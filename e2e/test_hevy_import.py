"""Hevy CSV import E2E tests.

Covers:
  1. HevyImportPanel renders in the Equip (Gear) tab.
  2. Uploading the sample CSV shows correct preview counts + skipped list.
  3. Cancel discards the parse — no sessions written to localStorage.
  4. Import commits 2 sessions to localStorage with correct shape/weights.
  5. Re-import appends without dedup (4 sessions after two imports).
  6. Pure-JS parser handles quoted fields containing commas.

The Equip tab is the gear icon at GEAR_TAB_INDEX = 6; its data-testid is
"tab-gear". conftest.click_tab(page, "gear") reaches it.

kg→lb conversion (kgToLb in lib/hevy-import.ts): round(kg * 2.20462 / 2.5) * 2.5
  80 kg  → 177.5 lb
  82.5 kg → 182.5 lb
  30 kg  → 65.0 lb  (Tricep Pushdown — matched)
  60 kg  → 132.5 lb (Lat Pulldown — matched; Zercher Squat also 60 kg but skipped)
"""

import textwrap

from playwright.sync_api import Page, expect

from conftest import click_tab, get_local_storage

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

SESSIONS_KEY = "workout-log:sessions"

# Standard five-row sample CSV described in the PR spec.
SAMPLE_CSV = textwrap.dedent("""\
    Workout #,Date,Workout Name,Duration,Exercise Name,Set Order,Weight (kg),Reps,RPE,Notes,Workout Notes
    1,2024-03-15,Push Day,3600,Bench Press (Barbell),1,80,8,,felt good,
    1,2024-03-15,Push Day,3600,Bench Press (Barbell),2,82.5,6,,,
    1,2024-03-15,Push Day,3600,Tricep Pushdown,1,30,12,,,
    1,2024-03-15,Push Day,3600,Zercher Squat,1,60,5,,,
    2,2024-03-17,Pull Day,3200,Lat Pulldown (Bar),1,60,10,,,
""")

# CSV where one exercise name contains a comma (inside quotes).
# "Bench Press, Wide Grip" has no entry in hevy-name-map → will appear in
# skipped list.  Verifies the pure-JS CSV parser doesn't choke.
QUOTED_FIELD_CSV = textwrap.dedent("""\
    Workout #,Date,Workout Name,Duration,Exercise Name,Set Order,Weight (kg),Reps,RPE,Notes,Workout Notes
    1,2024-03-15,Push Day,3600,"Bench Press, Wide Grip",1,70,8,,,
    1,2024-03-15,Push Day,3600,Tricep Pushdown,2,30,10,,,
""")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _navigate_to_equip(page: Page) -> None:
    """Navigate to the Equip (Gear) tab and wait for content."""
    click_tab(page, "gear")
    page.wait_for_timeout(300)


def _write_csv(tmp_path, filename: str, content: str) -> str:
    """Write CSV content to a tmp file and return its string path."""
    p = tmp_path / filename
    p.write_text(content, encoding="utf-8")
    return str(p)


def _upload_csv(page: Page, csv_path: str) -> None:
    """Set the hidden file input inside HevyImportPanel to the given CSV path.

    The input is hidden (display:none) but Playwright's set_input_files works
    on hidden inputs. We target it by accept attribute since the component
    renders it without a testid.
    """
    file_input = page.locator("input[type=file][accept='.csv,text/csv']")
    expect(file_input).to_have_count(1)
    file_input.set_input_files(csv_path)
    # FileReader is async — give it time to fire onload.
    page.wait_for_timeout(600)


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_hevy_panel_renders_in_equip_tab(app_page: Page):
    """HevyImportPanel header is visible in the Gear/Equip tab."""
    _navigate_to_equip(app_page)

    content = app_page.get_by_test_id("tab-content")
    # The panel header reads "Import from Hevy"
    hevy_heading = content.get_by_text("Import from Hevy", exact=True)
    expect(hevy_heading).to_be_visible()


def test_upload_csv_shows_preview_counts(app_page: Page, tmp_path):
    """Uploading sample CSV transitions to the parsed confirmation panel.

    Verifies:
      - Stat chips (Workouts / Exercises matched / Exercises skipped) appear.
      - The panel contains "2" (matched workouts) and "1" (skipped exercise).
      - Expanding the skipped list shows "Zercher Squat" by name.
    """
    _navigate_to_equip(app_page)
    csv_path = _write_csv(tmp_path, "hevy.csv", SAMPLE_CSV)
    _upload_csv(app_page, csv_path)

    content = app_page.get_by_test_id("tab-content")

    # The three StatChip labels
    expect(content.get_by_text("Workouts", exact=True)).to_be_visible()
    expect(content.get_by_text("Exercises matched", exact=True)).to_be_visible()
    expect(content.get_by_text("Exercises skipped", exact=True)).to_be_visible()

    panel_text = content.inner_text()
    assert "2" in panel_text, f"Expected '2' matched workouts in panel, got: {panel_text!r}"
    assert "1" in panel_text, f"Expected '1' skipped in panel, got: {panel_text!r}"

    # Expand the skipped list to verify "Zercher Squat" is listed.
    show_skipped_btn = content.get_by_role("button").filter(has_text="Show skipped exercises")
    expect(show_skipped_btn).to_be_visible()
    show_skipped_btn.click()
    app_page.wait_for_timeout(200)

    expect(content.get_by_text("Zercher Squat")).to_be_visible()


