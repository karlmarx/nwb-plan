"""UI v2 toggle tests — verify the New UI Preview toggle works end-to-end."""

from playwright.sync_api import Page, expect
from conftest import click_tab, get_local_storage


def _enable_ui_v2(page: Page):
    """Navigate to gear tab and enable the New UI Preview toggle."""
    click_tab(page, "gear")
    page.wait_for_timeout(300)

    # Find the toggle button by its title attribute
    toggle = page.locator("button[title='Toggle new UI preview']")
    expect(toggle).to_be_visible()
    toggle.click()
    page.wait_for_timeout(300)


def test_toggle_is_visible_in_gear_tab(app_page: Page):
    """New UI Preview toggle is visible in gear tab."""
    click_tab(app_page, "gear")
    app_page.wait_for_timeout(300)
    toggle = app_page.locator("button[title='Toggle new UI preview']")
    expect(toggle).to_be_visible()


def test_toggle_label_starts_off(app_page: Page):
    """Toggle label says 'Off' by default."""
    click_tab(app_page, "gear")
    app_page.wait_for_timeout(300)
    label_text = app_page.locator("text=Off — using classic UI")
    expect(label_text).to_be_visible()


def test_toggle_click_changes_label(app_page: Page):
    """Clicking toggle changes label to Active."""
    _enable_ui_v2(app_page)
    label_text = app_page.locator("text=Active — section color borders + pill badges")
    expect(label_text).to_be_visible()


def test_toggle_persists_to_localstorage(app_page: Page):
    """Enabling toggle persists nwb_ui_v2 to localStorage."""
    _enable_ui_v2(app_page)
    val = get_local_storage(app_page, "nwb_ui_v2")
    assert val is True, f"Expected nwb_ui_v2=True, got {val}"


def test_toggle_persists_across_reload(app_page: Page, base_url: str):
    """Toggle state survives page reload."""
    _enable_ui_v2(app_page)
    app_page.reload()
    app_page.wait_for_selector("[data-testid='app-container']")
    click_tab(app_page, "gear")
    app_page.wait_for_timeout(300)
    label = app_page.locator("text=Active — section color borders + pill badges")
    expect(label).to_be_visible()


def test_v2_upper_tab_pills_have_count_badge(app_page: Page):
    """With v2 on, Upper tab filter pills show count badges."""
    _enable_ui_v2(app_page)
    click_tab(app_page, "upper")
    app_page.wait_for_timeout(400)

    # The All pill should be a rounded-full pill
    pills = app_page.locator(".filter-wrap button, [class*='rounded-full']")
    # Check that the All button contains a count number
    all_btn = app_page.locator("button", has_text="All").first
    expect(all_btn).to_be_visible()
    # Count badge should be inside it — look for the total count
    inner = all_btn.inner_text()
    # Should contain a number (total exercises)
    has_number = any(c.isdigit() for c in inner)
    assert has_number, f"All pill should contain exercise count, got: '{inner}'"


def test_v2_section_cards_have_color_border(app_page: Page):
    """With v2 on, section cards in Upper tab have colored left borders."""
    _enable_ui_v2(app_page)
    click_tab(app_page, "upper")
    app_page.wait_for_timeout(400)

    sections = app_page.get_by_test_id("section")
    assert sections.count() > 0, "Should have sections on Upper tab"

    # Check the first section has a non-transparent left border
    first = sections.first
    border_left = first.evaluate(
        "el => getComputedStyle(el).borderLeftColor"
    )
    # Default border is var(--color-border) — a dark/muted color
    # v2 border should be a vivid accent color (not rgb(0,0,0) or very dark)
    assert border_left != "rgba(0, 0, 0, 0)", f"Left border should not be transparent, got: {border_left}"
    assert "rgb" in border_left, f"Expected rgb color, got: {border_left}"

    # Check border-left-width is notably wider than 1px (v2 uses 3px)
    border_width = first.evaluate(
        "el => parseFloat(getComputedStyle(el).borderLeftWidth)"
    )
    assert border_width >= 2.0, f"v2 section should have ~3px left border, got: {border_width}px"


def test_v2_can_be_toggled_off(app_page: Page):
    """Toggling v2 off returns to classic label."""
    _enable_ui_v2(app_page)  # on
    click_tab(app_page, "gear")
    app_page.wait_for_timeout(200)
    toggle = app_page.locator("button[title='Toggle new UI preview']")
    toggle.click()  # off
    app_page.wait_for_timeout(300)
    expect(app_page.locator("text=Off — using classic UI")).to_be_visible()


def test_classic_sections_have_thin_border(app_page: Page):
    """With v2 off (default), section cards have no thick colored left stripe."""
    click_tab(app_page, "upper")
    app_page.wait_for_timeout(400)
    sections = app_page.get_by_test_id("section")
    assert sections.count() > 0
    border_width = sections.first.evaluate(
        "el => parseFloat(getComputedStyle(el).borderLeftWidth)"
    )
    assert border_width < 2.0, f"Classic section should not have wide left border, got: {border_width}px"


def test_v2_workout_tab_shows_chip_badges(app_page: Page):
    """With v2 on, supplement indicator in Workout tab shows L-LEG/CORE chip badges."""
    _enable_ui_v2(app_page)
    click_tab(app_page, "workout")
    app_page.wait_for_timeout(500)

    # v2 chips have data-testid="v2-supp-chip"
    chips = app_page.get_by_test_id("v2-supp-chip")
    assert chips.count() > 0, "v2 Workout tab should show v2-supp-chip badges in supplement indicators"


def test_classic_workout_tab_no_chip_badges(app_page: Page):
    """With v2 off, supplement indicator uses single-letter badges, not full chips."""
    click_tab(app_page, "workout")
    app_page.wait_for_timeout(500)

    # v2 chips must not appear in classic mode
    chips = app_page.get_by_test_id("v2-supp-chip")
    assert chips.count() == 0, "Classic mode should not show v2-supp-chip badges"
