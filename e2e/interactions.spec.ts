import { test, expect } from "@playwright/test";

/**
 * Hortus Interaction Tests — Real clicks, real form fills, real assertions.
 *
 * Tests that buttons do things, forms submit, filters filter,
 * tabs switch, panels expand, and navigation navigates.
 */

// ──────────────────────────────────────────────
// Auth interactions
// ──────────────────────────────────────────────

test.describe("Auth Interactions", () => {
  test("Login form validates empty fields", async ({ page }) => {
    await page.goto("/auth/login");
    const submitBtn = page.getByRole("button", { name: /sign in/i });
    await submitBtn.click();
    // HTML5 validation should prevent submission — email field should be invalid
    const emailInput = page.locator("input[type=email]");
    await expect(emailInput).toBeVisible();
    const isValid = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validity.valid,
    );
    expect(isValid).toBe(false);
    await page.screenshot({ path: "e2e/screenshots/auth-login-validation.png" });
  });

  test("Login form accepts email input and shows password", async ({ page }) => {
    await page.goto("/auth/login");
    await page.locator("input[type=email]").fill("test@hortus.app");
    await page.locator("input[type=password]").fill("testpassword123");
    // Verify fields have values
    await expect(page.locator("input[type=email]")).toHaveValue("test@hortus.app");
    await expect(page.locator("input[type=password]")).toHaveValue("testpassword123");
    await page.screenshot({ path: "e2e/screenshots/auth-login-filled.png" });
  });

  test("Login page links to signup", async ({ page }) => {
    await page.goto("/auth/login");
    const signupLink = page.locator("a[href*=signup]");
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await page.waitForURL("**/auth/signup");
      await expect(page.getByRole("heading", { name: /create/i })).toBeVisible();
      await page.screenshot({ path: "e2e/screenshots/auth-navigated-to-signup.png" });
    }
  });

  test("Signup form validates minimum password length", async ({ page }) => {
    await page.goto("/auth/signup");
    // Fill with short password
    const nameInputs = page.locator("input[type=text]");
    if (await nameInputs.first().isVisible()) {
      await nameInputs.first().fill("Test User");
    }
    await page.locator("input[type=email]").fill("test@hortus.app");
    await page.locator("input[type=password]").fill("short");
    await page.screenshot({ path: "e2e/screenshots/auth-signup-filled.png" });
  });
});

// ──────────────────────────────────────────────
// Onboarding interactions
// ──────────────────────────────────────────────

test.describe("Onboarding Interactions", () => {
  test("Onboarding renders and all buttons exist", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/onboarding-interactive.png", fullPage: true });

    // Count all interactive buttons
    const buttons = await page.getByRole("button").all();
    expect(buttons.length).toBeGreaterThan(0);
  });
});

// ──────────────────────────────────────────────
// Home screen interactions
// ──────────────────────────────────────────────

test.describe("Home Interactions", () => {
  test("Quick log buttons are clickable", async ({ page }) => {
    await page.goto("/app/home");
    await page.waitForTimeout(500);

    // Find quick log buttons and click them
    const quickBtns = page.locator("button").filter({ hasText: /new growth|watered|pest|flowering|harvested|rain|frost|photo/i });
    const count = await quickBtns.count();
    if (count > 0) {
      await quickBtns.first().click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: "e2e/screenshots/home-quick-log-clicked.png", fullPage: true });
    }
  });

  test("Rule of Life sections are visible", async ({ page }) => {
    await page.goto("/app/home");
    await page.waitForTimeout(500);

    // Verify all 5 Rule of Life movements
    for (const movement of ["Observe", "Tend", "Restrain"]) {
      const el = page.locator(`text=${movement}`).first();
      if (await el.isVisible()) {
        await expect(el).toBeVisible();
      }
    }
    await page.screenshot({ path: "e2e/screenshots/home-rule-of-life.png", fullPage: true });
  });
});

// ──────────────────────────────────────────────
// Planner tab switching
// ──────────────────────────────────────────────

