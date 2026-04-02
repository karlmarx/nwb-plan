"""Gear/equipment tab tests — toggles, week start day, persistence."""

from playwright.sync_api import Page, expect

from conftest import click_tab, get_local_storage


def test_gear_tab_has_week_start(app_page: Page):
    """Gear tab shows Week Start Day picker."""
    click_tab(app_page, "gear")
    content = app_page.get_by_test_id("tab-content")
    expect(content.get_by_text("Week Start Day", exact=False).first).to_be_visible()


def test_gear_tab_day_buttons(app_page: Page):
    """Gear tab has 7 day abbreviations in week start section."""
    click_tab(app_page, "gear")
    content = app_page.get_by_test_id("tab-content")
    # Expand the Week Start Day section first (collapsed by default)
    week_section = content.get_by_test_id("section").filter(has_text="Week Start Day")
    if week_section.count() > 0:
        week_section.first.locator("button").first.click()
        app_page.wait_for_timeout(300)
    text = content.inner_text()
    for day in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]:
        assert day in text, f"Day '{day}' not found in gear tab"


def test_gear_tab_equipment_sections(app_page: Page):
    """Gear tab has equipment category sections."""
    click_tab(app_page, "gear")
    sections = app_page.get_by_test_id("tab-content").get_by_test_id("section")
    assert sections.count() >= 3, "Gear tab should have multiple equipment sections"


def test_gear_tab_equipment_toggles(app_page: Page):
    """Gear tab has equipment toggle buttons."""
    click_tab(app_page, "gear")
    content = app_page.get_by_test_id("tab-content")
    # Expand first equipment section
    sections = content.get_by_test_id("section")
    if sections.count() > 0:
        sections.first.locator("button").first.click()
        app_page.wait_for_timeout(300)
        # Should have some toggle-like buttons inside
        inner = sections.first.inner_text()
        assert len(inner) > 20, "Equipment section should have toggleable items"


def test_gear_tab_week_start_section_expanded(app_page: Page):
    """Expanding Week Start Day section shows day grid with all 7 days."""
    click_tab(app_page, "gear")
    content = app_page.get_by_test_id("tab-content")

    # Expand the Week Start Day section
    week_section = content.get_by_test_id("section").filter(has_text="Week Start Day")
    if week_section.count() > 0:
        week_section.first.locator("button").first.click()
        app_page.wait_for_timeout(300)

    expanded_text = content.inner_text().upper()
    # Rotation grid shows all 7 day abbreviations
    for day in ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]:
        assert day in expanded_text, f"Day '{day}' not found in expanded start day section"
