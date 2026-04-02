"""Theme toggle tests — dark/light switching and persistence."""

from playwright.sync_api import Page, expect

from conftest import get_local_storage


def test_default_theme_is_dark(app_page: Page):
    """Default theme is dark (no .light class on html)."""
    has_light = app_page.evaluate("() => document.documentElement.classList.contains('light')")
    assert not has_light, "Default theme should be dark"


def test_theme_toggle_switches_to_light(app_page: Page):
    """Clicking theme toggle adds .light class to html."""
    app_page.get_by_test_id("theme-toggle").click()
    app_page.wait_for_timeout(200)
    has_light = app_page.evaluate("() => document.documentElement.classList.contains('light')")
    assert has_light, "Theme toggle should switch to light mode"


def test_theme_toggle_back_to_dark(app_page: Page):
    """Clicking toggle twice returns to dark."""
    toggle = app_page.get_by_test_id("theme-toggle")
    toggle.click()
    app_page.wait_for_timeout(100)
    toggle.click()
    app_page.wait_for_timeout(100)
    has_light = app_page.evaluate("() => document.documentElement.classList.contains('light')")
    assert not has_light, "Double toggle should return to dark"


def test_theme_persists_to_localstorage(app_page: Page):
    """Theme preference saves to localStorage."""
    app_page.get_by_test_id("theme-toggle").click()
    app_page.wait_for_timeout(200)
    theme = get_local_storage(app_page, "nwb_theme")
    assert theme == "light", f"Expected 'light' in localStorage, got {theme}"


def test_light_theme_changes_background(app_page: Page):
    """Light theme has different background color than dark."""
    dark_bg = app_page.evaluate(
        "() => getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim()"
    )

    app_page.get_by_test_id("theme-toggle").click()
    app_page.wait_for_timeout(200)

    light_bg = app_page.evaluate(
        "() => getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim()"
    )

    assert dark_bg != light_bg, f"Background should change: dark={dark_bg} light={light_bg}"


def test_theme_toggle_title_changes(app_page: Page):
    """Theme toggle button title reflects current mode."""
    toggle = app_page.get_by_test_id("theme-toggle")
    title_dark = toggle.get_attribute("title")
    assert "light" in title_dark.lower(), f"Dark mode title should mention light: {title_dark}"

    toggle.click()
    app_page.wait_for_timeout(200)
    title_light = toggle.get_attribute("title")
    assert "dark" in title_light.lower(), f"Light mode title should mention dark: {title_light}"
