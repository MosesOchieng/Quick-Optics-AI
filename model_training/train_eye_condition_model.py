"""
Offline training script for eye-condition CNN.

Usage (example):
  1) Create a Python venv and install dependencies:
       python -m venv .venv
       source .venv/bin/activate
       pip install tensorflow==2.15.0 tensorflowjs==4.20.0
  2) Point DATASET_ROOT to a COPY of your folders, e.g.:
       DATASET_ROOT = "/home/kali/eye-datasets"
     with subfolders like:
       Healthy/
       Myopia/
       Glaucoma/
       "Diabetic Retinopathy"/
       "Central Serous Chorioretinopathy [Color Fundus]"/
  3) Run training:
       python train_eye_condition_model.py
  4) Convert the saved Keras model to TFJS:
       tensorflowjs_converter \
         --input_format=keras \
         ./eye_condition_model.h5 \
         ./eye_condition_tfjs
  5) Copy the TFJS folder into your app's public directory:
       cp -r eye_condition_tfjs "../public/models/eye-condition"

The frontend will then load `/models/eye-condition/model.json`.
"""

import os
from pathlib import Path

import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator


# ------------- CONFIG -------------

# Use the existing Original Dataset inside the project by default.
# You can change this to another path later if needed.
DATASET_ROOT = "/home/kali/Downloads/Quick OPtics AI/public/Original Dataset"
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 3  # Keep small for first run; you can increase once it works
VAL_SPLIT = 0.2
SEED = 42


def build_model(num_classes: int) -> tf.keras.Model:
  base_model = tf.keras.applications.EfficientNetB0(
    include_top=False,
    weights="imagenet",
    input_shape=(*IMAGE_SIZE, 3),
    pooling="avg",
  )
  base_model.trainable = False  # start with feature extractor frozen

  inputs = layers.Input(shape=(*IMAGE_SIZE, 3))
  x = tf.keras.applications.efficientnet.preprocess_input(inputs)
  x = base_model(x)
  # This layer will be used in the frontend as a feature vector if needed
  features = layers.Dense(256, activation="relu", name="feature_vector")(x)
  x = layers.Dropout(0.3)(features)
  outputs = layers.Dense(num_classes, activation="softmax", name="predictions")(x)

  model = models.Model(inputs=inputs, outputs=outputs, name="eye_condition_cnn")
  model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
  )
  return model


def main():
  dataset_root = Path(DATASET_ROOT)
  if not dataset_root.exists():
    raise SystemExit(f"DATASET_ROOT does not exist: {dataset_root}")

  # Use folder names as class labels
  # Example structure:
  #   Healthy/
  #   Myopia/
  #   Glaucoma/
  #   Diabetic Retinopathy/
  #   Central Serous Chorioretinopathy [Color Fundus]/
  train_datagen = ImageDataGenerator(
    validation_split=VAL_SPLIT,
    rotation_range=10,
    width_shift_range=0.05,
    height_shift_range=0.05,
    zoom_range=0.1,
    horizontal_flip=True,
    fill_mode="nearest",
  )

  train_gen = train_datagen.flow_from_directory(
    directory=str(dataset_root),
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="training",
    seed=SEED,
  )

  val_gen = train_datagen.flow_from_directory(
    directory=str(dataset_root),
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="validation",
    seed=SEED,
  )

  num_classes = train_gen.num_classes
  print("Classes:", train_gen.class_indices)

  model = build_model(num_classes)
  model.summary()

  callbacks = [
    tf.keras.callbacks.ModelCheckpoint(
      "eye_condition_model.h5", save_best_only=True, monitor="val_accuracy", mode="max"
    ),
    tf.keras.callbacks.EarlyStopping(
      monitor="val_accuracy", patience=3, restore_best_weights=True
    ),
  ]

  model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS,
    callbacks=callbacks,
  )

  # Save final model (even if not best)
  model.save("eye_condition_model_final.h5")
  print("Training complete. Best model saved as eye_condition_model.h5")


if __name__ == "__main__":
  main()


