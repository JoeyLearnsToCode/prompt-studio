import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { runMigrations } from './db/migrations';
import './styles/globals.css';

// 初始化数据库迁移
runMigrations().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
