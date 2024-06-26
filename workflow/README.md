### Work Flow

## Step 1: API Bulk Work, Generate Images and Metdata JSON

* Saving the API response from this step that will be used Step_3 for the manifest.
* Pulling in the metadata 

## Step 2: Cutout, Resource Object Detection and Segmentation for UI

Combination of the object detection and segmentation. Would output the masks and the 'cutouts'

* Original image as a thumbnail -- (480 on the longest side as jpegs)
* Output the individual cutouts as png (include, label in filename: image_{resource_id}_{object_name}_{instance__#} )
    * Normal the sizes of the individual cutouts (max_size= 480, on the longest side )
* Thumbnails of the binary masks: (include, label in filename: mask_{resource_id}_{object_name}_{instance__#} )
* Output the bounding box information -- JSON output (include, label in filename: image_{resource_id}_{object_name}_{instance__#}.JSON )
    * Including the four coordinates (Normalized 0-1)

Note: the outputs will be directed into the UI folders.


## Step 3: Generate Manifest

Combining the JSON Metadata into a manifest of all of the different assets that were generated.

* In the manifest, each row is an image/ resource. Including of all the metadata below (+ resource_id, item url) and a list of segments.
* Each row of the manifest should include:
    * Item Title
    * URL
    * subject List
    * date
    * alt_text entry -- duplicate the item title for now.
    * contributor_names
    * Locations 
    * Collection Name (source_collection)
        *  set -- specific to the Free-to-Reuse
    * original_format
    * thumbnail (filename)
    * List of Segements (Filename of the cutout, Filename of the mask, and bounding box information)
        *   outputs from step 1 and step 2 (filename and bounding box information)

* Starting with a dummy output