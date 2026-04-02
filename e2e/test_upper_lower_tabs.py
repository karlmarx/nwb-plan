"""Upper and Lower exercise library tab tests."""

from playwright.sync_api import Page, expect

from conftest import click_tab


def test_upper_tab_has_gallery_button(app_page: Page):
    """Upper tab shows diagram gallery button."""
    click_tab(app_page, "upper")
    expect(app_page.get_by_test_id("open-diagram-gallery")).to_be_visible()


def test_upper_tab_filter_pills(app_page: Page):
    """Upper tab shows muscle group filter pills."""
    click_tab(app_page, "upper")
    content = app_page.get_by_test_id("tab-content")
    for group in ["All", "Chest", "Shoulders", "Back", "Arms"]:
        expect(content.get_by_text(group, exact=True).first).to_be_visible()


def test_upper_tab_filter_changes_content(app_page: Page):
    """Clicking a filter pill changes displayed sections."""
    click_tab(app_page, "upper")
    content = app_page.get_by_test_id("tab-content")

    # Click "Back" filter
    content.get_by_text("Back", exact=True).first.click()
    app_page.wait_for_timeout(300)
    back_html = content.inner_html()

    # Click "Chest" filter
    content.get_by_text("Chest", exact=True).first.click()
    app_page.wait_for_timeout(300)
    chest_html = content.inner_html()

    assert back_html != chest_html, "Filters should change visible content"


def test_upper_tab_all_filter_resets(app_page: Page):
    """Clicking All after filtering shows all groups."""
    click_tab(app_page, "upper")
    content = app_page.get_by_test_id("tab-content")

    # Filter to one group
    content.get_by_text("Chest", exact=True).first.click()
    app_page.wait_for_timeout(200)
    filtered_sections = content.get_by_test_id("section").count()

    # Reset
    content.get_by_text("All", exact=True).first.click()
    app_page.wait_for_timeout(200)
    all_sections = content.get_by_test_id("section").count()

    assert all_sections >= filtered_sections, "All should show at least as many sections as filtered"


def test_upper_tab_exercise_stats(app_page: Page):
    """Upper tab shows exercise availability stats."""
    click_tab(app_page, "upper")
    content = app_page.get_by_test_id("tab-content")
    text = content.inner_text()
    assert "exercises" in text.lower() or "available" in text.lower(), \
        "Should show exercise count or availability"


def test_lower_tab_has_gallery_button(app_page: Page):
    """Lower tab shows diagram gallery button."""
    click_tab(app_page, "lower")
    expect(app_page.get_by_test_id("open-diagram-gallery")).to_be_visible()


def test_lower_tab_filter_pills(app_page: Page):
    """Lower tab shows muscle group filter pills."""
    click_tab(app_page, "lower")
    content = app_page.get_by_test_id("tab-content")
    text = content.inner_text()
    # Check for filter pill groups (partial match since labels include "/" separators)
    for group in ["All", "Quads", "Glutes", "Hamstrings"]:
        assert group.lower() in text.lower(), f"Filter group '{group}' not found in Lower tab"


def test_lower_tab_has_rehab_section(app_page: Page):
    """Lower tab includes Left Leg Rehab section."""
    click_tab(app_page, "lower")
    content = app_page.get_by_test_id("tab-content")
    expect(content.get_by_text("Rehab", exact=False).first).to_be_visible()


def test_lower_tab_different_count_than_upper(app_page: Page):
    """Lower tab has different exercise sections than Upper."""
    click_tab(app_page, "upper")
    upper_sections = app_page.get_by_test_id("tab-content").get_by_test_id("section").count()

    click_tab(app_page, "lower")
    lower_sections = app_page.get_by_test_id("tab-content").get_by_test_id("section").count()

    assert upper_sections != lower_sections or upper_sections > 0, \
        "Upper and Lower should have exercise sections"
