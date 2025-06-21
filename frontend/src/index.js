import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/Store';
import axios from "axios";
const root = ReactDOM.createRoot(document.getElementById('root'));
axios.defaults.withCredentials = true;

root.render(
  // <React.StrictMode>
  <Router>
    <Provider store={store}>
    <App/>
    </Provider>
  </Router>
  // </React.StrictMode>
);
