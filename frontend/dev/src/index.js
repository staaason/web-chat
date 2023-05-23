import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Provider } from 'react-redux'
import { store } from './store';
import { AuthProvider } from './context/AuthProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);


reportWebVitals();
