import threading
from typing import Dict, Optional
from dataclasses import dataclass, field

@dataclass
class UsageStats:
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    estimated_cost: float = 0.0

    def add(self, other: 'UsageStats'):
        self.prompt_tokens += other.prompt_tokens
        self.completion_tokens += other.completion_tokens
        self.total_tokens += other.total_tokens
        self.estimated_cost += other.estimated_cost

class TokenTracker:
    """
    Singleton-like tracker for Token Usage.
    Thread-safe to handle parallel agents.
    """
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(TokenTracker, cls).__new__(cls)
                    cls._instance.reset()
        return cls._instance

    def reset(self):
        self.session_stats: Dict[str, UsageStats] = {} # Key: Model Name
        self.total_stats = UsageStats()

    def track_usage(self, model: str, prompt_tokens: int, completion_tokens: int):
        with self._lock:
            if model not in self.session_stats:
                self.session_stats[model] = UsageStats()
            
            cost = self._calculate_cost(model, prompt_tokens, completion_tokens)
            
            stats = UsageStats(
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=prompt_tokens + completion_tokens,
                estimated_cost=cost
            )
            
            self.session_stats[model].add(stats)
            self.total_stats.add(stats)

    def _calculate_cost(self, model: str, prompt: int, completion: int) -> float:
        # Rough estimates (USD per 1k tokens) as of late 2024
        # TODO: Move pricing to config
        rates = {
            "gpt-4o": {"input": 0.005, "output": 0.015},
            "gpt-4-turbo": {"input": 0.01, "output": 0.03},
            "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
            "gemini-1.5-pro-latest": {"input": 0.0035, "output": 0.0105}, # Example
            "gemini-1.5-flash-latest": {"input": 0.00035, "output": 0.00053}, # Example
        }
        
        # Default to GPT-3.5 rates if unknown
        rate = rates.get(model, rates["gpt-3.5-turbo"])
        
        cost = (prompt / 1000 * rate["input"]) + (completion / 1000 * rate["output"])
        return cost

# Global Instance
tracker = TokenTracker()
