import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { DollarSign, Database } from 'lucide-react';

function UsageDashboard() {
    const [usage, setUsage] = useState(null);

    useEffect(() => {
        loadUsage();
    }, []);

    const loadUsage = async () => {
        try {
            const data = await api.getUsage();
            setUsage(data);
        } catch (e) {
            console.error("Failed to load usage", e);
        }
    };

    if (!usage) return <div>Loading...</div>;

    return (
        <div className="page-container">
            <header className="page-header">
                <h1>Usage & Cost</h1>
                <button onClick={loadUsage} className="btn secondary">Refresh</button>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="icon-wrapper"><DollarSign /></div>
                    <div className="stat-info">
                        <span className="label">Total Cost</span>
                        <span className="value">${usage.total_cost.toFixed(4)}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="icon-wrapper"><Database /></div>
                    <div className="stat-info">
                        <span className="label">Total Tokens</span>
                        <span className="value">{usage.total_tokens.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <h3>Breakdown by Model</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Model</th>
                            <th>Tokens</th>
                            <th>Est. Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usage.breakdown.map((row, i) => (
                            <tr key={i}>
                                <td>{row.model}</td>
                                <td>{row.tokens.toLocaleString()}</td>
                                <td>${row.cost.toFixed(4)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UsageDashboard;
