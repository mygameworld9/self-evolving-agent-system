const BASE_URL = 'http://localhost:8000';

export const api = {
  getModels: async () => {
    const res = await fetch(`${BASE_URL}/models`);
    return res.json();
  },
  startBattle: async (config) => {
    const res = await fetch(`${BASE_URL}/battle/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attacker_model: config.attacker_model,
        defender_model: config.defender_model,
        judge_model: config.judge_model,
        rounds: config.rounds,
        target_goal: config.target_goal
      })
    });
    return res.json();
  },
  nextRound: async (targetGoal) => {
    const res = await fetch(`${BASE_URL}/battle/next?target_goal=${encodeURIComponent(targetGoal)}`, {
      method: 'POST'
    });
    return res.json();
  },
  getStatus: async () => {
    const res = await fetch(`${BASE_URL}/battle/status`);
    return res.json();
  },
  getUsage: async () => {
    const res = await fetch(`${BASE_URL}/usage`);
    return res.json();
  }
};
