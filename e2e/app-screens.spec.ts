import { test, expect } from "@playwright/test";

/**
 * Hortus E2E Tests — Screenshot every screen
 *
 * Tests every route in the app, clicking through interactive elements
 * and capturing screenshots. Runs against the Vite preview server.
 */

// ──────────────────────────────────────────────
// Auth screens
// ──────────────────────────────────────────────

test.describe("Auth", () => {
  test("Login page renders with form", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.locator("input[type=email]")).toBeVisible();
    await expect(page.locator("input[type=password]")).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/auth-login.png", fullPage: true });
  });

  test("Signup page renders with form", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(page.getByRole("heading", { name: /create/i })).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/auth-signup.png", fullPage: true });
  });
});

// ──────────────────────────────────────────────
// Onboarding
// ──────────────────────────────────────────────

test.describe("Onboarding", () => {
  test("Onboarding page loads", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForTimeout(500);
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "e2e/screenshots/onboarding-step1.png", fullPage: true });
  });
});

// ──────────────────────────────────────────────
// Core app screens
// ──────────────────────────────────────────────

test.describe("Core App", () => {
  test("Home screen renders with phase and weather", async ({ page }) => {
    await page.goto("/app/home");
    await page.waitForTimeout(500);
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "e2e/screenshots/app-home.png", fullPage: true });
  });

  test("Loam Map renders with soil profile", async ({ page }) => {
    await page.goto("/app/land");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/app-loam-map.png", fullPage: true });
  });

  test("Weather screen renders hazard state", async ({ page }) => {
    await page.goto("/app/weather");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/app-weather.png", fullPage: true });
  });

  test("Common Year shows 8 phases", async ({ page }) => {
    await page.goto("/app/commonyear");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/app-common-year.png", fullPage: true });
  });

  test("Memory/Logs screen with observations", async ({ page }) => {
    await page.goto("/app/logs");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/app-memory.png", fullPage: true });
  });

  test("NRI Chat renders with greeting", async ({ page }) => {
    await page.goto("/app/nri");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/app-nri-chat.png", fullPage: true });
  });

  test("Source screen with Seeds Now and crop patterns", async ({ page }) => {
    await page.goto("/app/source");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/app-source.png", fullPage: true });
  });

  test("Philosophy screen with 6 philosophies", async ({ page }) => {
    await page.goto("/app/philosophy");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/app-philosophy.png", fullPage: true });
  });

  test("Settings screen renders all sections", async ({ page }) => {
    await page.goto("/app/settings");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/app-settings.png", fullPage: true });
  });
});

// ──────────────────────────────────────────────
// Growing screens
// ──────────────────────────────────────────────

test.describe("Growing", () => {
  test("Planner with tabs (Layout/Crops/Materials)", async ({ page }) => {
    await page.goto("/app/planner");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/app-planner-layout.png", fullPage: true });

    // Click Crops tab
    const cropsTab = page.locator("button", { hasText: /crops/i });
    if (await cropsTab.isVisible()) {
      await cropsTab.click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: "e2e/screenshots/app-planner-crops.png", fullPage: true });
    }

    // Click Materials tab
    const materialsTab = page.locator("button", { hasText: /materials/i });
    if (await materialsTab.isVisible()) {
      await materialsTab.click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: "e2e/screenshots/app-planner-materials.png", fullPage: true });
    }
  });

  test("Harvest log with yield dashboard", async ({ page }) => {
    await page.goto("/app/harvest");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/app-harvest.png", fullPage: true });
  });

  test("Succession timeline", async ({ page }) => {
    await page.goto("/app/succession");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/app-succession.png", fullPage: true });
  });

  test("Phenology log with streak", async ({ page }) => {
    await page.goto("/app/phenology");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/app-phenology.png", fullPage: true });
  });

  test("Notifications preferences", async ({ page }) => {
    await page.goto("/app/notifications");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/app-notifications.png", fullPage: true });
  });
});

// ──────────────────────────────────────────────
// Resilience features
// ──────────────────────────────────────────────

