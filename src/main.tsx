import React from 'react';
import ReactDOM from 'react-dom/client';
import { HarveyProvider } from './context/HarveyContext';
import { App } from './App';
import './app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HarveyProvider>
      <App />
    </HarveyProvider>
  </React.StrictMode>
);
