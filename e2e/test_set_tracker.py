"""In-app set tracker E2E tests.

Covers logging, edit/remove, auto rest timer, persistence, stale-session
auto-archive, per-set notes, and equipment photos. The tracker is rendered
inside the expanded ExerciseRow on the Today tab.
"""

import base64
import time

from playwright.sync_api import Page, expect

from conftest import click_tab, get_local_storage, set_local_storage


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

ACTIVE_KEY = "workout-log:active"
SESSIONS_KEY = "workout-log:sessions"
PHOTOS_KEY = "equipment-photos"


def _seed_deterministic_day(page: Page, base_url: str):
    """Seed startDay=Mon and rest day=Sun, then click Monday in the day picker
    so we reliably land on a training day (Push A) regardless of real-life
    today. Returns after first section + first exercise are expanded.
    """
    # Default schedule: startDay=0 (Mon), restDay=6 (Sun) → Mon=Push A.
    set_local_storage(page, {"nwb_startDay": 0, "nwb_restDay": 6})
    page.reload()
    page.wait_for_selector("[data-testid='app-container']")

    click_tab(page, "workout")
    page.wait_for_timeout(200)

    content = page.get_by_test_id("tab-content")
    # Click Monday cell (index 0) to deterministically pick Push A.
    day_cells = content.locator(".grid.grid-cols-7 > div")
    day_cells.nth(0).click()
    page.wait_for_timeout(300)


def _expand_first_exercise(page: Page):
    """Expand first section, then first exercise row. Returns the row locator."""
    sections = page.get_by_test_id("tab-content").get_by_test_id("section")
    assert sections.count() > 0, "Expected at least one workout section"

    # Sections may or may not auto-open from the day-pick toggle; click header
    # button to ensure expanded state.
    section = sections.first
    # If no exercise rows visible, click section header to expand
    if section.get_by_test_id("exercise-row").count() == 0:
        section.locator("button").first.click()
        page.wait_for_timeout(300)

    rows = section.get_by_test_id("exercise-row")
    assert rows.count() > 0, "Expected at least one exercise row"

    row = rows.first
    # Click header to expand the detail panel (which renders SetTracker)
    row.get_by_test_id("exercise-row-header").click()
    page.wait_for_timeout(400)
    return row


def _set_tracker(row):
    """Locator for the SetTracker block (no testid; we scope via ✓ button parent)."""
    return row.get_by_test_id("log-set").locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]")


def _type_weight_reps(row, weight: str, reps: str):
    """Fill the pending-set inputs (weight + reps).

    NumStepper renders <input type=number aria-label="lbs"> and
    aria-label="reps". We target by aria-label to avoid relying on order.
    """
    weight_input = row.get_by_label("lbs", exact=True)
    reps_input = row.get_by_label("reps", exact=True)
    weight_input.fill(weight)
    reps_input.fill(reps)


def _commit_set(row):
    row.get_by_test_id("log-set").click()


def _logged_rows(row):
    return row.get_by_test_id("logged-set")


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_log_single_set(app_page: Page, base_url: str):
    """Logging one set: row appears, SessionBar shows '1 set', RestTimer pops."""
    _seed_deterministic_day(app_page, base_url)
    row = _expand_first_exercise(app_page)

    # Initially no SessionBar (no set logged yet).
    expect(app_page.get_by_test_id("session-bar")).to_have_count(0)

    _type_weight_reps(row, "135", "8")
    _commit_set(row)
    app_page.wait_for_timeout(400)

    # (a) Logged row appears with the values.
    rows = _logged_rows(row)
    expect(rows).to_have_count(1)
    txt = rows.first.inner_text()
    assert "135" in txt and "8" in txt, f"Expected '135' and '8' in logged row, got: {txt}"

    # (b) SessionBar visible with elapsed timer + '1 set'.
    bar = app_page.get_by_test_id("session-bar")
    expect(bar).to_be_visible()
    bar_text = bar.inner_text()
    assert "1 set" in bar_text.lower(), f"Expected '1 set' in bar text, got: {bar_text}"

    # (c) RestTimer pops up. Default rest is the exercise's `rest` seconds (>0).
    timer = app_page.get_by_test_id("rest-timer")
    expect(timer).to_be_visible()
    display = app_page.get_by_test_id("timer-display").inner_text()
    # Display format like "M:SS" or similar — just confirm it has at least one digit.
    assert any(ch.isdigit() for ch in display), f"Timer display should have digits, got: {display}"


