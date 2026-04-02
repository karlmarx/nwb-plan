"""Issue #31: Smoke tests — blank page, JS errors, unicode, key elements."""

import re

from playwright.sync_api import Page, expect


def test_page_loads_not_blank(app_page: Page):
    """Page renders content, not a blank screen."""
    container = app_page.get_by_test_id("app-container")
    expect(container).to_be_visible()
    inner_html = container.inner_html()
    assert len(inner_html) > 100, "Page appears blank — innerHTML too short"


def test_no_console_errors(page: Page, base_url: str, context):
    """No JavaScript console errors on load."""
    context.route("**/sw.js", lambda route: route.abort())
    errors = []
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
    page.goto(base_url)
    page.wait_for_selector("[data-testid='app-container']", timeout=15000)
    # Filter out expected noise (e.g. favicon 404, SW registration)
    real_errors = [e for e in errors if "favicon" not in e.lower() and "sw.js" not in e.lower()]
    assert len(real_errors) == 0, f"Console errors found: {real_errors}"


def test_no_unhandled_rejections(page: Page, base_url: str, context):
    """No unhandled promise rejections (excluding known test-env noise)."""
    context.route("**/sw.js", lambda route: route.abort())
    crashes = []
    page.on("pageerror", lambda err: crashes.append(str(err)))
    page.goto(base_url)
    page.wait_for_selector("[data-testid='app-container']", timeout=15000)
    # Filter known test-environment artifacts:
    # - SW registration fails because we block sw.js (intentional)
    # - React 418 is a hydration warning in production mode (non-breaking)
    real_crashes = [
        e for e in crashes
        if "ServiceWorker" not in e
        and "React error #418" not in e
        and "sw.js" not in e
    ]
    assert len(real_crashes) == 0, f"Unhandled errors: {real_crashes}"


def test_page_title(app_page: Page):
    """Document title is set correctly."""
    assert "Femur Fracture Fitness" in app_page.title()


def test_app_title_visible(app_page: Page):
    """Main heading is visible."""
    title = app_page.get_by_test_id("app-title")
    expect(title).to_be_visible()
    expect(title).to_have_text("Femur Fracture Fitness")


def test_tab_bar_has_all_tabs(app_page: Page):
    """Tab bar contains all 6 content tabs + gear icon."""
    tab_bar = app_page.get_by_test_id("tab-bar")
    expect(tab_bar).to_be_visible()

    for name in ["workout", "upper", "lower", "core", "cardio", "safety"]:
        expect(app_page.get_by_test_id(f"tab-{name}")).to_be_visible()

    expect(app_page.get_by_test_id("tab-gear")).to_be_visible()


def test_progress_clock_visible(app_page: Page):
    """Progress clock renders."""
    expect(app_page.get_by_test_id("progress-clock")).to_be_visible()


def test_no_raw_unicode_escapes(app_page: Page):
    """No raw \\uXXXX escape sequences visible in rendered text."""
    body_text = app_page.inner_text("body")
    matches = re.findall(r"\\u[0-9a-fA-F]{4}", body_text)
    assert len(matches) == 0, f"Raw unicode escapes found: {matches}"


def test_no_html_entities_visible(app_page: Page):
    """No raw &mdash; or similar HTML entities visible as text."""
    body_text = app_page.inner_text("body")
    assert "&mdash;" not in body_text, "Raw &mdash; found in rendered text"
    assert "&bull;" not in body_text, "Raw &bull; found in rendered text"
    assert "&middot;" not in body_text, "Raw &middot; found in rendered text"
