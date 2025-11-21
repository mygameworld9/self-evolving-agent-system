import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const api = {
  getModels: async () => {
    const res = await axios.get(`${API_URL}/models`);
    return res.data;
  },
  startBattle: async (config) => {
    const res = await axios.post(`${API_URL}/battle/start`, config);
    return res.data;
  },
  nextRound: async (targetGoal) => {
    const res = await axios.post(`${API_URL}/battle/next`, null, {
      params: { target_goal: targetGoal }
    });
    return res.data;
  },
  getStatus: async () => {
    const res = await axios.get(`${API_URL}/battle/status`);
    return res.data;
  },
  getUsage: async () => {
    const res = await axios.get(`${API_URL}/usage`);
    return res.data;
  }
};
