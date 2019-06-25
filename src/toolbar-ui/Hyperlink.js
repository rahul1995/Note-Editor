import React from 'react';
import ToolbarButton from './ToolbarButton';
import Link from '@react/react-spectrum/Icon/Link';
import ModalTrigger from '@react/react-spectrum/ModalTrigger';
import Dialog from '@react/react-spectrum/Dialog';
import Label from '@react/react-spectrum/Label';
import TextField from '@react/react-spectrum/TextField';
import Button from '@react/react-spectrum/Button';

export default class Hyperlink extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            text: "Initial",
            dummy: 1
        }
    }

    setLink = () => {
        console.log("Clkic");
    }

    render() {
        return (
            <ModalTrigger>
                <Button label="Click Me" />
                <Dialog
                    confirmDisabled={!this.state.text}
                    confirmLabel="Done"
                    onConfirm={this.setLink}
                    title="Insert Hyperlink in Notes"
                    keyboardConfirm
                    key={this.state.dummy}
                >
                    <Label variant="inactive">{this.state.text}</Label>
                    <TextField placeholder="Type here" onChange={(e) => { this.setState({ text: e }) }} />
                </Dialog>
            </ModalTrigger>
        );
    }
}