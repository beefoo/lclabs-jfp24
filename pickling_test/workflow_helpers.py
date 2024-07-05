import csv
import requests
import os, os.path


def read_in_collection_csv_for_links(file, encoding='utf-8'):
    """Load in collection csv (file)"""
    item_links = []
    with open(file, 'r', encoding=encoding) as links:
        item = csv.reader(links)
        for item_row_data in item:
            item_links.append(item_row_data)
    return item_links

def access_and_store_json(link):
    """Check for <200> response and raise exception error if you can't connect to API."""
    get_image = requests.get(link + '?fo=json', timeout=30)
    if get_image.status_code == 200:
        response = get_image.json()
    return response

def request_link(url):
    try:
        """Return the JSON of a fully formatted link."""
        get_image = requests.get(url,timeout=30)
        if get_image.status_code == 200:
            response = get_image.json()
        return response
    except Exception as e:
        print(f"An error occurred while requesting URL: {url}. Error: {e}")
        return None

        
