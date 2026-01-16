import os
import cv2
import numpy as np
from PIL import Image
import random
import tensorflow as tf
from tensorflow.keras import layers, Model
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


def generate_pairs(folder):
    files = [f for f in os.listdir(folder) if f.endswith(".tif")]
    labels = {}

    for f in files:
        person_id = f.split("_")[0]
        labels.setdefault(person_id, []).append(f)

    pairs = []
    targets = []

    # Genuine pairs
    for person, imgs in labels.items():
        for i in range(len(imgs) - 1):
            pairs.append((imgs[i], imgs[i+1]))
            targets.append(1)

    # Impostor pairs
    persons = list(labels.keys())
    for _ in range(len(pairs)):
        p1, p2 = random.sample(persons, 2)
        pairs.append((labels[p1][0], labels[p2][0]))
        targets.append(0)

    return pairs, targets


def build_base_cnn():
    inp = layers.Input(shape=(IMG_SIZE, IMG_SIZE, 1))
    x = layers.Conv2D(32, 3, activation="relu")(inp)
    x = layers.MaxPooling2D()(x)
    x = layers.Conv2D(64, 3, activation="relu")(x)
    x = layers.MaxPooling2D()(x)
    x = layers.Conv2D(128, 3, activation="relu")(x)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(128, activation="relu")(x)
    return Model(inp, x)


base_cnn = build_base_cnn()

input_a = layers.Input(shape=(IMG_SIZE, IMG_SIZE, 1))
input_b = layers.Input(shape=(IMG_SIZE, IMG_SIZE, 1))

feat_a = base_cnn(input_a)
feat_b = base_cnn(input_b)

distance = L1Distance()([feat_a, feat_b])

output = layers.Dense(1, activation="sigmoid")(distance)

model = Model([input_a, input_b], output)
model.compile(
    loss="binary_crossentropy",
    optimizer="adam",
    metrics=["accuracy"]
)

pairs, labels = generate_pairs("fingerprint_data")

X1, X2, Y = [], [], []

for (f1, f2), y in zip(pairs, labels):
    X1.append(load_image(os.path.join("fingerprint_data", f1)))
    X2.append(load_image(os.path.join("fingerprint_data", f2)))
    Y.append(y)

X1 = np.array(X1)
X2 = np.array(X2)
Y = np.array(Y)

model.fit(
    [X1, X2], Y,
    batch_size=8,
    epochs=15,
    validation_split=0.2
)

model.save("fingerprint_verifier.keras")

model = load_model(
    "fingerprint_verifier.keras",
    custom_objects={"L1Distance": L1Distance},
    compile=False
)


def verify(enrolled_path, query_path, threshold=0.5):
    img1 = load_image(enrolled_path)
    img2 = load_image(query_path)

    score = model.predict(
        [np.expand_dims(img1, 0), np.expand_dims(img2, 0)],
        verbose=0
    )[0][0]

    print("Similarity score:", score)

    if score >= threshold:
        print("VERIFIED")
    else:
        print("NOT VERIFIED")
