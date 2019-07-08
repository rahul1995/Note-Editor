import React from 'react';
import { CustomPicker } from 'react-color';
import { Hue, Saturation } from 'react-color/lib/components/common';
import ColorUtils from '../../utils/ColorUtils';

class Pointer extends React.Component {
    
    render() {
        const defaultStyles = {
            width: "10px",
            height: "10px",
            borderRadius: "10px",
            border: "2px solid white",
            transform: "translate(-7px, -7px)"
        };
        const styles = {...defaultStyles, ...this.props.pointerStyles}
        return <div style={styles} />
    }
}

class ColorPicker extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            color: this.props.color
        }
    }

    handleTextChange = val => {
        const hex = ColorUtils.sanitizeHex(val);
        if(hex) {
            this.props.onChangeComplete({hex});
        }
    }

    render() {
        return (
            <div>
                <div className="color-picker-component color-picker-component-wrapper">
                    <div className="color-picker-saturation color-picker-component-wrapper">
                        <Saturation {...this.props} pointer={Pointer} />
                    </div>
                    <div className="color-picker-hue color-picker-component-wrapper">
                        <Hue {...this.props} pointer={Pointer} direction="vertical"
                            pointerStyles={{transform: "translate(5px, -7px)"}} />
                    </div>
                </div>
            </div>
        );
    }
}

export default CustomPicker(ColorPicker);