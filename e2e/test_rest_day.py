"""Rest Day Override tests — move rest day to a different day of the week."""

from playwright.sync_api import Page, expect

from conftest import click_tab, get_local_storage, set_local_storage


def _open_rest_day_section(page: Page):
    """Navigate to gear tab and expand the Rest Day This Week section."""
    click_tab(page, "gear")
    content = page.get_by_test_id("tab-content")
    section = content.get_by_test_id("section").filter(has_text="Rest Day This Week")
    section.first.locator("button").first.click()
    page.wait_for_timeout(300)
    return content


def test_rest_day_section_exists(app_page: Page):
    """Gear tab has a 'Rest Day This Week' section."""
    click_tab(app_page, "gear")
    content = app_page.get_by_test_id("tab-content")
    expect(content.get_by_text("Rest Day This Week", exact=False).first).to_be_visible()


def test_rest_day_picker_has_7_buttons(app_page: Page):
    """Rest day picker shows buttons for all 7 days."""
    content = _open_rest_day_section(app_page)
    picker = content.get_by_test_id("rest-day-picker")
    buttons = picker.locator("button")
    assert buttons.count() == 7, f"Expected 7 day buttons, got {buttons.count()}"


def test_rest_day_default_is_sunday(app_page: Page):
    """With default settings (startDay=0), Sunday is the default rest day."""
    content = _open_rest_day_section(app_page)
    # Sunday button (index 6) should be highlighted (bold font-weight 700)
    sun_btn = content.get_by_test_id("rest-day-6")
    fw = sun_btn.evaluate("el => getComputedStyle(el).fontWeight")
    assert fw in ("700", "bold"), f"Sunday button should be bold, got fontWeight={fw}"


def test_click_rest_day_changes_schedule(app_page: Page):
    """Clicking a different rest day updates the workout schedule."""
    content = _open_rest_day_section(app_page)

    # Click Wednesday (index 2) as rest day
    content.get_by_test_id("rest-day-2").click()
    app_page.wait_for_timeout(300)

    # Should show adjusted rotation text
    rotation_text = content.inner_text()
    assert "Adjusted rotation" in rotation_text, "Should show adjusted rotation preview"
    # Wednesday should now be Recovery in the rotation
    assert "Wed=Recovery" in rotation_text, f"Wed should be Recovery, got: {rotation_text}"


def test_rest_day_override_persists(app_page: Page, base_url: str):
    """Rest day override persists in localStorage across reload."""
    _open_rest_day_section(app_page)

    # Click Thursday (index 3) as rest day
    app_page.get_by_test_id("rest-day-3").click()
    app_page.wait_for_timeout(300)

    val = get_local_storage(app_page, "nwb_restDay")
    assert val == 3, f"nwb_restDay should be 3, got {val}"

    # Reload and verify it persists
    app_page.reload()
    app_page.wait_for_selector("[data-testid='app-container']")
    val = get_local_storage(app_page, "nwb_restDay")
    assert val == 3, f"nwb_restDay should persist as 3 after reload, got {val}"


def test_rest_day_affects_today_tab(app_page: Page, base_url: str):
    """Setting rest day override changes the workout shown in the day picker."""
    # Pre-seed rest day to Wednesday (2)
    set_local_storage(app_page, {"nwb_restDay": 2})
    app_page.reload()
    app_page.wait_for_selector("[data-testid='app-container']")

    # Go to workout (Today) tab — should be tab 0
    click_tab(app_page, "workout")
    app_page.wait_for_timeout(300)

    # The day picker grid should show Recovery on Wednesday
    content = app_page.get_by_test_id("tab-content")
    day_grid = content.locator(".grid").first
    day_cells = day_grid.locator("> div")

    # Wednesday is index 2
    wed_cell = day_cells.nth(2)
    wed_text = wed_cell.inner_text()
    assert "Recovery" in wed_text, f"Wednesday should show Recovery, got: {wed_text}"


def test_rest_day_reset_button(app_page: Page):
    """The 'Reset to default' button clears the rest day override."""
    content = _open_rest_day_section(app_page)

    # Set override to Tuesday
    content.get_by_test_id("rest-day-1").click()
    app_page.wait_for_timeout(300)

    # Click reset
    content.get_by_text("Reset to default").click()
    app_page.wait_for_timeout(300)

    # Override should be cleared
    val = get_local_storage(app_page, "nwb_restDay")
    assert val is None, f"nwb_restDay should be null after reset, got {val}"


def test_rest_day_training_order_preserved(app_page: Page, base_url: str):
    """Moving rest day preserves the order of the 6 training workouts."""
    # Set rest day to Wednesday (index 2), startDay=0 (default Mon)
    set_local_storage(app_page, {"nwb_restDay": 2, "nwb_startDay": 0})
    app_page.reload()
    app_page.wait_for_selector("[data-testid='app-container']")

    click_tab(app_page, "workout")
    app_page.wait_for_timeout(300)

    content = app_page.get_by_test_id("tab-content")
    day_grid = content.locator(".grid").first
    day_cells = day_grid.locator("> div")

    # Expected order: Mon=Push A, Tue=Pull A, Wed=Recovery,
    #                 Thu=Legs A, Fri=Push B, Sat=Pull B, Sun=Legs B
    expected = ["Push A", "Pull A", "Recovery", "Legs A", "Push B", "Pull B", "Legs B"]
    for i, exp in enumerate(expected):
        cell_text = day_cells.nth(i).inner_text()
        assert exp in cell_text, f"Day {i} should show {exp}, got: {cell_text}"


def test_rest_day_click_default_clears_override(app_page: Page):
    """Clicking the default rest day (Sunday with startDay=0) clears the override."""
    content = _open_rest_day_section(app_page)

    # Set override to Monday first
    content.get_by_test_id("rest-day-0").click()
    app_page.wait_for_timeout(200)
    val = get_local_storage(app_page, "nwb_restDay")
    assert val == 0, "Override should be 0 (Monday)"

    # Now click Sunday (6) — the default rest day — should clear override
    content.get_by_test_id("rest-day-6").click()
    app_page.wait_for_timeout(200)
    val = get_local_storage(app_page, "nwb_restDay")
    assert val is None, f"Clicking default rest day should clear override, got {val}"
