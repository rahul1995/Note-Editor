import {Editor, EditorState, CompositeDecorator} from 'draft-js';
import "draft-js/dist/Draft.css";
import createStyles from 'draft-js-custom-styles';
import "./custom.css";
import React from 'react';
import ToolBar from './ToolBar';
import Link from './Link';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.customStylesOb = createStyles(['font-size', 'color'], 'CUSTOM_');
        const decorator = new CompositeDecorator([
            {
                strategy: this.findLinkEntities,
                component: Link
            }
        ])
        this.state = { editorState:  EditorState.createEmpty(decorator)};
    }

    findLinkEntities = (contentBlock, callback, contentState) => {
        contentBlock.findEntityRanges(character => {
          const entityKey = character.getEntity();
          return (
            entityKey !== null &&
            contentState.getEntity(entityKey).getType() === "LINK"
          );
        }, callback);
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