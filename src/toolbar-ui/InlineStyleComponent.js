import React from 'react';
import TextBold from "@react/react-spectrum/Icon/TextBold";
import TextItalic from "@react/react-spectrum/Icon/TextItalic";
import TextUnderline from "@react/react-spectrum/Icon/TextUnderline";
import ToolbarButton from './ToolbarButton';
import { RichUtils } from 'draft-js';

export default class InlineStyleComponent extends React.Component {

    toggleInlineStyle = (style) => {
        const newState = RichUtils.toggleInlineStyle(this.props.editorState, style);
        this.props.onChange(newState);
    }

    render() {
        const INLINE_STYLES = [
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
        const currentStyle = this.props.editorState.getCurrentInlineStyle();
        return (
            <div className="inline-styles-container">
            {
                INLINE_STYLES.map(item => {
                    return <ToolbarButton key={item.style} {...item} onClick={this.toggleInlineStyle} active={currentStyle.has(item.style)} />
                })
            }
            </div>
        );
    }
}