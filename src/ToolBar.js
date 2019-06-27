import React from 'react';
import InlineStyleComponent from './toolbar-ui/InlineStyleComponent';
import FontSizeSelect from './toolbar-ui/FontSizeSelect';
import ToggleList from './toolbar-ui/ToggleList';
import Hyperlink from './toolbar-ui/Hyperlink';
import ColorSelect from './toolbar-ui/ColorSelect';

export default class ToolBar extends React.Component {

    render() {
        return (
            <div className="texteditor-toolbar-container">
                <FontSizeSelect editorState={this.props.editorState} onChange={this.props.onChange} focusEditor={this.props.focusEditor}
                    styles={this.props.styles.fontSize} />
                <ColorSelect editorState={this.props.editorState} onChange={this.props.onChange} focusEditor={this.props.focusEditor}
                    styles={this.props.styles.color} />
                <InlineStyleComponent editorState={this.props.editorState} onChange={this.props.onChange} />
                <ToggleList editorState={this.props.editorState} onChange={this.props.onChange} />
                <Hyperlink editorState={this.props.editorState} onChange={this.props.onChange} focusEditor={this.props.focusEditor} />
            </div>
        );
    }
}