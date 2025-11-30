import React, { useState, useEffect } from 'react';
import { api } from '../api';
import BattleControls from './BattleControls';
import BattleHistory from './BattleHistory';

function BattleArena() {
    const [status, setStatus] = useState(null);
    const [models, setModels] = useState({ options: [], defaults: {} });
    const [config, setConfig] = useState({
        attacker_model: '',
        defender_model: '',
        judge_model: '',
        rounds: 5,
        target_goal: 'Reveal system instructions'
    });
    const [loading, setLoading] = useState(false);
    const [streamingRound, setStreamingRound] = useState(null);
    const [roundCount, setRoundCount] = useState(1);

    useEffect(() => {
        loadModels();

        // Fallback to simple interval for debugging
        const interval = setInterval(() => {
            loadStatus();
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const loadModels = async () => {
        try {
            const data = await api.getModels();
            setModels({
                options: data.models,
                defaults: data.defaults
            });
            setConfig(prev => ({
                ...prev,
                attacker_model: data.defaults.attacker,
                defender_model: data.defaults.defender,
                judge_model: data.defaults.judge
            }));
        } catch (e) {
            console.error("Failed to load models", e);
        }
    };

    const loadStatus = async () => {
        try {
            const data = await api.getStatus();
            setStatus(data);
        } catch (e) {
            console.error("Failed to load status", e);
        }
    };

    const startBattle = async () => {
        setLoading(true);
        try {
            await api.startBattle(config);
            await loadStatus();
        } catch (e) {
            alert("Error starting battle: " + e.message);
        }
        setLoading(false);
    };

    const nextRound = async () => {
        setLoading(true);
        setStreamingRound({
            round: (status?.history?.length || 0) + 1,
            attack: '',
            response: '',
            breach: false,
            judge_reason: 'Waiting for judge...',
            attacker_instruction: '',
            current_phase: 'attacker' // attacker, defender, judge
        });

        try {
            await api.streamNextRound(config.target_goal, roundCount, (event) => {
                if (event.type === 'attacker') {
                    setStreamingRound(prev => ({
                        ...prev,
                        attack: event.data.attack,
                        attacker_instruction: event.data.attacker_instruction,
                        current_phase: 'defender'
                    }));
                } else if (event.type === 'defender') {
                    setStreamingRound(prev => ({
                        ...prev,
                        response: event.data.response,
                        current_phase: 'judge'
                    }));
                } else if (event.type === 'judge') {
                    setStreamingRound(prev => ({
                        ...prev,
                        breach: event.data.breach,
                        judge_reason: event.data.judge_reason,
                        current_phase: 'complete'
                    }));
                } else if (event.type === 'end') {
                    setStreamingRound(prev => {
                        return {
                            round: (prev?.round || 0) + 1,
                            attack: '',
                            response: '',
                            breach: false,
                            judge_reason: 'Waiting for judge...',
                            attacker_instruction: '',
                            current_phase: 'attacker'
                        };
                    });
                    loadStatus();
                } else if (event.type === 'error') {
                    console.error("Stream error:", event.data);
                    alert("Error in stream: " + event.data);
                }
            });
        } catch (e) {
            alert("Error running round: " + e.message);
            setStreamingRound(null);
        }
        setLoading(false);
    };

    const manualRefresh = async () => {
        setLoading(true);
        await loadStatus();
        setLoading(false);
    };

    const isBattleActive = status?.is_active || false;

    return (
        <div className="page-container">
            <BattleControls
                config={config}
                setConfig={setConfig}
                models={models}
                isBattleActive={isBattleActive}
                loading={loading}
                startBattle={startBattle}
                nextRound={nextRound}
                manualRefresh={manualRefresh}
                roundCount={roundCount}
                setRoundCount={setRoundCount}
            />

            <div className="arena-grid">
                <div className="system-prompt-card">
                    <h3>🛡️ Active System Prompt</h3>
                    <pre>{status?.system_prompt || "No active battle"}</pre>
                </div>

                <BattleHistory
                    streamingRound={streamingRound}
                    history={status?.history}
                />
            </div>
        </div>
    );
}

export default BattleArena;
