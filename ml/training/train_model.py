from pathlib import Path

import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

from preprocessing.clean_data import clean_dataset, load_dataset
from preprocessing.feature_extraction import create_tfidf_vectorizer


# =========================
# Paths
# =========================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATASET_PATH = PROJECT_ROOT / "ml" / "dataset" / "CEAS_08.csv"

MODEL_DIR = PROJECT_ROOT / "ml" / "models"

MODEL_PATH = MODEL_DIR / "phishing_model.pkl"


# =========================
# Main training function
# =========================

def train_model():
    print("=" * 60)
    print("PhishExplain AI - Model Training")
    print("=" * 60)

    # -------------------------
    # 1. Load dataset
    # -------------------------

    print("\n[1/6] Loading dataset...")

    df = load_dataset(str(DATASET_PATH))

    print(f"Original dataset size: {len(df)}")

    # -------------------------
    # 2. Clean dataset
    # -------------------------

    print("\n[2/6] Cleaning dataset...")

    df = clean_dataset(df)

    print(f"Clean dataset size: {len(df)}")

    print("\nLabel distribution:")
    print(df["label"].value_counts().sort_index())

    # -------------------------
    # 3. Prepare text and labels
    # -------------------------

    print("\n[3/6] Preparing text and labels...")

    X = df["text"]
    y = df["label"]

    # -------------------------
    # 4. Train/test split
    # -------------------------

    print("\n[4/6] Splitting dataset...")

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    print(f"Training samples: {len(X_train)}")
    print(f"Testing samples: {len(X_test)}")

    # -------------------------
    # 5. TF-IDF
    # -------------------------

    print("\n[5/6] Creating TF-IDF features...")

    vectorizer = create_tfidf_vectorizer()

    X_train_tfidf = vectorizer.fit_transform(X_train)

    print(
        f"TF-IDF training matrix shape: "
        f"{X_train_tfidf.shape}"
    )

    # -------------------------
    # 6. Train classifier
    # -------------------------

    print("\n[6/6] Training Logistic Regression...")

    model = LogisticRegression(
        max_iter=1000,
        class_weight="balanced",
        random_state=42,
    )

    model.fit(X_train_tfidf, y_train)

    print("\nModel training completed.")

    # -------------------------
    # Save model + vectorizer
    # -------------------------

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    model_package = {
        "model": model,
        "vectorizer": vectorizer,
        "label_mapping": {
            0: "legitimate",
            1: "phishing",
        },
    }

    joblib.dump(
        model_package,
        MODEL_PATH,
    )

    print("\nModel saved successfully:")
    print(MODEL_PATH)

    print("\n" + "=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    train_model()