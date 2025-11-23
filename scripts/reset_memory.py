import sys
import os

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import chromadb
from src.config import config

def reset_memory():
    print(f"Connecting to ChromaDB at {config.storage.host}:{config.storage.port}...")
    try:
        client = chromadb.HttpClient(
            host=config.storage.host,
            port=config.storage.port
        )
        
        collection_name = config.storage.collection_name
        print(f"Target collection: {collection_name}")
        
        try:
            client.delete_collection(name=collection_name)
            print(f"Successfully deleted collection '{collection_name}'.")
        except Exception as e:
            print(f"Collection '{collection_name}' might not exist or could not be deleted: {e}")
            
        # Recreate the collection to ensure it's ready for use
        client.create_collection(name=collection_name)
        print(f"Successfully recreated empty collection '{collection_name}'.")
        print("Long-term memory reset complete.")
        
    except Exception as e:
        print(f"Failed to reset memory: {e}")

if __name__ == "__main__":
    reset_memory()
