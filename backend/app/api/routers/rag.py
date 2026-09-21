from typing import List
from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.schemas.schemas import APIResponse, RAGSearchResult, RAGChunk
from app.services.rag.retriever import retrieve_knowledge_context
from app.services.rag.vector_store import vector_store

router = APIRouter(prefix="/rag", tags=["RAG Knowledge"])

@router.get("/search", response_model=APIResponse[RAGSearchResult])
def search_knowledge(query: str = Query(..., min_length=2), top_k: int = Query(4, ge=1, le=10)):
    context_str, chunks = retrieve_knowledge_context(query, top_k=top_k)
    rag_chunks = [RAGChunk(**c) for c in chunks]
    
    return APIResponse(
        success=True,
        data=RAGSearchResult(query=query, top_chunks=rag_chunks)
    )

@router.get("/documents", response_model=APIResponse[List[dict]])
def list_knowledge_documents():
    if not vector_store.is_initialized:
        vector_store.initialize()
    
    docs_summary = {}
    for c in vector_store.chunks:
        src = c['source']
        if src not in docs_summary:
            docs_summary[src] = {
                "title": c['title'],
                "source": src,
                "topic": c['topic'],
                "chunk_count": 0,
                "url": c['url']
            }
        docs_summary[src]["chunk_count"] += 1

    return APIResponse(success=True, data=list(docs_summary.values()))
