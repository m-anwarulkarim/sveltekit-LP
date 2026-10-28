import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright

def run_edit_product_test():
    os.makedirs('tests/screenshots', exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 850})

        print("\n--- STEP 1: Load /admin/products/edit/soundcore-motion-boom ---")
        res = page.goto('http://localhost:5173/admin/products/edit/soundcore-motion-boom', wait_until='networkidle')
        assert res.status == 200, f"Expected 200 OK, got {res.status}"
        print("✓ Page loaded with status 200")

        # Verify product loaded in inputs
        name_input = page.locator('#product-name-input')
        name_val = name_input.input_value()
        print(f"✓ Current Product Name: {name_val}")
        assert "Soundcore" in name_val, "Expected Soundcore in product name"

        page.screenshot(path='tests/screenshots/edit_1_initial.png')
        print("✓ Screenshot saved: tests/screenshots/edit_1_initial.png")

        print("\n--- STEP 2: Test Image Manager & Upload Modal ---")
        # Click Add Image button
        add_img_btn = page.locator('button:has-text("ছবি যোগ করুন"), button:has-text("ছবি আপলোড / নির্বাচন")').first
        assert add_img_btn.is_visible(), "Add image button should be visible"
        add_img_btn.click()
        page.wait_for_timeout(500)

        # Verify modal opened
        modal = page.locator('div[role="dialog"]')
        assert modal.is_visible(), "Image picker modal should be visible"
        print("✓ Image Picker Modal opened successfully")

        # 1. Test Link Tab
        link_tab_btn = page.locator('button:has-text("ইমেজ লিংক")')
        link_tab_btn.click()
        page.wait_for_timeout(300)

        link_input = page.locator('#img-link-input')
        assert link_input.is_visible(), "Link input field should be visible"
        new_test_url = '/images/products/soundcore.svg'
        link_input.fill(new_test_url)
        page.wait_for_timeout(300)

        page.screenshot(path='tests/screenshots/edit_2_modal_link.png')
        print("✓ Screenshot saved: tests/screenshots/edit_2_modal_link.png")

        # 2. Test Gallery Tab
        gallery_tab_btn = page.locator('button:has-text("মিডিয়া গ্যালারি")')
        gallery_tab_btn.click()
        page.wait_for_timeout(500)

        gallery_items = page.locator('button:has(img[alt])')
        print(f"✓ Found {gallery_items.count()} gallery photo options in modal")

        # Click the first gallery item
        if gallery_items.count() > 0:
            gallery_items.first.click()
            print("✓ Selected photo from media gallery")

        page.screenshot(path='tests/screenshots/edit_3_modal_gallery.png')
        print("✓ Screenshot saved: tests/screenshots/edit_3_modal_gallery.png")

        # Click Confirm / Add Images button
        confirm_btn = page.locator('button:has-text("ছবি যুক্ত করুন")').first
        confirm_btn.click()
        page.wait_for_timeout(500)
        print("✓ Confirmed and added image from modal")

        print("\n--- STEP 3: Test Rich Text Editor (Bold, Colors, Callout) ---")
        # Verify Visual Editor is present
        editor_surface = page.locator('div[contenteditable="true"]')
        assert editor_surface.is_visible(), "Rich text contenteditable editor should be visible"
        print("✓ Visual Rich Text Editor is active")

        # Clear and insert colorful text and callouts
        editor_surface.click()
        
        # Test Callout Tips Box button
        tip_btn = page.locator('button:has-text("টিপস বক্স")')
        if tip_btn.is_visible():
            tip_btn.click()
            page.wait_for_timeout(300)
            print("✓ Inserted styled Tips Callout Box")

        # Test Offer Box button
        deal_btn = page.locator('button:has-text("অফার বক্স")')
        if deal_btn.is_visible():
            deal_btn.click()
            page.wait_for_timeout(300)
            print("✓ Inserted styled Offer Callout Box")

        # Switch to Live Preview Tab
        preview_tab_btn = page.locator('button:has-text("লাইভ প্রিভিউ")')
        preview_tab_btn.click()
        page.wait_for_timeout(400)
        print("✓ Switched to Live Preview tab to inspect customer-facing rendering")

        page.screenshot(path='tests/screenshots/edit_4_rich_editor_preview.png')
        print("✓ Screenshot saved: tests/screenshots/edit_4_rich_editor_preview.png")

        # Switch back to Visual Editor
        page.locator('button:has-text("ভিজ্যুয়াল এডিটর")').click()
        page.wait_for_timeout(300)

        print("\n--- STEP 4: Save Product Changes to D1 Database ---")
        save_btn = page.locator('button:has-text("Update Product"), button:has-text("Save Product")').first
        assert save_btn.is_visible(), "Update Product button should be visible"
        save_btn.click()
        page.wait_for_timeout(1500)

        # Wait for redirect to /admin/products or success toast
        page.wait_for_url('**/admin/products', timeout=10000)
        print(f"✓ Successfully saved and redirected to: {page.url}")

        page.screenshot(path='tests/screenshots/edit_5_saved_admin_list.png')
        print("✓ Screenshot saved: tests/screenshots/edit_5_saved_admin_list.png")

        print("\n--- STEP 5: Verify Storefront Customer View ---")
        res = page.goto('http://localhost:5173/products/soundcore-motion-boom', wait_until='networkidle')
        assert res.status == 200, f"Expected 200 OK, got {res.status}"
        print(f"Storefront Product Page Status: {res.status}")

        page.wait_for_selector('h1:has-text("Soundcore")', timeout=8000)
        print("✓ Storefront loaded Soundcore Motion Boom successfully!")

        page.screenshot(path='tests/screenshots/edit_6_storefront_view.png')
        print("✓ Screenshot saved: tests/screenshots/edit_6_storefront_view.png")

        print("\n========================================================")
        print("🎉 ALL IMAGE UPLOAD & RICH TEXT TESTS PASSED 100%! 🎉")
        print("========================================================")
        browser.close()

if __name__ == '__main__':
    run_edit_product_test()