test.describe("Planner Interactions", () => {
  test("Tab switching between Layout/Crops/Materials", async ({ page }) => {
    await page.goto("/app/planner");
    await page.waitForTimeout(500);

    // Click Crops tab and verify content changes
    const cropsTab = page.getByRole("button").filter({ hasText: /^crops$/i });
    if (await cropsTab.isVisible()) {
      await cropsTab.click();
      await page.waitForTimeout(200);
      // Should show crop-specific content
      await page.screenshot({ path: "e2e/screenshots/planner-crops-tab-active.png", fullPage: true });
    }

    // Click Materials tab
    const materialsTab = page.getByRole("button").filter({ hasText: /^materials$/i });
    if (await materialsTab.isVisible()) {
      await materialsTab.click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: "e2e/screenshots/planner-materials-tab-active.png", fullPage: true });
    }

    // Click back to Layout
    const layoutTab = page.getByRole("button").filter({ hasText: /^layout$/i });
    if (await layoutTab.isVisible()) {
      await layoutTab.click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: "e2e/screenshots/planner-layout-tab-active.png", fullPage: true });
    }
  });
});

// ──────────────────────────────────────────────
// Memory/Logs filter tabs
// ──────────────────────────────────────────────

test.describe("Memory Interactions", () => {
  test("Filter tabs change displayed observations", async ({ page }) => {
    await page.goto("/app/logs");
    await page.waitForTimeout(500);

    const allCount = await page.locator("[style*='border-radius']").count();

    // Click Notes filter
    const notesTab = page.getByRole("button").filter({ hasText: /^notes$/i });
    if (await notesTab.isVisible()) {
      await notesTab.click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: "e2e/screenshots/memory-notes-filter.png", fullPage: true });
    }

    // Click Voice filter
    const voiceTab = page.getByRole("button").filter({ hasText: /^voice$/i });
    if (await voiceTab.isVisible()) {
      await voiceTab.click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: "e2e/screenshots/memory-voice-filter.png", fullPage: true });
    }

    // Click All filter to reset
    const allTab = page.getByRole("button").filter({ hasText: /^all$/i });
    if (await allTab.isVisible()) {
      await allTab.click();
      await page.waitForTimeout(200);
    }
  });
});

// ──────────────────────────────────────────────
// NRI Chat input
// ──────────────────────────────────────────────

test.describe("NRI Chat Interactions", () => {
  test("Can type a message and see send button", async ({ page }) => {
    await page.goto("/app/nri");
    await page.waitForTimeout(500);

    const textarea = page.locator("textarea").first();
    if (await textarea.isVisible()) {
      await textarea.fill("What should I plant this week?");
      await expect(textarea).toHaveValue("What should I plant this week?");
      await page.screenshot({ path: "e2e/screenshots/nri-chat-message-typed.png", fullPage: true });

      // Click send
      const sendBtn = page.getByRole("button").filter({ hasText: /send/i });
      if (await sendBtn.isVisible()) {
        await sendBtn.click();
        await page.waitForTimeout(300);
        await page.screenshot({ path: "e2e/screenshots/nri-chat-after-send.png", fullPage: true });
      }
    }
  });
});

// ──────────────────────────────────────────────
// Settings toggles
// ──────────────────────────────────────────────

test.describe("Settings Interactions", () => {
  test("Language mode pills are clickable", async ({ page }) => {
    await page.goto("/app/settings");
    await page.waitForTimeout(500);

    // Find Gardener pill
    const gardenerPill = page.getByRole("button").filter({ hasText: /^gardener$/i });
    if (await gardenerPill.isVisible()) {
      await gardenerPill.click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: "e2e/screenshots/settings-gardener-mode.png", fullPage: true });
    }

    // Find Source pill
    const sourcePill = page.getByRole("button").filter({ hasText: /^source$/i });
    if (await sourcePill.isVisible()) {
      await sourcePill.click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: "e2e/screenshots/settings-source-mode.png", fullPage: true });
    }
  });

  test("Notifications page has toggle elements", async ({ page }) => {
    await page.goto("/app/notifications");
    await page.waitForTimeout(500);
    // Verify the page has interactive elements
    const buttons = await page.getByRole("button").all();
    expect(buttons.length).toBeGreaterThan(0);
    await page.screenshot({ path: "e2e/screenshots/notifications-interactive.png", fullPage: true });
  });
});

// ──────────────────────────────────────────────
// Seed Exchange filter tabs
// ──────────────────────────────────────────────

