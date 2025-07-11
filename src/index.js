import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Make sure App.js is in the same directory or adjust path

// Create a root for your React application
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component into the root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);