import React from 'react';

// Assumes 6-digit valid hex code
function hexToHSV(hex) {

    const red = +("0x" + hex[0] + hex[1])/255;
    const green = +("0x" + hex[2] + hex[3])/255;
    const blue = +("0x" + hex[4] + hex[5])/255;
    const min = Math.min(red, Math.min(green, blue));
    const max = Math.max(red, Math.max(green, blue));
    const delta = max - min;
    const hue = 0;
    const saturation = max > 0 ? Math.round(delta * 100 / max) : 0;
    const value = max * 100;

    if (delta > 0) {
        switch (max) {
        case red:
            hue = Math.round(60 * ((green - blue) / delta));
            break;
        case green:
            hue = Math.round(60 * ((blue - red) / delta + 2));
            break;
        case blue:
            hue = Math.round(60 * ((red - green) / delta + 4));
            break;
        }
    }
    if (hue < 0)
        hue += 360;
    return { hue, saturation, value };
}

class SV {
    render() {

    }
}

class Hue {
    render() {
        
    }
}

export default class MyColorPicker extends React.Component {

    sanitizeHex = hex => {
        if(hex.startsWith('#')) hex = hex.substring(1);
        if (/^[0-9a-f]+$/i.test(hex)) {
            if (hex.length === 3)
                hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
            if (hex.length === 6)
                return hex;
        }
        return "000000";
    }

    render() {
        const hexCode = this.sanitizeHex(this.props.color); // will return 6-digit hex code, black in case of error
        const {hue, saturation, value} = hexToHSV(hexCode);
        <div className="color-picker-component">
            <SV saturation={saturation} value={value} />
            <Hue hue={hue} />
            <FieldLabel position="left">Hex: #</FieldLabel>
            <TextField quiet hexCode={hexCode} />
        </div>
    }
}