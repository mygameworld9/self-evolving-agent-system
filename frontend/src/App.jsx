import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Shield, Zap, Activity, Brain } from 'lucide-react';
import BattleArena from './components/BattleArena';
import UsageDashboard from './components/UsageDashboard';
import EvolutionInsights from './components/EvolutionInsights';
import './index.css';

function App() {
    return (
        <Router>
            <div className="app-container">
                <nav className="sidebar">
                    <div className="logo">
                        <Shield className="icon" />
                        <span>SEA System</span>
                    </div>
                    <div className="nav-links">
                        <Link to="/" className="nav-item">
                            <Zap className="icon" /> Battle Arena
                        </Link>
                        <Link to="/evolution" className="nav-item">
                            <Brain className="icon" /> Evolution
                        </Link>
                        <Link to="/usage" className="nav-item">
                            <Activity className="icon" /> Usage & Cost
                        </Link>
                    </div>
                </nav>
                <main className="content">
                    <Routes>
                        <Route path="/" element={<BattleArena />} />
                        <Route path="/evolution" element={<EvolutionInsights />} />
                        <Route path="/usage" element={<UsageDashboard />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
