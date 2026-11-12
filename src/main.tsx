import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Live GitHub star count in the footer (falls back to the word "Star").
fetch('https://api.github.com/repos/HamzehGhoreyshi/blu-bank-cards-animation-2')
  .then((r) => (r.ok ? r.json() : null))
  .then((d) => {
    const el = document.querySelector('.star-count');
    if (el && d && typeof d.stargazers_count === 'number') el.textContent = String(d.stargazers_count);
  })
  .catch(() => {});
