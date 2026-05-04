"""Focus-mode SetTracker E2E tests (PR #87).

Tests cover the fullscreen workout-walkthrough (focus overlay) and the
add-exercise-picker auto-expand path introduced in PR #87.

SetTracker is rendered inside:
  1. The focus-mode overlay (workout-view.tsx ~3222) — keyed on item.ex.id so
     draft state and inputs reset cleanly when navigating between exercises.
  2. Expanded ExerciseRows on the Today tab (exercise-row.tsx ~204).

Note on ``data-testid="set-tracker"``: the root <div> of SetTracker.tsx does
NOT carry that testid in the production codebase.  The canonical in-DOM
indicator that a SetTracker is rendered and interactive is
``data-testid="log-set"`` (the ✓ commit button inside it).
All tests use that selector as the SetTracker presence check.
"""

from playwright.sync_api import Page, expect

from conftest import click_tab, get_local_storage, set_local_storage

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

ACTIVE_KEY = "workout-log:active"
SESSIONS_KEY = "workout-log:sessions"


# ---------------------------------------------------------------------------
# Shared setup helpers
# ---------------------------------------------------------------------------

def _seed_and_land_on_training_day(page: Page) -> None:
    """Seed startDay=Mon, restDay=Sun, force-select Monday (Push A).

    Mirrors the deterministic day-pin pattern in test_set_tracker.py so
    every test in this module exercises a known, non-rest training day.
    """
    set_local_storage(page, {"nwb_startDay": 0, "nwb_restDay": 6})
    page.reload()
    page.wait_for_selector("[data-testid='app-container']")

    click_tab(page, "workout")
    page.wait_for_timeout(200)

    content = page.get_by_test_id("tab-content")
    # Click Monday (index 0) in the 7-column day-picker grid.
    content.locator(".grid.grid-cols-7 > div").nth(0).click()
    page.wait_for_timeout(300)


def _open_first_workout_section(page: Page) -> None:
    """Ensure the first workout Section is expanded (exercise rows rendered)."""
    sections = page.get_by_test_id("tab-content").get_by_test_id("section")
    assert sections.count() > 0, "Expected at least one workout section"
    section = sections.first
    if section.get_by_test_id("exercise-row").count() == 0:
        section.locator("button").first.click()
        page.wait_for_timeout(300)


def _click_focus_button(page: Page) -> None:
    """Click the ▶ focus-mode trigger on the first workout Section header.

    The button carries ``title="Focus mode — full screen exercise view"``
    (section.tsx line ~78) and no aria-label.  We match by title attribute
    rather than inner text to avoid ambiguity with other ▶ glyphs.
    """
    sections = page.get_by_test_id("tab-content").get_by_test_id("section")
    first_section = sections.first
    play_btn = first_section.locator(
        "button[title='Focus mode — full screen exercise view']"
    )
    expect(play_btn).to_be_visible()
    play_btn.click()
    page.wait_for_timeout(400)


def _get_focus_overlay(page: Page):
    """Return the fullscreen focus overlay locator.

    The overlay is a ``div.fixed.inset-0`` rendered inside WorkoutView with
    background #0a0a0a.  It always contains a ✕ close button (aria-label
    absent; text content "✕") and the SetTracker's ``log-set`` button.
    We scope by the presence of ``[data-testid=log-set]`` to distinguish it
    from other fixed overlays (e.g. diagram gallery).
    """
    return page.locator("div.fixed.inset-0").filter(
        has=page.get_by_test_id("log-set")
    ).first


def _dismiss_timer_if_visible(page: Page) -> None:
    """Dismiss the RestTimer if it's present.

    When inside the focus-mode overlay (z-[250]) the RestTimer (z-[100]) is
    visually behind the overlay and a normal click would be intercepted.
    We use ``dispatch_event("click")`` to fire the click event directly on
    the element without pointer-event interception checks.
    """
    close_btn = page.get_by_test_id("timer-close")
    if close_btn.count() > 0:
        close_btn.dispatch_event("click")
        page.wait_for_timeout(200)


