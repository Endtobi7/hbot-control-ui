import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// Optional: Import providers if needed
// import { Provider } from 'react-redux';
// import store from './store';

ReactDOM.render(
  <React.StrictMode>
    {/* Optional: Wrap with Provider if using state management */}
    {/* <Provider store={store}> */}
    <App />
    {/* </Provider> */}
  </React.StrictMode>,
  document.getElementById('root')
);