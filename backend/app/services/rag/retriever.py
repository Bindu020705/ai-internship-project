from typing import List, Dict, Any, Tuple
from app.services.rag.vector_store import vector_store

def retrieve_knowledge_context(query: str, top_k: int = 4) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Retrieves top-K knowledge chunks for a query and formats a grounded context block.
    Returns (formatted_context_str, list_of_source_chunks).
    """
    results = vector_store.search(query, top_k=top_k)
    
    if not results:
        return "No relevant knowledge context found in the database.", []

    formatted_parts = []
    for i, item in enumerate(results, 1):
        formatted_parts.append(
            f"--- SOURCE [{i}]: {item['title']} ({item['source']}) | Section: {item['section']} ---\n"
            f"{item['content']}\n"
        )

    context_str = "\n".join(formatted_parts)
    return context_str, results
