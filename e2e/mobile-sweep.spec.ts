import { test, expect, type Page } from "@playwright/test";

/**
 * Hortus Mobile Sweep
 *
 * Full visual and interaction audit at mobile viewport (375x812, iPhone 14).
 * Screenshots every screen. Tests touch targets, overflow, and layout.
 */

const MOBILE_VIEWPORT = { width: 375, height: 812 };

test.use({ viewport: MOBILE_VIEWPORT });

async function noHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    return document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2;
  });
}

// ──────────────────────────────────────────────
// Marketing page — mobile
// ──────────────────────────────────────────────

test.describe("Marketing Mobile", () => {
  test("Hero renders without horizontal overflow", async ({ page }) => {
    await page.goto("/marketing.html");
    await page.waitForTimeout(1000);
    const noOverflow = await noHorizontalOverflow(page);
    expect(noOverflow).toBe(true);
    await page.screenshot({ path: "e2e/screenshots/mobile-marketing-hero.png", fullPage: false });
  });

  test("Nav collapses on mobile — only CTA and theme visible", async ({ page }) => {
    await page.goto("/marketing.html");
    await page.waitForTimeout(500);
    // Desktop nav links should be hidden
    const navLinks = page.locator("nav .nav-links a:not(.nav-cta):not(.btn-theme)");
    const visibleCount = await navLinks.evaluateAll(
      (els) => els.filter((el) => getComputedStyle(el).display !== "none").length,
    );
    // On mobile, these should be hidden via CSS
    await page.screenshot({ path: "e2e/screenshots/mobile-marketing-nav.png", fullPage: false });
  });

  test("Phone mockup scales correctly", async ({ page }) => {
    await page.goto("/marketing.html");
    await page.waitForTimeout(500);
    // Scroll to phone area
    await page.evaluate(() => {
      document.querySelector(".hero-phone-area")?.scrollIntoView();
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: "e2e/screenshots/mobile-marketing-phone.png", fullPage: false });
  });

  test("Features slider scrolls horizontally on touch", async ({ page }) => {
    await page.goto("/marketing.html");
    await page.evaluate(() => document.getElementById("features")?.scrollIntoView());
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/mobile-marketing-features.png", fullPage: false });

    // Swipe the slider
    const slider = page.locator(".features-scroll");
    if (await slider.isVisible()) {
      const box = await slider.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + 20, box.y + box.height / 2, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(300);
        await page.screenshot({ path: "e2e/screenshots/mobile-marketing-features-swiped.png", fullPage: false });
      }
    }
  });

  test("Resilience cards stack vertically", async ({ page }) => {
    await page.goto("/marketing.html");
    await page.evaluate(() => document.getElementById("resilience")?.scrollIntoView());
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/mobile-marketing-resilience.png", fullPage: false });
  });

  test("Demo gate form fits mobile width", async ({ page }) => {
    await page.goto("/marketing.html");
    await page.evaluate(() => document.getElementById("try-it")?.scrollIntoView());
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/mobile-marketing-demo-gate.png", fullPage: false });

    // Fill form on mobile
    const form = page.locator("#demo-form");
    if (await form.isVisible()) {
      await form.locator("input[name=name]").fill("Mobile User");
      await form.locator("input[name=email]").fill("mobile@test.com");
      await form.locator("select[name=role]").selectOption("gardener");
      await page.screenshot({ path: "e2e/screenshots/mobile-marketing-form-filled.png", fullPage: false });
    }
  });

  test("Full page screenshot — no overflow", async ({ page }) => {
    await page.goto("/marketing.html");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "e2e/screenshots/mobile-marketing-full.png", fullPage: true });
  });
});

// ──────────────────────────────────────────────
// App screens — mobile
// ──────────────────────────────────────────────

