import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AuthContextProvider } from './context/authContext';
import App from './App';
import { GenreProvider } from './context/genreContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <GenreProvider>
        <App />
      </GenreProvider>
    </AuthContextProvider>
  </React.StrictMode>
);
