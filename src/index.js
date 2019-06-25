import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Provider from '@react/react-spectrum/Provider';

ReactDOM.render(
    <Provider theme="light">
        <App />
    </Provider>, document.getElementById("root")
);