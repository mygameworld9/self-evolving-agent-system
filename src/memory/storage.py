import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional
from src.config import config

class ChromaStorage:
    def __init__(self):
        self.client = chromadb.HttpClient(
            host=config.storage.host,
            port=config.storage.port
        )
        self.collection = self.client.get_or_create_collection(
            name=config.storage.collection_name
        )

    def add(self, documents: List[str], metadatas: List[Dict[str, Any]], ids: List[str]):
        """
        Adds documents to the vector DB.
        """
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )

    def query(self, query_text: str, n_results: int = 3) -> Dict[str, Any]:
        """
        Semantic search.
        """
        return self.collection.query(
            query_texts=[query_text],
            n_results=n_results
        )

    def count(self) -> int:
        return self.collection.count()