def test_cancel_discards_parse(app_page: Page, tmp_path):
    """After uploading, clicking Cancel hides the preview and writes nothing to storage."""
    _navigate_to_equip(app_page)
    csv_path = _write_csv(tmp_path, "hevy.csv", SAMPLE_CSV)
    _upload_csv(app_page, csv_path)

    content = app_page.get_by_test_id("tab-content")
    # Confirm we're in the parsed phase.
    expect(content.get_by_text("Workouts", exact=True)).to_be_visible()

    # Click Cancel
    cancel_btn = content.get_by_role("button", name="Cancel")
    expect(cancel_btn).to_be_visible()
    cancel_btn.click()
    app_page.wait_for_timeout(300)

    # Panel should revert to idle (the "Choose .csv file" button returns)
    expect(content.get_by_text("Choose .csv file", exact=True)).to_be_visible()
    # Confirmation panel stats should no longer be visible
    expect(content.get_by_text("Workouts", exact=True)).to_have_count(0)

    # localStorage should have no sessions (key absent or empty array)
    sessions = get_local_storage(app_page, SESSIONS_KEY)
    assert sessions is None or sessions == [], \
        f"Cancel should not write to sessions, got: {sessions}"


def test_import_commits_sessions_to_localstorage(app_page: Page, tmp_path):
    """Clicking Import after upload writes 2 sessions with correct shape to localStorage.

    kg->lb conversion assertions (kgToLb rounds to nearest 2.5 lb):
      - Bench Press 80 kg  -> 177.5 lb
      - Bench Press 82.5 kg -> 182.5 lb
      - Tricep Pushdown 30 kg -> 65 lb
      - Lat Pulldown 60 kg -> 132.5 lb
    """
    _navigate_to_equip(app_page)
    csv_path = _write_csv(tmp_path, "hevy.csv", SAMPLE_CSV)
    _upload_csv(app_page, csv_path)

    content = app_page.get_by_test_id("tab-content")
    expect(content.get_by_text("Workouts", exact=True)).to_be_visible()

    # Click the Import button (label contains "Import" and session count)
    import_btn = content.get_by_role("button").filter(has_text="Import")
    expect(import_btn).to_be_visible()
    import_btn.click()
    app_page.wait_for_timeout(400)

    # Success message should appear
    success_text = content.inner_text()
    assert "imported" in success_text.lower() or "workout" in success_text.lower(), \
        f"Expected success message after import, got: {success_text!r}"

    # Read sessions from localStorage
    sessions = get_local_storage(app_page, SESSIONS_KEY)
    assert isinstance(sessions, list), f"Expected list in sessions storage, got: {type(sessions)}"
    assert len(sessions) == 2, f"Expected 2 sessions, got {len(sessions)}: {sessions}"

    # Each session must have required fields
    for s in sessions:
        assert isinstance(s.get("id"), str) and s["id"].startswith("s-"), \
            f"Session id malformed: {s.get('id')}"
        assert isinstance(s.get("startedAt"), (int, float)) and s["startedAt"] > 0, \
            f"Session missing startedAt: {s}"
        assert isinstance(s.get("exercises"), list) and len(s["exercises"]) > 0, \
            f"Session has no exercises: {s}"

    # Session 1 (Push Day): should have Bench Press + Tricep Pushdown
    push_session = next(
        (s for s in sessions if "Push" in (s.get("workoutKey") or "")), None
    )
    assert push_session is not None, "Could not find Push Day session"

    push_ex_ids = [e["exerciseId"] for e in push_session["exercises"]]
    assert "barbell_floor_press" in push_ex_ids, \
        f"Expected barbell_floor_press in Push session, got: {push_ex_ids}"
    assert "tricep_rope_pushdown" in push_ex_ids, \
        f"Expected tricep_rope_pushdown in Push session, got: {push_ex_ids}"

    # Verify Bench Press sets and weights (kg->lb with nearest-2.5 rounding)
    bench_ex = next(
        (e for e in push_session["exercises"] if e["exerciseId"] == "barbell_floor_press"),
        None,
    )
    assert bench_ex is not None
    assert len(bench_ex["sets"]) == 2, \
        f"Bench Press should have 2 sets, got {len(bench_ex['sets'])}"

    set1, set2 = bench_ex["sets"]
    assert set1["weight"] == 177.5, \
        f"Set 1 weight: expected 177.5 lb (80 kg), got {set1['weight']}"
    assert set1["reps"] == 8, f"Set 1 reps: expected 8, got {set1['reps']}"
    assert set2["weight"] == 182.5, \
        f"Set 2 weight: expected 182.5 lb (82.5 kg), got {set2['weight']}"
    assert set2["reps"] == 6, f"Set 2 reps: expected 6, got {set2['reps']}"

    # Verify Tricep Pushdown weight
    tricep_ex = next(
        (e for e in push_session["exercises"] if e["exerciseId"] == "tricep_rope_pushdown"),
        None,
    )
    assert tricep_ex is not None
    assert len(tricep_ex["sets"]) == 1
    assert tricep_ex["sets"][0]["weight"] == 65.0, \
        f"Tricep Pushdown: expected 65 lb (30 kg), got {tricep_ex['sets'][0]['weight']}"

    # Session 2 (Pull Day): should have Lat Pulldown
    pull_session = next(
        (s for s in sessions if "Pull" in (s.get("workoutKey") or "")), None
    )
    assert pull_session is not None, "Could not find Pull Day session"
    pull_ex_ids = [e["exerciseId"] for e in pull_session["exercises"]]
    assert "lat_pulldown_wide" in pull_ex_ids, \
        f"Expected lat_pulldown_wide in Pull session, got: {pull_ex_ids}"

    lat_ex = next(
        (e for e in pull_session["exercises"] if e["exerciseId"] == "lat_pulldown_wide"),
        None,
    )
    assert lat_ex is not None
    assert lat_ex["sets"][0]["weight"] == 132.5, \
        f"Lat Pulldown: expected 132.5 lb (60 kg), got {lat_ex['sets'][0]['weight']}"


