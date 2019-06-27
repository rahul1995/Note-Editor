import React from 'react';
import Select from "@react/react-spectrum/Select";

export default class ColorSelect extends React.Component {

    getColor = () => {
        const defaultColor = "#000000";
        return this.props.styles.current(this.props.editorState) || defaultColor;
    }

    setColor = color => {
        this.props.focusEditor(this.props.styles.add(this.props.editorState, color));
    }

    render() {
        const colors = ["#ea2356", "#45ab09", "#34dd77", "#000000"];
        let options = colors.map(color => {
            return {
                label: color,
                value: color
            }
        });
        return (
            <Select
                onChange={this.setColor}
                options={options}
                value={this.getColor()}
                quite
                flexible
            />
        );
    }
}