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

    # Rows should not be visible while collapsed.
    expect(app_page.get_by_test_id("hep-row-hep_prone_hip_extension")).to_have_count(0)

    app_page.get_by_test_id("hep-pill-toggle").click()

    expect(pill).to_have_attribute("data-hep-expanded", "true")
    expect(app_page.get_by_test_id("hep-row-hep_prone_hip_extension")).to_be_visible()


def test_hep_pill_checkbox_toggles_completion(app_page: Page):
    """Tapping a row checkbox marks it done and updates the count."""
    app_page.get_by_test_id("hep-pill-toggle").click()
    app_page.get_by_test_id("hep-checkbox-hep_prone_hip_extension").click()

    pill = app_page.get_by_test_id("hep-block-pill")
    expect(pill).to_have_attribute("data-hep-done", "1")

    # Reload and verify persistence.
    app_page.reload()
    app_page.wait_for_selector("[data-testid='day-header']", timeout=8000)
    expect(app_page.get_by_test_id("hep-block-pill")).to_have_attribute(
        "data-hep-done", "1",
    )
