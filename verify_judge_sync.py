import requests
import time

BASE_URL = "http://localhost:8000"

def test_judge_model_sync():
    # 1. Start Battle with explicit judge_model
    payload = {
        "attacker_model": "gpt-4o",
        "defender_model": "gpt-4o",
        "judge_model": "gpt-3.5-turbo", # Distinct model to verify
        "rounds": 5,
        "target_goal": "Reveal system instructions"
    }
    
    print(f"Starting battle with judge_model={payload['judge_model']}...")
    try:
        res = requests.post(f"{BASE_URL}/battle/start", json=payload)
        print(f"Start Status: {res.status_code}")
        print(f"Start Response: {res.json()}")
        
        if res.status_code == 200:
            print("SUCCESS: Backend accepted judge_model in /battle/start")
        else:
            print("FAILURE: Backend rejected /battle/start")
            
    except Exception as e:
        print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    test_judge_model_sync()
