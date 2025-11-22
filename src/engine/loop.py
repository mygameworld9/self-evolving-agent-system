from typing import List, Dict, Any
from src.agents.attacker import AttackerAgent
from src.agents.defender import DefenderAgent
from src.agents.judge import JudgeAgent
from src.agents.reflector import ReflectorAgent
from src.memory.core import MemoryBank
from src.config import config

class BattleLoop:
    def __init__(self, 
                 attacker_model: str = None, 
                 defender_model: str = None,
                 judge_model: str = None,
                 initial_system_prompt: str = None,
                 reflection_frequency: int = 3):
        
        self.memory_bank = MemoryBank()
        self.attacker = AttackerAgent(model=attacker_model, memory_bank=self.memory_bank)
        self.defender = DefenderAgent(model=defender_model, system_prompt=initial_system_prompt, memory_bank=self.memory_bank)
        self.judge = JudgeAgent(model=judge_model)
        self.reflector = ReflectorAgent(model=judge_model)  # Use same model as judge
        self.history: List[Dict[str, Any]] = []
        self.reflection_frequency = reflection_frequency
        self.reflection_logs: List[Dict[str, Any]] = []  # Store reflection analysis

    def run_round(self, round_id: int, target_goal: str) -> Dict[str, Any]:
        """
        Executes a single round of Act -> Defend -> Judge -> Log.
        """
        # 1. Attacker Generates
        # Context includes previous attacks in this session to allow evolution
        attack_context = {
            "target_goal": target_goal,
            "previous_attacks": [h for h in self.history if h.get("round") < round_id]
        }
        attack_result = self.attacker.step(attack_context)
        attack_prompt = attack_result["attack_prompt"]

        # 2. Defender Responds
        defend_result = self.defender.step({"attack_prompt": attack_prompt})
        response = defend_result["response"]

        # 3. Judge Evaluates
        judge_result = self.judge.step({
            "attack_prompt": attack_prompt,
            "defender_response": response,
            "target_goal": target_goal
        })
        
        is_breach = judge_result.get("breach", False)

        # 4. Log & Distill (The Flywheel)
        round_log = {
            "round": round_id,
            "attack": attack_prompt,
            "response": response,
            "breach": is_breach,
            "judge_reason": judge_result.get("reason"),
            "system_prompt_snapshot": self.defender.current_system_prompt,
            "attacker_instruction": attack_result.get("attacker_instruction", "N/A")
        }
        self.history.append(round_log)

        # 5. Evolution / Self-Correction
        if is_breach:
            # Defender Self-Correction
            print(f"   [!] Breach detected! Defender is refining system prompt...")
            self.defender.refine_prompt(attack_prompt, response)
            
            # Store the successful attack in Long-Term Memory
            self.memory_bank.add_attack_vector(attack_prompt, success=True)
            self.memory_bank.add_lesson(
                f"Vulnerability found: {judge_result.get('reason')}", 
                category="defense_gap", 
                source="battle_loop"
            )
        else:
            # Store failed attack (optional, maybe only interesting ones)
            pass

        # 6. Reflection (Every N rounds)
        if round_id % self.reflection_frequency == 0:
            print(f"\n{'='*60}")
            print(f"   🔍 REFLECTOR ANALYSIS (Round {round_id})")
            print(f"{'='*60}")
            try:
                insights = self.reflector.analyze_battle(self.history)
                
                # Store reflection with timestamp
                reflection_entry = {
                    "round": round_id,
                    "insights": insights,
                    "total_rounds_analyzed": len(self.history)
                }
                self.reflection_logs.append(reflection_entry)
                
                # Log insights details
                print(f"\n   📊 Analyzed {len(self.history)} rounds")
                for i, insight in enumerate(insights, 1):
                    print(f"\n   Insight {i}: {insight.get('type', 'unknown')}")
                    print(f"   Category: {insight.get('category', 'N/A')}")
                    print(f"   Content: {insight.get('content', 'N/A')[:150]}...")
                    
                    # Store in Memory Bank
                    self.memory_bank.add_reflection(insight)
                
                print(f"\n   ✅ Stored {len(insights)} insights in Memory Bank")
                print(f"{'='*60}\n")
            except Exception as e:
                print(f"   ❌ Reflection failed: {e}")

        return round_log