def test_reimport_appends_no_dedup(app_page: Page, tmp_path):
    """Importing the same CSV twice appends sessions without deduplication.

    Per spec: the Hevy import flow has no dedup by design; each import appends.
    After two imports, localStorage should contain 4 sessions.
    """
    _navigate_to_equip(app_page)
    csv_path = _write_csv(tmp_path, "hevy.csv", SAMPLE_CSV)

    # First import
    _upload_csv(app_page, csv_path)
    content = app_page.get_by_test_id("tab-content")
    expect(content.get_by_text("Workouts", exact=True)).to_be_visible()
    content.get_by_role("button").filter(has_text="Import").click()
    app_page.wait_for_timeout(400)

    sessions_after_1 = get_local_storage(app_page, SESSIONS_KEY)
    assert isinstance(sessions_after_1, list) and len(sessions_after_1) == 2, \
        f"Expected 2 sessions after first import, got: {len(sessions_after_1) if sessions_after_1 else None}"

    # Reset the panel to idle for the second import
    import_another_btn = content.get_by_role("button").filter(has_text="Import another file")
    expect(import_another_btn).to_be_visible()
    import_another_btn.click()
    app_page.wait_for_timeout(200)

    # Second import
    _upload_csv(app_page, csv_path)
    expect(content.get_by_text("Workouts", exact=True)).to_be_visible()
    content.get_by_role("button").filter(has_text="Import").click()
    app_page.wait_for_timeout(400)

    sessions_after_2 = get_local_storage(app_page, SESSIONS_KEY)
    assert isinstance(sessions_after_2, list) and len(sessions_after_2) == 4, \
        f"Expected 4 sessions after second import (no dedup), got: " \
        f"{len(sessions_after_2) if sessions_after_2 else None}"


def test_quoted_field_csv_no_choke(app_page: Page, tmp_path):
    """Parser handles quoted fields with commas — no crash, skipped name is exact.

    The exercise '"Bench Press, Wide Grip"' has no entry in hevy-name-map so it
    should appear in the skipped list with its comma intact.
    Tricep Pushdown is matched, so one session is produced.
    """
    _navigate_to_equip(app_page)
    csv_path = _write_csv(tmp_path, "quoted.csv", QUOTED_FIELD_CSV)
    _upload_csv(app_page, csv_path)

    content = app_page.get_by_test_id("tab-content")

    # Should NOT land in error phase — parser must survive the quoted comma.
    # If the parser choked, the error div would appear instead of the stat chips.
    expect(content.get_by_text("Workouts", exact=True)).to_be_visible()

    # One workout matched (Tricep Pushdown is in the name-map)
    panel_text = content.inner_text()
    assert "1" in panel_text, f"Expected 1 matched workout, got: {panel_text!r}"

    # "Bench Press, Wide Grip" should be in the skipped list — expand it.
    show_skipped_btn = content.get_by_role("button").filter(has_text="Show skipped exercises")
    expect(show_skipped_btn).to_be_visible()
    show_skipped_btn.click()
    app_page.wait_for_timeout(200)

    # The name must appear verbatim (no quote artifacts, comma preserved)
    expect(content.get_by_text("Bench Press, Wide Grip")).to_be_visible()
