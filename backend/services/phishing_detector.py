import re
from pathlib import Path
from typing import Dict, List

import joblib


# ============================================================
# LOAD TRAINED ML MODEL
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "phishing_model.pkl"
)

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Trained phishing model not found at: {MODEL_PATH}"
    )

model_package = joblib.load(MODEL_PATH)

ML_MODEL = model_package["model"]
VECTORIZER = model_package["vectorizer"]

LABEL_MAPPING = model_package.get(
    "label_mapping",
    {
        0: "legitimate",
        1: "phishing",
    },
)


# ============================================================
# RULE-BASED THREAT INDICATORS
# ============================================================

URGENCY_WORDS = [
    "urgent",
    "immediately",
    "as soon as possible",
    "within 24 hours",
    "act now",
    "final warning",
    "account will be suspended",
    "account will be closed",
]

CREDENTIAL_WORDS = [
    "password",
    "passcode",
    "otp",
    "one-time password",
    "login",
    "verify your account",
    "confirm your identity",
    "credentials",
]

THREAT_WORDS = [
    "suspended",
    "blocked",
    "locked",
    "terminated",
    "disabled",
    "security alert",
    "unauthorized",
]

MONEY_WORDS = [
    "payment",
    "invoice",
    "refund",
    "bank",
    "transfer",
    "money",
    "prize",
    "reward",
]


# ============================================================
# URL EXTRACTION
# ============================================================

def find_urls(text: str) -> List[str]:
    """Extract URLs from message text."""

    pattern = r"https?://[^\s]+|www\.[^\s]+"

    return re.findall(
        pattern,
        text,
        flags=re.IGNORECASE,
    )


# ============================================================
# RULE-BASED INDICATORS
# ============================================================

def detect_indicators(
    sender: str,
    subject: str,
    message: str,
) -> List[str]:

    full_text = (
        f"{sender} {subject} {message}"
    ).lower()

    indicators: List[str] = []

    # Urgency
    if any(
        word in full_text
        for word in URGENCY_WORDS
    ):
        indicators.append(
            "Urgency language"
        )

    # Credential request
    if any(
        word in full_text
        for word in CREDENTIAL_WORDS
    ):
        indicators.append(
            "Credential request"
        )

    # Threatening language
    if any(
        word in full_text
        for word in THREAT_WORDS
    ):
        indicators.append(
            "Threatening language"
        )

    # Financial language
    if any(
        word in full_text
        for word in MONEY_WORDS
    ):
        indicators.append(
            "Financial request"
        )

    # URL detection
    urls = find_urls(full_text)

    if urls:
        indicators.append(
            "URL detected"
        )

        if any(
            len(url) > 80
            for url in urls
        ):
            indicators.append(
                "Unusually long URL"
            )

    # Sender-domain mismatch
    if sender:

        sender_lower = sender.lower()

        personal_domains = [
            "@gmail.com",
            "@yahoo.com",
            "@outlook.com",
            "@hotmail.com",
        ]

        if any(
            sender_lower.endswith(domain)
            for domain in personal_domains
        ):

            organizations = [
                "microsoft",
                "paypal",
                "bank",
                "amazon",
                "apple",
                "google",
                "netflix",
            ]

            if any(
                organization in full_text
                for organization in organizations
            ):
                indicators.append(
                    "Possible sender-domain mismatch"
                )

    # Remove duplicates
    indicators = list(
        dict.fromkeys(indicators)
    )

    return indicators


# ============================================================
# ML PREDICTION
# ============================================================

def predict_with_ml(
    subject: str,
    message: str,
):

    text = (
        f"{subject} {message}"
    ).strip()

    features = VECTORIZER.transform(
        [text]
    )

    prediction = ML_MODEL.predict(
        features
    )[0]

    probabilities = ML_MODEL.predict_proba(
        features
    )[0]

    phishing_probability = float(
        probabilities[1]
    )

    legitimate_probability = float(
        probabilities[0]
    )

    prediction_label = LABEL_MAPPING.get(
        int(prediction),
        "phishing"
        if int(prediction) == 1
        else "legitimate",
    )

    return (
        prediction_label,
        phishing_probability,
        legitimate_probability,
    )


# ============================================================
# MAIN ANALYSIS FUNCTION
# ============================================================

def analyze_message(
    sender: str,
    subject: str,
    message: str,
) -> Dict:

    sender = sender or ""
    subject = subject or ""
    message = message or ""

    # --------------------------------------------------------
    # ML prediction
    # --------------------------------------------------------

    (
        ml_prediction,
        phishing_probability,
        legitimate_probability,
    ) = predict_with_ml(
        subject,
        message,
    )

    # --------------------------------------------------------
    # Explainable indicators
    # --------------------------------------------------------

    indicators = detect_indicators(
        sender,
        subject,
        message,
    )

    # --------------------------------------------------------
    # Final prediction
    # --------------------------------------------------------

    if ml_prediction == "phishing":

        prediction = "phishing"
        confidence = phishing_probability

    else:

        prediction = "legitimate"
        confidence = legitimate_probability

    # --------------------------------------------------------
    # Risk level
    # --------------------------------------------------------

    if prediction == "phishing":

        if (
            phishing_probability >= 0.75
            or len(indicators) >= 3
        ):

            risk_level = "high"

        elif (
            phishing_probability >= 0.50
            or len(indicators) >= 1
        ):

            risk_level = "medium"

        else:

            risk_level = "low"

    else:

        if legitimate_probability >= 0.85:

            risk_level = "low"

        elif legitimate_probability >= 0.60:

            risk_level = "medium"

        else:

            risk_level = "high"

    # --------------------------------------------------------
    # Add default indicator
    # --------------------------------------------------------

    if prediction == "phishing":

        if not indicators:

            indicators.append(
                "ML model detected phishing patterns"
            )

    else:

        if not indicators:

            indicators.append(
                "No major suspicious indicators detected"
            )

    # --------------------------------------------------------
    # Explanation
    # --------------------------------------------------------

    if prediction == "phishing":

        indicator_text = ", ".join(
            indicators
        )

        explanation = (
            "The machine-learning model classified "
            "this message as phishing. "
            f"Detected indicators include: "
            f"{indicator_text}. "
            "These characteristics can be associated "
            "with suspicious or malicious email activity."
        )

        recommended_action = (
            "Do not click links or open unexpected "
            "attachments. Do not provide passwords, "
            "OTPs, or financial information. Verify "
            "the request through the organization's "
            "official website or another trusted channel."
        )

    else:

        explanation = (
            "The machine-learning model classified "
            "this message as likely legitimate. "
            "No major rule-based phishing indicators "
            "were detected."
        )

        recommended_action = (
            "The message appears low risk based on "
            "the current analysis, but continue to "
            "use caution with unexpected requests, "
            "links, and attachments."
        )

    # --------------------------------------------------------
    # API response
    # --------------------------------------------------------

    return {
        "prediction": prediction,
        "confidence": round(
            confidence,
            2,
        ),
        "risk_level": risk_level,
        "indicators": indicators,
        "explanation": explanation,
        "recommended_action": recommended_action,
    }