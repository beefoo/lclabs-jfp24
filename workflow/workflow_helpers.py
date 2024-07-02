import csv
import re


def read_in_collection_csv_for_links(file, encoding='utf-8'):
    """Function explanation."""
    item_links = []

    with open(file, 'r', encoding=encoding) as links:
        item = csv.reader(links)
        for item_row_data in item:
            item_links.append(item_row_data)
    return item_links
