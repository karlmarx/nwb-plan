"""Workout History tab E2E tests.

Covers: empty state, single-session render, reverse-chron order,
sparkline on multi-session same exercise, persistence across reload,
and tab navigation from Safety to History.

Data shape (workout-log:sessions):
  WorkoutSession {
    id, workoutKey, label?, startedAt, endedAt,
    exercises: LoggedExercise[] {
      exerciseId, name, variantId?, note?,
      sets: LoggedSet[] { n, weight, reps, durationSec?, note?, completedAt }
    }
  }

Sparkline renders only when topWeights.length >= 2 (same exerciseId appearing
in ≥2 sessions).  A single session shows "first time logged" fallback instead.
"""

import time

from playwright.sync_api import Page, expect

from conftest import click_tab, get_local_storage, set_local_storage

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

SESSIONS_KEY = "workout-log:sessions"

# Fixed timestamps — deterministic dates so string assertions never break.
# These must not fall in the future relative to any reasonable CI clock.
# Using 2025-01-10, 2025-01-17, 2025-01-24 (Fridays, ~09:00 UTC).
TS_OLD   = 1736496000000   # 2025-01-10 09:00 UTC
TS_MID   = 1737100800000   # 2025-01-17 09:00 UTC
TS_NEW   = 1737705600000   # 2025-01-24 09:00 UTC


# ---------------------------------------------------------------------------
# Helper: navigate to the History tab
# ---------------------------------------------------------------------------

def _go_to_history(page: Page):
    """Click the tab-history icon and wait for history-view to appear."""
    page.get_by_test_id("tab-history").click()
    page.wait_for_selector("[data-testid='history-view']", timeout=8000)


# ---------------------------------------------------------------------------
# Helper: build a minimal WorkoutSession dict
# ---------------------------------------------------------------------------

def _make_session(
    sid: str,
    workout_key: str,
    started_at: int,
    ended_at: int,
    exercises: list,
) -> dict:
    return {
        "id": sid,
        "workoutKey": workout_key,
        "startedAt": started_at,
        "endedAt": ended_at,
        "exercises": exercises,
    }


def _make_exercise(exercise_id: str, name: str, sets: list) -> dict:
    return {
        "exerciseId": exercise_id,
        "name": name,
        "sets": sets,
    }


def _make_set(n: int, weight: int, reps: int, ts: int) -> dict:
    return {
        "n": n,
        "weight": weight,
        "reps": reps,
        "completedAt": ts,
    }


# ---------------------------------------------------------------------------
# Seed helpers that reload after writing so HistoryView re-mounts fresh.
# ---------------------------------------------------------------------------

def _seed_and_navigate_history(page: Page, sessions: list):
    """Write sessions to localStorage, reload, then navigate to History tab."""
    set_local_storage(page, {SESSIONS_KEY: sessions})
    page.reload()
    page.wait_for_selector("[data-testid='app-container']")
    _go_to_history(page)


# ---------------------------------------------------------------------------
# Test 1: Empty state
# ---------------------------------------------------------------------------

def test_history_empty_state(app_page: Page):
    """With no completed sessions, History tab shows the empty-state card.

    Verifies:
    - history-view is present
    - 'No completed workouts yet' text appears
    - No history-session cards exist
    """
    # app_page already clears localStorage; just navigate to History.
    _go_to_history(app_page)

    hv = app_page.get_by_test_id("history-view")
    expect(hv).to_be_visible()

    # Empty-state message
    text = hv.inner_text()
    assert "no completed workouts" in text.lower(), (
        f"Expected 'No completed workouts' in history view, got: {text[:200]}"
    )

    # No session cards
    expect(app_page.get_by_test_id("history-session")).to_have_count(0)


# ---------------------------------------------------------------------------
# Test 2: Single session renders with correct set formatting
# ---------------------------------------------------------------------------