def _log_set_in_overlay(overlay, weight: str, reps: str) -> None:
    """Fill weight+reps inside the focus overlay and click the log button."""
    overlay.get_by_label("lbs", exact=True).fill(weight)
    overlay.get_by_label("reps", exact=True).fill(reps)
    overlay.get_by_test_id("log-set").click()


# ---------------------------------------------------------------------------
# Test 1 — Enter focus mode
# ---------------------------------------------------------------------------

def test_enter_focus_mode_shows_set_tracker(app_page: Page, base_url: str):
    """Clicking ▶ on a workout section opens the focus overlay and renders
    the SetTracker (log-set button) for the first exercise."""
    _seed_and_land_on_training_day(app_page)
    _open_first_workout_section(app_page)

    # Before opening focus mode, no focus overlay should exist.
    focus_overlay_locator = app_page.locator("div.fixed.inset-0").filter(
        has=app_page.get_by_test_id("log-set")
    )
    expect(focus_overlay_locator).to_have_count(0)

    _click_focus_button(app_page)

    # SetTracker's commit button should now be visible inside the overlay.
    # dynamic() import may take a moment — use a generous timeout.
    log_set_btn = app_page.get_by_test_id("log-set").first
    expect(log_set_btn).to_be_visible(timeout=8000)

    # Overlay itself is a fullscreen fixed panel.
    overlay = _get_focus_overlay(app_page)
    expect(overlay).to_be_visible()

    # It should show an exercise name in a large heading.
    # We verify that the first section's first exercise name appears somewhere
    # in the overlay (it's rendered in a big white heading div).
    first_section = app_page.get_by_test_id("tab-content").get_by_test_id("section").first
    first_ex_name = first_section.get_by_test_id("exercise-name").first.inner_text()
    assert len(first_ex_name.strip()) > 0, "Expected a non-empty exercise name"
    assert overlay.locator("text=" + first_ex_name.strip()).count() >= 1, \
        f"Exercise name '{first_ex_name}' not found in focus overlay"


# ---------------------------------------------------------------------------
# Test 2 — Log a set in focus mode
# ---------------------------------------------------------------------------

def test_log_set_in_focus_mode(app_page: Page, base_url: str):
    """Inside the focus overlay: fill weight, fill reps, click log-set →
    a logged-set row appears with correct values, SessionBar shows '1 set',
    RestTimer pops."""
    _seed_and_land_on_training_day(app_page)
    _open_first_workout_section(app_page)

    # No SessionBar yet (no set logged).
    expect(app_page.get_by_test_id("session-bar")).to_have_count(0)

    _click_focus_button(app_page)
    overlay = _get_focus_overlay(app_page)
    expect(overlay.get_by_test_id("log-set")).to_be_visible(timeout=8000)

    # Fill and commit.
    _log_set_in_overlay(overlay, "135", "8")
    app_page.wait_for_timeout(400)

    # (a) A logged-set row appears inside the overlay with the correct values.
    logged = overlay.get_by_test_id("logged-set").first
    expect(logged).to_be_visible()
    txt = logged.inner_text()
    assert "135" in txt and "8" in txt, \
        f"Expected '135' and '8' in logged row text, got: {txt!r}"

    # (b) SessionBar appears and shows '1 set'.
    bar = app_page.get_by_test_id("session-bar")
    expect(bar).to_be_visible()
    bar_text = bar.inner_text().lower()
    assert "1 set" in bar_text, \
        f"Expected '1 set' in SessionBar text, got: {bar_text!r}"

    # (c) RestTimer pops with a valid countdown display.
    timer = app_page.get_by_test_id("rest-timer")
    expect(timer).to_be_visible()
    display = app_page.get_by_test_id("timer-display").inner_text()
    assert any(ch.isdigit() for ch in display), \
        f"Timer display should contain digits, got: {display!r}"


