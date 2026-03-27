// browser.js — Playwright wrapper
// Handles launch, page state extraction, action execution, screenshots

import { chromium } from "playwright";
import path from "path";
import fs from "fs";

let _browser = null;
let _context = null;
let _page = null;

export async function launchBrowser({ record = true, sessionId } = {}) {
  const videoDir = path.resolve("output/videos");
  fs.mkdirSync(videoDir, { recursive: true });

  _browser = await chromium.launch({
    headless: false,           // visible window — you can watch it work
    args: ["--window-size=1280,800"],
  });

  _context = await _browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ...(record && {
      recordVideo: {
        dir: videoDir,
        size: { width: 1280, height: 800 },
      },
    }),
  });

  _page = await _context.newPage();

  // Catch console errors — may indicate JS bugs worth reporting
  _page.on("console", (msg) => {
    if (msg.type() === "error") {
      global._consoleErrors = global._consoleErrors ?? [];
      global._consoleErrors.push(msg.text());
    }
  });

  return _page;
}

export async function closeBrowser() {
  if (_page) await _page.close().catch(() => {});
  if (_context) await _context.close().catch(() => {});
  if (_browser) await _browser.close().catch(() => {});
  _page = _context = _browser = null;
}

export function getPage() {
  return _page;
}

// Extract meaningful page state for the AI to reason about
export async function getPageState(page) {
  return await page.evaluate(() => {
    function bestSelector(el) {
      // Build the most reliable CSS selector for this element
      if (el.id) return `#${el.id}`;
      if (el.name) return `${el.tagName.toLowerCase()}[name='${el.name}']`;
      if (el.getAttribute("data-testid")) return `[data-testid='${el.getAttribute("data-testid")}']`;
      if (el.type && el.tagName === "INPUT") return `input[type='${el.type}']`;
      if (el.className) {
        const cls = el.className.toString().trim().split(/\s+/).slice(0, 2).join(".");
        if (cls) return `${el.tagName.toLowerCase()}.${cls}`;
      }
      return el.tagName.toLowerCase();
    }

    const interactable = [
      ...document.querySelectorAll(
        "button, a[href], input, select, textarea, [role='button'], [role='link'], [role='tab'], [role='menuitem']"
      ),
    ]
      .map((el) => {
        const rect = el.getBoundingClientRect();
        const visible =
          rect.width > 0 &&
          rect.height > 0 &&
          rect.top >= -100 &&
          rect.top < window.innerHeight + 100;
        return {
          tag: el.tagName.toLowerCase(),
          type: el.type ?? null,
          text: (el.innerText ?? el.placeholder ?? el.title ?? "").slice(0, 80).trim(),
          id: el.id || null,
          name: el.name || null,
          placeholder: el.placeholder || null,
          ariaLabel: el.getAttribute("aria-label") || null,
          selector: bestSelector(el),   // <-- pre-built best selector
          visible,
          disabled: el.disabled ?? false,
          isInput: ["input", "textarea", "select"].includes(el.tagName.toLowerCase()),
        };
      })
      .filter((el) => el.visible && !el.disabled)
      .slice(0, 35);

    const bodyText = document.body.innerText.slice(0, 1000).replace(/\s+/g, " ").trim();

    const errors = [
      ...document.querySelectorAll(
        ".error, .alert, .alert-danger, [role='alert'], .notification, .toast, .warning"
      ),
    ]
      .map((el) => el.innerText.slice(0, 120))
      .filter(Boolean);

    return {
      url: window.location.href,
      title: document.title,
      bodyText,
      interactable,
      errors,
      consoleErrors: window.__qaErrors ?? [],
    };
  });
}

export async function takeScreenshot(page, sessionId, step) {
  const dir = path.resolve("output/screenshots");
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${sessionId}_step${String(step).padStart(3, "0")}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  return filePath;
}

// Execute a structured action returned by the AI
export async function doAction(page, action) {
  const timeout = 6000;
  try {
    switch (action.action) {
      case "click": {
        // Try by text first, fall back to CSS selector
        const locator = action.text
          ? page.getByText(action.text, { exact: false }).first()
          : page.locator(action.selector).first();
        await locator.click({ timeout });
        break;
      }
      case "type": {
        // Try to find the input field by various methods
        let el = null;
        
        // First try: exact selector if provided
        if (action.selector) {
          el = page.locator(action.selector).first();
        }
        // Second try: find by placeholder text
        else if (action.text && action.description?.includes("placeholder")) {
          el = page.getByPlaceholder(new RegExp(action.text, "i")).first();
        }
        // Third try: find by label text
        else if (action.text) {
          el = page.getByLabel(new RegExp(action.text, "i"), { exact: false }).first();
        }
        // Last resort: find any visible input
        else {
          el = page.locator("input:visible").first();
        }
        
        if (!el) throw new Error("Could not find input field");
        await el.click({ timeout });
        await el.fill(action.text ?? "", { timeout });
        break;
      }
      case "press": {
        await page.keyboard.press(action.key ?? "Enter");
        break;
      }
      case "navigate": {
        await page.goto(action.url, { waitUntil: "domcontentloaded", timeout: 15000 });
        break;
      }
      case "scroll": {
        await page.evaluate((dir) => {
          window.scrollBy({ top: dir === "down" ? 600 : -600, behavior: "smooth" });
        }, action.direction ?? "down");
        break;
      }
      case "hover": {
        const locator = action.text
          ? page.getByText(action.text, { exact: false }).first()
          : page.locator(action.selector).first();
        await locator.hover({ timeout });
        break;
      }
      case "select": {
        await page.locator(action.selector).first().selectOption(action.value, { timeout });
        break;
      }
      case "wait": {
        await page.waitForTimeout(Math.min(action.ms ?? 1000, 5000));
        break;
      }
      default:
        console.warn(`Unknown action type: ${action.action}`);
    }
  } catch (err) {
    // Don't crash the loop — log the failure and continue
    console.warn(`  Action failed (${action.action}): ${err.message}`);
    return false;
  }
  return true;
}
