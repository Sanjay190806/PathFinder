import pytest
from starlette.testclient import TestClient
from backend.app.main import limiter as main_limiter
from backend.app.api.v1.auth import _auth_limiter
from backend.app.api.v1.demo import _demo_limiter
from backend.app.api.v1.ai_chat import _ai_limiter

# Prevent TestClient from automatically persisting ambient cookies across requests
# which breaks test isolation and unauthenticated endpoint validation.
_orig_request = TestClient.request

def _patched_testclient_request(self, *args, **kwargs):
    resp = _orig_request(self, *args, **kwargs)
    self.cookies.clear()
    return resp

TestClient.request = _patched_testclient_request


@pytest.fixture(autouse=True, scope="session")
def disable_rate_limits_for_testing():
    """
    Disables rate limiting across all limiters during pytest test runs to prevent
    spurious HTTP 429 Too Many Requests errors when running hundreds of tests in seconds.
    """
    main_limiter.enabled = False
    _auth_limiter.enabled = False
    _demo_limiter.enabled = False
    _ai_limiter.enabled = False
    yield
    main_limiter.enabled = True
    _auth_limiter.enabled = True
    _demo_limiter.enabled = True
    _ai_limiter.enabled = True
