import React from 'react';
import Button from "@react/react-spectrum/Button";

export default class ToolbarButton extends React.Component {

    handleMouseDown = (e) => {
        e.preventDefault();
        this.props.onClick(this.props.style);
    }

    render() {
        return <Button variant="action" icon={this.props.icon} onMouseDown={this.handleMouseDown} selected={this.props.active} />
    }
}