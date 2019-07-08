import React from 'react';
import FontSizeSelect from './toolbar-ui/FontSizeSelect';
import ColorPickerButton from './toolbar-ui/color-picker/ColorPickerButton';
import ToggleableInlineStyle from './toolbar-ui/ToggleableInlineStyles';
import ToggleList from './toolbar-ui/ToggleList';
import Hyperlink from './toolbar-ui/Hyperlink';
import HistoryButtons from './toolbar-ui/HistoryButtons';

export default function ToolBar(props) {
    return (
        <div className="texteditor-toolbar-container">
            <FontSizeSelect editorState={props.editorState} onChange={props.onChange} focusEditor={props.focusEditor}
                styles={props.styles.fontSize} />
            <ColorPickerButton editorState={props.editorState} onChange={props.onChange} focusEditor={props.focusEditor}
                styles={props.styles.color} />
            <ToggleableInlineStyle editorState={props.editorState} onChange={props.onChange} />
            <ToggleList editorState={props.editorState} onChange={props.onChange} />
            <Hyperlink editorState={props.editorState} onChange={props.onChange} focusEditor={props.focusEditor} />
            <HistoryButtons editorState={props.editorState} onChange={props.onChange} />
        </div>
    );
}