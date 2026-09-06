import logging
import re
import sys
from typing import Any

# Sensitive field keys to redact from logs
SENSITIVE_KEYS_PATTERN = re.compile(
    r'(?i)(password|hashed_password|access_token|refresh_token|secret|secret_key|api_key|cookie|csrf_token|jwt_secret)\s*([:=])\s*([\'"]?)([^\s\'",;{}]+)\3'
)
BEARER_TOKEN_PATTERN = re.compile(
    r'(?i)(bearer\s+)([A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_=]*)'
)
COOKIE_PATTERN = re.compile(
    r'(?i)(cookie|set-cookie)\s*[:=]\s*([\'"]?)([^\r\n\'"]+)\2'
)


def sanitize_log_message(message: str) -> str:
    """Scrubs passwords, JWT tokens, cookies, and secrets from log strings (SEC-010)."""
    if not isinstance(message, str):
        message = str(message)
    # 1. Redact Authorization headers: "Authorization: Bearer xyz" -> "Authorization: Bearer [REDACTED]"
    message = re.sub(
        r'(?i)(authorization\s*[:=]\s*)(?:bearer\s+)?[^\s\'",;{}]+',
        r'\1Bearer [REDACTED]',
        message
    )
    # 2. Redact standalone Bearer tokens: "Bearer xyz" -> "Bearer [REDACTED]"
    message = re.sub(
        r'(?i)\bbearer\s+(?!\[REDACTED\])[^\s\'",;{}]+',
        'Bearer [REDACTED]',
        message
    )
    # 3. Redact key-value secrets (e.g. password=XYZ, "access_token": "abc")
    message = SENSITIVE_KEYS_PATTERN.sub(r'\1\2\3[REDACTED]\3', message)
    # 4. Redact Cookie headers
    message = COOKIE_PATTERN.sub(r'\1: [REDACTED]', message)
    return message


class SensitiveDataFilter(logging.Filter):
    """Logging filter that automatically redacts sensitive data from log records."""

    def filter(self, record: logging.LogRecord) -> bool:
        try:
            formatted = record.getMessage()
            record.msg = sanitize_log_message(formatted)
            record.args = ()
        except Exception:
            if isinstance(record.msg, str):
                record.msg = sanitize_log_message(record.msg)
            record.args = ()
        return True


def setup_logging(log_level: str = "INFO"):
    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(SensitiveDataFilter())

    logging.basicConfig(
        level=getattr(logging, log_level.upper(), logging.INFO),
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[handler]
    )
    logger = logging.getLogger("pathfinder")
    logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))
    logger.addFilter(SensitiveDataFilter())
    return logger


logger = setup_logging()