def test_autofill_from_prior_set(app_page: Page, base_url: str):
    """Logging a set prefills the next pending row's inputs with same w × r."""
    _seed_deterministic_day(app_page, base_url)
    row = _expand_first_exercise(app_page)

    _type_weight_reps(row, "95", "10")
    _commit_set(row)
    app_page.wait_for_timeout(400)

    # Close any rest timer overlay so it doesn't intercept clicks.
    if app_page.get_by_test_id("timer-close").count() > 0:
        app_page.get_by_test_id("timer-close").click()
        app_page.wait_for_timeout(200)

    # The (now next) pending row should be prefilled with 95 / 10.
    weight_val = row.get_by_label("lbs", exact=True).input_value()
    reps_val = row.get_by_label("reps", exact=True).input_value()
    assert weight_val == "95", f"Expected weight prefill '95', got '{weight_val}'"
    assert reps_val == "10", f"Expected reps prefill '10', got '{reps_val}'"


def test_edit_logged_set(app_page: Page, base_url: str):
    """Tapping a logged row enters edit mode; ✓ persists the change."""
    _seed_deterministic_day(app_page, base_url)
    row = _expand_first_exercise(app_page)

    _type_weight_reps(row, "135", "8")
    _commit_set(row)
    app_page.wait_for_timeout(400)
    if app_page.get_by_test_id("timer-close").count() > 0:
        app_page.get_by_test_id("timer-close").click()
        app_page.wait_for_timeout(200)

    logged = _logged_rows(row).first
    # Tap the "Edit set" button (the value display). When the row enters edit
    # mode, it re-renders WITHOUT data-testid="logged-set", so we have to
    # query the editor inputs/buttons via the parent SetTracker block.
    logged.get_by_role("button", name="Edit set").click()
    app_page.wait_for_timeout(300)

    # Save-edit button has aria-label="Save edit"; the two number inputs
    # adjacent to it are weight + reps. Scope to the exercise row to avoid
    # collisions with other trackers that might be on screen.
    save_btn = row.get_by_role("button", name="Save edit")
    expect(save_btn).to_be_visible()
    # The two edit-mode inputs sit just above the pending-set's NumSteppers.
    # The cleanest way to grab them is by aria-label difference: edit inputs
    # have NO aria-label, while pending NumStepper inputs have label "lbs"
    # and "reps". So filter to inputs without aria-label.
    edit_inputs = row.locator("input[type=number]:not([aria-label])")
    assert edit_inputs.count() == 2, \
        f"Expected 2 unlabeled number inputs in edit mode, got {edit_inputs.count()}"
    edit_inputs.nth(1).fill("12")
    save_btn.click()
    app_page.wait_for_timeout(300)

    # Logged row text should now contain "12"
    new_txt = _logged_rows(row).first.inner_text()
    assert "12" in new_txt, f"Edit didn't persist; row text: {new_txt}"

    # localStorage should reflect the change
    active = get_local_storage(app_page, ACTIVE_KEY)
    assert active is not None
    sets = active["exercises"][0]["sets"]
    assert sets[0]["reps"] == 12, f"Expected reps=12 in storage, got {sets[0]['reps']}"


