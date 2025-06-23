import requests
from bs4 import BeautifulSoup
import json

url = "https://app.texture.capital"
headers = {
    "User-Agent": "Mozilla/5.0 (compatible; TokenBoardBot/1.0)"
}

response = requests.get(url, headers=headers)
response.raise_for_status()

soup = BeautifulSoup(response.text, "html.parser")

# Find all offering cards
results = []
for card in soup.find_all("div", class_="offering-card"):
    # Get the link (if present)
    link_tag = card.find("a", href=True)
    link = link_tag['href'] if link_tag else None

    # Get the image (if present)
    img_tag = card.find("img", class_="card-img-top")
    img_url = img_tag['src'] if img_tag else None

    # Get the title
    title_tag = card.find("p", class_="card-name")
    title = title_tag.get_text(strip=True) if title_tag else None

    # Get the closing date
    closing_tag = card.find("p", class_="card-closing")
    closing = closing_tag.get_text(strip=True) if closing_tag else None

    # Get the left and right details
    detail_left = card.find("div", class_="card-detail-left")
    detail_right = card.find("div", class_="card-detail-right")
    left_text = detail_left.get_text(" ", strip=True) if detail_left else ""
    right_text = detail_right.get_text(" ", strip=True) if detail_right else ""

    # Get the footer (e.g., PRIMARY)
    footer_tag = card.find("div", class_="offering-card-footer")
    footer = footer_tag.get_text(strip=True) if footer_tag else None

    # Print or store the data
    print("Title:", title)
    print("Link:", link)
    print("Image URL:", img_url)
    print("Closing:", closing)
    print("Details Left:", left_text)
    print("Details Right:", right_text)
    print("Footer:", footer)
    print("-" * 40)

    # Append each listing as a dict to the results list
    results.append({
        "title": title,
        "link": link,
        "image_url": img_url,
        "closing": closing,
        "details_left": left_text,
        "details_right": right_text,
        "footer": footer
    })

# After the loop, save to JSON
with open("texture_listings.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