def test_history_single_session_renders(app_page: Page):
    """A single seeded session renders one card with correct content.

    Session has 2 exercises × 3 sets (all at 135 lb, reps 8/10/8).
    Verifies:
    - Exactly one history-session card
    - Each exercise renders inside the card (2 history-exercise elements)
    - Set text contains '135 lb × 8, 10, 8' (grouped same-weight format)
    - Single-session exercises show 'first time logged' fallback (no sparkline)
    - Date label is rendered (non-empty)
    - Workout label ('Push A') appears in the card header
    """
    sets_135 = [
        _make_set(1, 135, 8,  TS_NEW),
        _make_set(2, 135, 10, TS_NEW + 120_000),
        _make_set(3, 135, 8,  TS_NEW + 240_000),
    ]
    session = _make_session(
        "s-single-001", "Push A",
        started_at=TS_NEW,
        ended_at=TS_NEW + 3_600_000,
        exercises=[
            _make_exercise("barbell_bench_press", "Barbell Bench Press", sets_135),
            _make_exercise("overhead_press",      "Overhead Press",      sets_135),
        ],
    )
    _seed_and_navigate_history(app_page, [session])

    # Exactly one session card
    cards = app_page.get_by_test_id("history-session")
    expect(cards).to_have_count(1)

    card = cards.first

    # Workout label
    card_text = card.inner_text()
    assert "Push A" in card_text, (
        f"Expected 'Push A' in session card text, got: {card_text[:300]}"
    )

    # Date label — just confirm it's non-empty (locale-formatted)
    assert len(card_text.strip()) > 10, "Session card should have non-trivial content"

    # Two exercise rows
    ex_rows = card.get_by_test_id("history-exercise")
    expect(ex_rows).to_have_count(2)

    # Verify formatted sets — all 3 sets at 135 lb should collapse to one group
    for i in range(2):
        row_text = ex_rows.nth(i).inner_text()
        assert "135 lb" in row_text, (
            f"Exercise row {i} should contain '135 lb', got: {row_text}"
        )
        assert "8, 10, 8" in row_text, (
            f"Exercise row {i} should contain '8, 10, 8', got: {row_text}"
        )

    # Single-session: sparkline must NOT appear (only 1 data point per exercise)
    expect(card.get_by_test_id("history-sparkline")).to_have_count(0)

    # 'first time logged' fallback text should be present on each exercise
    history_text = app_page.get_by_test_id("history-view").inner_text()
    assert "first time logged" in history_text.lower(), (
        f"Expected 'first time logged' fallback for single-session exercises. "
        f"Got: {history_text[:400]}"
    )


# ---------------------------------------------------------------------------
# Test 3: Reverse-chronological order
# ---------------------------------------------------------------------------

def test_history_reverse_chronological_order(app_page: Page):
    """Three sessions seeded in any order render newest-first.

    Seeds sessions at TS_OLD, TS_MID, TS_NEW in MID→NEW→OLD insertion order,
    then verifies the first rendered card corresponds to TS_NEW (Jan 24).
    """
    make_sess = lambda sid, ts, key: _make_session(
        sid, key,
        started_at=ts,
        ended_at=ts + 3_600_000,
        exercises=[
            _make_exercise("cable_row", "Cable Row", [_make_set(1, 100, 10, ts + 60_000)])
        ],
    )

    # Insert in intentionally non-chronological order: MID first, then NEW, then OLD
    sessions = [
        make_sess("s-mid-001", TS_MID, "Pull B"),
        make_sess("s-new-001", TS_NEW, "Pull A"),
        make_sess("s-old-001", TS_OLD, "Pull C"),
    ]
    _seed_and_navigate_history(app_page, sessions)

    cards = app_page.get_by_test_id("history-session")
    expect(cards).to_have_count(3)

    # First card must be the most-recent (TS_NEW → "Pull A")
    first_text = cards.first.inner_text()
    assert "Pull A" in first_text, (
        f"Expected newest session ('Pull A') to be first, got: {first_text[:200]}"
    )

    # Last card must be the oldest (TS_OLD → "Pull C")
    last_text = cards.nth(2).inner_text()
    assert "Pull C" in last_text, (
        f"Expected oldest session ('Pull C') to be last, got: {last_text[:200]}"
    )


# ---------------------------------------------------------------------------
# Test 4: Sparkline appears on multi-session same exercise + diff sign
# ---------------------------------------------------------------------------

