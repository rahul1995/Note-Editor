import React from 'react';
import InlineStyleComponent from './toolbar-ui/InlineStyleComponent';
import FontSizeSelect from './toolbar-ui/FontSizeSelect';
import ToggleList from './toolbar-ui/ToggleList';

export default class ToolBar extends React.Component {

    render() {
        return (
            <div className="texteditor-toolbar-container">
                <FontSizeSelect editorState={this.props.editorState} onChange={this.props.onChange} focusEditor={this.props.focusEditor} />
                <InlineStyleComponent editorState={this.props.editorState} onChange={this.props.onChange} />
                <ToggleList editorState={this.props.editorState} onChange={this.props.onChange} />
            </div>
        );
    }
}