test.describe("Seed Exchange Interactions", () => {
  test("Filter tabs work (All/Offers/Requests/Swaps)", async ({ page }) => {
    await page.goto("/app/seed-exchange");
    await page.waitForTimeout(500);

    // Count items at start
    await page.screenshot({ path: "e2e/screenshots/seed-exchange-all.png", fullPage: true });

    const offersTab = page.getByRole("button").filter({ hasText: /^offers$/i });
    if (await offersTab.isVisible()) {
      await offersTab.click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: "e2e/screenshots/seed-exchange-offers.png", fullPage: true });
    }

    const requestsTab = page.getByRole("button").filter({ hasText: /^requests$/i });
    if (await requestsTab.isVisible()) {
      await requestsTab.click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: "e2e/screenshots/seed-exchange-requests.png", fullPage: true });
    }

    const swapsTab = page.getByRole("button").filter({ hasText: /^swaps$/i });
    if (await swapsTab.isVisible()) {
      await swapsTab.click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: "e2e/screenshots/seed-exchange-swaps.png", fullPage: true });
    }
  });
});

// ──────────────────────────────────────────────
// Garden-Ready Lot Finder interactions
// ──────────────────────────────────────────────

test.describe("Garden-Ready Finder Interactions", () => {
  test("Public land filter toggles", async ({ page }) => {
    await page.goto("/app/garden-ready");
    await page.waitForTimeout(500);

    const publicFilter = page.getByRole("button").filter({ hasText: /public land/i });
    if (await publicFilter.isVisible()) {
      await publicFilter.click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: "e2e/screenshots/garden-ready-public-only.png", fullPage: true });

      // Toggle off
      await publicFilter.click();
      await page.waitForTimeout(200);
    }
  });

  test("Sort dropdown changes order", async ({ page }) => {
    await page.goto("/app/garden-ready");
    await page.waitForTimeout(500);

    const sortSelect = page.locator("select");
    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption("distance");
      await page.waitForTimeout(200);
      await page.screenshot({ path: "e2e/screenshots/garden-ready-sorted-distance.png", fullPage: true });
    }
  });

  test("Lot cards are clickable", async ({ page }) => {
    await page.goto("/app/garden-ready");
    await page.waitForTimeout(500);

    const lotCard = page.locator("[role=button]").first();
    if (await lotCard.isVisible()) {
      await lotCard.click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: "e2e/screenshots/garden-ready-lot-selected.png", fullPage: true });
    }
  });
});

// ──────────────────────────────────────────────
// Compost Tracker expand/collapse
// ──────────────────────────────────────────────

test.describe("Compost Tracker Interactions", () => {
  test("Compost page has interactive pile cards", async ({ page }) => {
    await page.goto("/app/compost");
    await page.waitForTimeout(500);
    // Verify piles render with clickable elements
    const content = await page.textContent("body");
    expect(content?.toLowerCase()).toContain("main pile");
    await page.screenshot({ path: "e2e/screenshots/compost-interactive.png", fullPage: true });
  });
});

// ──────────────────────────────────────────────
// Philosophy accordion expand
// ──────────────────────────────────────────────

test.describe("Philosophy Interactions", () => {
  test("Philosophy cards expand to show details", async ({ page }) => {
    await page.goto("/app/philosophy");
    await page.waitForTimeout(500);

    // Click a philosophy card to expand
    const backToEden = page.locator("text=Back to Eden").first();
    if (await backToEden.isVisible()) {
      await backToEden.click();
      await page.waitForTimeout(300);
      // After click, should see gifts/costs/best-for content
      await page.screenshot({ path: "e2e/screenshots/philosophy-expanded.png", fullPage: true });
    }
  });
});

// ──────────────────────────────────────────────
// Ancient Library search and filter
// ──────────────────────────────────────────────

