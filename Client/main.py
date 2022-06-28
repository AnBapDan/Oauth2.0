from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from controllers import client
from fastapi.staticfiles import StaticFiles
from websocket import websocket

app = FastAPI()
app.include_router(client)
app.include_router(websocket)
app.add_middleware(SessionMiddleware, secret_key="secret-string")

app.mount("/static", StaticFiles(directory="templates/static"), name="static")

