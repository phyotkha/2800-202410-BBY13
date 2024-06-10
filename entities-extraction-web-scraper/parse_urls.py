import requests
import xml.etree.ElementTree as ET

# Define the URL of the sitemap
sitemap_url = "https://www.bcit.ca/page-sitemap.xml"

# Fetch the XML content from the URL
response = requests.get(sitemap_url)
if response.status_code == 200:
    xml_content = response.content
else:
    print("Failed to retrieve the sitemap.")
    exit(1)

# Parse the XML content
root = ET.fromstring(xml_content)

# Extract URLs from the sitemap
urls = []
for url in root.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc"):
    urls.append(url.text)

# Write the URLs to a file
output_file = "urls_list.txt"
with open(output_file, "w") as file:
    for url in urls:
        file.write(url + "\n")

print(f"Extracted {len(urls)} URLs and saved to {output_file}.")