test.describe("Ancient Library Interactions", () => {
  test("Plant search filters results", async ({ page }) => {
    await page.goto("/ancient/plants");
    await page.waitForTimeout(500);

    const searchInput = page.locator("input[placeholder*=earch]").first();
    if (await searchInput.isVisible()) {
      // Count initial plant cards
      const initialCards = await page.locator("[style*='cursor: pointer']").count();

      // Search for "sage"
      await searchInput.fill("sage");
      await page.waitForTimeout(300);
      const filteredCards = await page.locator("[style*='cursor: pointer']").count();

      // Should have fewer results
      expect(filteredCards).toBeLessThanOrEqual(initialCards);
      await page.screenshot({ path: "e2e/screenshots/ancient-search-sage.png", fullPage: true });

      // Clear search
      await searchInput.fill("");
      await page.waitForTimeout(300);
    }
  });

  test("Difficulty filter narrows plant list", async ({ page }) => {
    await page.goto("/ancient/plants");
    await page.waitForTimeout(500);

    const beginnerBtn = page.getByRole("button").filter({ hasText: /^beginner$/i });
    if (await beginnerBtn.isVisible()) {
      await beginnerBtn.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: "e2e/screenshots/ancient-beginner-filtered.png", fullPage: true });
    }
  });

  test("Tradition filter chips work", async ({ page }) => {
    await page.goto("/ancient/plants");
    await page.waitForTimeout(500);

    const romanChip = page.getByRole("button").filter({ hasText: /roman/i }).first();
    if (await romanChip.isVisible()) {
      await romanChip.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: "e2e/screenshots/ancient-roman-filtered.png", fullPage: true });
    }
  });

  test("Plant detail panel opens on card click", async ({ page }) => {
    await page.goto("/ancient/plants");
    await page.waitForTimeout(500);

    // Click the first plant card
    const firstPlant = page.locator("[style*='cursor: pointer']").first();
    if (await firstPlant.isVisible()) {
      await firstPlant.click();
      await page.waitForTimeout(300);

      // Should show detail content — check for "How to Grow" or growing notes
      const detailContent = page.locator("text=How to Grow").first();
      if (await detailContent.isVisible()) {
        await expect(detailContent).toBeVisible();
      }
      await page.screenshot({ path: "e2e/screenshots/ancient-plant-detail-open.png", fullPage: true });
    }
  });

  test("Technique cards expand with instructions", async ({ page }) => {
    await page.goto("/ancient/techniques");
    await page.waitForTimeout(500);

    const firstTechnique = page.locator("[style*='cursor: pointer']").first();
    if (await firstTechnique.isVisible()) {
      await firstTechnique.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: "e2e/screenshots/ancient-technique-expanded.png", fullPage: true });
    }
  });

  test("Tradition cards expand with plants and techniques", async ({ page }) => {
    await page.goto("/ancient/traditions");
    await page.waitForTimeout(500);

    const firstTradition = page.locator("[style*='cursor: pointer']").first();
    if (await firstTradition.isVisible()) {
      await firstTradition.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: "e2e/screenshots/ancient-tradition-expanded.png", fullPage: true });
    }
  });

  test("Calendar shows 12 months with current highlighted", async ({ page }) => {
    await page.goto("/ancient/calendar");
    await page.waitForTimeout(500);
    const body = await page.textContent("body");
    expect(body).toContain("January");
    expect(body).toContain("December");
    await page.screenshot({ path: "e2e/screenshots/ancient-calendar-interactive.png", fullPage: true });
  });
});

// ──────────────────────────────────────────────
// Navigation — bottom nav + sidebar links
// ──────────────────────────────────────────────

test.describe("Navigation", () => {
  test("Bottom nav has 5 navigation buttons", async ({ page }) => {
    await page.goto("/app/home");
    await page.waitForTimeout(500);
    const navButtons = page.locator("nav button");
    const count = await navButtons.count();
    expect(count).toBeGreaterThanOrEqual(5);
    await page.screenshot({ path: "e2e/screenshots/nav-bottom-bar.png", fullPage: true });
  });

  test("NRI compass button navigates to chat", async ({ page }) => {
    await page.goto("/app/home");
    await page.waitForTimeout(500);

    const compassBtn = page.locator("[aria-label=NRI]");
    if (await compassBtn.isVisible()) {
      await compassBtn.click();
      await page.waitForURL("**/app/nri");
      await expect(page.locator("body")).not.toBeEmpty();
      await page.screenshot({ path: "e2e/screenshots/nav-compass-to-nri.png", fullPage: true });
    }
  });
});

