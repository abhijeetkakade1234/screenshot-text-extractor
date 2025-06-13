import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

import easyocr
import numpy as np
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps
import io

app = FastAPI()

# Initialize EasyOCR reader globally
reader = easyocr.Reader(['en'])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    try:
        # Read and process the image
        contents = await file.read()
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
        pil_img = ImageOps.exif_transpose(pil_img)
        img = np.array(pil_img)

        # Perform OCR with bounding boxes
        results = reader.readtext(img)
        
        # Return both text and positions
        text_regions = [
            {
                "text": item[1],
                "confidence": float(item[2]),
                "bbox": {
                    "x1": int(item[0][0][0]),
                    "y1": int(item[0][0][1]),
                    "x2": int(item[0][2][0]),
                    "y2": int(item[0][2][1])
                }
            }
            for item in results
        ]
        
        print(f"Found {len(text_regions)} text regions")
        return {"regions": text_regions}

    except Exception as e:
        print("OCR Error:", e)
        return {"regions": [], "error": str(e)}

