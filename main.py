import os
from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route
import aioredis
import logging
from dotenv import load_dotenv

load_dotenv(verbose=True)

log = logging.getLogger(__name__)

PYTHON_LOG_LEVEL = os.getenv("PYTHON_LOG_LEVEL", "debug")
REDIS_HOSTNAME = os.getenv("REDIS_HOSTNAME")
REDIS_PORT = os.getenv("REDIS_PORT")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")


async def redis_set_value(key, value):
    """Connect to redis and store key value"""
    redis = await aioredis.from_url(
        f"redis://{REDIS_HOSTNAME}", password=REDIS_PASSWORD
    )
    await redis.set(key, value)


async def index(request):
    data = await request.json()
    stripe_connect_account_id = data["stripe_connect_account_id"]
    site_url = data["site_url"]
    log.error(f"{data}")

    await redis_set_value(stripe_connect_account_id, site_url)

    return JSONResponse(data)


routes = [Route("/", index, methods=["POST"])]

if PYTHON_LOG_LEVEL.lower() == "debug":
    debug = True
else:
    debuf = False

app = Starlette(debug=debug, routes=routes)
