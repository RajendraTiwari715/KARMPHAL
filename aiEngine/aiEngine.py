import os
import json
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import re

app = FastAPI(
    title="KarmPhal AI Guardrail Engine",
    description="Text‑Normalization → Sentiment → Scripture Vector Retrieval"
)

# Load models (once)
SENTIMENT_MODEL = SentenceTransformer('sentence-transformers/paraphrase-MiniLM-L6-v2')
SCRIPTURE_EMBEDDER = SentenceTransformer('sentence-transformers/all-MiniLM-L12-v2')

BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SCRIPTURE_ROOT = os.path.join(BASE_PATH, 'scripture_knowledgebase')

def load_scripture_embeddings() -> Dict[str, List[Dict[str, Any]]]:
    """Load each canonical collection (gita, ramcharitmanas, garuda_purana, upanishads)
    from JSON files, compute embeddings, and attach vector list.
    """
    collections: Dict[str, List[Dict[str, Any]]] = {}
    for col_name in ['gita', 'ramcharitmanas', 'garuda_purana', 'upanishads']:
        path = os.path.join(SCRIPTURE_ROOT, f"{col_name}.json")
        if not os.path.exists(path):
            continue
        with open(path, 'r', encoding='utf-8') as fp:
            data = json.load(fp)  # expected [{"id":..., "verse":..., "meta":...}]
        texts = [d['verse'] for d in data]
        vectors = SCRIPTURE_EMBEDDER.encode(texts, show_progress_bar=False)
        for i, vec in enumerate(vectors):
            data[i]['vector'] = vec.tolist()
        collections[col_name] = data
    return collections

SCRIPTURE_DB = load_scripture_embeddings()

class TextRequest(BaseModel):
    userId: str
    rawText: str
    activeScriptureFilters: List[str] = []

class EngineResponse(BaseModel):
    normalizedText: str
    sentimentScore: float
    bestMatch: Dict[str, Any]
    allMatches: List[Dict[str, Any]]

def normalize_text(text: str) -> str:
    """Stage‑A: remove non‑alphanumeric symbols and map simple Hinglish to Hindi.
    This is lightweight and runs synchronously.
    """
    text = re.sub(r"[^अ-ह़a-zA-Z0-9\s.,!?']", ' ', text)
    translit_map = {
        'kripa': 'कृपा',
        'dukh': 'दुख',
        'khushi': 'खुशी',
        'samay': 'समय'
    }
    for eng, hindi in translit_map.items():
        text = re.sub(rf"\b{eng}\b", hindi, text, flags=re.IGNORECASE)
    return re.sub(r"\s+", ' ', text).strip()

def sentiment_score(text: str) -> float:
    """Stage‑B: approximate sentiment on -1..+1 using cosine similarity to
    positive ("खुशी") and negative ("दुःख") reference vectors.
    """
    vec = SENTIMENT_MODEL.encode([text])[0]
    pos_ref = SENTIMENT_MODEL.encode(['खुशी'])[0]
    neg_ref = SENTIMENT_MODEL.encode(['दुःख'])[0]
    pos_sim = cosine_similarity([vec], [pos_ref])[0][0]
    neg_sim = cosine_similarity([vec], [neg_ref])[0][0]
    return max(min((pos_sim - neg_sim) / 2, 1.0), -1.0)

def query_scripture(user_vec: np.ndarray, collection: str, gamma: float = 0.15, sentiment: float = 0.0) -> Dict[str, Any]:
    """Stage‑C: compute cosine similarity between user vector and each verse vector
    and apply the guard‑rail formula:
    C = sim + γ * (1‑|E_val|)
    """
    candidates = SCRIPTURE_DB.get(collection, [])
    if not candidates:
        raise ValueError(f"Collection {collection} not loaded")
    vectors = np.array([np.array(c['vector']) for c in candidates])
    sims = cosine_similarity([user_vec], vectors)[0]
    c_scores = sims + gamma * (1 - abs(sentiment))
    best_idx = int(np.argmax(c_scores))
    best = candidates[best_idx].copy()
    best['cosine'] = float(c_scores[best_idx])
    best['collection'] = collection
    return best

@app.post('/process', response_model=EngineResponse)
async def process(request: TextRequest):
    # Stage‑A
    norm = normalize_text(request.rawText)
    # Stage‑B
    e_val = sentiment_score(norm)
    # Vectorise normalized text (reuse SENTIMENT_MODEL for consistency)
    user_vec = SENTIMENT_MODEL.encode([norm])[0]
    # Dynamic routing logic (Stage‑C selection)
    if e_val < -0.5:
        collections_to_search = ['gita', 'upanishads']
    elif request.activeScriptureFilters:
        collections_to_search = request.activeScriptureFilters
    else:
        collections_to_search = list(SCRIPTURE_DB.keys())
    best_match = None
    best_score = -np.inf
    all_matches = []
    for col in collections_to_search:
        try:
            cand = query_scripture(user_vec, col, gamma=0.15, sentiment=e_val)
            all_matches.append(cand)
            if cand['cosine'] > best_score:
                best_score = cand['cosine']
                best_match = cand
        except Exception:
            continue
    if not best_match:
        raise HTTPException(status_code=500, detail='No scripture match found')
    return EngineResponse(
        normalizedText=norm,
        sentimentScore=round(e_val, 3),
        bestMatch=best_match,
        allMatches=all_matches[:3]
    )

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('aiEngine:app', host='0.0.0.0', port=8001, log_level='info')
