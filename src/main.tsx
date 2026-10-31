import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './ui/App';
import './styles/fonts.css';
import './styles/codex.css';
import './styles/screens.css';
import './styles/tourneys.css';
import './styles/folios.css';
import './styles/contest.css';
import './styles/materials.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
