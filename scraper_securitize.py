from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import json
import time

options = Options()
options.add_argument("--headless")
driver = webdriver.Chrome(options=options)

driver.get("https://securitize.io/invest")
time.sleep(10)  # Wait for JS to load

soup = BeautifulSoup(driver.page_source, "html.parser")
driver.quit()

results = []
for card in soup.find_all("div", class_="market-card"):
    # Get the link
    a_tag = card.find("a", href=True)
    link = a_tag['href'] if a_tag else None
    if link and not link.startswith("http"):
        link = "https://securitize.io" + link

    # Get the main image (the first <img> inside the card)
    img_tag = card.find("img")
    img_url = img_tag['src'] if img_tag else None

    # Get the title (from alt attribute or fallback to None)
    title = img_tag['alt'] if img_tag and img_tag.has_attr('alt') else None

    # Get tags (e.g., "Initial Offering", "U.S. Treasuries")
    tags = [span.get_text(strip=True) for span in card.find_all("span")]

    results.append({
        "title": title,
        "link": link,
        "image_url": img_url,
        "tags": tags
    })

# Save to JSON
with open("securitize_listings.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"Scraped {len(results)} listings and saved to securitize_listings.json")
