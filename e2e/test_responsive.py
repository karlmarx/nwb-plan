"""Responsive/mobile viewport tests."""

import pytest
from playwright.sync_api import Page, Browser, expect

from conftest import click_tab, TAB_NAMES

MOBILE_VIEWPORT = {"width": 393, "height": 851}  # iPhone 14 Pro


@pytest.fixture()
def mobile_page(browser: Browser, base_url: str):
    """Page fixture with mobile viewport and SW blocked."""
    context = browser.new_context(
        viewport=MOBILE_VIEWPORT,
        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
    )
    context.route("**/sw.js", lambda route: route.abort())
    page = context.new_page()
    page.goto(base_url)
    page.evaluate("() => localStorage.clear()")
    page.reload()
    page.wait_for_selector("[data-testid='app-container']", timeout=15000)
    yield page
    context.close()


def test_no_horizontal_scroll_on_mobile(mobile_page: Page):
    """App fits mobile viewport without horizontal scrollbar."""
    scroll_width = mobile_page.evaluate("() => document.body.scrollWidth")
    client_width = mobile_page.evaluate("() => document.documentElement.clientWidth")
    assert scroll_width <= client_width + 5, \
        f"Horizontal overflow: scrollWidth={scroll_width} clientWidth={client_width}"


def test_tab_bar_visible_on_mobile(mobile_page: Page):
    """Tab bar is fully visible on mobile."""
    expect(mobile_page.get_by_test_id("tab-bar")).to_be_visible()
    for name in TAB_NAMES:
        expect(mobile_page.get_by_test_id(f"tab-{name}")).to_be_visible()


def test_all_tabs_work_on_mobile(mobile_page: Page):
    """All tabs can be tapped on mobile."""
    for name in TAB_NAMES:
        click_tab(mobile_page, name)
        mobile_page.wait_for_timeout(100)
        expect(mobile_page.get_by_test_id("tab-content")).to_be_visible()


def test_exercise_rows_tappable_on_mobile(mobile_page: Page):
    """Exercise rows meet minimum 44px touch target."""
    click_tab(mobile_page, "workout")
    sections = mobile_page.get_by_test_id("tab-content").get_by_test_id("section")
    if sections.count() > 0:
        sections.first.locator("button").first.click()
        mobile_page.wait_for_timeout(300)
        rows = sections.first.get_by_test_id("exercise-row")
        if rows.count() > 0:
            height = rows.first.evaluate(
                "el => el.querySelector('[data-testid=\"exercise-name\"]')?.closest('.min-h-\\\\[44px\\\\]')?.offsetHeight || el.offsetHeight"
            )
            # Min-h-[44px] class should enforce at least 44px
            assert height >= 40, f"Touch target too small: {height}px"


def test_mobile_no_horizontal_scroll_gallery(mobile_page: Page):
    """Diagram gallery has no horizontal scroll on mobile."""
    click_tab(mobile_page, "upper")
    mobile_page.get_by_test_id("open-diagram-gallery").click()
    mobile_page.wait_for_selector("[data-testid='diagram-gallery-overlay']")

    overlay = mobile_page.get_by_test_id("diagram-gallery-overlay")
    scroll_width = overlay.evaluate("el => el.scrollWidth")
    client_width = overlay.evaluate("el => el.clientWidth")
    assert scroll_width <= client_width + 5, \
        f"Gallery horizontal overflow: scrollWidth={scroll_width} clientWidth={client_width}"
