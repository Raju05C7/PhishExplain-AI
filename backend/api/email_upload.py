from fastapi import APIRouter, UploadFile, File, HTTPException
import mailparser
import html
import re

from bs4 import BeautifulSoup


router = APIRouter(
    prefix="/api",
    tags=["Email Upload"],
)


# ============================================================
# CLEAN PLAIN TEXT
# ============================================================

def clean_plain_text(text: str) -> str:
    if not text:
        return ""

    # Decode HTML entities
    text = html.unescape(text)

    # Remove invisible Unicode characters
    text = re.sub(
        r"[\u200b\u200c\u200d\ufeff]",
        "",
        text,
    )

    # Replace non-breaking spaces
    text = text.replace("\xa0", " ")

    # Normalize line endings
    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # Remove empty lines
    lines = []

    for line in text.split("\n"):
        line = line.strip()

        if line:
            lines.append(line)

    text = "\n".join(lines)

    # Collapse repeated spaces
    text = re.sub(
        r"[ \t]+",
        " ",
        text,
    )

    # Collapse excessive blank lines
    text = re.sub(
        r"\n{3,}",
        "\n\n",
        text,
    )

    return text.strip()


# ============================================================
# CLEAN HTML EMAIL
# ============================================================

def clean_html_email(html_content: str) -> str:
    if not html_content:
        return ""

    html_content = html.unescape(
        html_content
    )

    soup = BeautifulSoup(
        html_content,
        "html.parser",
    )

    # Remove non-visible elements
    for element in soup(
        [
            "script",
            "style",
            "head",
            "meta",
            "title",
            "noscript",
        ]
    ):
        element.decompose()

    # Remove tracking / invisible images
    for image in soup.find_all("img"):

        width = str(
            image.get("width", "")
        ).lower()

        height = str(
            image.get("height", "")
        ).lower()

        style = str(
            image.get("style", "")
        ).lower()

        if (
            width in {"0", "1"}
            or height in {"0", "1"}
            or "display:none" in style
            or "display: none" in style
        ):
            image.decompose()

    text = soup.get_text(
        "\n",
        strip=True,
    )

    return clean_plain_text(text)


# ============================================================
# URL EXTRACTION
# ============================================================

def extract_urls(text: str) -> list[str]:

    if not text:
        return []

    pattern = (
        r"https?://[^\s<>\"]+"
        r"|www\.[^\s<>\"]+"
    )

    urls = re.findall(
        pattern,
        text,
        flags=re.IGNORECASE,
    )

    # Remove duplicates
    return list(
        dict.fromkeys(urls)
    )


# ============================================================
# HEADER VALUE HELPER
# ============================================================

def get_header(
    headers,
    name: str,
) -> str:

    if not headers:
        return ""

    target = name.lower()

    # mail-parser normally returns a dictionary,
    # but handle other structures safely.

    if isinstance(headers, dict):

        for key, value in headers.items():

            if str(key).lower() == target:

                if isinstance(value, list):
                    return ", ".join(
                        str(item)
                        for item in value
                    )

                return str(value)

    return ""


# ============================================================
# EMAIL HEADER ANALYSIS
# ============================================================

