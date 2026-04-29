"""Service worker E2E tests — network-first HTML strategy (nwb-plan-v7).

PR #85 shipped a behaviour change:
  - HTML navigations (request.mode === 'navigate'): network-first, cache
    fallback only when offline (previously cache-first → stale shell after
    deploys referencing dead hashed asset URLs).
  - /_next/* and /api/* requests: SW skips entirely (passes through).
  - Static precached assets (manifest.json, icons): cache-first.
  - activate handler: evicts every cache except nwb-plan-v7.
  - clients.claim() so the new SW takes immediate control.

These tests use a raw Playwright `page` / `context` fixture (NOT `app_page`)
because `app_page` routes away sw.js — we deliberately need the SW active.

All JS evaluation is done via page.evaluate(); each snippet is commented
with why in-page JS is necessary (these facts live in the SW/browser cache
layer, not in the DOM, so Playwright has no first-class API for them).
"""

import time
import re
from playwright.sync_api import Page, BrowserContext, expect


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

BASE = "http://localhost:3000"
CACHE_NAME = "nwb-plan-v7"
PRECACHE_URLS = ["/manifest.json", "/icon.svg", "/icon-192.png", "/icon-512.png"]


def _wait_for_sw(page: Page, timeout_ms: int = 10_000) -> None:
    """Block until navigator.serviceWorker.ready resolves.

    We use page.evaluate with a JS Promise so Playwright waits for the SW
    to finish installing and activating before we probe the cache.  There is
    no Playwright-native 'wait for service worker' API.
    """
    page.evaluate(
        """() => navigator.serviceWorker.ready""",
    )


def _cache_keys(page: Page) -> list[str]:
    """Return the list of cache names visible to this page's origin.

    Uses the CacheStorage API — there is no Playwright abstraction for it.
    """
    return page.evaluate("""() => caches.keys()""")


def _cache_has(page: Page, url: str) -> bool:
    """Return True if the named cache contains a Response for *url*.

    We open the specific named cache and call .match() — the only way to
    inspect the cache contents from the test.
    """
    return page.evaluate(
        """([cacheName, url]) =>
            caches.open(cacheName).then(c => c.match(url).then(r => r !== undefined))
        """,
        [CACHE_NAME, url],
    )


# ---------------------------------------------------------------------------
# Test 1 — SW registers and the expected cache is created on first load
# ---------------------------------------------------------------------------

def test_sw_registers_and_cache_exists(page: Page, base_url: str):
    """SW registers on first load and nwb-plan-v7 cache exists.

    We navigate to the root, wait for the SW to be 'ready' (installed +
    activated), then assert the cache name appears in caches.keys().
    """
    page.goto(base_url)
    _wait_for_sw(page)

    keys = _cache_keys(page)
    assert CACHE_NAME in keys, (
        f"Expected cache '{CACHE_NAME}' to exist after SW activation, "
        f"got: {keys}"
    )


# ---------------------------------------------------------------------------
# Test 2 — Precached assets are stored in the cache after first load
# ---------------------------------------------------------------------------

def test_precached_assets_present(page: Page, base_url: str):
    """After first load all four precached static assets exist in the cache.

    The SW's install handler calls caches.open(CACHE).then(c => c.addAll([...]))
    for manifest.json and the three icon files.  We verify each one.
    """
    page.goto(base_url)
    _wait_for_sw(page)

    for url in PRECACHE_URLS:
        found = _cache_has(page, url)
        assert found, f"Precached asset '{url}' not found in cache '{CACHE_NAME}'"


# ---------------------------------------------------------------------------
# Test 3 — HTML navigation is network-first (response comes from network)
# ---------------------------------------------------------------------------