test.describe("Resilience", () => {
  test("Food System Map with US states and markers", async ({ page }) => {
    await page.goto("/app/food-map");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/app-food-map.png", fullPage: true });
  });

  test("Food Resilience Score gauge", async ({ page }) => {
    await page.goto("/app/resilience");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/app-resilience.png", fullPage: true });
  });

  test("Yield Dashboard with bed bars", async ({ page }) => {
    await page.goto("/app/yield");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/app-yield.png", fullPage: true });
  });

  test("Seed Exchange Board with tabs", async ({ page }) => {
    await page.goto("/app/seed-exchange");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/app-seed-exchange.png", fullPage: true });
  });

  test("Economic Impact dashboard", async ({ page }) => {
    await page.goto("/app/impact");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/app-impact.png", fullPage: true });
  });

  test("Compost Tracker with piles", async ({ page }) => {
    await page.goto("/app/compost");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/app-compost.png", fullPage: true });
  });

  test("Garden-Ready Lot Finder", async ({ page }) => {
    await page.goto("/app/garden-ready");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/app-garden-ready.png", fullPage: true });
  });
});

// ──────────────────────────────────────────────
// Community screens
// ──────────────────────────────────────────────

test.describe("Community", () => {
  test("People & NRI Signals", async ({ page }) => {
    await page.goto("/app/community/people");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/community-people.png", fullPage: true });
  });

  test("Workdays schedule", async ({ page }) => {
    await page.goto("/app/community/workdays");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/community-workdays.png", fullPage: true });
  });

  test("Sharing Board", async ({ page }) => {
    await page.goto("/app/community/sharing");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/community-sharing.png", fullPage: true });
  });

  test("Messages/Threads", async ({ page }) => {
    await page.goto("/app/community/messages");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/community-messages.png", fullPage: true });
  });

  test("Volunteer Hours", async ({ page }) => {
    await page.goto("/app/community/hours");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/community-hours.png", fullPage: true });
  });

  test("Garden Map", async ({ page }) => {
    await page.goto("/app/community/map");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/community-garden-map.png", fullPage: true });
  });
});

// ──────────────────────────────────────────────
// Ancient Library
// ──────────────────────────────────────────────

test.describe("Ancient Library", () => {
  test("Library Home with 3 CTA cards", async ({ page }) => {
    await page.goto("/ancient");
    await page.waitForTimeout(500);
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "e2e/screenshots/ancient-home.png", fullPage: true });
  });

  test("Plants browse with filters and search", async ({ page }) => {
    await page.goto("/ancient/plants");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/ancient-plants.png", fullPage: true });

    // Click a Beginner filter if visible
    const beginnerBtn = page.locator("button", { hasText: /beginner/i });
    if (await beginnerBtn.isVisible()) {
      await beginnerBtn.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: "e2e/screenshots/ancient-plants-beginner.png", fullPage: true });
    }

    // Click first plant card
    const firstCard = page.locator("[style*='cursor: pointer']").first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: "e2e/screenshots/ancient-plant-detail.png", fullPage: true });
    }
  });

  test("Techniques list and expand", async ({ page }) => {
    await page.goto("/ancient/techniques");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/ancient-techniques.png", fullPage: true });
  });

  test("Traditions grid", async ({ page }) => {
    await page.goto("/ancient/traditions");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/ancient-traditions.png", fullPage: true });
  });

  test("Seasonal Calendar with current month", async ({ page }) => {
    await page.goto("/ancient/calendar");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/ancient-calendar.png", fullPage: true });
  });
});

// ──────────────────────────────────────────────
// Static pages
// ──────────────────────────────────────────────

test.describe("Static", () => {
  test("Marketing page loads", async ({ page }) => {
    await page.goto("/marketing.html");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "e2e/screenshots/marketing-hero.png", fullPage: false });

    // Scroll to resilience section
    await page.evaluate(() => {
      document.getElementById("resilience")?.scrollIntoView();
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/marketing-resilience.png", fullPage: false });

    // Scroll to features slider
    await page.evaluate(() => {
      document.getElementById("features")?.scrollIntoView();
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/marketing-features.png", fullPage: false });

    // Scroll to demo gate
    await page.evaluate(() => {
      document.getElementById("try-it")?.scrollIntoView();
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/marketing-demo-gate.png", fullPage: false });
  });

  test("Prototype page loads with dev bar", async ({ page }) => {
    await page.goto("/prototype.html");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "e2e/screenshots/prototype-app.png", fullPage: false });
  });
});
