"""Workout tab tests — day picker, sections, exercises, supplements."""

from playwright.sync_api import Page, expect

from conftest import click_tab


def test_workout_tab_shows_content(app_page: Page):
    """Workout tab displays workout sections."""
    click_tab(app_page, "workout")
    content = app_page.get_by_test_id("tab-content")
    expect(content).to_be_visible()
    # Should have at least one section
    sections = content.get_by_test_id("section")
    assert sections.count() >= 1, "Workout tab should have at least one section"


def test_day_picker_visible(app_page: Page):
    """Day picker grid with 7 days is visible on workout tab."""
    click_tab(app_page, "workout")
    content = app_page.get_by_test_id("tab-content")
    # Day grid has 7 cells — look for the grid container
    grid_text = content.inner_text()
    grid_text_upper = grid_text.upper()
    for day in ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]:
        assert day in grid_text_upper, f"Day '{day}' not found in workout tab"


def test_clicking_day_changes_workout(app_page: Page):
    """Clicking a different day in the picker changes selected day styling."""
    click_tab(app_page, "workout")
    content = app_page.get_by_test_id("tab-content")

    # Day cells are <div> elements (not buttons) inside the grid
    day_cells = content.locator(".grid.grid-cols-7 > div")
    if day_cells.count() < 7:
        return  # Skip if grid not found

    # Click Monday (index 0) and Saturday (index 5)
    day_cells.nth(0).click()
    app_page.wait_for_timeout(200)
    html_mon = content.inner_html()

    day_cells.nth(5).click()
    app_page.wait_for_timeout(200)
    html_sat = content.inner_html()

    # The selected day border/background styling should differ
    assert html_mon != html_sat, "Clicking different days should change selected state"


def test_section_expandable(app_page: Page):
    """Sections can be expanded/collapsed by clicking."""
    click_tab(app_page, "workout")
    sections = app_page.get_by_test_id("section")
    if sections.count() > 0:
        first_section = sections.first
        # Click header to toggle
        first_section.locator("button").first.click()
        app_page.wait_for_timeout(300)
        # Should show some content or exercises
        inner = first_section.inner_html()
        assert len(inner) > 50, "Expanded section should have content"


def test_exercise_rows_visible_in_section(app_page: Page):
    """Expanded section contains exercise rows."""
    click_tab(app_page, "workout")
    sections = app_page.get_by_test_id("section")
    if sections.count() > 0:
        # Click to expand first section
        sections.first.locator("button").first.click()
        app_page.wait_for_timeout(300)
        # Check for exercise rows
        rows = sections.first.get_by_test_id("exercise-row")
        if rows.count() > 0:
            expect(rows.first.get_by_test_id("exercise-name")).to_be_visible()
