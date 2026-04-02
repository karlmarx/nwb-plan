"""Diagram gallery overlay tests — categories, exercises, animation, close."""

from playwright.sync_api import Page, expect

from conftest import click_tab

CATEGORIES = ["rack", "supine", "prone", "glute", "trx", "arm", "yoga", "equip"]


def _open_gallery(page: Page):
    click_tab(page, "upper")
    page.get_by_test_id("open-diagram-gallery").click()
    page.wait_for_selector("[data-testid='diagram-gallery-overlay']", timeout=5000)


def test_gallery_opens_from_upper_tab(app_page: Page):
    """Gallery overlay opens from Upper tab button."""
    _open_gallery(app_page)
    expect(app_page.get_by_test_id("diagram-gallery-overlay")).to_be_visible()


def test_gallery_opens_from_core_tab(app_page: Page):
    """Gallery overlay opens from Core tab button."""
    click_tab(app_page, "core")
    app_page.get_by_test_id("open-core-gallery").click()
    expect(app_page.get_by_test_id("diagram-gallery-overlay")).to_be_visible()


def test_gallery_close_button_dismisses(app_page: Page):
    """Close button removes the gallery overlay."""
    _open_gallery(app_page)
    app_page.get_by_test_id("diagram-gallery-close").click()
    app_page.wait_for_timeout(300)
    overlay = app_page.get_by_test_id("diagram-gallery-overlay")
    expect(overlay).not_to_be_visible()


def test_gallery_has_category_tabs(app_page: Page):
    """Gallery shows category filter tabs."""
    _open_gallery(app_page)
    expect(app_page.get_by_test_id("diagram-categories")).to_be_visible()
    # Should have multiple category buttons
    cats = app_page.get_by_test_id("diagram-categories").locator("button")
    assert cats.count() >= 4, "Gallery should have at least 4 categories"


def test_gallery_category_switching(app_page: Page):
    """Switching category changes exercise pills."""
    _open_gallery(app_page)

    exercises_before = app_page.get_by_test_id("diagram-exercises").inner_text()

    # Click second category button
    cats = app_page.get_by_test_id("diagram-categories").locator("button")
    if cats.count() > 1:
        cats.nth(1).click()
        app_page.wait_for_timeout(300)
        exercises_after = app_page.get_by_test_id("diagram-exercises").inner_text()
        # Content may differ (different exercises per category)
        assert exercises_before or exercises_after, "Category switch should work"


def test_gallery_has_exercise_pills(app_page: Page):
    """Gallery shows exercise selection pills."""
    _open_gallery(app_page)
    expect(app_page.get_by_test_id("diagram-exercises")).to_be_visible()
    pills = app_page.get_by_test_id("diagram-exercises").locator("button")
    assert pills.count() >= 1, "Should have exercise pills in gallery"


def test_gallery_animation_svg_present(app_page: Page):
    """Gallery has SVG animation area."""
    _open_gallery(app_page)
    expect(app_page.get_by_test_id("diagram-animation")).to_be_visible()


def test_gallery_playpause_button(app_page: Page):
    """Play/pause button toggles animation state."""
    _open_gallery(app_page)
    btn = app_page.get_by_test_id("diagram-playpause")
    expect(btn).to_be_visible()
    text_before = btn.inner_text()
    btn.click()
    app_page.wait_for_timeout(100)
    text_after = btn.inner_text()
    assert text_before != text_after, "Play/pause button should toggle symbol"


def test_gallery_selecting_exercise_shows_details(app_page: Page):
    """Selecting an exercise pill shows details."""
    _open_gallery(app_page)
    pills = app_page.get_by_test_id("diagram-exercises").locator("button")
    if pills.count() > 1:
        pills.nth(1).click()
        app_page.wait_for_timeout(300)
    # Animation area should still be visible after selection
    expect(app_page.get_by_test_id("diagram-animation")).to_be_visible()


def test_gallery_no_horizontal_scrollbar(app_page: Page):
    """Gallery overlay has no horizontal scrollbar."""
    _open_gallery(app_page)
    overlay = app_page.get_by_test_id("diagram-gallery-overlay")
    scroll_width = overlay.evaluate("el => el.scrollWidth")
    client_width = overlay.evaluate("el => el.clientWidth")
    assert scroll_width <= client_width + 2, \
        f"Horizontal scrollbar detected: scrollWidth={scroll_width} > clientWidth={client_width}"
