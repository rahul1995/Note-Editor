import {Editor, EditorState} from 'draft-js';
import "draft-js/dist/Draft.css";
import "./custom.css";
import React from 'react';
import ToolBar from './ToolBar';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { editorState: EditorState.createEmpty() };
    }

    onChange = (editorState) => {
        this.setState({ editorState });
    }

    customStyleFn = (styleSet) => {
        let cssStyles = {fontSize: "11px"};
        cssStyles = styleSet.reduce((map, style) => {
            if (style.startsWith("font-")) {
                const fontSize = style.substring("font-".length) + "px";
                return Object.assign(map, {fontSize});
            } else {
                return map;
            }
        }, {});
        return cssStyles;
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
                    <ToolBar editorState={this.state.editorState} onChange={this.onChange} focusEditor={this.focusEditor} />
                </div>
                <div className="editor-main">
                    <Editor editorState={this.state.editorState} onChange={this.onChange}
                        placeholder="Type here"
                        customStyleFn={this.customStyleFn}
                        ref={el => {this.editorRef = el}}
                    />
                </div>
            </div>
        );
    }
}