import React from 'react';
import TextBold from "@react/react-spectrum/Icon/TextBold";
import TextItalic from "@react/react-spectrum/Icon/TextItalic";
import TextUnderline from "@react/react-spectrum/Icon/TextUnderline";
import StyleButton from './StyleButton';
import { RichUtils } from 'draft-js';

export default class ToggleableInlineStyle extends React.Component {

    static INLINE_STYLES = [
        {
            icon: <TextBold />,
            style: "BOLD"
        },
        {
            icon: <TextItalic />,
            style: "ITALIC"
        },
        {
            icon: <TextUnderline />,
            style: "UNDERLINE"
        }
    ];

    toggleStyle = (style) => {
        const newState = RichUtils.toggleInlineStyle(this.props.editorState, style);
        this.props.onChange(newState);
    }

    render() {
        const currentStyle = this.props.editorState.getCurrentInlineStyle();
        return (
            <div className="inline-styles-container">
            {
                ToggleableInlineStyle.INLINE_STYLES.map(item => {
                    return (
                        <StyleButton key={item.style}
                            icon={item.icon} style={item.style}
                            onToggle={this.toggleStyle} active={currentStyle.has(item.style)} />
                    );
                })
            }
            </div>
        );
    }
}