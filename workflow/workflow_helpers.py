import csv
import os
import os.path

import numpy as np
import regex as re
import requests
from PIL import Image
import torch
from torchvision.transforms import ToTensor


def read_in_collection_csv_for_links(file, encoding="utf-8"):
    """Load in collection csv (file)"""
    item_links = []
    with open(file, "r", encoding=encoding) as links:
        item = csv.reader(links)
        for item_row_data in item:
            item_links.append(item_row_data)
    return item_links


def access_and_store_json(link):
    """Check for <200> response and raise exception error if you can't connect to API."""
    get_image = requests.get(link + "?fo=json", timeout=15)
    if get_image.status_code == 200:
        response = get_image.json()
    return response


def request_link(url):
    """Return the JSON of a fully formatted link."""
    get_image = requests.get(url, timeout=15)
    if get_image.status_code == 200:
        response = get_image.json()
    return response


def extract_number(directory_name):
    match = re.findall(r"\d+", directory_name)
    # if match:
    return match[0]


def show_anns_ours(mask, ax):
    ax.set_autoscale_on(False)
    img = np.ones((mask.shape[0], mask.shape[1], 4))
    img[:, :, 3] = 0
    color_mask = [0, 1, 0, 0.7]
    img[np.logical_not(mask)] = color_mask
    ax.imshow(img)


def run_ours_box_or_points(img_path, pts_sampled, pts_labels, model):
    image_np = np.array(Image.open(img_path))
    img_tensor = ToTensor()(image_np)
    pts_sampled = torch.reshape(torch.tensor(pts_sampled), [1, 1, -1, 2])
    pts_labels = torch.reshape(torch.tensor(pts_labels), [1, 1, -1])
    predicted_logits, predicted_iou = model(
        img_tensor[None, ...],
        pts_sampled,
        pts_labels,
    )

    sorted_ids = torch.argsort(predicted_iou, dim=-1, descending=True)
    predicted_iou = torch.take_along_dim(predicted_iou, sorted_ids, dim=2)
    predicted_logits = torch.take_along_dim(
        predicted_logits, sorted_ids[..., None, None], dim=2
    )

    return torch.ge(predicted_logits[0, 0, 0, :, :], 0).cpu().detach().numpy()


def resize_to_thumbnail(path):
    img = Image.open(path)
    img.thumbnail((480, 480))
    img.save(path)


def crop_image(path, x1, y1, x2, y2):
    img = Image.open(path)
    box = (x1 - 20, y1 - 20, x2 + 20, y2 + 30)
    img = img.crop(box)
    img.save(path)
