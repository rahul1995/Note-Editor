import React from 'react';
import Button from '@react/react-spectrum/Button';
import Link from '@react/react-spectrum/Icon/Link';
import ModalTrigger from '@react/react-spectrum/ModalTrigger';
import Dialog from '@react/react-spectrum/Dialog';
import FieldLabel from '@react/react-spectrum/FieldLabel';
import TextField from '@react/react-spectrum/TextField';
import { EditorState, Modifier } from 'draft-js';
import DraftUtils from '../utils/DraftUtils';

export default class Hyperlink extends React.Component {

    constructor(props) {
        super(props);
        this.setInitialValues();
    }

    setInitialValues = () => {
        const { editorState } = this.props;
        this.initialText = DraftUtils.getSelectedText(editorState.getCurrentContent(), editorState.getSelection()) || '';
        this.initialUrl = DraftUtils.getLinkFromState(editorState) || '';
    }

    setLink = (text, url) => {
        const { editorState } = this.props;
        const contentState = editorState.getCurrentContent();
        const selection = editorState.getSelection();
        const contentStateWithEntity = contentState.createEntity("LINK", "MUTABLE", { url });
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        let finalContentState = contentStateWithEntity;

        if(this.initialText === text) {
            finalContentState = Modifier.applyEntity(contentStateWithEntity, selection, entityKey)
        } else {
            const contentStateAfterReplace = 
                Modifier.replaceText(contentStateWithEntity, selection, text, editorState.getCurrentInlineStyle(), entityKey);
            const tempSelection = contentStateAfterReplace.getSelectionAfter();
            const newOffset = tempSelection.getFocusOffset();
            finalContentState = contentStateAfterReplace.merge({
                selectionAfter: tempSelection.merge({
                    anchorOffset: newOffset - text.length
                })
            });
        }

        const newEditorState = EditorState.push(editorState, finalContentState, "apply-entity");
        const finalEditorState = EditorState.forceSelection(newEditorState, newEditorState.getSelection());
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
        this.setInitialValues();
        return (
            <ModalTrigger ref = {(el) => {this.modalTrigger = el}}>
                <Button variant="action" icon={<Link />} />
                <DialogWrapper editorState={this.props.editorState}
                    initialText={this.initialText} initialUrl={this.initialUrl}
                    onConfirm={this.setLink} closeDialog={this.closeDialog} />
            </ModalTrigger>
        );
    }
}

class DialogWrapper extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            text: this.props.initialText || '',
            url: this.props.initialUrl || ''
        }
    }

    done = () => {
        this.props.closeDialog();
        this.props.onConfirm(this.state.text, this.state.url);
    }

    setText = text => {
        this.setState({text});
    }

    setUrl = url => {
        this.setState({url});
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
                ref={el => {this.dialog = el}}
            >
                <FieldLabel label="Text">
                    <TextField value={this.state.text} placeholder="Type here" onChange={this.setText} />
                </FieldLabel>
                <FieldLabel label="URL">
                    <TextField value={this.state.url} placeholder="Type here" onChange={this.setUrl} />
                </FieldLabel>
            </Dialog>
        );
    }
}