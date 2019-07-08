import React from 'react';
import Button from "@react/react-spectrum/Button";

export default class ToolbarButton extends React.Component {

    handleMouseDown = (e) => {
        if(e.button === 0) { // Left-click
            e.preventDefault();
            if(typeof this.props.onClick === "function") {
                this.props.onClick();
            }
        }
    }

    render() {
        return (
            <Button variant="action" icon={this.props.icon} onMouseDown={this.handleMouseDown}
                selected={this.props.active} disabled={this.props.disabled} />
        );
    }
}