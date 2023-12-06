// index.tsx

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'; // Import Provider
import store from './redux/store'; // Import your Redux store
import App from './App'; // Your main App component

const root = document.getElementById('root');

if (root) {
  ReactDOM.render(
    <React.StrictMode>
      {/* Wrap your App component with Provider and pass the Redux store */}
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
    root
  );
}