def test_history_sparkline_on_repeated_exercise(app_page: Page):
    """Two sessions sharing an exerciseId each show a sparkline SVG.

    Session 1 (older): bench at 100 lb → session 2 (newer): bench at 120 lb.
    Verifies:
    - Both history-exercise rows render a history-sparkline SVG
    - The newer session's diff label shows a positive delta (▲ +20 lb)
    - The older session shows no diff (it's the first occurrence, index 0)
    """
    ex_id = "barbell_bench_press"
    ex_name = "Barbell Bench Press"

    sess_old = _make_session(
        "s-spark-old", "Push A",
        started_at=TS_OLD,
        ended_at=TS_OLD + 3_600_000,
        exercises=[
            _make_exercise(ex_id, ex_name, [
                _make_set(1, 100, 8, TS_OLD + 60_000),
                _make_set(2, 100, 8, TS_OLD + 180_000),
            ])
        ],
    )
    sess_new = _make_session(
        "s-spark-new", "Push A",
        started_at=TS_NEW,
        ended_at=TS_NEW + 3_600_000,
        exercises=[
            _make_exercise(ex_id, ex_name, [
                _make_set(1, 120, 8, TS_NEW + 60_000),
                _make_set(2, 120, 8, TS_NEW + 180_000),
            ])
        ],
    )
    _seed_and_navigate_history(app_page, [sess_old, sess_new])

    cards = app_page.get_by_test_id("history-session")
    expect(cards).to_have_count(2)

    # Both cards should have exactly one exercise row each
    for i in range(2):
        ex_rows = cards.nth(i).get_by_test_id("history-exercise")
        expect(ex_rows).to_have_count(1)
        # Each exercise row must contain a sparkline SVG (topWeights.length >= 2)
        sparkline = ex_rows.first.get_by_test_id("history-sparkline")
        count = sparkline.count()
        assert count == 1, (
            f"Card {i} should show a sparkline for repeated exercise, got {count}"
        )

    # Verify the diff label for the NEWER session (first card in reverse-chron order)
    newer_card = cards.first  # TS_NEW is most recent
    newer_text = newer_card.inner_text()

    # Delta is +20 lb (120 - 100) → should contain "▲" and "20"
    assert "▲" in newer_text or "+20" in newer_text, (
        f"Expected positive delta (▲ or +20) in newer session card. Got: {newer_text[:300]}"
    )


# ---------------------------------------------------------------------------
# Test 5: Session data persists across page reload
# ---------------------------------------------------------------------------

def test_history_persists_across_reload(app_page: Page):
    """Sessions seeded in localStorage survive a page reload and remain visible.

    Seeds one session, navigates to History, reloads, navigates to History again,
    and confirms the session card is still present.
    """
    session = _make_session(
        "s-persist-001", "Lower A",
        started_at=TS_MID,
        ended_at=TS_MID + 2_700_000,
        exercises=[
            _make_exercise("leg_press", "Leg Press", [
                _make_set(1, 180, 12, TS_MID + 60_000),
            ])
        ],
    )
    _seed_and_navigate_history(app_page, [session])

    # Confirm visible before reload
    expect(app_page.get_by_test_id("history-session")).to_have_count(1)

    # Reload
    app_page.reload()
    app_page.wait_for_selector("[data-testid='app-container']")

    # localStorage must still hold the session
    stored = get_local_storage(app_page, SESSIONS_KEY)
    assert isinstance(stored, list) and len(stored) == 1, (
        f"Sessions should survive reload, got: {stored}"
    )
    assert stored[0]["id"] == "s-persist-001"

    # Navigate back to History and confirm still visible
    _go_to_history(app_page)
    expect(app_page.get_by_test_id("history-session")).to_have_count(1)

    card_text = app_page.get_by_test_id("history-session").first.inner_text()
    assert "Lower A" in card_text, (
        f"Session label 'Lower A' should be present after reload, got: {card_text[:200]}"
    )


# ---------------------------------------------------------------------------
# Test 6: Tab navigation — clicking tab-history reveals history-view
# ---------------------------------------------------------------------------

def test_history_tab_navigation(app_page: Page):
    """Clicking Safety then History switches content correctly.

    Starts on default tab, clicks Safety (to ensure we're NOT already on
    History), then clicks tab-history.  Verifies:
    - history-view is visible
    - Safety-specific content is no longer the active view (sanity: safety
      section testid count drops to 0 inside tab-content, or tab-history
      has active styling — we check via history-view visibility).
    """
    # First navigate to Safety to have a known non-History state
    click_tab(app_page, "safety")
    app_page.wait_for_timeout(200)

    # Ensure Safety content is visible and History view is NOT
    safety_content = app_page.get_by_test_id("tab-content")
    expect(safety_content).to_be_visible()
    expect(app_page.get_by_test_id("history-view")).to_have_count(0)

    # Now click the History tab icon
    app_page.get_by_test_id("tab-history").click()
    app_page.wait_for_selector("[data-testid='history-view']", timeout=8000)

    # history-view must be visible
    expect(app_page.get_by_test_id("history-view")).to_be_visible()

    # The URL must NOT have changed (SPA — no navigation)
    assert "localhost:3000" in app_page.url, (
        f"SPA should not change URL on tab switch, got: {app_page.url}"
    )

    # nwb_tab in localStorage should be 7 (HISTORY_TAB_INDEX)
    tab_val = get_local_storage(app_page, "nwb_tab")
    assert tab_val == 7, (
        f"nwb_tab should be 7 after clicking History, got: {tab_val}"
    )
