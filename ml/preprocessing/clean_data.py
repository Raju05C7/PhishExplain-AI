import pandas as pd


def load_dataset(csv_path: str) -> pd.DataFrame:
    """
    Load the CEAS email dataset.
    """

    df = pd.read_csv(csv_path)

    required_columns = [
        "subject",
        "body",
        "label",
    ]

    missing_columns = [
        column for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    return df


def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean email text and prepare labels.
    """

    df = df.copy()

    # Replace missing subjects with an empty string.
    df["subject"] = df["subject"].fillna("")

    # Body should not be missing, but handle it safely.
    df["body"] = df["body"].fillna("")

    # Make sure labels are numeric.
    df["label"] = pd.to_numeric(
        df["label"],
        errors="coerce",
    )

    # Remove rows where the label could not be converted.
    df = df.dropna(subset=["label"])

    # Convert labels to integers.
    df["label"] = df["label"].astype(int)

    # Combine subject and body.
    df["text"] = (
        df["subject"].astype(str)
        + " "
        + df["body"].astype(str)
    )

    # Remove rows with completely empty text.
    df = df[df["text"].str.strip() != ""]

    # Keep only the two expected classes.
    df = df[df["label"].isin([0, 1])]

    # Remove duplicate emails.
    df = df.drop_duplicates(
        subset=["text"],
        keep="first",
    )

    # Reset dataframe index.
    df = df.reset_index(drop=True)

    return df


if __name__ == "__main__":
    dataset_path = "../dataset/CEAS_08.csv"

    df = load_dataset(dataset_path)
    df = clean_dataset(df)

    print("Dataset cleaning completed.")
    print(f"Total emails: {len(df)}")

    print("\nLabel distribution:")
    print(df["label"].value_counts().sort_index())

    print("\nMissing values:")
    print(
        df[["text", "label"]].isna().sum()
    )

    print("\nSample:")
    print(
        df[["text", "label"]].head(3).to_string()
    )