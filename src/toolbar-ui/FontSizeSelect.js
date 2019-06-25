import React from 'react';
import Select from "@react/react-spectrum/Select";

export default class FontSizeSelect extends React.Component {

    getFontSize = () => {
        const defaultSize = "14px";
        return this.props.styles.current(this.props.editorState) || defaultSize;
    }

    setFontSize = fontSize => {
      this.props.focusEditor(this.props.styles.add(this.props.editorState, fontSize));
    }

    render() {
        const sizes = [8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
        let options = sizes.map(size => {
            return {
                label: size,
                value: size + "px"
            }
        });
        return (
            <Select
                onChange={this.setFontSize}
                options={options}
                value={this.getFontSize()}
                quite
                flexible
            />
        );
    }
}