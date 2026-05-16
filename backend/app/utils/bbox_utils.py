def xyxy_to_xywh(x1: int, y1: int, x2: int, y2: int) -> dict:
    """
    Converts YOLO xyxy bounding box format to the API spec's x, y, width, height format.
    """
    return {
        "x": x1,
        "y": y1,
        "width": x2 - x1,
        "height": y2 - y1
    }
 
 
def get_bbox_area(bbox: dict) -> int:
    return bbox["width"] * bbox["height"]