# ---------------------------------------------------------------------------
# Test 3 — Advance to next exercise re-keys SetTracker
# ---------------------------------------------------------------------------

def test_advance_to_next_exercise_rekeys_set_tracker(app_page: Page, base_url: str):
    """After logging a set on exercise 1, clicking Next › resets the draft
    inputs for exercise 2 and the set logged on exercise 1 persists in
    localStorage."""
    _seed_and_land_on_training_day(app_page)
    _open_first_workout_section(app_page)
    _click_focus_button(app_page)

    overlay = _get_focus_overlay(app_page)
    expect(overlay.get_by_test_id("log-set")).to_be_visible(timeout=8000)

    # Log a distinctive set on exercise 1.
    _log_set_in_overlay(overlay, "200", "3")
    app_page.wait_for_timeout(400)
    _dismiss_timer_if_visible(app_page)

    # Snapshot storage to identify exercise 1's id.
    active_before = get_local_storage(app_page, ACTIVE_KEY)
    assert active_before is not None, "Active session must exist after logging a set"
    first_ex_id = active_before["exercises"][0]["exerciseId"]
    assert active_before["exercises"][0]["sets"][0]["weight"] == 200

    # Click Next › button (text contains "Next"; it is enabled when not last ex).
    # The button is in the nav bar at the bottom of the overlay.
    next_btn = overlay.locator("button:not([disabled])").filter(has_text="Next").last
    expect(next_btn).to_be_visible()
    next_btn.click()
    app_page.wait_for_timeout(400)

    # SetTracker for exercise 2 should be rendered and have no logged rows yet.
    expect(overlay.get_by_test_id("log-set")).to_be_visible(timeout=5000)
    expect(overlay.get_by_test_id("logged-set")).to_have_count(0)

    # The draft weight input must NOT carry over "200" from exercise 1's last set.
    # (key prop on SetTracker re-mounts it → fresh draft state).
    draft_weight = overlay.get_by_label("lbs", exact=True).input_value()
    assert draft_weight != "200", \
        f"Draft weight should reset on navigation; got {draft_weight!r}"

    # Exercise 1's logged set must still be in storage.
    active_after = get_local_storage(app_page, ACTIVE_KEY)
    assert active_after is not None
    ex1_entry = next(
        (e for e in active_after["exercises"] if e["exerciseId"] == first_ex_id), None
    )
    assert ex1_entry is not None, "Exercise 1 entry should remain in storage"
    assert len(ex1_entry["sets"]) == 1
    assert ex1_entry["sets"][0]["weight"] == 200, \
        "Previous set weight should survive navigation to next exercise"


# ---------------------------------------------------------------------------
# Test 4 — Keyboard navigation preserves logged sets
# ---------------------------------------------------------------------------