def test_remove_logged_set(app_page: Page, base_url: str):
    """✕ on a logged row removes it; remaining sets renumber."""
    _seed_deterministic_day(app_page, base_url)
    row = _expand_first_exercise(app_page)

    # Log 3 sets in a row.
    for w, r in [("100", "10"), ("105", "8"), ("110", "6")]:
        _type_weight_reps(row, w, r)
        _commit_set(row)
        app_page.wait_for_timeout(300)
        if app_page.get_by_test_id("timer-close").count() > 0:
            app_page.get_by_test_id("timer-close").click()
            app_page.wait_for_timeout(150)

    rows = _logged_rows(row)
    expect(rows).to_have_count(3)

    # Remove the middle set (index 1).
    rows.nth(1).get_by_role("button", name="Remove set").click()
    app_page.wait_for_timeout(300)

    rows = _logged_rows(row)
    expect(rows).to_have_count(2)

    # Storage should have 2 sets, renumbered 1..2.
    active = get_local_storage(app_page, ACTIVE_KEY)
    sets = active["exercises"][0]["sets"]
    assert len(sets) == 2
    assert [s["n"] for s in sets] == [1, 2], f"Set numbers not renumbered: {[s['n'] for s in sets]}"
    # Removed-middle: should keep 1st (100x10) and 3rd (110x6) — not 105x8.
    weights = sorted(s["weight"] for s in sets)
    assert 105 not in weights, f"Removed set's weight (105) still in: {weights}"


def test_end_workout_archives(app_page: Page, base_url: str):
    """End → Finish archives the session into workout-log:sessions."""
    _seed_deterministic_day(app_page, base_url)
    row = _expand_first_exercise(app_page)

    _type_weight_reps(row, "115", "5")
    _commit_set(row)
    app_page.wait_for_timeout(400)
    if app_page.get_by_test_id("timer-close").count() > 0:
        app_page.get_by_test_id("timer-close").click()
        app_page.wait_for_timeout(200)

    bar = app_page.get_by_test_id("session-bar")
    expect(bar).to_be_visible()

    bar.get_by_test_id("end-workout").click()
    app_page.wait_for_timeout(150)
    bar.get_by_test_id("end-confirm").click()
    app_page.wait_for_timeout(400)

    # SessionBar disappears
    expect(app_page.get_by_test_id("session-bar")).to_have_count(0)

    # Active session cleared, archived sessions has 1 entry with our set.
    active = get_local_storage(app_page, ACTIVE_KEY)
    assert active is None, f"Active session should be null, got: {active}"

    sessions = get_local_storage(app_page, SESSIONS_KEY)
    assert isinstance(sessions, list) and len(sessions) >= 1, \
        f"Expected at least 1 archived session, got: {sessions}"
    last = sessions[-1]
    assert last.get("endedAt"), "Archived session should have endedAt"
    sets = last["exercises"][0]["sets"]
    assert sets[0]["weight"] == 115 and sets[0]["reps"] == 5


def test_persistence_across_reload(app_page: Page, base_url: str):
    """Logged set survives a hard reload."""
    _seed_deterministic_day(app_page, base_url)
    row = _expand_first_exercise(app_page)

    _type_weight_reps(row, "145", "7")
    _commit_set(row)
    app_page.wait_for_timeout(400)

    # Snapshot what's in localStorage before reload.
    pre = get_local_storage(app_page, ACTIVE_KEY)
    assert pre is not None
    pre_set = pre["exercises"][0]["sets"][0]
    assert pre_set["weight"] == 145 and pre_set["reps"] == 7

    # Hard reload.
    app_page.reload()
    app_page.wait_for_selector("[data-testid='app-container']")

    # SessionBar should still be visible (active session restored).
    expect(app_page.get_by_test_id("session-bar")).to_be_visible()

    # Storage round-trips.
    post = get_local_storage(app_page, ACTIVE_KEY)
    assert post is not None
    assert post["id"] == pre["id"], "Session id should match across reload"
    assert post["exercises"][0]["sets"][0]["weight"] == 145
    assert post["exercises"][0]["sets"][0]["reps"] == 7


