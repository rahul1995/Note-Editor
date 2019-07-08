import {Editor, EditorState, CompositeDecorator, ContentState} from 'draft-js';
import "draft-js/dist/Draft.css";
import createStyles from 'draft-js-custom-styles';
import "./custom.css";
import React from 'react';
import ToolBar from './ToolBar';
import DecoratorFactory from './DecoratorFactory';
import DraftUtils from './utils/DraftUtils';
import htmlExample from './html2';

export default class RichTextEditor extends React.Component {
    constructor(props) {
        super(props);
        this.customStylesOb = createStyles(['font-size', 'color'], 'CUSTOM_');
        const decorator = new CompositeDecorator([DecoratorFactory.getDecorator('LINK')]);
        this.state = { editorState: EditorState.createEmpty(decorator) };
        this.editorRef = null;
        window.draftToFlash = () => DraftUtils.draftToFlash(this.state.editorState.getCurrentContent());
        window.flashToDraft = (html) => {
            const contentBlocks = DraftUtils.flashToDraft(html);
            const contentState = ContentState.createFromBlockArray(contentBlocks);
            this.onChange(EditorState.createWithContent(contentState, decorator));
        }

        const html = props.htmlNotes || htmlExample;
        if (html && html.length > 0) {
            const contentBlocks = DraftUtils.flashToDraft(html);
            const contentState = ContentState.createFromBlockArray(contentBlocks);
            this.state = { editorState: EditorState.createWithContent(contentState, decorator) };
        } else {
            this.state = { editorState: EditorState.createEmpty(decorator) };
        }
    }

    onChange = (editorState) => {
        this.setState({ editorState });
    }

    focusEditor = (newState) => {
        if(this.editorRef) {
            if(newState) {
                let selection = this.state.editorState.getSelection();
                selection = selection.set('hasFocus', true);
                let editorState = EditorState.set(newState, {
                    selection,
                    forceSelection: true
                });
                this.onChange(editorState);
            }
            window.setTimeout(() => this.editorRef.focus(), 50);
        }
    }

    onEditorClick = (e) => {
        if(e.ctrlKey) {
            const link = DraftUtils.getLinkFromState(this.state.editorState);
            if(link) { window.open(link); }
        }
        if(this.editorRef) {
            this.editorRef.focus();
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
                <div className="editor-main" onClick={this.onEditorClick}>
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