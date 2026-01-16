import numpy as np
import cv2
from PIL import Image
import tensorflow as tf
from tensorflow.keras import layers
from tensorflow.keras.models import load_model


IMG_SIZE = 224


class L1Distance(layers.Layer):
    def call(self, inputs):
        x, y = inputs
        return tf.abs(x - y)


def load_image(path):
    img = Image.open(path).convert("L")
    img = np.array(img)

    # normalize 16-bit TIFF
    if img.dtype != np.uint8:
        img = cv2.normalize(img, None, 0, 255, cv2.NORM_MINMAX)
        img = img.astype(np.uint8)

    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img / 255.0
    img = np.expand_dims(img, axis=-1)
    return img


model = load_model(
    "fingerprint_verifier.keras",
    custom_objects={"L1Distance": L1Distance},
    compile=False
)


def verify(enrolled_path, query_path, threshold=0.5) -> bool:
    img1 = load_image(enrolled_path)
    img2 = load_image(query_path)

    score = model.predict(
        [np.expand_dims(img1, 0), np.expand_dims(img2, 0)],
        verbose=0
    )[0][0]

    print("Similarity score:", score)

    if score >= threshold:
        return True
    else:
        return False


if __name__ == "__main__":
    verify("fingerprint_data/012_3_1.tif", "fingerprint_data/012_4_8.tif")
