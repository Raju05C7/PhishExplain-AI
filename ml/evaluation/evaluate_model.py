from pathlib import Path

import joblib
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split

from preprocessing.clean_data import clean_dataset, load_dataset


# =========================
# Paths
# =========================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATASET_PATH = PROJECT_ROOT / "ml" / "dataset" / "CEAS_08.csv"

MODEL_PATH = PROJECT_ROOT / "ml" / "models" / "phishing_model.pkl"


# =========================
# Evaluation
# =========================

def evaluate_model():

    print("=" * 60)
    print("PhishExplain AI - Model Evaluation")
    print("=" * 60)

    # -------------------------
    # 1. Load and clean dataset
    # -------------------------

    print("\n[1/6] Loading dataset...")

    df = load_dataset(str(DATASET_PATH))
    df = clean_dataset(df)

    X = df["text"]
    y = df["label"]

    print(f"Total emails: {len(df)}")

    # -------------------------
    # 2. Recreate the same
    #    train/test split
    # -------------------------

    print("\n[2/6] Creating test split...")

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
    # 3. Load trained model
    # -------------------------

    print("\n[3/6] Loading trained model...")

    model_package = joblib.load(MODEL_PATH)

    model = model_package["model"]
    vectorizer = model_package["vectorizer"]

    print("Model loaded successfully.")

    # -------------------------
    # 4. Transform ONLY test data
    # -------------------------

    print("\n[4/6] Transforming test data...")

    X_test_tfidf = vectorizer.transform(X_test)

    print(
        f"Test feature matrix shape: "
        f"{X_test_tfidf.shape}"
    )

    # -------------------------
    # 5. Predict
    # -------------------------

    print("\n[5/6] Generating test predictions...")

    predictions = model.predict(X_test_tfidf)

    # -------------------------
    # 6. Metrics
    # -------------------------

    print("\n[6/6] Calculating metrics...")

    accuracy = accuracy_score(
        y_test,
        predictions,
    )

    print("\n" + "=" * 60)
    print("FINAL TEST PERFORMANCE")
    print("=" * 60)

    print(
        f"\nAccuracy: {accuracy * 100:.2f}%"
    )

    print("\nClassification Report:")

    print(
        classification_report(
            y_test,
            predictions,
            target_names=[
                "Legitimate",
                "Phishing",
            ],
        )
    )

    print("Confusion Matrix:")

    cm = confusion_matrix(
        y_test,
        predictions,
    )

    print(cm)

    print("\n" + "=" * 60)
    print("TEST EVALUATION COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    evaluate_model()