"""Core tab tests — blocks by body part, equipment picker."""

from playwright.sync_api import Page, expect

from conftest import click_tab


def test_core_tab_has_gallery_button(app_page: Page):
    """Core tab shows diagram gallery button."""
    click_tab(app_page, "core")
    expect(app_page.get_by_test_id("open-core-gallery")).to_be_visible()


def test_core_tab_body_part_sections(app_page: Page):
    """Core tab shows sections organized by body part."""
    click_tab(app_page, "core")
    content = app_page.get_by_test_id("tab-content")

    # Check for body part section headings
    for heading in ["Anterior", "Obliques", "Posterior"]:
        expect(content.get_by_text(heading, exact=False).first).to_be_visible()


def test_core_tab_has_sections(app_page: Page):
    """Core tab has multiple exercise sections."""
    click_tab(app_page, "core")
    sections = app_page.get_by_test_id("tab-content").get_by_test_id("section")
    assert sections.count() >= 3, "Core tab should have at least 3 body part sections"


def test_core_tab_equipment_picker(app_page: Page):
    """Core tab has equipment nearby picker for equipment-specific exercises."""
    click_tab(app_page, "core")
    content = app_page.get_by_test_id("tab-content")
    # Look for equipment text
    text = content.inner_text()
    assert "equipment" in text.lower() or "nearby" in text.lower(), \
        "Core tab should have equipment picker section"
