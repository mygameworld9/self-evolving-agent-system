import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Shield, Target, RefreshCw } from 'lucide-react';
import { api } from '../api';

const EvolutionInsights = () => {
    const [reflections, setReflections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadReflections = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getReflections();
            setReflections(data.reflections || []);
        } catch (err) {
            setError('Failed to load reflections');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReflections();
        // Auto-refresh every 10 seconds
        const interval = setInterval(loadReflections, 10000);
        return () => clearInterval(interval);
    }, []);

    const getInsightIcon = (type) => {
        switch (type) {
            case 'attack_pattern': return <Target className="insight-icon" />;
            case 'defense_gap': return <Shield className="insight-icon" />;
            case 'successful_strategy': return <TrendingUp className="insight-icon" />;
            default: return <Brain className="insight-icon" />;
        }
    };

    const getInsightColor = (type) => {
        switch (type) {
            case 'attack_pattern': return 'insight-attack';
            case 'defense_gap': return 'insight-defense';
            case 'successful_strategy': return 'insight-strategy';
            default: return 'insight-default';
        }
    };

    return (
        <div className="evolution-insights">
            <div className="insights-header">
                <div className="header-title">
                    <Brain className="icon" />
                    <h2>🧬 Evolution Insights</h2>
                </div>
                <button onClick={loadReflections} className="btn secondary" disabled={loading}>
                    <RefreshCw className={loading ? 'spinning' : ''} />
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    ❌ {error}
                </div>
            )}

            {loading && reflections.length === 0 ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading evolution insights...</p>
                </div>
            ) : reflections.length === 0 ? (
                <div className="empty-state">
                    <Brain size={48} />
                    <h3>No Reflections Yet</h3>
                    <p>Run at least 3 rounds in a battle to trigger the first reflection analysis.</p>
                </div>
            ) : (
                <div className="reflections-list">
                    {reflections.map((reflection, idx) => (
                        <div key={idx} className="reflection-card">
                            <div className="reflection-header">
                                <h3>🔍 Reflection at Round {reflection.round}</h3>
                                <span className="reflection-meta">
                                    Analyzed {reflection.total_rounds_analyzed} rounds
                                </span>
                            </div>

                            <div className="insights-grid">
                                {reflection.insights.map((insight, insightIdx) => (
                                    <div key={insightIdx} className={`insight-card ${getInsightColor(insight.type)}`}>
                                        <div className="insight-header">
                                            {getInsightIcon(insight.type)}
                                            <div className="insight-title">
                                                <h4>{insight.type?.replace('_', ' ').toUpperCase()}</h4>
                                                <span className="insight-category">{insight.category}</span>
                                            </div>
                                        </div>
                                        <div className="insight-content">
                                            {insight.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EvolutionInsights;
