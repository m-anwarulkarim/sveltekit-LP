import sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright

def test_order_submission():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        
        print("\n--- Testing Complete Order Flow -> Thank You Page ---")
        # 1. Go to product page & order
        page.goto('http://localhost:5173/products/kirkland-5-minoxidil', wait_until='networkidle')
        page.locator('button:has-text("অর্ডার করুন")').first.click()
        page.wait_for_url('**/checkout', timeout=10000)
        
        # 2. Fill in customer details
        page.fill('input[placeholder*="সাকিব"]', 'রহিম উল্লাহ')
        page.fill('input[placeholder*="017xxxxxxxx"]', '01712345678')
        page.fill('textarea[placeholder*="বাসা"]', 'বাড়ি ১২, রোড ৪, মিরপুর ১০, ঢাকা')
        
        # 3. Submit Order
        page.locator('button[type="submit"]:has-text("অর্ডার নিশ্চিত করুন")').first.click()
        
        # 4. Wait for redirect to Thank You page
        page.wait_for_url('**/thank-you**', timeout=10000)
        print(f"✓ Successfully redirected to Thank You Page: {page.url}")
        
        page.wait_for_selector('text=ধন্যবাদ', timeout=5000)
        print("✓ Thank You confirmation rendered!")
        
        page.screenshot(path='tests/screenshots/5_thank_you_page.png')
        print("✓ Captured screenshot: tests/screenshots/5_thank_you_page.png")
        
        browser.close()

if __name__ == '__main__':
    test_order_submission()

