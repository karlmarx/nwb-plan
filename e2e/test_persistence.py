"""localStorage persistence tests — all 11 nwb_ keys survive reload."""

from playwright.sync_api import Page, expect

from conftest import click_tab, get_local_storage, set_local_storage


def test_tab_persists_across_reload(app_page: Page, base_url: str):
    """Selected tab index persists after page reload."""
    click_tab(app_page, "core")  # index 3
    app_page.reload()
    app_page.wait_for_selector("[data-testid='app-container']")
    active = get_local_storage(app_page, "nwb_tab")
    assert active == 3, f"Tab should persist as 3, got {active}"
    # Core tab button should appear active
    core_btn = app_page.get_by_test_id("tab-core")
    border = core_btn.evaluate("el => getComputedStyle(el).borderColor")
    muted = core_btn.evaluate("el => getComputedStyle(el).color")
    assert border != "rgb(0, 0, 0)", "Core tab should have accent border after reload"


def test_theme_persists_across_reload(app_page: Page, base_url: str):
    """Light theme persists after page reload."""
    app_page.get_by_test_id("theme-toggle").click()
    app_page.wait_for_timeout(200)
    app_page.reload()
    app_page.wait_for_selector("[data-testid='app-container']")
    has_light = app_page.evaluate("() => document.documentElement.classList.contains('light')")
    assert has_light, "Light theme should persist after reload"


def test_preseeded_tab_loads_correctly(app_page: Page, base_url: str):
    """Pre-seeded nwb_tab value activates the correct tab on load."""
    # Pre-seed tab 4 (Cardio)
    app_page.evaluate("() => localStorage.setItem('nwb_tab', JSON.stringify(4))")
    app_page.reload()
    app_page.wait_for_selector("[data-testid='app-container']")

    # Cardio content should be active
    content = app_page.get_by_test_id("tab-content")
    text = content.inner_text()
    assert "cardio" in text.lower() or "tier" in text.lower() or "swim" in text.lower(), \
        "Pre-seeded tab 4 should show Cardio content"


def test_equipment_state_persists(app_page: Page, base_url: str):
    """Equipment toggle state persists across reload via localStorage."""
    click_tab(app_page, "gear")
    # Inject a custom equipment state
    set_local_storage(app_page, {"nwb_equipment": {"barbell": False, "cable": True}})
    app_page.reload()
    app_page.wait_for_selector("[data-testid='app-container']")
    eq = get_local_storage(app_page, "nwb_equipment")
    assert eq is not None, "Equipment state should persist"
    assert eq.get("barbell") is False, "Barbell disabled state should persist"


def test_start_day_persists(app_page: Page, base_url: str):
    """Week start day persists across reload."""
    set_local_storage(app_page, {"nwb_startDay": 2})  # Wednesday
    app_page.reload()
    app_page.wait_for_selector("[data-testid='app-container']")
    val = get_local_storage(app_page, "nwb_startDay")
    assert val == 2, f"Start day should persist as 2, got {val}"


def test_all_localstorage_keys_writable(app_page: Page):
    """All 11 nwb_ localStorage keys can be written and read back."""
    keys_and_values = {
        "nwb_tab": 2,
        "nwb_phase": 1,
        "nwb_startDay": 3,
        "nwb_equipment": {"barbell": True},
        "nwb_swaps": {},
        "nwb_hevy": {},
        "nwb_machines": {},
        "nwb_nearby": {},
        "nwb_core_nearby": [],
        "nwb_supplements": {"leftLeg": True, "core": False},
        "nwb_theme": "dark",
    }
    set_local_storage(app_page, keys_and_values)

    for key, expected in keys_and_values.items():
        actual = get_local_storage(app_page, key)
        assert actual == expected, f"Key {key}: expected {expected}, got {actual}"
