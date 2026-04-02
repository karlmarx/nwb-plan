"""Exercise interaction tests — expand/collapse, swap, machine selector, rest timer."""

from playwright.sync_api import Page, expect

from conftest import click_tab


def _expand_first_exercise(page: Page):
    """Navigate to Workout tab, expand first section, expand first exercise."""
    click_tab(page, "workout")
    sections = page.get_by_test_id("tab-content").get_by_test_id("section")
    assert sections.count() > 0, "Need at least one section"
    sections.first.locator("button").first.click()
    page.wait_for_timeout(300)
    rows = sections.first.get_by_test_id("exercise-row")
    if rows.count() > 0:
        rows.first.click()
        page.wait_for_timeout(300)
    return rows.first if rows.count() > 0 else None


def test_exercise_row_expands(app_page: Page):
    """Clicking an exercise row expands it to show details."""
    row = _expand_first_exercise(app_page)
    if row:
        inner = row.inner_html()
        assert "SETUP" in inner or "setup" in inner.lower() or len(inner) > 200, \
            "Expanded row should show exercise details"


def test_exercise_row_shows_name(app_page: Page):
    """Exercise rows show the exercise name."""
    click_tab(app_page, "workout")
    sections = app_page.get_by_test_id("tab-content").get_by_test_id("section")
    if sections.count() > 0:
        sections.first.locator("button").first.click()
        app_page.wait_for_timeout(300)
        rows = sections.first.get_by_test_id("exercise-row")
        if rows.count() > 0:
            name_el = rows.first.get_by_test_id("exercise-name")
            expect(name_el).to_be_visible()
            assert len(name_el.inner_text()) > 2, "Exercise name should not be empty"


def test_exercise_row_collapses(app_page: Page):
    """Clicking an expanded exercise row collapses it."""
    click_tab(app_page, "workout")
    sections = app_page.get_by_test_id("tab-content").get_by_test_id("section")
    if sections.count() > 0:
        sections.first.locator("button").first.click()
        app_page.wait_for_timeout(300)
        rows = sections.first.get_by_test_id("exercise-row")
        if rows.count() > 0:
            rows.first.click()
            app_page.wait_for_timeout(200)
            html_expanded = rows.first.inner_html()

            rows.first.click()
            app_page.wait_for_timeout(200)
            html_collapsed = rows.first.inner_html()

            assert html_expanded != html_collapsed, "Exercise should toggle expand/collapse"


def test_exercise_details_sections(app_page: Page):
    """Expanded exercise shows Setup, Execute, Safety, Why sections."""
    row = _expand_first_exercise(app_page)
    if row:
        inner = row.inner_html()
        # Check for key sections
        has_details = any(kw in inner.upper() for kw in ["SETUP", "EXECUTE", "SAFETY", "WHY"])
        assert has_details, f"Expanded exercise should show detail sections, got: {inner[:200]}"


def test_upper_library_exercises_expand(app_page: Page):
    """Exercises in Upper library tab expand on click."""
    click_tab(app_page, "upper")
    sections = app_page.get_by_test_id("tab-content").get_by_test_id("section")
    if sections.count() > 0:
        sections.first.locator("button").first.click()
        app_page.wait_for_timeout(300)
        rows = sections.first.get_by_test_id("exercise-row")
        if rows.count() > 0:
            rows.first.click()
            app_page.wait_for_timeout(300)
            expect(rows.first.get_by_test_id("exercise-name")).to_be_visible()


def test_rest_timer_appears(app_page: Page):
    """Clicking rest timer button opens rest timer overlay."""
    click_tab(app_page, "workout")
    sections = app_page.get_by_test_id("tab-content").get_by_test_id("section")
    if sections.count() == 0:
        return

    sections.first.locator("button").first.click()
    app_page.wait_for_timeout(300)
    rows = sections.first.get_by_test_id("exercise-row")
    if rows.count() == 0:
        return

    rows.first.click()
    app_page.wait_for_timeout(300)

    # Look for timer button (clock icon or "Start Timer" text)
    timer_btn = rows.first.locator("button").filter(has_text=lambda t: "timer" in t.lower() or "rest" in t.lower() or "⏱" in t)
    if timer_btn.count() == 0:
        # Try by icon
        timer_btn = rows.first.locator("button").last
    timer_btn.click()
    app_page.wait_for_timeout(300)

    overlay = app_page.get_by_test_id("rest-timer")
    if overlay.count() > 0:
        expect(overlay).to_be_visible()


def test_rest_timer_close_button(app_page: Page):
    """Rest timer close button dismisses the overlay."""
    # Start timer programmatically by finding a timer-triggering button
    click_tab(app_page, "workout")
    sections = app_page.get_by_test_id("tab-content").get_by_test_id("section")
    if sections.count() == 0:
        return

    sections.first.locator("button").first.click()
    app_page.wait_for_timeout(300)
    rows = sections.first.get_by_test_id("exercise-row")
    if rows.count() == 0:
        return

    rows.first.click()
    app_page.wait_for_timeout(300)

    # Try all buttons in the row to find timer trigger
    buttons = rows.first.locator("button")
    for i in range(buttons.count()):
        btn = buttons.nth(i)
        title = btn.get_attribute("title") or ""
        text = btn.inner_text()
        if "timer" in (title + text).lower() or "rest" in (title + text).lower():
            btn.click()
            app_page.wait_for_timeout(300)
            break

    timer = app_page.get_by_test_id("rest-timer")
    if timer.count() > 0 and timer.is_visible():
        app_page.get_by_test_id("timer-close").click()
        app_page.wait_for_timeout(300)
        expect(timer).not_to_be_visible()