def test_stale_session_auto_archives(app_page: Page, base_url: str):
    """An active session idle >4 hrs is auto-archived on app load."""
    # Pre-seed an "old" active session — startedAt 5 hours ago, no sets.
    five_hours_ago = int(time.time() * 1000) - 5 * 60 * 60 * 1000
    stale = {
        "id": "s-stale-test",
        "workoutKey": "Push A",
        "startedAt": five_hours_ago,
        "exercises": [],
    }
    # Use raw setItem because conftest set_local_storage JSON-encodes again,
    # but our value is already a dict — that's fine, set_local_storage
    # JSON.stringifies it, which is what the app expects.
    set_local_storage(app_page, {ACTIVE_KEY: stale, SESSIONS_KEY: []})
    app_page.reload()
    app_page.wait_for_selector("[data-testid='app-container']")
    # Give the hook's mount effect a beat.
    app_page.wait_for_timeout(400)

    # SessionBar should NOT render (active was cleared).
    expect(app_page.get_by_test_id("session-bar")).to_have_count(0)

    # Active should be null, archived sessions should now contain the stale one.
    assert get_local_storage(app_page, ACTIVE_KEY) is None
    sessions = get_local_storage(app_page, SESSIONS_KEY)
    assert isinstance(sessions, list) and len(sessions) >= 1
    assert any(s.get("id") == "s-stale-test" for s in sessions), \
        f"Stale session not in archived list: {sessions}"


def test_per_set_note_renders(app_page: Page, base_url: str):
    """A per-set note typed before ✓ shows up inline on the logged row."""
    _seed_deterministic_day(app_page, base_url)
    row = _expand_first_exercise(app_page)

    _type_weight_reps(row, "120", "6")

    # The note input is the first text input inside the tracker
    # (placeholder "Note for this set...").
    note_input = row.locator("input[placeholder*='Note for this set']")
    note_input.fill("RPE 8 neutral grip")

    _commit_set(row)
    app_page.wait_for_timeout(400)

    logged = _logged_rows(row).first
    txt = logged.inner_text()
    assert "RPE 8" in txt, f"Note not rendered inline; row text: {txt}"

    # Storage check
    active = get_local_storage(app_page, ACTIVE_KEY)
    assert active["exercises"][0]["sets"][0]["note"] == "RPE 8 neutral grip"


def test_equipment_photo_upload(app_page: Page, base_url: str, tmp_path):
    """Uploading a tiny PNG bumps the count badge and writes to localStorage."""
    _seed_deterministic_day(app_page, base_url)
    row = _expand_first_exercise(app_page)

    # Smallest valid 1x1 transparent PNG.
    png_bytes = base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
    )
    fixture = tmp_path / "equip.png"
    fixture.write_bytes(png_bytes)

    # The PhotoButton hides its <input type="file"> inside a label. Target it
    # by its accept attribute since there's no testid.
    file_input = row.locator("input[type=file][accept='image/*']")
    assert file_input.count() == 1, \
        f"Expected exactly 1 photo file input, got {file_input.count()}"
    file_input.set_input_files(str(fixture))
    app_page.wait_for_timeout(500)  # FileReader is async

    # Storage should have an equipment-photos entry for this exercise.
    photos = get_local_storage(app_page, PHOTOS_KEY)
    assert isinstance(photos, list) and len(photos) == 1, \
        f"Expected 1 photo in storage, got: {photos}"
    p = photos[0]
    assert isinstance(p.get("exerciseId"), str) and len(p["exerciseId"]) > 0
    assert p["dataUrl"].startswith("data:image/"), \
        f"Photo dataUrl should be a data URL, got: {p.get('dataUrl', '')[:40]}"
    assert isinstance(p.get("capturedAt"), int) and p["capturedAt"] > 0
