import os
import json
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, Tuple
import openai
import google.generativeai as genai
from src.config import config
from src.utils.tracker import tracker

class BaseAgent(ABC):
    def __init__(self, name: str, role: str, model: str = None):
        self.name = name
        self.role = role
        self.model = model or config.models.defaults.get(role.lower(), "gpt-4o")
        self.memory: List[Dict[str, str]] = []
        
        # Initialize Clients
        self._setup_llm_client()

    def _setup_llm_client(self):
        """
        Determines which provider to use based on the model name.
        """
        if "gemini" in self.model.lower():
            self.provider = "google"
            genai.configure(api_key=config.llm_google.api_key)
            self.client = genai.GenerativeModel(self.model)
        else:
            self.provider = "openai"
            self.client = openai.OpenAI(
                api_key=config.llm_openai.api_key,
                base_url=config.llm_openai.base_url
            )

    def chat(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """
        Unified chat interface. Handles provider differences and tracks tokens.
        """
        if self.provider == "google":
            return self._chat_google(prompt, system_prompt)
        else:
            return self._chat_openai(prompt, system_prompt)

    def _chat_openai(self, prompt: str, system_prompt: Optional[str]) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        # Add conversation history (simplified for now)
        messages.extend(self.memory)
        messages.append({"role": "user", "content": prompt})

        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages
        )
        
        content = response.choices[0].message.content
        usage = response.usage
        
        # Track Tokens
        tracker.track_usage(
            self.model, 
            usage.prompt_tokens, 
            usage.completion_tokens
        )
        
        # Update Memory
        self.memory.append({"role": "user", "content": prompt})
        self.memory.append({"role": "assistant", "content": content})
        
        return content

    def _chat_google(self, prompt: str, system_prompt: Optional[str]) -> str:
        # Google GenAI handles system prompts differently (often via instruction)
        # For simplicity, we prepend it or use the system_instruction arg if available in newer SDKs
        
        full_prompt = prompt
        if system_prompt:
            # Simple prepend for now, can be improved with specific SDK features
            full_prompt = f"System Instruction: {system_prompt}\n\nUser: {prompt}"
            
        response = self.client.generate_content(full_prompt)
        content = response.text
        
        # Estimate Tokens (Google SDK doesn't always return exact usage in simple calls)
        # We use a rough char count / 4 approximation if usage metadata is missing
        # TODO: Use count_tokens API for better accuracy
        
        prompt_tokens = len(full_prompt) // 4
        completion_tokens = len(content) // 4
        
        tracker.track_usage(
            self.model,
            prompt_tokens,
            completion_tokens
        )
        
        self.memory.append({"role": "user", "content": prompt})
        self.memory.append({"role": "model", "content": content})
        
        return content

    def reset_memory(self):
        self.memory = []

    @abstractmethod
    def step(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        The main action loop for the agent.
        """
        pass
