from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .api_routes import router
from .db import engine
from .models import Base
from .config import settings

app = FastAPI(title="Attacked.ai BFI API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup (simple dev approach)
@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)

app.include_router(router)

# Tiny dashboard
app.mount("/", StaticFiles(directory="services/api/static", html=True), name="static")
