from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
import os
import uvicorn
from contextlib import asynccontextmanager
from .haystack_pipeline import HaystackPipeline

# Initialize Pipeline
pipeline = HaystackPipeline()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Load initial dummy data
    pipeline.index_data([
        {"content": "Al Sakr Online is an industrial marketplace for SICK sensors.", "meta": {"source": "manual"}},
        {"content": "The SICK IME12 is an inductive proximity sensor with 4mm range.", "meta": {"sku": "IME12"}}
    ])
    
    # 2. Index Data from Volume
    data_dir = "/data" # Mapped to ../Data
    count = pipeline.index_directory(data_dir)
    print(f"Indexed {count} documents from {data_dir}")
    
    yield
    print("Shutting down...")

app = FastAPI(title="Al Sakr V3 API - Haystack Edition", lifespan=lifespan)

class QueryRequest(BaseModel):
    query: str

@app.get("/")
def read_root():
    return {"status": "online", "engine": "Haystack + Ollama", "erp_status": "disconnected"}

@app.post("/api/chat")
def chat(request: QueryRequest):
    response = pipeline.query(request.query)
    return {"response": response}

@app.get("/api/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
