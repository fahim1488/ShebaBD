"""
text_helpers.py — Text processing and search utilities for ShebaBD.

Used for search term normalization, content sanitization,
and generating URL-friendly slugs.
"""
import re
import unicodedata


def slugify(text: str) -> str:
    """
    Convert text to a URL-friendly slug.
    Example: "Blood Donation Drive 2026!" -> "blood-donation-drive-2026"
    """
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text


def normalize_search(query: str) -> str:
    """
    Normalize a search query for consistent matching.
    Strips extra whitespace and converts to lowercase.
    """
    return re.sub(r"\s+", " ", query.strip().lower())


def truncate_text(text: str, max_length: int = 200, suffix: str = "...") -> str:
    """
    Truncate text at the nearest word boundary.
    """
    if len(text) <= max_length:
        return text
    truncated = text[:max_length].rsplit(" ", 1)[0]
    return truncated.rstrip(".,;:") + suffix


def sanitize_html(text: str) -> str:
    """
    Remove HTML tags from user input to prevent XSS.
    """
    return re.sub(r"<[^>]+>", "", text)


def extract_keywords(text: str, min_length: int = 3) -> list[str]:
    """
    Extract meaningful keywords from a block of text.
    Useful for building search indexes.
    """
    words = re.findall(r"\b[a-zA-Z]+\b", text.lower())
    stopwords = {"the", "and", "for", "are", "was", "with", "this", "that", "from", "have"}
    return list({w for w in words if len(w) >= min_length and w not in stopwords})


def highlight_match(text: str, query: str) -> str:
    """
    Wrap matching query terms in <mark> tags for search highlighting.
    """
    if not query.strip():
        return text
    pattern = re.compile(re.escape(query.strip()), re.IGNORECASE)
    return pattern.sub(lambda m: f"<mark>{m.group()}</mark>", text)
