from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import json
import time

# --- Setup Selenium Webdriver ---
options = Options()
options.add_argument("--headless")  # Run browser in the background
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
driver = webdriver.Chrome(options=options)

print("Navigating to Centrifuge pools page...")
driver.get("https://app.centrifuge.io/#/pools")

# --- Wait for the page to load the pools ---
# We wait for the pool cards to be present in the DOM.
# You may need to adjust the class name and wait time.
wait_time_seconds = 20
print(f"Waiting up to {wait_time_seconds} seconds for pools to load...")

try:
    # This selector targets the list items that wrap each pool card
    pool_list_selector = "li[class*='PoolList__PoolCardBox']"
    WebDriverWait(driver, wait_time_seconds).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, pool_list_selector))
    )
    print("Pools loaded successfully.")
    time.sleep(5) # Extra wait for all data to render
except Exception as e:
    print(f"Error: Timed out waiting for pool cards. {e}")
    driver.quit()
    exit()


# --- Parse the HTML with BeautifulSoup ---
soup = BeautifulSoup(driver.page_source, 'html.parser')
driver.quit() # Close the browser once we have the HTML

pools_data = []

# Loop through each pool card list item
for card in soup.select(pool_list_selector):
    try:
        # Find the link for the pool
        link_tag = card.find("a", href=True)
        link = link_tag['href'] if link_tag else "N/A"
        full_link = f"https://app.centrifuge.io/{link.lstrip('#')}" if link != "N/A" else "N/A"

        # Find the pool name (it's the h2 inside the card header)
        header_div = card.select_one("div[class*='ListItemCardStyles__CardHeader']")
        pool_name_tag = header_div.find("h2") if header_div else None
        pool_name = pool_name_tag.get_text(strip=True) if pool_name_tag else "Pool Name Not Found"
        
        # Extract all key-value data points from the card
        details = {}
        # This selector targets the small divs that hold a label (span) and a value (h2)
        for detail_container in card.select("div[class*='Flex-sc-'][class*='Stack-sc-']"):
            label_tag = detail_container.find("span")
            value_tag = detail_container.find("h2")
            if label_tag and value_tag:
                label = label_tag.get_text(strip=True)
                value = value_tag.get_text(strip=True)
                if label:  # Ensure the label is not empty
                    details[label] = value

        pools_data.append({
            "pool_name": pool_name,
            "link": full_link,
            "details": details
        })
        print(f"Successfully scraped: '{pool_name}'")

    except Exception as e:
        print(f"Could not parse a card, skipping. Error: {e}")


# --- Save results to JSON ---
output_filename = "public/centrifuge_pools.json"
with open(output_filename, "w", encoding="utf-8") as f:
    json.dump(pools_data, f, ensure_ascii=False, indent=2)

print(f"\nSuccessfully scraped {len(pools_data)} pools and saved to {output_filename}")
