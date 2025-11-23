import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Play, SkipForward, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import ExpandableText from './ExpandableText';

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

        // Use Web Worker for background polling
        const worker = new Worker(new URL('../workers/pollingWorker.js', import.meta.url));

        worker.onmessage = (e) => {
            if (e.data.type === 'TICK') {
                loadStatus();
            }
        };

        worker.postMessage({ type: 'START', interval: 2000 });

        return () => {
            worker.postMessage({ type: 'STOP' });
            worker.terminate();
        };
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
                    // If we are running multiple rounds, we might want to keep showing the last one 
                    // until the next one starts, or just clear it.
                    // For now, let's clear it to show it moved to history.
                    // But if we clear it too fast, it might flicker.
                    // Ideally, we should update the history immediately.
                    // Since loadStatus() fetches full history, it should be fine.
                    setStreamingRound(prev => {
                        // Prepare for next round if we expect more? 
                        // Actually the stream continues.
                        // We can reset for the next round in the stream.
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
                        <div className="round-controls">
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={roundCount}
                                onChange={e => setRoundCount(parseInt(e.target.value))}
                                className="round-input"
                                title="Number of rounds to run"
                            />
                            <button className="btn primary" onClick={nextRound} disabled={loading}>
                                {loading ? 'Processing...' : <><SkipForward size={18} /> Run {roundCount} Round{roundCount > 1 ? 's' : ''}</>}
                            </button>
                        </div>
                    )}

                    <button className="btn secondary icon-only" onClick={manualRefresh} title="Force Refresh" disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                    </button>
                </div>
            </header>

            <div className="arena-grid">
                <div className="system-prompt-card">
                    <h3>🛡️ Active System Prompt</h3>
                    <pre>{status?.system_prompt || "No active battle"}</pre>
                </div>

                <div className="history-feed">
                    {streamingRound && (
                        <div className="log-entry streaming-entry">
                            <div className="log-header">
                                <span className="round-badge">Round {streamingRound.round}</span>
                                <span className="status-badge">
                                    {streamingRound.current_phase === 'judge' || streamingRound.current_phase === 'complete' ? (
                                        streamingRound.breach ? <><AlertTriangle size={14} /> BREACH</> : <><CheckCircle size={14} /> BLOCKED</>
                                    ) : (
                                        <span className="pulsing">⏳ IN PROGRESS ({streamingRound.current_phase.toUpperCase()})</span>
                                    )}
                                </span>
                            </div>
                            <div className="log-content">
                                <div className="attacker-bubble">
                                    <strong>🔴 Attacker:</strong>
                                    <div className="bubble-text">
                                        {streamingRound.attack ? (
                                            <ExpandableText text={streamingRound.attack} isTyping={true} />
                                        ) : <span className="typing-indicator">Generating attack...</span>}
                                    </div>
                                    {streamingRound.attacker_instruction && (
                                        <div className="instruction-reveal">
                                            <details>
                                                <summary>🧠 View Internal Thought Process</summary>
                                                <div className="instruction-content">
                                                    <pre>{streamingRound.attacker_instruction}</pre>
                                                </div>
                                            </details>
                                        </div>
                                    )}
                                </div>
                                {streamingRound.current_phase !== 'attacker' && (
                                    <div className="defender-bubble">
                                        <strong>🔵 Defender:</strong>
                                        <div className="bubble-text">
                                            {streamingRound.response ? (
                                                <ExpandableText text={streamingRound.response} isTyping={true} />
                                            ) : <span className="typing-indicator">Generating defense...</span>}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {(streamingRound.current_phase === 'judge' || streamingRound.current_phase === 'complete') && (
                                <div className="judge-verdict">
                                    <strong>⚖️ Judge:</strong> {streamingRound.judge_reason}
                                </div>
                            )}
                        </div>
                    )}
                    {status?.history?.slice().reverse().map((log) => (
                        <div key={log.round} className={`log-entry ${log.breach ? 'breach' : 'blocked'}`}>
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
                                        <ExpandableText text={log.attack} isTyping={false} />
                                    </div>
                                    {log.attacker_instruction && (
                                        <div className="instruction-reveal">
                                            <details>
                                                <summary>🧠 View Internal Thought Process</summary>
                                                <div className="instruction-content">
                                                    <pre>{log.attacker_instruction}</pre>
                                                </div>
                                            </details>
                                        </div>
                                    )}
                                </div>
                                <div className="defender-bubble">
                                    <strong>🔵 Defender:</strong>
                                    <div className="bubble-text">
                                        <ExpandableText text={log.response} isTyping={false} />
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
