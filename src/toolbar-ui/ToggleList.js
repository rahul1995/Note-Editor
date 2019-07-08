import React from 'react';
import StyleButton from './StyleButton';
import { RichUtils } from 'draft-js';
import TextBulleted from "@react/react-spectrum/Icon/TextBulleted";

export default class ToggleList extends React.Component {

    static STYLE = {
        icon: <TextBulleted />,
        style: 'unordered-list-item'
    }

    toggleBlockType = (blockType) => {
        this.props.onChange(RichUtils.toggleBlockType(this.props.editorState, blockType));
    }

    render() {
        const editorState = this.props.editorState;
        const selection = editorState.getSelection();
        const blockType = editorState
            .getCurrentContent()
            .getBlockForKey(selection.getStartKey())
            .getType();
        
        return (
            <StyleButton icon={ToggleList.STYLE.icon} style={ToggleList.STYLE.style}
                active={blockType === ToggleList.STYLE.style} onToggle={this.toggleBlockType} />
        );
    }
}