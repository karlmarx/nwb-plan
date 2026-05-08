"""E2E tests for the ad-hoc supersets / universal complement picker."""

from playwright.sync_api import Page, expect


def open_picker_for_first_exercise(page: Page) -> None:
    """Open the complement picker for the first exercise on Today."""
    page.get_by_test_id("tab-workout").click()
    # Expand first exercise so its "+ complement" button is visible
    first_row = page.get_by_test_id("exercise-row").first
    first_row.click()
    first_row.get_by_role("button", name="Add complement").first.click()
    expect(page.get_by_test_id("complement-picker")).to_be_visible()


def test_picker_has_search_and_results(app_page: Page):
    """Picker renders a search input and shows a flat list of curated results."""
    open_picker_for_first_exercise(app_page)
    expect(app_page.get_by_test_id("complement-search")).to_be_visible()
    # At least one result row appears with a source label
    rows = app_page.get_by_test_id("complement-result")
    expect(rows.first).to_be_visible()


def test_filter_chip_narrows_results(app_page: Page):
    """Activating a single filter chip narrows results to that source only."""
    open_picker_for_first_exercise(app_page)
    pre_count = app_page.get_by_test_id("complement-result").count()
    assert pre_count > 0, "expected baseline complements on a fresh state"

    # Activate the Core chip — only CORE-labeled rows should remain
    app_page.get_by_test_id("filter-chip-core").click()
    rows = app_page.get_by_test_id("complement-result")
    post_count = rows.count()
    assert post_count > 0, "expected core complements on the default workout"
    assert post_count <= pre_count, "core filter should not add results"
    # Every visible result row's label must indicate a core region (not e.g. NEARBY/CATALOG/PT)
    forbidden_labels = ["NEARBY", "CATALOG", "PT", "L-LEG", "MOBILITY", "STRETCH", "BREATH"]
    for i in range(post_count):
        text = rows.nth(i).inner_text()
        for bad in forbidden_labels:
            assert bad not in text, f"row {i} contained forbidden label {bad}: {text}"


def test_search_finds_catalog_exercise(app_page: Page):
    """Typing 'bench' surfaces a CATALOG-labeled result from EX."""
    open_picker_for_first_exercise(app_page)
    app_page.get_by_test_id("complement-search").fill("bench")
    rows = app_page.get_by_test_id("complement-result")
    catalog_rows = rows.filter(has_text="CATALOG")
    expect(catalog_rows.first).to_be_visible()


def test_add_lib_complement(app_page: Page):
    """Tapping a CATALOG result adds a lib-kind card under the parent exercise."""
    open_picker_for_first_exercise(app_page)
    app_page.get_by_test_id("complement-search").fill("bench")
    catalog_rows = app_page.get_by_test_id("complement-result").filter(has_text="CATALOG")
    first = catalog_rows.first
    title = first.locator("span.text-sm").inner_text()  # exercise name
    first.click()
    # Close picker — scope to complement-picker to avoid strict-mode violation
    app_page.get_by_test_id("complement-picker").get_by_role("button", name="Done").click()
    # The first exercise row now has a superset-card with that title
    cards = app_page.get_by_test_id("superset-card")
    expect(cards.filter(has_text=title).first).to_be_visible()


def test_add_custom_text_complement(app_page: Page):
    """Custom-text save creates a card with the typed string under the exercise."""
    open_picker_for_first_exercise(app_page)
    app_page.get_by_test_id("custom-text-toggle").click()
    app_page.get_by_test_id("custom-text-input").fill("Cossack squat 3x8")
    app_page.get_by_test_id("custom-text-save").click()
    expect(app_page.get_by_test_id("complement-picker")).not_to_be_visible()
    cards = app_page.get_by_test_id("superset-card")
    expect(cards.filter(has_text="Cossack squat 3x8").first).to_be_visible()


def test_remove_custom_text(app_page: Page):
    """Tapping the × on a custom-text card removes it from the workout."""
    open_picker_for_first_exercise(app_page)
    app_page.get_by_test_id("custom-text-toggle").click()
    app_page.get_by_test_id("custom-text-input").fill("My custom move")
    app_page.get_by_test_id("custom-text-save").click()
    card = app_page.get_by_test_id("superset-card").filter(has_text="My custom move").first
    expect(card).to_be_visible()
    card.get_by_role("button", name="Remove complement").click()
    expect(app_page.get_by_test_id("superset-card").filter(has_text="My custom move")).to_have_count(0)


def test_complement_persistence(app_page: Page):
    """A lib complement and a text complement both survive a page reload."""
    open_picker_for_first_exercise(app_page)

    # Add a lib complement
    app_page.get_by_test_id("complement-search").fill("bench")
    catalog_rows = app_page.get_by_test_id("complement-result").filter(has_text="CATALOG")
    catalog_title = catalog_rows.first.locator("span.text-sm").inner_text()
    catalog_rows.first.click()

    # Switch to custom-text and add one
    app_page.get_by_test_id("custom-text-toggle").click()
    app_page.get_by_test_id("custom-text-input").fill("Persisted custom move")
    app_page.get_by_test_id("custom-text-save").click()

    # Reload
    app_page.reload()
    app_page.wait_for_selector("[data-testid='app-container']", timeout=15000)

    # Both cards still visible (re-expand the first row first)
    first_row = app_page.get_by_test_id("exercise-row").first
    first_row.click()
    cards = app_page.get_by_test_id("superset-card")
    expect(cards.filter(has_text=catalog_title).first).to_be_visible()
    expect(cards.filter(has_text="Persisted custom move").first).to_be_visible()
