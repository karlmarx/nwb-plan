"""E2E tests for the ad-hoc supersets / universal complement picker."""

from playwright.sync_api import Page, expect


def open_picker_for_first_exercise(page: Page) -> None:
    """Open the complement picker for the first exercise on Today."""
    page.get_by_test_id("tab-workout").click()
    # Expand first exercise so its "+ complement" button is visible
    first_row = page.get_by_test_id("exercise-row").first
    first_row.click()
    first_row.get_by_role("button", name="Add complement").first.click()
    expect(page.get_by_test_id("complement-picker")).to_be_visible()


def test_picker_has_search_and_results(app_page: Page):
    """Picker renders a search input and shows a flat list of curated results."""
    open_picker_for_first_exercise(app_page)
    expect(app_page.get_by_test_id("complement-search")).to_be_visible()
    # At least one result row appears with a source label
    rows = app_page.get_by_test_id("complement-result")
    expect(rows.first).to_be_visible()


def test_filter_chip_narrows_results(app_page: Page):
    """Activating a single filter chip removes results from other sources."""
    open_picker_for_first_exercise(app_page)
    # Establish baseline: at least one non-catalog row exists
    pre_count = app_page.get_by_test_id("complement-result").count()
    assert pre_count > 0

    # Activate the Nearby chip — only NEARBY-labeled rows should remain
    app_page.get_by_test_id("filter-chip-nearby").click()
    rows = app_page.get_by_test_id("complement-result")
    # Every visible result row's label badge must say NEARBY
    for i in range(rows.count()):
        badge = rows.nth(i).locator("span", has_text="NEARBY")
        expect(badge).to_be_visible()
