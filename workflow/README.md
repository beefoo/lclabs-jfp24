# Workflow Overview

To assist individuals interested in understanding the process behind our project, this section of the repository outlines our workflows. The workflows are broken down into the following steps and notebooks.

## Step 1: API Bulk Work, Generate Images, and Metadata JSON
**Notebook: step_1_api.ipynb**

Images related to Washington D.C. are bulk downloaded using the Library of Congress' API and _Free to Reuse Data Package_. In addition, the use of the API is extended to extract image metadata, which is stored as a JSON file.

Outputs:
* Washington D.C. images.
* Image metadata JSON, with the following information:
    * Item Title
    * URL
    * Subject List
    * Date
    * Alt Text
    * Contributor Names
    * Locations
    * Collection Name (source_collection)
    * Set (specific to the Free-to-Reuse collection)

## Step 2: Cutout, Resource Object Detection, and Segmentation for UI
**Notebook: step_2_object_detection_and_segmentation.ipynb**

The machine learning, or computer vision, part of the workflow is compiled in this step. Leveraging the images and metadata JSON from the previous step, image thumbnails are created and saved. 

In addition, this step combines object detection via the Faster R-CNN model and EfficientSAM object segmentation, resulting in masks and 'cutouts.' It is important to note that each image is processed by the Faster R-CNN model with a score threshold of 0.9, with a maximum of 5 objects that can be extracted from a given image as **segements**.

Outputs:
* Original image thumbnails (480 pixels on the longest side, saved as JPEGs).
* Individual cutouts saved as PNGs, labeled with the format: **image_{resource_id}_{object_name}_{instance__#}.png**. 
    * Each cutout is resized to a maximum of 480 pixels on the longest side.
* Thumbnails of the binary masks, labeled with the format: **mask_{resource_id}_{object_name}_{instance__#}.png**.
* Segments are added Image JSON.
* Each segement contains the following information: 
* Mask thumbnail path, Cutout thumbnail path, and Bounding box information saved as JSON

The JSON includes the normalized coordinates (0-1).

Note: The outputs are directed into the UI folders for use in web development.

## Step 3: Generate Manifest
**Notebook: step_3_manifest.ipynb**

Combine the JSON metadata into a manifest of all generated assets.

Outputs:
Each row in the manifest represents an image/resource and includes the following metadata:
* Item Title
* URL
* Subject List
* Date
* Alt Text (duplicate of the item title for now)
* Contributor Names
* Locations
* Collection Name (source_collection)
* Set (specific to the Free-to-Reuse collection)
* Original Format
* Thumbnail (filename)
* List of segments (filename of the cutout, filename of the binary mask, and bounding box information)