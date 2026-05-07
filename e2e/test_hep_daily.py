"""HEP Daily section E2E tests.

Covers: Today-tab collapsed pill, Rehab-tab full block, end-of-workout strip,
and completion-sync across all three surfaces.

Storage:
  nwb_hep_done_<YYYY-MM-DD>: string[]   # HEP exercise ids checked off today
"""

from __future__ import annotations

from datetime import date

from playwright.sync_api import Page, expect

from conftest import click_tab


# Today's HEP date key — must match components/hep-block.tsx::todayKey().
def _today_key() -> str:
    return date.today().isoformat()


def _storage_key() -> str:
    return f"nwb_hep_done_{_today_key()}"


# ---------------------------------------------------------------------------
# Today tab — collapsed pill
# ---------------------------------------------------------------------------

def test_hep_pill_renders_on_today_tab(app_page: Page):
    """Pill renders at the top of the Today tab with correct count."""
    pill = app_page.get_by_test_id("hep-block-pill")
    expect(pill).to_be_visible()

    # Count should match the seeded HEP_EXERCISES length (6 as of May 6).
    expect(pill).to_have_attribute("data-hep-total", "6")
    expect(pill).to_have_attribute("data-hep-done", "0")


def test_hep_pill_starts_collapsed_and_expands(app_page: Page):
    """Pill is collapsed by default; clicking it expands the row list."""
    pill = app_page.get_by_test_id("hep-block-pill")
    expect(pill).to_have_attribute("data-hep-expanded", "false")

    # Rows should not be visible inside the pill while collapsed.
    # (Scope to the pill container to avoid matching the always-visible strip rows.)
    expect(pill.get_by_test_id("hep-row-hep_prone_hip_extension")).to_have_count(0)

    app_page.get_by_test_id("hep-pill-toggle").click()

    expect(pill).to_have_attribute("data-hep-expanded", "true")
    expect(pill.get_by_test_id("hep-row-hep_prone_hip_extension")).to_be_visible()


def test_hep_pill_checkbox_toggles_completion(app_page: Page):
    """Tapping a row checkbox marks it done and updates the count."""
    pill = app_page.get_by_test_id("hep-block-pill")
    app_page.get_by_test_id("hep-pill-toggle").click()
    # Scope to pill to avoid strict-mode collision with the strip instance.
    pill.get_by_test_id("hep-checkbox-hep_prone_hip_extension").click()

    expect(pill).to_have_attribute("data-hep-done", "1")

    # Reload and verify persistence.
    app_page.reload()
    app_page.wait_for_selector("[data-testid='day-header']", timeout=8000)
    expect(app_page.get_by_test_id("hep-block-pill")).to_have_attribute(
        "data-hep-done", "1",
    )


# ---------------------------------------------------------------------------
# Rehab tab — always-expanded full block
# ---------------------------------------------------------------------------

def test_hep_full_block_renders_on_rehab_tab(app_page: Page):
    """Full block renders at the top of the Rehab tab, always expanded."""
    click_tab(app_page, "rehab")
    app_page.wait_for_selector("[data-testid='rehab-tab']", timeout=8000)

    full = app_page.get_by_test_id("hep-block-full")
    expect(full).to_be_visible()
    expect(full).to_have_attribute("data-hep-total", "6")

    # All six rows should be visible immediately (no toggle).
    for ex_id in [
        "hep_prone_hip_extension",
        "hep_hip_abduction_sidelying",
        "hep_straight_leg_raise",
        "hep_bridging_ball_squeeze",
        "hep_isometric_hip_er_prone_ball",
        "hep_band_sidelying_clamshell",
    ]:
        expect(app_page.get_by_test_id(f"hep-row-{ex_id}")).to_be_visible()


def test_hep_full_block_above_phase_picker(app_page: Page):
    """The full block sits above the existing rehab-phase-picker."""
    click_tab(app_page, "rehab")
    app_page.wait_for_selector("[data-testid='rehab-tab']", timeout=8000)

    full_box = app_page.get_by_test_id("hep-block-full").bounding_box()
    picker_box = app_page.get_by_test_id("rehab-phase-picker").bounding_box()
    assert full_box is not None and picker_box is not None
    assert full_box["y"] < picker_box["y"], (
        f"HEP full block should be above the phase picker "
        f"(full y={full_box['y']}, picker y={picker_box['y']})"
    )


# ---------------------------------------------------------------------------
# End-of-workout strip
# ---------------------------------------------------------------------------

def test_hep_strip_renders_at_end_of_today_workout(app_page: Page):
    """The HEP strip appears at the bottom of today's workout."""
    # Today's workoutKey can vary by day-of-week — assert at least one strip exists.
    strips = app_page.locator("[data-testid^='hep-strip-']")
    expect(strips.first).to_be_visible()
    expect(strips.first).to_have_attribute("data-hep-total", "6")


def test_hep_strip_completion_syncs_with_pill(app_page: Page):
    """Checking off a HEP exercise in the pill reflects in the strip immediately."""
    # Expand the pill and check off one exercise.
    # Scope to pill to avoid strict-mode collision with the strip instance.
    pill = app_page.get_by_test_id("hep-block-pill")
    app_page.get_by_test_id("hep-pill-toggle").click()
    pill.get_by_test_id("hep-checkbox-hep_prone_hip_extension").click()

    # The strip's done counter should bump to 1.
    strips = app_page.locator("[data-testid^='hep-strip-']")
    expect(strips.first).to_have_attribute("data-hep-done", "1")


def test_hep_strip_completion_syncs_with_rehab_tab(app_page: Page):
    """Checking off in the strip reflects on the Rehab-tab full block."""
    # Tap a checkbox via the strip — the strip uses the same hep-checkbox-* testids
    # because the row component is shared. Force-scroll to it first.
    app_page.get_by_test_id("hep-checkbox-hep_straight_leg_raise").last.scroll_into_view_if_needed()
    app_page.get_by_test_id("hep-checkbox-hep_straight_leg_raise").last.click()

    # Switch to the Rehab tab and verify the count.
    click_tab(app_page, "rehab")
    app_page.wait_for_selector("[data-testid='rehab-tab']", timeout=8000)
    expect(app_page.get_by_test_id("hep-block-full")).to_have_attribute("data-hep-done", "1")
