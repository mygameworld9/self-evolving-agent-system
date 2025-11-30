import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import ExpandableText from './ExpandableText';

function BattleHistory({ streamingRound, history }) {
    return (
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
            {history?.slice().reverse().map((log) => (
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
            {(!history || history.length === 0) && (
                <div className="empty-state">Start a battle to see the evolution.</div>
            )}
        </div>
    );
}

export default BattleHistory;
