"""Shared fixtures for NWB Plan Playwright E2E tests."""

import json
import subprocess
import time

import pytest
from playwright.sync_api import Page, BrowserContext


# ---------------------------------------------------------------------------
# Server management
# ---------------------------------------------------------------------------

_server_proc = None


def pytest_configure(config):
    """Start Next.js production server once for the entire test session."""
    global _server_proc
    import urllib.request
    import os

    # Skip if server already running (e.g. started externally by CI)
    try:
        urllib.request.urlopen("http://localhost:3000")
        return
    except Exception:
        pass

    # Build only if .next/ doesn't exist (CI pre-builds; local dev skips)
    if not os.path.exists(".next"):
        subprocess.run(["npm", "run", "build"], check=True)

    _server_proc = subprocess.Popen(
        ["npm", "run", "start"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    # Wait for server to be ready (up to 30s)
    for _ in range(30):
        try:
            urllib.request.urlopen("http://localhost:3000")
            break
        except Exception:
            time.sleep(1)
    else:
        raise RuntimeError("Next.js server did not start within 30s")


def pytest_unconfigure(config):
    """Stop the Next.js server."""
    global _server_proc
    if _server_proc:
        _server_proc.terminate()
        _server_proc.wait(timeout=5)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def base_url():
    return "http://localhost:3000"


@pytest.fixture()
def app_page(page: Page, context: BrowserContext, base_url: str):
    """Page fixture that blocks service worker and clears localStorage."""
    # Block service worker to prevent cache interference
    context.route("**/sw.js", lambda route: route.abort())

    page.goto(base_url)
    page.evaluate("() => localStorage.clear()")
    page.reload()
    page.wait_for_selector("[data-testid='app-container']", timeout=15000)
    return page


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def set_local_storage(page: Page, entries: dict):
    """Set multiple localStorage entries."""
    page.evaluate(
        """(entries) => {
            for (const [key, value] of Object.entries(entries)) {
                localStorage.setItem(key, JSON.stringify(value));
            }
        }""",
        entries,
    )


def get_local_storage(page: Page, key: str):
    """Read a localStorage value (parsed from JSON if possible, else raw string)."""
    val = page.evaluate(
        """(k) => {
            const v = localStorage.getItem(k);
            if (v === null) return null;
            try { return JSON.parse(v); } catch { return v; }
        }""",
        key,
    )
    return val


def click_tab(page: Page, tab_name: str):
    """Click a tab by name (lowercase). Use 'gear' for the config tab."""
    tid = "tab-gear" if tab_name == "gear" else f"tab-{tab_name}"
    page.get_by_test_id(tid).click()


TAB_NAMES = ["workout", "upper", "lower", "core", "cardio", "safety"]
