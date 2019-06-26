import React from 'react';
import ToolbarButton from './ToolbarButton';
import Link from '@react/react-spectrum/Icon/Link';
import ModalTrigger from '@react/react-spectrum/ModalTrigger';
import Dialog from '@react/react-spectrum/Dialog';
import FieldLabel from '@react/react-spectrum/FieldLabel';
import TextField from '@react/react-spectrum/TextField';
import { EditorState, Modifier } from 'draft-js';

export default class Hyperlink extends React.Component {

    constructor(props) {
        super(props);
    }

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

    onDialogClose = () => {
        
    }

    render() {
        return (
            <ModalTrigger>
                <ToolbarButton icon={<Link />} />
                <MyDialog onDialogClose={this.onDialogClose} setLink={this.setLink} />
            </ModalTrigger>
        );
    }
}

class MyDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            text: '',
            url: ''
        }
    }

    done = () => {
        this.props.setLink(this.state.text, this.state.url);
    }

    render() {
        return (
            <Dialog
                confirmDisabled={!this.state.text || !this.state.url}
                confirmLabel="Done"
                cancelLabel="Cancel"
                onConfirm={this.done}
                onClose={() => { this.props.onDialogClose }}
                title="Insert Hyperlink in Notes"
                keyboardConfirm
                ref={el => {this.dialog = el}}
            >
                <FieldLabel label="Text">
                    <TextField placeholder="Type here" onChange={(e) => { this.setState({ text: e }) }} />
                </FieldLabel>
                <FieldLabel label="URL">
                    <TextField placeholder="Type here" onChange={(e) => { this.setState({ url: e }) }} />
                </FieldLabel>
            </Dialog>
        );
    }
}