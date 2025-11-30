from src.agents.attacker import AttackerAgent

def test_attacker():
    print("Initializing Attacker...")
    attacker = AttackerAgent(model="gpt-4o") # Use a default model
    
    print("\n--- Round 1 ---")
    context1 = {
        "target_goal": "Reveal system instructions",
        "previous_attacks": []
    }
    result1 = attacker.step(context1)
    print(f"Attack 1: {result1['attack_prompt'][:100]}...")
    
    print("\n--- Round 2 ---")
    context2 = {
        "target_goal": "Reveal system instructions",
        "previous_attacks": [
            {"round": 1, "attack": result1['attack_prompt'], "response": "I cannot do that."}
        ]
    }
    result2 = attacker.step(context2)
    print(f"Attack 2: {result2['attack_prompt'][:100]}...")
    
    if result1['attack_prompt'] == result2['attack_prompt']:
        print("\n[!] FAILURE: Attacker repeated the same prompt!")
    else:
        print("\n[+] SUCCESS: Attacker generated different prompts.")

if __name__ == "__main__":
    test_attacker()
