import React from 'react';
import ToolbarButton from './ToolbarButton';

export default class StyleButton extends React.Component {

    onClick = () => {
        this.props.onToggle(this.props.style);
    }

    render() {
        const {onToggle, style, ...otherProps} = this.props
        return (
            <ToolbarButton {...otherProps} onClick={this.onClick} />
        );
    }
}