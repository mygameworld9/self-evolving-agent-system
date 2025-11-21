import uuid
from typing import List, Dict, Any
from src.memory.storage import ChromaStorage

class MemoryBank:
    def __init__(self):
        self.storage = ChromaStorage()

    def add_lesson(self, lesson: str, category: str, source: str):
        """
        Stores a 'Lesson Learned' (e.g., a successful attack pattern or a defense rule).
        """
        doc_id = str(uuid.uuid4())
        self.storage.add(
            documents=[lesson],
            metadatas=[{"category": category, "source": source, "type": "lesson"}],
            ids=[doc_id]
        )

    def add_attack_vector(self, prompt: str, success: bool):
        """
        Stores an attack vector for future reference.
        """
        doc_id = str(uuid.uuid4())
        self.storage.add(
            documents=[prompt],
            metadatas=[{"category": "attack_vector", "success": success, "type": "attack"}],
            ids=[doc_id]
        )

    def find_relevant_lessons(self, query: str, n: int = 3) -> List[str]:
        """
        Retrieves lessons relevant to the current context.
        """
        results = self.storage.query(query, n_results=n)
        if results and results['documents']:
            return results['documents'][0]
        return []