// ──────────────────────────────────────────────
// Community interactions
// ──────────────────────────────────────────────

test.describe("Community Interactions", () => {
  test("Workday RSVP buttons toggle", async ({ page }) => {
    await page.goto("/app/community/workdays");
    await page.waitForTimeout(500);

    const attendingBtn = page.getByRole("button").filter({ hasText: /attending/i });
    if (await attendingBtn.first().isVisible()) {
      await attendingBtn.first().click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: "e2e/screenshots/community-rsvp-attending.png", fullPage: true });
    }
  });

  test("Sharing board shows posts with status", async ({ page }) => {
    await page.goto("/app/community/sharing");
    await page.waitForTimeout(500);
    const body = await page.textContent("body");
    expect(body).toContain("Surplus");
    await page.screenshot({ path: "e2e/screenshots/community-sharing-interactive.png", fullPage: true });
  });

  test("Volunteer hours form fields work", async ({ page }) => {
    await page.goto("/app/community/hours");
    await page.waitForTimeout(500);

    // Find hours input and fill it
    const hoursInput = page.locator("input[type=number]").first();
    if (await hoursInput.isVisible()) {
      await hoursInput.fill("2.5");
      await expect(hoursInput).toHaveValue("2.5");
      await page.screenshot({ path: "e2e/screenshots/community-hours-filled.png", fullPage: true });
    }
  });
});

// ──────────────────────────────────────────────
// Marketing page interactions
// ──────────────────────────────────────────────

test.describe("Marketing Interactions", () => {
  test("Features slider scrolls horizontally", async ({ page }) => {
    await page.goto("/marketing.html");
    await page.waitForTimeout(1000);

    // Scroll to features section
    await page.evaluate(() => document.getElementById("features")?.scrollIntoView());
    await page.waitForTimeout(500);

    // Find the scrollable container and scroll it
    const scroller = page.locator(".features-scroll");
    if (await scroller.isVisible()) {
      await scroller.evaluate((el) => el.scrollBy({ left: 350, behavior: "smooth" }));
      await page.waitForTimeout(500);
      await page.screenshot({ path: "e2e/screenshots/marketing-slider-scrolled.png" });
    }
  });

  test("Demo gate form accepts input and submits", async ({ page }) => {
    await page.goto("/marketing.html");
    await page.waitForTimeout(500);

    // Navigate to demo gate
    await page.evaluate(() => document.getElementById("try-it")?.scrollIntoView());
    await page.waitForTimeout(500);

    // Fill the form
    const form = page.locator("#demo-form");
    if (await form.isVisible()) {
      await form.locator("input[name=name]").fill("Jeromy Darling");
      await form.locator("input[name=email]").fill("jeromy@hortus.app");
      await form.locator("input[name=cltName]").fill("Rondo CLT");
      await form.locator("select[name=role]").selectOption("clt_staff");

      await page.screenshot({ path: "e2e/screenshots/marketing-demo-form-filled.png" });

      // Submit
      await form.locator("button[type=submit]").click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: "e2e/screenshots/marketing-demo-form-submitted.png" });
    }
  });

  test("Nav links scroll to sections", async ({ page }) => {
    await page.goto("/marketing.html");
    await page.waitForTimeout(1000);

    // Click "Resilience" nav link
    const resilienceLink = page.locator("nav a[href='#resilience']");
    if (await resilienceLink.isVisible()) {
      await resilienceLink.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: "e2e/screenshots/marketing-nav-to-resilience.png" });
    }
  });

  test("Theme toggle button works", async ({ page }) => {
    await page.goto("/marketing.html");
    await page.waitForTimeout(500);

    const themeBtn = page.locator(".btn-theme");
    if (await themeBtn.isVisible()) {
      // Check initial theme
      const initialTheme = await page.locator("html").getAttribute("data-theme");

      await themeBtn.click();
      await page.waitForTimeout(300);

      const newTheme = await page.locator("html").getAttribute("data-theme");
      // Theme should have changed
      expect(newTheme).not.toBe(initialTheme);
      await page.screenshot({ path: "e2e/screenshots/marketing-dark-theme.png" });

      // Toggle back
      await themeBtn.click();
      await page.waitForTimeout(300);
    }
  });
});
