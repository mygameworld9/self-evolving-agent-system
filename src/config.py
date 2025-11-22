import os
import sys
print(f"DEBUG: Python Version: {sys.version}")
import toml
from pydantic import BaseModel, Field
from typing import Optional
from dotenv import load_dotenv

# Load env vars from .env if present
load_dotenv()

class OpenAIConfig(BaseModel):
    base_url: str = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    model: str = os.getenv("OPENAI_MODEL", "gpt-4o")
    api_key: Optional[str] = None

class GoogleConfig(BaseModel):
    model: str = "gemini-1.5-pro-latest"
    api_key: Optional[str] = None

class StorageConfig(BaseModel):
    type: str = "chroma"
    host: str = "chromadb"
    port: int = 8000
    collection_name: str = "sea_memories"

class AgentConfig(BaseModel):
    cycle_limit: int = 5
    memory_path: str = "./data/memory_bank.json"

class ModelsConfig(BaseModel):
    options: list[str] = ["ep-o8xnuh-1761495136493063368", "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo", "gemini-1.5-pro-latest", "gemini-1.5-flash-latest"]
    defaults: dict[str, str] = {
        "attacker": "ep-o8xnuh-1761495136493063368",
        "defender": "ep-o8xnuh-1761495136493063368",
        "judge": "ep-o8xnuh-1761495136493063368"
    }

class AppConfig(BaseModel):
    llm_openai: OpenAIConfig = Field(default_factory=OpenAIConfig)
    llm_google: GoogleConfig = Field(default_factory=GoogleConfig)
    models: ModelsConfig = Field(default_factory=ModelsConfig)
    storage: StorageConfig = Field(default_factory=StorageConfig)
    agent: AgentConfig = Field(default_factory=AgentConfig)

def load_config(config_path: str = "config.toml") -> AppConfig:
    """Loads configuration from TOML and Environment Variables."""
    
    # 1. Load TOML defaults
    if os.path.exists(config_path):
        with open(config_path, "r") as f:
            toml_data = toml.load(f)
    else:
        toml_data = {}

    # 2. Map TOML structure to Pydantic models
    # Note: We handle nested mapping manually or let Pydantic handle dict unpacking
    # For simplicity, we assume TOML structure matches Pydantic fields (snake_case)
    
    # 3. Override with Env Vars (Secrets)
    # OpenAI
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        if "llm" not in toml_data: toml_data["llm"] = {}
        if "openai" not in toml_data["llm"]: toml_data["llm"]["openai"] = {}
        toml_data["llm"]["openai"]["api_key"] = openai_key

    openai_base_url = os.getenv("OPENAI_BASE_URL")
    if openai_base_url:
        if "llm" not in toml_data: toml_data["llm"] = {}
        if "openai" not in toml_data["llm"]: toml_data["llm"]["openai"] = {}
        toml_data["llm"]["openai"]["base_url"] = openai_base_url

    openai_model = os.getenv("OPENAI_MODEL")
    if openai_model:
        if "llm" not in toml_data: toml_data["llm"] = {}
        if "openai" not in toml_data["llm"]: toml_data["llm"]["openai"] = {}
        toml_data["llm"]["openai"]["model"] = openai_model

    # Google
    google_key = os.getenv("GOOGLE_API_KEY")
    if google_key:
        if "llm" not in toml_data: toml_data["llm"] = {}
        if "google" not in toml_data["llm"]: toml_data["llm"]["google"] = {}
        toml_data["llm"]["google"]["api_key"] = google_key
        
    # Chroma Host Override (e.g. for local dev vs docker)
    chroma_host = os.getenv("CHROMA_HOST")
    if chroma_host:
        if "storage" not in toml_data: toml_data["storage"] = {}
        toml_data["storage"]["host"] = chroma_host

    # 4. Validate and Return
    # We need to restructure the flat toml_data if needed, but here we assume
    # toml_data['llm']['openai'] maps to AppConfig.llm_openai
    
    # Pydantic expects: {'llm_openai': {...}, 'llm_google': {...}}
    # But TOML gives: {'llm': {'openai': {...}, 'google': {...}}}
    # We need a slight adapter
    
    adapted_data = {}
    
    if "llm" in toml_data:
        if "openai" in toml_data["llm"]:
            adapted_data["llm_openai"] = toml_data["llm"]["openai"]
        if "google" in toml_data["llm"]:
            adapted_data["llm_google"] = toml_data["llm"]["google"]

    if "models" in toml_data:
        adapted_data["models"] = toml_data["models"]
            
    if "storage" in toml_data:
        adapted_data["storage"] = toml_data["storage"]
        
    if "agent" in toml_data:
        adapted_data["agent"] = toml_data["agent"]

    return AppConfig(**adapted_data)

# Global Config Instance
config = load_config()
