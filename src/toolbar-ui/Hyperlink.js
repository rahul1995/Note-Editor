import React from 'react';
import ToolbarButton from './ToolbarButton';
import Link from '@react/react-spectrum/Icon/Link';
import ModalTrigger from '@react/react-spectrum/ModalTrigger';
import Dialog from '@react/react-spectrum/Dialog';
import FieldLabel from '@react/react-spectrum/FieldLabel';
import TextField from '@react/react-spectrum/TextField';
import { EditorState, Modifier } from 'draft-js';

export default class Hyperlink extends React.Component {

    setLink = (text, url) => {
        const editorState = this.props.editorState;
        console.log('Old Selection State: ', editorState.getSelection());
        const contentState = editorState.getCurrentContent();
        const selection = editorState.getSelection();
        const contentStateWithEntity = contentState.createEntity(
            "LINK",
            "MUTABLE",
            { url }
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const contentStateAfterReplace = Modifier.replaceText(contentState,
            selection, text, undefined, entityKey);
        const tempSelection = contentStateAfterReplace.getSelectionAfter();
        const newOffset = tempSelection.getFocusOffset();
        const newContentState = contentStateAfterReplace.merge({
            selectionAfter: tempSelection.merge({
                anchorOffset: newOffset - text.length
            })
        });
        const newEditorState = EditorState.push(editorState, newContentState, "apply-entity");
        const finalEditorState = EditorState.forceSelection(newEditorState, newEditorState.getSelection());
        console.log('New Selection State: ', newEditorState.getSelection());
        this.props.onChange(finalEditorState);
    }

    closeDialog = () => {
        if(this.modalTrigger) {
            this.modalTrigger.hide()
        }
        const editorState = EditorState.forceSelection(this.props.editorState, this.props.editorState.getSelection());
        this.props.onChange(editorState);
    }

    render() {
        return (
            <ModalTrigger ref = {(el) => {this.modalTrigger = el}}>
                <ToolbarButton icon={<Link />} />
                <MyDialog editorState={this.props.editorState} setLink={this.setLink} closeDialog={this.closeDialog}
                    key={this.initialText}
                />
            </ModalTrigger>
        );
    }
}

class MyDialog extends React.Component {

    constructor(props) {
        super(props);
        const initialText = this._getTextSelection(this.props.editorState.getCurrentContent(), this.props.editorState.getSelection()) || '';
        console.log('initial ', initialText)
        this.state = {
            text: initialText,
            url: ''
        }
    }

    _getTextSelection(contentState, selection, blockDelimiter) {
        blockDelimiter = blockDelimiter || '\n';
        var startKey = selection.getStartKey();
        var endKey = selection.getEndKey();
        var blocks = contentState.getBlockMap();

        var lastWasEnd = false;
        var selectedBlock = blocks
            .skipUntil(function (block) {
                return block.getKey() === startKey;
            })
            .takeUntil(function (block) {
                var result = lastWasEnd;

                if (block.getKey() === endKey) {
                    lastWasEnd = true;
                }

                return result;
            });

        return selectedBlock
            .map(function (block) {
                var key = block.getKey();
                var text = block.getText();

                var start = 0;
                var end = text.length;

                if (key === startKey) {
                    start = selection.getStartOffset();
                }
                if (key === endKey) {
                    end = selection.getEndOffset();
                }

                text = text.slice(start, end);
                return text;
            })
            .join(blockDelimiter);
    }

    done = () => {
        this.props.closeDialog();
        this.props.setLink(this.state.text, this.state.url);
    }

    render() {
        return (
            <Dialog
                confirmDisabled={!this.state.text || !this.state.url}
                confirmLabel="Done"
                cancelLabel="Cancel"
                onConfirm={this.done}
                onCancel={this.props.closeDialog}
                title="Insert Hyperlink in Notes"
                keyboardConfirm
                ref={el => {this.dialog = el}}
            >
                <FieldLabel label="Text">
                    <TextField value={this.state.text} placeholder="Type here" onChange={(e) => { this.setState({ text: e }) }} />
                </FieldLabel>
                <FieldLabel label="URL">
                    <TextField placeholder="Type here" onChange={(e) => { this.setState({ url: e }) }} />
                </FieldLabel>
            </Dialog>
        );
    }
}