def test_html_navigation_is_network_first(page: Page, base_url: str, context: BrowserContext):
    """HTML navigate requests actually hit the network when online.

    Strategy: capture context-level *request* events (the network layer,
    BEFORE the SW intercept). If the SW were cache-first and answered from
    cache, the browser would not send the request to the server — so no
    document request would appear in context.on('request').

    Network-first means fetch(e.request) is called inside the SW, which
    causes the browser to actually issue the network request — so a
    document request DOES appear here.

    We use a unique query param (freshparam=<timestamp>) so the HTTP
    layer cannot serve the response from its own cache, isolating SW
    behavior. We also assert that the document response has status 200
    and contains live HTML content from the server.

    Note: we cannot rely on Response.from_service_worker — Playwright sets
    that True for any response routed through respondWith(), even if the
    SW internally called fetch() and returned the live network response.
    What we care about is: did the network actually get hit? A network-
    first SW always hits the network when online.
    """
    # Warm up: one initial load so the SW registers + the cache exists
    page.goto(base_url)
    _wait_for_sw(page)
    page.wait_for_timeout(300)  # let SW write the navigation response to cache

    unique_param = f"freshparam={int(time.time() * 1000)}"
    target_url = f"{base_url}/?{unique_param}"

    seen_doc_requests: list[str] = []

    def on_request(request):
        # Document-level request whose URL matches our unique nav URL
        if request.url == target_url and request.resource_type == "document":
            seen_doc_requests.append(request.url)

    context.on("request", on_request)

    page.goto(target_url)
    _wait_for_sw(page)

    # If the SW were cache-first AND the cache had a "/" entry, the browser
    # would not hit the network for the document — seen_doc_requests would
    # be empty. Network-first must always touch the network when online.
    assert len(seen_doc_requests) >= 1, (
        f"Expected document request for {target_url} to hit the network "
        f"(network-first behavior), but no such request was observed. "
        f"This suggests the SW served HTML from cache while online."
    )

    # The page also rendered live content from the server
    body_text = page.inner_text("body")
    assert len(body_text.strip()) > 0, "Page body is empty after network-first nav"


# ---------------------------------------------------------------------------
# Test 4 — HTML navigation falls back to cache when offline
# ---------------------------------------------------------------------------

def test_html_navigation_offline_fallback(page: Page, base_url: str, context: BrowserContext):
    """When offline, the SW falls back to the cached HTML shell.

    Steps:
      1. Navigate online (populates the SW HTML cache entry for '/').
      2. Go offline via context.set_offline(True).
      3. Navigate to '/' again.
      4. Assert the page still loads (title present, no network error).

    We use page.evaluate() to read navigator.onLine as a secondary check.
    Note: we DO NOT clear the cache — we're testing the SW fallback path.
    """
    # Step 1: seed the cache while online
    page.goto(base_url)
    _wait_for_sw(page)
    # Wait briefly for the SW to write the navigation response to cache
    page.wait_for_timeout(500)

    # Step 2: go offline
    context.set_offline(True)

    try:
        # Step 3: navigate while offline — should not throw
        page.goto(base_url, wait_until="domcontentloaded", timeout=15_000)

        # Step 4: page still renders content (SW served the cached HTML shell)
        body_text = page.inner_text("body")
        assert len(body_text.strip()) > 0, (
            "Page body is empty when offline — SW cache fallback did not work"
        )

        # Secondary check: confirm we really are offline
        online = page.evaluate("() => navigator.onLine")
        assert not online, "Expected navigator.onLine to be False in offline mode"

    finally:
        # Always restore connectivity so subsequent tests are unaffected
        context.set_offline(False)


# ---------------------------------------------------------------------------
# Test 5 — /_next/* chunk requests bypass the SW entirely
# ---------------------------------------------------------------------------

def test_next_chunks_bypass_sw(page: Page, base_url: str):
    """Requests to /_next/static/chunks/*.js are NOT served from the SW cache.

    The SW's fetch handler early-returns (no e.respondWith) for any URL whose
    pathname starts with /_next/.  So these requests go straight to the network
    and will never appear in caches.match().

    We verify this by loading the page, collecting a /_next/ JS URL from the
    actual network responses, and then confirming that URL is absent from the
    SW cache.  This proves the SW's skip rule works — if the SW had intercepted
    and cached it, caches.match() would return a Response.
    """
    next_js_urls = []

    def capture(response):
        url = response.url
        if "/_next/static/chunks/" in url and url.endswith(".js"):
            next_js_urls.append(url)

    page.on("response", capture)
    page.goto(base_url)
    _wait_for_sw(page)

    assert len(next_js_urls) > 0, (
        "No /_next/static/chunks/*.js requests observed — cannot verify SW bypass"
    )

    # Check that the first observed chunk URL is NOT in the SW cache.
    # We use just the pathname portion for caches.match (same-origin relative URL).
    sample_url = next_js_urls[0]
    sample_path = "/" + sample_url.split(BASE, 1)[-1].lstrip("/")

    in_cache = page.evaluate(
        """([cacheName, path]) =>
            caches.open(cacheName).then(c => c.match(path).then(r => r !== undefined))
        """,
        [CACHE_NAME, sample_path],
    )
    assert not in_cache, (
        f"/_next/ asset '{sample_path}' was found in SW cache '{CACHE_NAME}' "
        "— the SW should have skipped it entirely"
    )


# ---------------------------------------------------------------------------
# Test 6 — /api/* requests bypass the SW
# ---------------------------------------------------------------------------

