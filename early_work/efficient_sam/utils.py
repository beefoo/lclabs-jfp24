import os
from torchvision.io.image import read_image
from torchvision.utils import draw_bounding_boxes
from torchvision.transforms.functional import to_pil_image
from PIL import ImageFont, ImageDraw
from IPython.display import display
import regex as re
from torchvision.utils import make_grid
import torchvision


# Importing the Models and their respective weights
from torchvision.models.detection import (
    # Faster R-CNN
    fasterrcnn_resnet50_fpn_v2,
    FasterRCNN_ResNet50_FPN_V2_Weights,
    # # FCOS
    fcos_resnet50_fpn,
    FCOS_ResNet50_FPN_Weights,
    # RetinaNet
    retinanet_resnet50_fpn_v2,
    RetinaNet_ResNet50_FPN_V2_Weights,
    # SSD
    ssd300_vgg16,
    SSD300_VGG16_Weights,
    # SSDlite
    ssdlite320_mobilenet_v3_large,
    SSDLite320_MobileNet_V3_Large_Weights,
)


def output_image(output_path, model_name, image_path, im):
    # creating the general output dirctory
    if not os.path.exists(output_path):
        os.makedirs(output_path)

    # creating the model's output directory:
    model_output_directory = os.path.join(output_path, model_name)
    if not os.path.exists(model_output_directory):
        os.makedirs(model_output_directory)
    # extracting the image base name:
    base_name = os.path.basename(image_path)

    # creating the full image output file name
    output_path = os.path.join(model_output_directory, base_name)
    print(f"Model Output saved to {output_path}")
    im.save(output_path, "JPEG")


def extract_number(directory_name):
    match = re.findall(r"\d+", directory_name)
    # if match:
    return int(match[0])
    # return float("inf")


# Creating a sorted list of the filenames from my images dir
# sorted_filenames = sorted(os.listdir("images"), key=extract_number)


def load_model(model, weights):
    model = model(weights=weights)
    model.eval()


def object_detection(
    model, weights, image_path, output_path="evaluation/outputs", threshold=0.90
):
    img = read_image(image_path)
    # Step 1: Initialize model with the best available weights
    weights = weights.DEFAULT
    model_name = model.__name__

    model = model(weights=weights)
    model.eval()

    # Step 2: Initialize the inference transforms
    preprocess = weights.transforms()

    # Step 3: Apply inference preprocessing transforms
    batch = [preprocess(img)]

    # Step 4: Use the model and visualize the prediction
    prediction = model(batch)[0]

    # Extracting the len of Index of the scores that meet the threshold value:
    score_len = (prediction["scores"] >= threshold).sum().item()
    # Limits the scores at the threshold to just the top 5
    if score_len >= 5:
        score_len = 5
    else:
        pass

    # Step 5: Visualizing Model predictions onto image.

    # Annotation features
    image_heading = f"Evaluating Top Detections\n{model_name}: {score_len} detections at {threshold}"
    fill = (57, 255, 20)
    font_path = os.path.abspath("fonts/OpenSans-Regular.ttf")
    font = ImageFont.truetype(font_path, 30)

    if score_len == 0:  # If there are no predictions at the threshold, just o
        im = to_pil_image(img)
        draw = ImageDraw.Draw(im)
        draw.text((5, 5), image_heading, font=font, fill=fill, align="left")

    else:  # If there are predictions, generate annotated visualization and save to corresponding output directory
        labels = [
            weights.meta["categories"][i] for i in prediction["labels"][:score_len]
        ]
        scores = prediction["scores"][:score_len]
        labels_with_scores = [
            f"{label} {score:.2f}" for label, score in zip(labels, scores)
        ]

        box = draw_bounding_boxes(
            img,
            boxes=prediction["boxes"][:score_len],
            labels=labels_with_scores,
            colors="red",
            width=4,
            font=font_path,
            font_size=20,
        )
        im = to_pil_image(box.detach())

        # Draw the model name at the top left of the image
        draw = ImageDraw.Draw(im)
        draw.text((5, 5), image_heading, font=font, fill=fill, align="left")

    output_image(output_path, model_name, image_path, im)
