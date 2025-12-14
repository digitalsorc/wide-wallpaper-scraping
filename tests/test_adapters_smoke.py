import pytest
import respx
from httpx import Response

from wallpaperbot.adapters.unsplash import UnsplashAdapter
from wallpaperbot.config import Config


@pytest.mark.asyncio
@respx.mock
async def test_unsplash_adapter_discover():
    respx.get("https://api.unsplash.com/search/photos").mock(
        return_value=Response(
            200,
            json={
                "results": [
                    {
                        "id": "abc123",
                        "alt_description": "mountain",
                        "links": {"html": "https://unsplash.com/photos/abc123"},
                        "urls": {"raw": "https://images.unsplash.com/photo.jpg"},
                        "user": {"name": "Jane"},
                        "width": 6000,
                        "height": 2000,
                        "tags": [{"title": "mountain"}],
                    }
                ]
            },
        )
    )

    adapter = UnsplashAdapter(Config(unsplash_access_key="test-key"))
    results = await adapter.discover("mountain", page_limit=1)
    assert len(results) == 1
    assert results[0].direct_url.endswith("photo.jpg")