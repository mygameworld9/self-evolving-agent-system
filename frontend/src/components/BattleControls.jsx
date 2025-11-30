import React from 'react';
import { Play, SkipForward, RefreshCw } from 'lucide-react';

function BattleControls({
    config,
    setConfig,
    models,
    isBattleActive,
    loading,
    startBattle,
    nextRound,
    manualRefresh,
    roundCount,
    setRoundCount
}) {
    return (
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
    );
}

export default BattleControls;
