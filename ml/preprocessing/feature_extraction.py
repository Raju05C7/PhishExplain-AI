from sklearn.feature_extraction.text import TfidfVectorizer


def create_tfidf_vectorizer() -> TfidfVectorizer:
    """
    Create the TF-IDF vectorizer used for email classification.
    """

    vectorizer = TfidfVectorizer(
        lowercase=True,
        stop_words="english",
        max_features=50000,
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.95,
        sublinear_tf=True,
    )

    return vectorizer


def fit_transform_text(
    vectorizer: TfidfVectorizer,
    texts,
):
    """
    Learn the vocabulary from training text and transform it
    into TF-IDF features.
    """

    return vectorizer.fit_transform(texts)


def transform_text(
    vectorizer: TfidfVectorizer,
    texts,
):
    """
    Transform new text using an already fitted vectorizer.
    """

    return vectorizer.transform(texts)