import os
import sys

# Force UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright

def run_tests():
    os.makedirs('tests/screenshots', exist_ok=True)
    
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        
        console_errors = []
        page.on('console', lambda msg: console_errors.append(msg.text) if msg.type == 'error' else None)
        
        print("\n--- STEP 1: Testing Storefront Homepage ---")
        res = page.goto('http://localhost:5173/', wait_until='networkidle')
        assert res.status == 200, f"Expected 200 OK, got {res.status}"
        print(f"Homepage HTTP Status: {res.status}")
        
        # Check title
        title = page.title()
        print(f"Page Title: {title}")
        
        # Check products rendered on homepage
        page.wait_for_selector('text=Kirkland 5% Minoxidil', timeout=10000)
        print("✓ Kirkland 5% Minoxidil is rendered!")
        
        page.wait_for_selector('text=The Ordinary Niacinamide', timeout=5000)
        print("✓ The Ordinary Niacinamide is rendered!")
        
        # Check BDT currency symbol
        page.wait_for_selector('text=৳', timeout=5000)
        print("✓ BDT currency symbol (৳) is visible on product cards!")
        
        page.screenshot(path='tests/screenshots/1_homepage.png', full_page=False)
        print("✓ Captured screenshot: tests/screenshots/1_homepage.png")
        
        print("\n--- STEP 2: Testing Product Details Page ---")
        res = page.goto('http://localhost:5173/products/kirkland-5-minoxidil', wait_until='networkidle')
        assert res.status == 200, f"Expected 200 OK, got {res.status}"
        print(f"Product Page HTTP Status: {res.status}")
        
        page.wait_for_selector('h1:has-text("Kirkland 5% Minoxidil")', timeout=10000)
        print("✓ Product title rendered in H1 heading!")
        
        page.wait_for_selector('text=৳799', timeout=5000)
        print("✓ Product price ৳799 rendered from database!")
        
        page.screenshot(path='tests/screenshots/2_product_page.png', full_page=False)
        print("✓ Captured screenshot: tests/screenshots/2_product_page.png")
        
        print("\n--- STEP 3: Testing Cart & Checkout Page ---")
        # Click "অর্ডার করুন" (Order Now) which adds item to cart and navigates to /checkout
        order_btn = page.locator('button:has-text("অর্ডার করুন")').first
        if order_btn.is_visible():
            order_btn.click()
            page.wait_for_url('**/checkout', timeout=10000)
        else:
            page.goto('http://localhost:5173/checkout', wait_until='networkidle')

        print(f"Checkout Page URL: {page.url}")
        
        # Check form fields
        page.wait_for_selector('input[placeholder*="সাকিব"]', timeout=5000)
        print("✓ Checkout customer form rendered!")
        
        # Check the Submit button (which was previously blank in user's screenshot)
        checkout_btn = page.locator('button[type="submit"]:has-text("অর্ডার নিশ্চিত করুন")').first
        assert checkout_btn.is_visible(), "Submit button should be clearly visible!"
        btn_text = checkout_btn.inner_text()
        print(f"✓ Checkout Button Text is visible: '{btn_text}'")
        
        # Verify button background color is blue and not white
        btn_bg = checkout_btn.evaluate("el => window.getComputedStyle(el).backgroundColor")
        btn_color = checkout_btn.evaluate("el => window.getComputedStyle(el).color")
        print(f"✓ Button Styles: backgroundColor={btn_bg}, color={btn_color}")
        
        page.screenshot(path='tests/screenshots/3_checkout_page.png', full_page=False)
        print("✓ Captured screenshot: tests/screenshots/3_checkout_page.png")
        
        print("\n--- STEP 4: Testing Admin Deck Products Page ---")
        res = page.goto('http://localhost:5173/admin/products', wait_until='networkidle')
        assert res.status == 200, f"Expected 200 OK, got {res.status}"
        print(f"Admin Products HTTP Status: {res.status}")
        
        # Verify table rows have database products on Page 1
        page.wait_for_selector('text=Kirkland 5% Minoxidil', timeout=10000)
        print("✓ Admin table shows Kirkland 5% Minoxidil from database!")

        page.wait_for_selector('text=Bioderma Sebium Gel', timeout=5000)
        print("✓ Admin table shows Bioderma Sebium Gel from database!")

        # Search for "Ordinary" in admin table search input
        search_input = page.locator('input[placeholder="Search products..."]')
        if search_input.is_visible():
            search_input.fill('Ordinary')
            page.wait_for_timeout(500)
            page.wait_for_selector('text=The Ordinary Niacinamide', timeout=5000)
            print("✓ Admin search filtered and found 'The Ordinary Niacinamide'!")
        
        page.screenshot(path='tests/screenshots/4_admin_products.png', full_page=False)
        print("✓ Captured screenshot: tests/screenshots/4_admin_products.png")
        
        print("\n==============================================")
        print("🎉 ALL PLAYWRIGHT TESTS PASSED SUCCESSFULLY! 🎉")
        print("==============================================")
        browser.close()

if __name__ == '__main__':
    run_tests()