def test_keyboard_navigation_preserves_logged_sets(app_page: Page, base_url: str):
    """ArrowRight advances to exercise 2, ArrowLeft returns to exercise 1,
    Escape exits the overlay.  Logged sets survive all transitions."""
    _seed_and_land_on_training_day(app_page)
    _open_first_workout_section(app_page)
    _click_focus_button(app_page)

    overlay = _get_focus_overlay(app_page)
    expect(overlay.get_by_test_id("log-set")).to_be_visible(timeout=8000)

    # Log one set on exercise 1.
    _log_set_in_overlay(overlay, "95", "10")
    app_page.wait_for_timeout(400)
    _dismiss_timer_if_visible(app_page)

    active_snap = get_local_storage(app_page, ACTIVE_KEY)
    assert active_snap is not None
    first_ex_id = active_snap["exercises"][0]["exerciseId"]

    # ArrowRight → exercise 2.
    app_page.keyboard.press("ArrowRight")
    app_page.wait_for_timeout(300)
    # SetTracker for ex2 is visible and has no logged rows.
    expect(overlay.get_by_test_id("log-set")).to_be_visible()
    expect(overlay.get_by_test_id("logged-set")).to_have_count(0)

    # ArrowLeft → back to exercise 1.
    app_page.keyboard.press("ArrowLeft")
    app_page.wait_for_timeout(300)
    # SetTracker for ex1 is visible and the logged row is shown.
    expect(overlay.get_by_test_id("log-set")).to_be_visible()
    expect(overlay.get_by_test_id("logged-set").first).to_be_visible()

    # Escape → overlay closes.
    app_page.keyboard.press("Escape")
    app_page.wait_for_timeout(300)
    # After Escape the focus overlay is removed from DOM entirely.
    expect(
        app_page.locator("div.fixed.inset-0").filter(
            has=app_page.get_by_test_id("log-set")
        )
    ).to_have_count(0)

    # Logged sets must persist in localStorage after Escape.
    active_final = get_local_storage(app_page, ACTIVE_KEY)
    assert active_final is not None
    ex1_entry = next(
        (e for e in active_final["exercises"] if e["exerciseId"] == first_ex_id), None
    )
    assert ex1_entry is not None, "Exercise 1 entry should survive Escape"
    assert ex1_entry["sets"][0]["weight"] == 95
    assert ex1_entry["sets"][0]["reps"] == 10


# ---------------------------------------------------------------------------
# Test 5 — Add-exercise picker auto-expands new row with SetTracker visible
# ---------------------------------------------------------------------------

def test_add_exercise_picker_auto_expands_row_with_set_tracker(
    app_page: Page, base_url: str
):
    """The '＋ Add exercise' button opens the picker; selecting an exercise
    closes the picker and the new row is already expanded with the SetTracker
    (log-set button) visible — no additional tap required."""
    _seed_and_land_on_training_day(app_page)
    _open_first_workout_section(app_page)

    # Collect names of exercises already present so we don't pick a duplicate.
    existing_names: set[str] = set()
    for row in app_page.get_by_test_id("exercise-row").all():
        try:
            existing_names.add(
                row.get_by_test_id("exercise-name").inner_text(timeout=500).strip()
            )
        except Exception:
            pass

    # Open the add-exercise picker.
    add_btn = app_page.get_by_test_id("add-exercise")
    expect(add_btn).to_be_visible()
    add_btn.click()
    app_page.wait_for_timeout(300)

    picker = app_page.get_by_test_id("add-exercise-picker")
    expect(picker).to_be_visible()

    # Find the first non-disabled exercise button in the picker.
    # Each exercise button in the picker wraps a span.text-sm.font-semibold
    # (the exercise name) and is not disabled when the exercise isn't already
    # in the current workout.
    chosen_name: str | None = None
    all_buttons = picker.locator("button:not([disabled])")
    count = all_buttons.count()
    for idx in range(count):
        btn = all_buttons.nth(idx)
        try:
            name_el = btn.locator(".text-sm.font-semibold.text-text").first
            if name_el.count() == 0:
                continue
            candidate = name_el.inner_text(timeout=300).strip()
            if candidate and candidate not in existing_names:
                chosen_name = candidate
                btn.click()
                break
        except Exception:
            continue

    assert chosen_name is not None, (
        "Could not find a non-disabled exercise button in the picker. "
        f"Picker buttons count: {count}, existing: {existing_names}"
    )

    # Picker closes automatically after onAdd → onClose.
    expect(picker).to_have_count(0, timeout=3000)

    # Wait for the double-rAF scroll + React paint to settle.
    app_page.wait_for_timeout(700)

    # The newly added row must be rendered and already expanded
    # (SetTracker's log-set button visible) without any extra interaction.
    new_row = app_page.locator(f'[data-exercise-name="{chosen_name}"]')
    expect(new_row).to_be_visible(timeout=5000)

    log_set_in_new_row = new_row.get_by_test_id("log-set")
    expect(log_set_in_new_row).to_be_visible(timeout=5000)
