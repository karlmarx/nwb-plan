"""Cardio tab tests — tiers and schedule."""

from playwright.sync_api import Page, expect

from conftest import click_tab


def test_cardio_tab_has_content(app_page: Page):
    """Cardio tab displays tier sections."""
    click_tab(app_page, "cardio")
    content = app_page.get_by_test_id("tab-content")
    expect(content).to_be_visible()
    assert len(content.inner_text()) > 50, "Cardio tab should have content"


def test_cardio_tab_has_tiers(app_page: Page):
    """Cardio tab shows exercise tiers."""
    click_tab(app_page, "cardio")
    content = app_page.get_by_test_id("tab-content")
    text = content.inner_text()
    assert "tier" in text.lower() or "cardio" in text.lower(), \
        "Cardio tab should mention tiers or cardio exercises"


def test_cardio_tab_has_sections(app_page: Page):
    """Cardio tab has expandable sections."""
    click_tab(app_page, "cardio")
    sections = app_page.get_by_test_id("tab-content").get_by_test_id("section")
    assert sections.count() >= 1, "Cardio tab should have at least one section"


def test_cardio_schedule_no_em_dash(app_page: Page):
    """Cardio schedule doesn't show raw em dash entities."""
    click_tab(app_page, "cardio")
    text = app_page.get_by_test_id("tab-content").inner_text()
    assert "\u0026mdash;" not in text, "Raw &mdash; entity found"
    assert "\\u2014" not in text, "Raw unicode escape found"
