"""Safety tab tests — injuries, stop signals, removed exercises."""

from playwright.sync_api import Page, expect

from conftest import click_tab


def test_safety_tab_has_content(app_page: Page):
    """Safety tab renders content."""
    click_tab(app_page, "safety")
    content = app_page.get_by_test_id("tab-content")
    expect(content).to_be_visible()
    assert len(content.inner_text()) > 100, "Safety tab should have substantial content"


def test_safety_tab_injury_status(app_page: Page):
    """Safety tab shows injury status section."""
    click_tab(app_page, "safety")
    content = app_page.get_by_test_id("tab-content")
    text = content.inner_text()
    assert "injury" in text.lower() or "mri" in text.lower(), \
        "Safety tab should mention injury status"


def test_safety_tab_stop_signals(app_page: Page):
    """Safety tab shows absolute stop signals."""
    click_tab(app_page, "safety")
    content = app_page.get_by_test_id("tab-content")
    text = content.inner_text()
    assert "stop" in text.lower(), "Safety tab should have stop signals section"


def test_safety_tab_pool_entry_section(app_page: Page):
    """Safety tab has Pool Entry section (key NWB water safety info)."""
    click_tab(app_page, "safety")
    content = app_page.get_by_test_id("tab-content")
    text = content.inner_text()
    assert "pool" in text.lower() or "water" in text.lower(), \
        "Safety tab should have pool entry section"


def test_safety_tab_has_sections(app_page: Page):
    """Safety tab has multiple sections."""
    click_tab(app_page, "safety")
    sections = app_page.get_by_test_id("tab-content").get_by_test_id("section")
    assert sections.count() >= 2, "Safety tab should have multiple sections"
