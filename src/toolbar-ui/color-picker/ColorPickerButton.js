import React from 'react';
import OverlayTrigger from '@react/react-spectrum/OverlayTrigger';
import TextField from '@react/react-spectrum/TextField';
import Button from '@react/react-spectrum/Button';
import Popover from '@react/react-spectrum/Popover';
import ColorPicker from "./ColorPicker";
import ColorUtils from '../../utils/ColorUtils';

export default class ColorPickerButton extends React.Component {

    getCurrentColor = () => {
        const defaultColor = "#000000";
        return this.props.styles.current(this.props.editorState) || defaultColor;
    }

    setColor = ({hex}) => {
        this.props.focusEditor(this.props.styles.add(this.props.editorState, hex));
    }

    render() {
        const currentColor = this.getCurrentColor();
        return (
            <OverlayTrigger trigger="click">
                <Button variant="action" style={{backgroundColor: currentColor}} />
                <Popover>
                    <ColorPickerComponent color={currentColor} onColorChange={this.setColor} />
                </Popover>
            </OverlayTrigger>
        );
    }
}

class ColorPickerComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            color: this.props.color,
            textVal: this.props.color
        }
    }

    onColorChange = (data) => {
        this.setState({color: data.hex, textVal: data.hex});
        this.props.onColorChange && this.props.onColorChange(data);
    }

    handleKeyDown = evt => {
        if(evt.keyCode === 13) { //Enter key
            evt.preventDefault();
            const hex = ColorUtils.sanitizeHex(evt.target.value) || this.state.color;
            this.onColorChange({hex});
        }
    }

    handleChange = value => {
        this.setState({textVal: value})
    }

    render() {
        return (
            <div>
                <ColorPicker color={this.state.color} onChangeComplete={this.onColorChange} />
                <TextField quiet value={this.state.textVal} onKeyDown={this.handleKeyDown}
                    onChange={this.handleChange} />
            </div>
        )
    }
}