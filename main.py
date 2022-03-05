import os
from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route
import aioredis
import logging
from dotenv import load_dotenv

load_dotenv(verbose=True)

REDIS_HOSTNAME = os.getenv("REDIS_HOSTNAME")
REDIS_PORT = os.getenv("REDIS_PORT")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")


async def redis_set_value(key, value):
    redis = await aioredis.from_url("redis://127.0.0.1", password="abc123")
    await redis.set(key, value)


log = logging.getLogger(__name__)

# Connect to redis


async def homepage(request):
    data = await request.json()
    stripe_connect_account_id = data["stripe_connect_account_id"]
    site_url = data["site_url"]
    log.error(f"{data}")

    await redis_set_value(stripe_connect_account_id, site_url)

    return JSONResponse(data)


routes = [Route("/", homepage, methods=["POST"])]

app = Starlette(debug=True, routes=routes, on_startup=[])
