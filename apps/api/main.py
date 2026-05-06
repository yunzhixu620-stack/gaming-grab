"""
Gaming PM Agent - API Backend
FastAPI entry point. Only does route registration and startup/shutdown.
No business logic here — each router is independent.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers (each module independent, no cross-imports)
from routers import discovery, sentiment, structuring, asset_gen


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("[Gaming PM Agent] API starting...")
    yield
    # Shutdown
    print("[Gaming PM Agent] API shutting down...")


app = FastAPI(
    title="Gaming PM Agent API",
    version="0.1.0",
    description="Data-driven gaming product manager agent backend",
    lifespan=lifespan,
)

# CORS — allow Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check (no auth needed)
@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}

# Register routers (each module gets its own prefix)
app.include_router(discovery.router, prefix="/api/v1/discovery", tags=["Phase 1 - Discovery"])
app.include_router(sentiment.router, prefix="/api/v1/sentiment", tags=["Phase 2 - Sentiment"])
app.include_router(structuring.router, prefix="/api/v1/structuring", tags=["Phase 3 - Structuring"])
app.include_router(asset_gen.router, prefix="/api/v1/asset-gen", tags=["Phase 4 - Asset Gen"])


# Run with: uvicorn main:app --reload --port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
