from __future__ import annotations

import json
from pathlib import Path

from playwright.sync_api import Browser, Page, expect, sync_playwright


APP_URL = "http://127.0.0.1:5173"
ARTIFACT_DIR = Path(__file__).resolve().parent / "verification-artifacts"
WIDTHS = [375, 768, 1024, 1440]


def snapshot(page: Page, name: str) -> None:
    ARTIFACT_DIR.mkdir(exist_ok=True)
    page.screenshot(path=str(ARTIFACT_DIR / f"{name}.png"), full_page=True)


def clear_input(page: Page) -> None:
    field = page.get_by_role("textbox")
    field.click()
    field.press("Control+A")
    field.press("Delete")


def set_input(page: Page, value: str) -> None:
    field = page.get_by_role("textbox")
    clear_input(page)
    if value:
        field.fill(value)


def read_status(page: Page) -> str:
    return page.locator("section").filter(has_text="Status").get_by_role("heading").inner_text()


def expect_symbol(page: Page, expected: str) -> None:
    symbol_row = page.locator("dt", has_text="Current symbol").locator("..")
    expect(symbol_row.locator("dd")).to_have_text(expected)


def validate_examples(page: Page, accepted: str, rejected_button: str, invalid: str) -> None:
    page.get_by_role("button", name=accepted).click()
    page.get_by_role("button", name="Validate").click()
    expect(page.get_by_role("heading", name="Accepted")).to_be_visible()

    page.get_by_role("button", name=rejected_button).click()
    page.get_by_role("button", name="Validate").click()
    expect(page.get_by_role("heading", name="Rejected")).to_be_visible()

    set_input(page, invalid)
    page.get_by_role("button", name="Validate").click()
    expect(page.get_by_role("heading", name="Invalid input")).to_be_visible()


def verify_regex1(page: Page) -> None:
    page.get_by_role("combobox", name="Select DFA").select_option("regex1")
    validate_examples(page, "aaaababa", "empty", "abc")

    page.get_by_role("button", name="aaaabbaa").click()
    page.get_by_role("button", name="Run").click()
    expect(page.get_by_role("heading", name="Running")).to_be_visible()
    page.get_by_role("button", name="Pause").click()
    expect(page.get_by_role("heading", name="Paused")).to_be_visible()

    page.get_by_role("button", name="Step").click()
    expect_symbol(page, "a")

    page.get_by_label("Animation speed").fill("80")
    page.get_by_role("button", name="Run").click()
    expect(page.get_by_role("heading", name="Accepted")).to_be_visible(timeout=5000)

    page.get_by_role("button", name="Reset", exact=True).click()
    expect(page.get_by_role("heading", name="Idle")).to_be_visible()


def verify_regex2(page: Page) -> None:
    page.get_by_role("combobox", name="Select DFA").select_option("regex2")
    validate_examples(page, "000100", "empty", "012")

    page.get_by_role("button", name="110100").click()
    page.get_by_role("button", name="Step").click()
    expect_symbol(page, "1")
    page.get_by_role("button", name="Step").click()
    expect_symbol(page, "1")
    page.get_by_role("button", name="Reset", exact=True).click()
    expect(page.get_by_role("heading", name="Idle")).to_be_visible()


def verify_graph_controls(page: Page) -> None:
    viewport = page.get_by_test_id("graph-viewport")
    initial_scale = float(viewport.get_attribute("data-scale"))

    page.get_by_role("button", name="Zoom in").click()
    zoomed_scale = float(viewport.get_attribute("data-scale"))
    assert zoomed_scale > initial_scale, "zoom in did not increase scale"

    page.get_by_role("button", name="Zoom out").click()
    after_zoom_out = float(viewport.get_attribute("data-scale"))
    assert after_zoom_out < zoomed_scale, "zoom out did not decrease scale"

    page.get_by_role("button", name="Reset view").click()
    reset_scale = float(viewport.get_attribute("data-scale"))
    assert abs(reset_scale - initial_scale) < 0.0001, "reset view did not restore initial scale"

    canvas = page.locator("section").filter(has_text="Graph canvas").locator(".bg-graph-paper")
    box = canvas.bounding_box()
    assert box is not None, "graph canvas is not visible"
    page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
    page.mouse.down()
    page.mouse.move(box["x"] + box["width"] / 2 + 80, box["y"] + box["height"] / 2 + 50)
    page.mouse.up()


def verify_keyboard(page: Page) -> None:
    page.keyboard.press("Tab")
    page.keyboard.press("Tab")
    page.keyboard.press("Tab")
    focused = page.evaluate("document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent")
    assert focused is not None


def verify_reduced_motion(browser: Browser) -> None:
    context = browser.new_context(viewport={"width": 1024, "height": 900}, reduced_motion="reduce")
    page = context.new_page()
    page.goto(APP_URL)
    page.wait_for_load_state("networkidle")
    page.get_by_role("button", name="aaaababa").click()
    page.get_by_role("button", name="Run").click()
    expect(page.locator("animateMotion")).to_have_count(0)
    expect(page.get_by_role("heading", name="Accepted")).to_be_visible(timeout=5000)
    snapshot(page, "reduced-motion")
    context.close()


def main() -> None:
    ARTIFACT_DIR.mkdir(exist_ok=True)
    summary: list[dict[str, object]] = []

    with sync_playwright() as playwright:
      browser = playwright.chromium.launch(headless=True)

      for width in WIDTHS:
          context = browser.new_context(viewport={"width": width, "height": 900})
          page = context.new_page()
          page.goto(APP_URL)
          page.wait_for_load_state("networkidle")

          expect(page.get_by_role("heading", name="Automata Visualizer")).to_be_visible()
          verify_graph_controls(page)
          verify_regex1(page)
          verify_regex2(page)
          verify_keyboard(page)

          snapshot(page, f"viewport-{width}")
          summary.append({"width": width, "status": read_status(page)})
          context.close()

      verify_reduced_motion(browser)
      browser.close()

    (ARTIFACT_DIR / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
