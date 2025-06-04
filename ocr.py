import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"  # Suppress TensorFlow INFO and WARNING messages
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"  # Force TensorFlow to use CPU only
# uvicorn ocr:app --reload
#pip install uvicorn[standard]
import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps
import io
import keras_ocr

app = FastAPI()

# Allow Chrome Extension to access this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = keras_ocr.pipeline.Pipeline()

def preprocess_for_keras_ocr(img: np.ndarray) -> np.ndarray:
    if len(img.shape) == 2 or img.shape[2] == 1:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
    elif img.shape[2] == 4:
        img = cv2.cvtColor(img, cv2.COLOR_BGRA2RGB)
    else:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    if img.shape[0] < 600:
        scale = 600 / img.shape[0]
        img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    return img

@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    contents = await file.read()
    pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
    pil_img = ImageOps.exif_transpose(pil_img)
    img = np.array(pil_img)
    img = preprocess_for_keras_ocr(img)
    results = pipeline.recognize([img])
    text = " ".join([item[0] for item in results[0]])
    return {"text": text}
