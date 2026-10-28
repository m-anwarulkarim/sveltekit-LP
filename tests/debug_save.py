import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright

def run_debug():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 850})

        console_logs = []
        page.on('console', lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))

        page.goto('http://localhost:5173/admin/products/edit/soundcore-motion-boom', wait_until='networkidle')

        # Check values
        name = page.locator('#product-name-input').input_value()
        print(f"Name value: '{name}'")

        # Click save
        save_btn = page.locator('button:has-text("Update Product")').first
        save_btn.click()
        page.wait_for_timeout(2000)

        alert = page.locator('.text-rose-700')
        if alert.is_visible():
            print(f"Validation error shown: '{alert.inner_text()}'")
        else:
            print("No validation alert shown")

        toast = page.locator('.fixed.top-6.right-6')
        if toast.is_visible():
            print(f"Toast shown: '{toast.inner_text()}'")

        print("Console logs:")
        for log in console_logs:
            print("  ", log)

        browser.close()

run_debug()

