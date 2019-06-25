import React from 'react';
import ToolbarButton from './ToolbarButton';
import { RichUtils } from 'draft-js';
import TextBulleted from "@react/react-spectrum/Icon/TextBulleted";

export default class ToggleList extends React.Component {

    toggleBlockType = (blockType) => {
        this.props.onChange(RichUtils.toggleBlockType(this.props.editorState, blockType));
    }

    render() {

        const STYLE = {
            icon: <TextBulleted />,
            style: 'unordered-list-item'
        }

        const editorState = this.props.editorState;
        const selection = editorState.getSelection();
        const blockType = editorState
            .getCurrentContent()
            .getBlockForKey(selection.getStartKey())
            .getType();
        
        return (
            <ToolbarButton {...STYLE} active={blockType === STYLE.style} onClick={this.toggleBlockType} />
        );
    }
}