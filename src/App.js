import {Editor, EditorState} from 'draft-js';
import "draft-js/dist/Draft.css";
import createStyles from 'draft-js-custom-styles';
import "./custom.css";
import React from 'react';
import ToolBar from './ToolBar';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.customStylesOb = createStyles(['font-size', 'color'], 'CUSTOM_');
        this.state = { editorState:  EditorState.createEmpty()};
    }

    onChange = (editorState) => {
        this.setState({ editorState });
    }

    focusEditor = (newState) => {
        if(this.editorRef) {
            let selection = this.state.editorState.getSelection();
            selection = selection.set('hasFocus', true);
            let editorState = EditorState.set(newState, {
                selection,
                forceSelection: true
            });
            this.onChange(editorState);
            window.setTimeout(() => this.editorRef.focus(), 50);
        }
    }

    render() {
        let className = "texteditor-container";
        const contentState = this.state.editorState.getCurrentContent();
        if (!contentState.hasText() && contentState.getBlockMap().first().getType() !== "unstyled") {
            className += " texteditor-hidePlaceholder";
        }
        return (
            <div className={className}>
                <div className="toolbar-container">
                    <ToolBar editorState={this.state.editorState} onChange={this.onChange} focusEditor={this.focusEditor}
                        styles={this.customStylesOb.styles} />
                </div>
                <div className="editor-main">
                    <Editor editorState={this.state.editorState} onChange={this.onChange}
                        placeholder="Type here"
                        customStyleFn={this.customStylesOb.customStyleFn}
                        ref={el => {this.editorRef = el}}
                    />
                </div>
            </div>
        );
    }
}