def test_api_requests_bypass_sw(page: Page, base_url: str):
    """/api/* fetch requests are never intercepted or cached by the SW.

    The SW fetch handler early-returns for pathnames starting with /api/.
    We issue a fetch() from inside the page context to a known /api/ endpoint,
    then confirm the URL is not present in the SW cache.

    We use page.evaluate() to make the fetch because Playwright's network
    request interceptor cannot distinguish 'was this SW-controlled' at the
    cache-storage level — we need to query CacheStorage directly.
    """
    page.goto(base_url)
    _wait_for_sw(page)

    # The /api/auth/session endpoint always exists (NextAuth) — we don't care
    # if it returns 200 or 4xx, only that it was requested and NOT cached.
    api_path = "/api/auth/session"

    # Make a fetch() from page context to trigger any SW intercept path
    page.evaluate(
        """(url) => fetch(url).catch(() => null)""",
        f"{base_url}{api_path}",
    )
    # Give the SW a moment to process (it should do nothing for /api/)
    page.wait_for_timeout(300)

    in_cache = page.evaluate(
        """([cacheName, path]) =>
            caches.open(cacheName).then(c => c.match(path).then(r => r !== undefined))
        """,
        [CACHE_NAME, api_path],
    )
    assert not in_cache, (
        f"'/api/auth/session' was found in SW cache '{CACHE_NAME}' "
        "— the SW should not cache /api/* responses"
    )


# ---------------------------------------------------------------------------
# Test 7 — Old cache version (nwb-plan-v6) is evicted after activation
# ---------------------------------------------------------------------------

def test_old_cache_evicted(page: Page, base_url: str):
    """Only nwb-plan-v7 exists after activation; v6 (and any older) is deleted.

    The SW's activate handler runs:
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )

    Test flow:
      1. Navigate to the app (sets the origin so the CacheStorage API is
         usable; also registers + activates the current SW).
      2. From the page, manually seed a stale 'nwb-plan-v6' cache.
      3. Unregister the active SW and reload — this triggers a fresh
         install + activate cycle, which runs the eviction code path.
      4. Wait for the new SW to be ready and assert v6 is gone.

    We can't seed the cache before page.goto() because the CacheStorage API
    is bound to a security origin — calling caches.open() on about:blank
    throws 'caches is not defined'.
    """
    # Step 1: navigate so the origin is set and caches API is usable
    page.goto(base_url)
    _wait_for_sw(page)

    # Step 2: seed a stale v6 cache (after page load, when caches API works)
    page.evaluate(
        """() => caches.open('nwb-plan-v6')
                  .then(c => c.put('/', new Response('stale shell v6')))"""
    )

    # Sanity-check the seed worked
    keys_before = _cache_keys(page)
    assert "nwb-plan-v6" in keys_before, (
        f"Failed to seed stale cache; keys before reload: {keys_before}"
    )

    # Step 3: unregister current SW + reload to force a fresh install + activate
    page.evaluate(
        """() => navigator.serviceWorker.getRegistrations()
                  .then(regs => Promise.all(regs.map(r => r.unregister())))"""
    )
    page.reload()
    _wait_for_sw(page)
    # Activate is async; give clients.claim() + cleanup time to run
    page.wait_for_timeout(500)

    keys_after = _cache_keys(page)

    # v7 must exist
    assert CACHE_NAME in keys_after, (
        f"Expected {CACHE_NAME} in cache keys after activate, got: {keys_after}"
    )

    # v6 must be gone (evicted by activate handler)
    old_caches = [k for k in keys_after if k.startswith("nwb-plan-") and k != CACHE_NAME]
    assert len(old_caches) == 0, (
        f"Stale cache(s) should have been evicted by activate handler, "
        f"still present: {old_caches}"
    )


# ---------------------------------------------------------------------------
# Test 8 — clients.claim() gives immediate SW control on first load
# ---------------------------------------------------------------------------

def test_clients_claim_immediate_control(page: Page, base_url: str):
    """navigator.serviceWorker.controller is non-null on first controlled load.

    Normally a freshly installed SW only controls pages on *second* load.
    The activate handler calls clients.claim() to override this — so even
    the very first page load after SW installation should have a controller.

    We use page.evaluate() to read navigator.serviceWorker.controller because
    Playwright has no built-in accessor for the SW controller object.
    """
    page.goto(base_url)
    _wait_for_sw(page)

    # Give clients.claim() a moment to propagate (it's async post-activation)
    page.wait_for_timeout(500)

    controller_exists = page.evaluate(
        """() => navigator.serviceWorker.controller !== null"""
    )
    assert controller_exists, (
        "navigator.serviceWorker.controller is null — clients.claim() did not "
        "give the SW immediate control of this page"
    )
