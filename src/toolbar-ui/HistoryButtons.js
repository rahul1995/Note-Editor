import React from 'react';
import { EditorState } from 'draft-js';
import Undo from '@react/react-spectrum/Icon/Undo';
import Redo from '@react/react-spectrum/Icon/Redo';
import ToolbarButton from "./ToolbarButton";

export default class HistoryButtons extends React.Component {

    undo = () => {
        const newState = EditorState.undo(this.props.editorState);
        this.props.onChange(newState);
    }

    redo = () => {
        const newState = EditorState.redo(this.props.editorState);
        this.props.onChange(newState);
    }

    render() {
        const canUndo = !this.props.editorState.getUndoStack().isEmpty();
        const canRedo = !this.props.editorState.getRedoStack().isEmpty();
        return (
            <div className="history-buttons">
                <ToolbarButton icon={<Undo />}  disabled={!canUndo} onClick={this.undo} />
                <ToolbarButton icon={<Redo />} disabled={!canRedo} onClick={this.redo} />
            </div>
        )
    }
}