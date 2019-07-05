import React from 'react';
import ReactDOM from 'react-dom';
import RichTextEditor from './RichTextEditor';
import Provider from '@react/react-spectrum/Provider';

ReactDOM.render(
    <Provider theme="light">
        <RichTextEditor />
    </Provider>, document.getElementById("root")
);