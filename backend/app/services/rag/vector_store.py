import os
import numpy as np
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.services.rag.ingestor import ingest_all_knowledge_docs

class VectorStoreManager:
    def __init__(self, knowledge_dir: str = "./data/knowledge"):
        self.knowledge_dir = knowledge_dir
        self.chunks: List[Dict[str, Any]] = []
        self.vectorizer: TfidfVectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
        self.tfidf_matrix = None
        self.is_initialized = False

    def initialize(self):
        self.chunks = ingest_all_knowledge_docs(self.knowledge_dir)
        if not self.chunks:
            # Fallback inline default chunk if dir empty
            self.chunks = [{
                "id": "default-1",
                "title": "Household Water Efficiency Guidelines",
                "source": "household_water_efficiency.md",
                "topic": "Water Efficiency",
                "section": "General",
                "url": "knowledge/household_water_efficiency.md",
                "content": "To reduce household water consumption, install aerated low-flow showerheads (6-8 LPM) and repair leaking toilet flappers which can silently waste 200-700 liters per day."
            }]
        
        corpus = [f"{c['title']} {c['topic']} {c['section']} {c['content']}" for c in self.chunks]
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
        self.is_initialized = True
        print(f"RAG VectorStore initialized with {len(self.chunks)} knowledge chunks.")

    def search(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        if not self.is_initialized or self.tfidf_matrix is None:
            self.initialize()

        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        
        # Get top-k indices
        top_indices = np.argsort(similarities)[::-1][:top_k]

        results = []
        for idx in top_indices:
            score = float(similarities[idx])
            chunk = dict(self.chunks[idx])
            chunk["similarity_score"] = round(score, 3)
            results.append(chunk)

        return results

# Singleton vector store instance
vector_store = VectorStoreManager()
