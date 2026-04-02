"""Visual regression tests — screenshot baselines for each tab."""

import pytest
from playwright.sync_api import Page, expect

from conftest import click_tab, TAB_NAMES

# Mask the progress clock (real-time, non-deterministic)
CLOCK_MASK_SELECTOR = "[data-testid='progress-clock']"

# Screenshot options
SNAP_OPTS = {
    "full_page": False,
    "animations": "disabled",
}


def _masked_snapshot(page: Page, name: str, **extra):
    """Take a screenshot masking the progress clock."""
    mask = [page.locator(CLOCK_MASK_SELECTOR)] if page.locator(CLOCK_MASK_SELECTOR).count() > 0 else []
    return page.screenshot(
        path=f"test-results/screenshots/{name}.png",
        animations="disabled",
        mask=mask,
        **extra,
    )


@pytest.mark.parametrize("tab_name", TAB_NAMES)
def test_tab_screenshot_dark(app_page: Page, tab_name: str):
    """Dark mode screenshot for each tab (visual regression baseline)."""
    click_tab(app_page, tab_name)
    app_page.wait_for_timeout(500)  # Let animations settle
    _masked_snapshot(app_page, f"dark-{tab_name}")


@pytest.mark.parametrize("tab_name", TAB_NAMES)
def test_tab_screenshot_light(app_page: Page, tab_name: str):
    """Light mode screenshot for each tab."""
    app_page.get_by_test_id("theme-toggle").click()
    app_page.wait_for_timeout(200)
    click_tab(app_page, tab_name)
    app_page.wait_for_timeout(500)
    _masked_snapshot(app_page, f"light-{tab_name}")


def test_gear_tab_screenshot(app_page: Page):
    """Screenshot of gear/config tab."""
    click_tab(app_page, "gear")
    app_page.wait_for_timeout(300)
    _masked_snapshot(app_page, "dark-gear")


def test_diagram_gallery_screenshot(app_page: Page):
    """Screenshot of diagram gallery overlay."""
    click_tab(app_page, "upper")
    app_page.get_by_test_id("open-diagram-gallery").click()
    app_page.wait_for_selector("[data-testid='diagram-gallery-overlay']")
    # Pause animation for deterministic screenshot
    playpause = app_page.get_by_test_id("diagram-playpause")
    if playpause.is_visible():
        playpause.click()
    app_page.wait_for_timeout(500)
    _masked_snapshot(app_page, "diagram-gallery")