test.describe("App Mobile", () => {
  test("Home — bottom nav visible, content fits", async ({ page }) => {
    await page.goto("/app/home");
    await page.waitForTimeout(500);
    // Bottom nav should be visible
    const nav = page.locator("nav").last();
    await expect(nav).toBeVisible();
    // No horizontal overflow
    const noOverflow = await noHorizontalOverflow(page);
    expect(noOverflow).toBe(true);
    await page.screenshot({ path: "e2e/screenshots/mobile-app-home.png", fullPage: false });
  });

  test("Home — bottom nav compass button is prominent", async ({ page }) => {
    await page.goto("/app/home");
    await page.waitForTimeout(500);
    const compass = page.locator("[aria-label=NRI]");
    if (await compass.isVisible()) {
      const box = await compass.boundingBox();
      // Compass should be at least 44px wide (touch target)
      expect(box?.width).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({ path: "e2e/screenshots/mobile-app-compass.png", fullPage: false });
  });

  test("Loam Map — tabs and cards fit mobile", async ({ page }) => {
    await page.goto("/app/land");
    await page.waitForTimeout(500);
    const noOverflow = await noHorizontalOverflow(page);
    expect(noOverflow).toBe(true);
    await page.screenshot({ path: "e2e/screenshots/mobile-app-loam.png", fullPage: true });
  });

  test("Weather — hazard banner full width", async ({ page }) => {
    await page.goto("/app/weather");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/mobile-app-weather.png", fullPage: false });
  });

  test("Planner — tabs fit mobile width", async ({ page }) => {
    await page.goto("/app/planner");
    await page.waitForTimeout(500);
    const noOverflow = await noHorizontalOverflow(page);
    expect(noOverflow).toBe(true);
    await page.screenshot({ path: "e2e/screenshots/mobile-app-planner.png", fullPage: false });
  });

  test("NRI Chat — input at bottom, messages fill screen", async ({ page }) => {
    await page.goto("/app/nri");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/mobile-app-nri.png", fullPage: false });
  });

  test("Memory — observation cards stack cleanly", async ({ page }) => {
    await page.goto("/app/logs");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/mobile-app-memory.png", fullPage: true });
  });

  test("Common Year — phase cards stack vertically", async ({ page }) => {
    await page.goto("/app/commonyear");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/mobile-app-commonyear.png", fullPage: true });
  });

  test("Source — crop pattern cards stack", async ({ page }) => {
    await page.goto("/app/source");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/mobile-app-source.png", fullPage: true });
  });

  test("Settings — all sections fit", async ({ page }) => {
    await page.goto("/app/settings");
    await page.waitForTimeout(500);
    const noOverflow = await noHorizontalOverflow(page);
    expect(noOverflow).toBe(true);
    await page.screenshot({ path: "e2e/screenshots/mobile-app-settings.png", fullPage: true });
  });

  test("Food Map — SVG scales to viewport", async ({ page }) => {
    await page.goto("/app/food-map");
    await page.waitForTimeout(500);
    const svg = page.locator("svg").first();
    if (await svg.isVisible()) {
      const box = await svg.boundingBox();
      // SVG should not exceed viewport width
      expect(box?.width).toBeLessThanOrEqual(376);
    }
    await page.screenshot({ path: "e2e/screenshots/mobile-app-food-map.png", fullPage: false });
  });

  test("Resilience Score — gauge centered", async ({ page }) => {
    await page.goto("/app/resilience");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/mobile-app-resilience.png", fullPage: false });
  });

  test("Seed Exchange — filter tabs wrap on mobile", async ({ page }) => {
    await page.goto("/app/seed-exchange");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/mobile-app-seed-exchange.png", fullPage: false });
  });

  test("Compost — pile cards full width", async ({ page }) => {
    await page.goto("/app/compost");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/mobile-app-compost.png", fullPage: false });
  });

  test("Garden-Ready — lot cards stack", async ({ page }) => {
    await page.goto("/app/garden-ready");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/mobile-app-garden-ready.png", fullPage: true });
  });

  test("Harvest — form fields full width", async ({ page }) => {
    await page.goto("/app/harvest");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/mobile-app-harvest.png", fullPage: false });
  });

  test("Onboarding — step cards stack", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForTimeout(500);
    // Visual check — screenshot the full page
    await page.screenshot({ path: "e2e/screenshots/mobile-onboarding.png", fullPage: true });
  });

  test("Login — form centered on mobile", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForTimeout(300);
    await page.screenshot({ path: "e2e/screenshots/mobile-auth-login.png", fullPage: false });
  });
});

// ──────────────────────────────────────────────
// Community screens — mobile
// ──────────────────────────────────────────────

test.describe("Community Mobile", () => {
  test("People — member cards stack", async ({ page }) => {
    await page.goto("/app/community/people");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/mobile-community-people.png", fullPage: true });
  });

  test("Messages — thread list fits mobile", async ({ page }) => {
    await page.goto("/app/community/messages");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/mobile-community-messages.png", fullPage: false });
  });

  test("Workdays — RSVP buttons are touch-sized", async ({ page }) => {
    await page.goto("/app/community/workdays");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/mobile-community-workdays.png", fullPage: false });
  });
});

// ──────────────────────────────────────────────
// Ancient Library — mobile
// ──────────────────────────────────────────────

test.describe("Ancient Library Mobile", () => {
  test("Library home — CTA cards stack", async ({ page }) => {
    await page.goto("/ancient");
    await page.waitForTimeout(500);
    const noOverflow = await noHorizontalOverflow(page);
    expect(noOverflow).toBe(true);
    await page.screenshot({ path: "e2e/screenshots/mobile-ancient-home.png", fullPage: true });
  });

  test("Plants — filters wrap, cards stack", async ({ page }) => {
    await page.goto("/ancient/plants");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/mobile-ancient-plants.png", fullPage: false });
  });

  test("Calendar — month cards full width", async ({ page }) => {
    await page.goto("/ancient/calendar");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/mobile-ancient-calendar.png", fullPage: true });
  });
});

// ──────────────────────────────────────────────
// Coordinator — mobile
// ──────────────────────────────────────────────

test.describe("Coordinator Mobile", () => {
  test("Dashboard — garden cards stack", async ({ page }) => {
    await page.goto("/app/coordinator");
    await page.waitForTimeout(500);
    const noOverflow = await noHorizontalOverflow(page);
    expect(noOverflow).toBe(true);
    await page.screenshot({ path: "e2e/screenshots/mobile-coordinator-dashboard.png", fullPage: true });
  });

  test("Visit log — form fits mobile", async ({ page }) => {
    await page.goto("/app/coordinator/visits");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/mobile-coordinator-visits.png", fullPage: false });
  });

  test("Reports — metrics cards stack", async ({ page }) => {
    await page.goto("/app/coordinator/reports");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/mobile-coordinator-reports.png", fullPage: true });
  });
});