def analyze_headers(
    headers,
    sender: str,
) -> dict:

    return_path = get_header(
        headers,
        "Return-Path",
    )

    reply_to = get_header(
        headers,
        "Reply-To",
    )

    message_id = get_header(
        headers,
        "Message-ID",
    )

    authentication_results = get_header(
        headers,
        "Authentication-Results",
    )

    received = get_header(
        headers,
        "Received",
    )

    # --------------------------------------------------------
    # SPF
    # --------------------------------------------------------

    authentication_lower = (
        authentication_results.lower()
    )

    if "spf=pass" in authentication_lower:

        spf = "pass"

    elif "spf=fail" in authentication_lower:

        spf = "fail"

    elif "spf=softfail" in authentication_lower:

        spf = "softfail"

    elif "spf=neutral" in authentication_lower:

        spf = "neutral"

    else:

        spf = "unknown"


    # --------------------------------------------------------
    # DKIM
    # --------------------------------------------------------

    if "dkim=pass" in authentication_lower:

        dkim = "pass"

    elif "dkim=fail" in authentication_lower:

        dkim = "fail"

    else:

        dkim = "unknown"


    # --------------------------------------------------------
    # DMARC
    # --------------------------------------------------------

    if "dmarc=pass" in authentication_lower:

        dmarc = "pass"

    elif "dmarc=fail" in authentication_lower:

        dmarc = "fail"

    else:

        dmarc = "unknown"


    # --------------------------------------------------------
    # Reply-To mismatch
    # --------------------------------------------------------

    sender_domain = ""

    reply_domain = ""


    sender_match = re.search(
        r"@([A-Za-z0-9.-]+)",
        sender,
    )

    if sender_match:

        sender_domain = (
            sender_match.group(1)
            .lower()
        )


    reply_match = re.search(
        r"@([A-Za-z0-9.-]+)",
        reply_to,
    )

    if reply_match:

        reply_domain = (
            reply_match.group(1)
            .lower()
        )


    reply_to_mismatch = (
        bool(sender_domain)
        and bool(reply_domain)
        and sender_domain != reply_domain
    )


    # --------------------------------------------------------
    # Header risk indicators
    # --------------------------------------------------------

    indicators = []

    if spf == "fail":

        indicators.append(
            "SPF authentication failed"
        )

    if dkim == "fail":

        indicators.append(
            "DKIM authentication failed"
        )

    if dmarc == "fail":

        indicators.append(
            "DMARC authentication failed"
        )

    if reply_to_mismatch:

        indicators.append(
            "Reply-To domain differs from sender domain"
        )

    if not message_id:

        indicators.append(
            "Message-ID header missing"
        )

    if not return_path:

        indicators.append(
            "Return-Path header missing"
        )

    if not authentication_results:

        indicators.append(
            "Authentication-Results header missing"
        )


    # --------------------------------------------------------
    # Header risk score
    # --------------------------------------------------------

    score = 0

    if spf == "fail":
        score += 30

    elif spf == "softfail":
        score += 15

    if dkim == "fail":
        score += 25

    if dmarc == "fail":
        score += 30

    if reply_to_mismatch:
        score += 20

    if not message_id:
        score += 5

    if not authentication_results:
        score += 5

    score = min(
        score,
        100,
    )


    # --------------------------------------------------------
    # Risk level
    # --------------------------------------------------------

    if score >= 60:

        risk_level = "high"

    elif score >= 30:

        risk_level = "medium"

    else:

        risk_level = "low"


    return {
        "return_path": return_path,
        "reply_to": reply_to,
        "message_id": message_id,
        "received": received,
        "authentication_results": authentication_results,

        "spf": spf,
        "dkim": dkim,
        "dmarc": dmarc,

        "reply_to_mismatch": reply_to_mismatch,

        "indicators": indicators,

        "risk_score": score,
        "risk_level": risk_level,
    }


# ============================================================
# PARSE EML
# ============================================================

@router.post("/parse-eml")
async def parse_eml(
    file: UploadFile = File(...),
):

    # --------------------------------------------------------
    # Validate file
    # --------------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file selected.",
        )


    if not file.filename.lower().endswith(
        ".eml"
    ):

        raise HTTPException(
            status_code=400,
            detail="Only .eml files are supported.",
        )


    # --------------------------------------------------------
    # Read file
    # --------------------------------------------------------

    try:

        content = await file.read()

        parsed_email = (
            mailparser.parse_from_bytes(
                content
            )
        )

    except Exception as exc:

        raise HTTPException(
            status_code=400,
            detail=f"Unable to parse email: {exc}",
        )


    # --------------------------------------------------------
    # Sender
    # --------------------------------------------------------

    sender = ""

    if parsed_email.from_:

        try:

            sender = (
                parsed_email.from_[0][1]
            )

        except (
            IndexError,
            TypeError,
        ):

            sender = str(
                parsed_email.from_[0]
            )


    # --------------------------------------------------------
    # Subject
    # --------------------------------------------------------

    subject = (
        parsed_email.subject
        or ""
    )


    # --------------------------------------------------------
    # HTML / plain text
    # --------------------------------------------------------

    html_body = ""

    plain_body = ""


    if parsed_email.text_html:

        html_body = "\n\n".join(
            parsed_email.text_html
        )


    if parsed_email.text_plain:

        plain_body = "\n\n".join(
            parsed_email.text_plain
        )


    # --------------------------------------------------------
    # Clean visible message
    # --------------------------------------------------------

    if html_body:

        message = clean_html_email(
            html_body
        )

    elif plain_body:

        message = clean_plain_text(
            plain_body
        )

    else:

        message = ""


    # --------------------------------------------------------
    # Extract URLs
    # --------------------------------------------------------

    combined_content = (
        html_body
        + "\n"
        + plain_body
    )

    urls = extract_urls(
        combined_content
    )


    # --------------------------------------------------------
    # Analyze headers
    # --------------------------------------------------------

    header_analysis = analyze_headers(
        parsed_email.headers,
        sender,
    )


    # --------------------------------------------------------
    # Fallback
    # --------------------------------------------------------

    if not message:

        message = (
            "No readable email body was found."
        )


    # --------------------------------------------------------
    # Return complete analysis data
    # --------------------------------------------------------

    return {

        "filename": file.filename,

        "sender": sender,

        "subject": subject,

        "message": message,

        "urls": urls,

        "header_analysis": header_analysis,
    }