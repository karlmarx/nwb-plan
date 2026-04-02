"""Tab navigation tests — all 7 tabs."""

from playwright.sync_api import Page, expect

from conftest import click_tab, TAB_NAMES, get_local_storage


def test_all_tabs_clickable(app_page: Page):
    """Each of the 6 content tabs + gear can be clicked without error."""
    for name in TAB_NAMES:
        click_tab(app_page, name)
        expect(app_page.get_by_test_id("tab-content")).to_be_visible()

    click_tab(app_page, "gear")
    expect(app_page.get_by_test_id("tab-content")).to_be_visible()


def test_active_tab_styling(app_page: Page):
    """Active tab has different styling than inactive tabs."""
    click_tab(app_page, "upper")
    upper_btn = app_page.get_by_test_id("tab-upper")
    workout_btn = app_page.get_by_test_id("tab-workout")

    upper_border = upper_btn.evaluate("el => getComputedStyle(el).borderColor")
    workout_border = workout_btn.evaluate("el => getComputedStyle(el).borderColor")
    assert upper_border != workout_border, "Active and inactive tabs should have different border colors"


def test_tab_content_changes(app_page: Page):
    """Clicking different tabs shows different content."""
    click_tab(app_page, "workout")
    workout_html = app_page.get_by_test_id("tab-content").inner_html()

    click_tab(app_page, "safety")
    safety_html = app_page.get_by_test_id("tab-content").inner_html()

    assert workout_html != safety_html, "Tab content should change between tabs"


def test_tab_persists_to_localstorage(app_page: Page):
    """Clicking a tab saves the index to localStorage."""
    click_tab(app_page, "core")  # index 3
    val = get_local_storage(app_page, "nwb_tab")
    assert val == 3


def test_gear_tab_accessible(app_page: Page):
    """Gear tab shows equipment configuration content."""
    click_tab(app_page, "gear")
    content = app_page.get_by_test_id("tab-content")
    expect(content).to_contain_text("Week Start Day")
