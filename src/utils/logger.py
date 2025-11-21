import logging
import json
from datetime import datetime
from typing import Any, Dict

class AgentLogger:
    def __init__(self, log_file: str = "battle.log"):
        self.logger = logging.getLogger("AgentLogger")
        self.logger.setLevel(logging.INFO)
        
        # File Handler
        fh = logging.FileHandler(log_file)
        fh.setLevel(logging.INFO)
        
        # Formatter
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        fh.setFormatter(formatter)
        
        self.logger.addHandler(fh)

    def log_event(self, agent: str, action: str, content: Any):
        """
        Logs a structured event.
        """
        entry = {
            "timestamp": datetime.now().isoformat(),
            "agent": agent,
            "action": action,
            "content": content
        }
        self.logger.info(json.dumps(entry))

# Global Logger
agent_logger = AgentLogger()
