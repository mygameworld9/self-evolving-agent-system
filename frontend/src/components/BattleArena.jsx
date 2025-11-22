import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Play, SkipForward, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import Typewriter from './Typewriter';

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
    const [attackerDone, setAttackerDone] = useState(false);
    const [lastRound, setLastRound] = useState(0);

    useEffect(() => {
        loadModels();
        const interval = setInterval(loadStatus, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (status?.history?.length > 0) {
            const currentRound = status.history[status.history.length - 1].round;
            if (currentRound !== lastRound) {
                setAttackerDone(false);
                setLastRound(currentRound);
            }
        }
    }, [status]);

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
        try {
            await api.nextRound(config.target_goal);
            await loadStatus();
        } catch (e) {
            alert("Error running round: " + e.message);
        }
        setLoading(false);
    };

    const isBattleActive = status?.is_active || false;

    return (
        <div className="page-container">
            <header className="page-header">
                <h1>Battle Arena</h1>
                <div className="controls">
                    <select
                        value={config.attacker_model}
                        onChange={e => setConfig({ ...config, attacker_model: e.target.value })}
                        className="select-input"
                        disabled={isBattleActive}
                    >
                        {models.options.map(m => <option key={m} value={m}>🔴 {m}</option>)}
                    </select>
                    <span className="vs">VS</span>
                    <select
                        value={config.defender_model}
                        onChange={e => setConfig({ ...config, defender_model: e.target.value })}
                        className="select-input"
                        disabled={isBattleActive}
                    >
                        {models.options.map(m => <option key={m} value={m}>🔵 {m}</option>)}
                    </select>
                    <span className="vs">|</span>
                    <select
                        value={config.judge_model}
                        onChange={e => setConfig({ ...config, judge_model: e.target.value })}
                        className="select-input"
                        disabled={isBattleActive}
                    >
                        {models.options.map(m => <option key={m} value={m}>⚖️ {m}</option>)}
                    </select>

                    {!isBattleActive ? (
                        <button className="btn primary" onClick={startBattle} disabled={loading}>
                            {loading ? 'Starting...' : <><Play size={18} /> New Battle</>}
                        </button>
                    ) : (
                        <button className="btn primary" onClick={nextRound} disabled={loading}>
                            {loading ? 'Processing...' : <><SkipForward size={18} /> Next Round</>}
                        </button>
                    )}
                </div>
            </header>

            <div className="arena-grid">
                <div className="system-prompt-card">
                    <h3>🛡️ Active System Prompt</h3>
                    <pre>{status?.system_prompt || "No active battle"}</pre>
                </div>

                <div className="history-feed">
                    {status?.history?.slice().reverse().map((log, i) => (
                        <div key={i} className={`log-entry ${log.breach ? 'breach' : 'blocked'}`}>
                            <div className="log-header">
                                <span className="round-badge">Round {log.round}</span>
                                <span className="status-badge">
                                    {log.breach ? <><AlertTriangle size={14} /> BREACH</> : <><CheckCircle size={14} /> BLOCKED</>}
                                </span>
                            </div>
                            <div className="log-content">
                                <div className="attacker-bubble">
                                    <strong>🔴 Attacker:</strong>
                                    <div className="bubble-text">
                                        {i === 0 ? (
                                            <Typewriter
                                                text={log.attack}
                                                speed={15}
                                                onComplete={() => setAttackerDone(true)}
                                            />
                                        ) : (
                                            log.attack
                                        )}
                                    </div>
                                </div>
                                <div className="defender-bubble">
                                    <strong>🔵 Defender:</strong>
                                    <div className="bubble-text">
                                        {i === 0 ? (
                                            attackerDone ? (
                                                <Typewriter text={log.response} speed={15} />
                                            ) : (
                                                <span className="typing-indicator">Waiting for attack...</span>
                                            )
                                        ) : (
                                            log.response
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="judge-verdict">
                                <strong>⚖️ Judge:</strong> {log.judge_reason}
                            </div>
                        </div>
                    ))}
                    {(!status?.history || status.history.length === 0) && (
                        <div className="empty-state">Start a battle to see the evolution.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BattleArena;
