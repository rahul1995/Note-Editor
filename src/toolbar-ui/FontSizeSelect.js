import React from 'react';
import Select from "@react/react-spectrum/Select";

import { RichUtils, Modifier, EditorState, convertToRaw, CharacterMetadata } from 'draft-js';
import { Map } from 'immutable';

export default class FontSizeSelect extends React.Component {

    addOrRemoveStyles = (contentState, selectionState, stylesPredicate, addOrRemove) => {
        const blockMap = contentState.getBlockMap();
        const startKey = selectionState.getStartKey();
        const startOffset = selectionState.getStartOffset();
        const endKey = selectionState.getEndKey();
        const endOffset = selectionState.getEndOffset();
      
        const newBlocks = blockMap
          .skipUntil((_, k) => k === startKey)
          .takeUntil((_, k) => k === endKey)
          .concat(Map([[endKey, blockMap.get(endKey)]]))
          .map((block, blockKey) => {
            let sliceStart;
            let sliceEnd;
      
            if (startKey === endKey) {
              sliceStart = startOffset;
              sliceEnd = endOffset;
            } else {
              sliceStart = blockKey === startKey ? startOffset : 0;
              sliceEnd = blockKey === endKey ? endOffset : block.getLength();
            }
      
            let chars = block.getCharacterList();

            let current;
            while (sliceStart < sliceEnd) {
              current = chars.get(sliceStart);
              let inlineStyles = current.getStyle().filter(stylesPredicate);
              inlineStyles.toArray().forEach(inlineStyle => {
                chars = chars.set(
                    sliceStart,
                    addOrRemove
                      ? CharacterMetadata.applyStyle(current, inlineStyle)
                      : CharacterMetadata.removeStyle(current, inlineStyle),
                );
              });
              sliceStart++;
            }
      
            return block.set('characterList', chars);
          });
      
        return contentState.merge({
          blockMap: blockMap.merge(newBlocks),
          selectionBefore: selectionState,
          selectionAfter: selectionState,
        });
    }

    

    changeFontSize = (value) => {
        const toggledStyle = `font-${value}`;
        const selection = this.props.editorState.getSelection();
        const currentStyle = this.props.editorState.getCurrentInlineStyle();

        //Remove font styles from selection
        const nextContentState = this.addOrRemoveStyles(this.props.editorState.getCurrentContent(),
                                    selection, (style) => style.startsWith("font-"), false);
        let newState = EditorState.push(this.props.editorState, nextContentState, "change-inline-style");

        if(selection.isCollapsed()) {
            newState = currentStyle.reduce((state, style) => {
                if(style.startsWith("font-")) {
                    return RichUtils.toggleInlineStyle(state, style);
                } else {
                    return state;
                }
            }, this.props.editorState);
        }
        
        newState = RichUtils.toggleInlineStyle(newState, toggledStyle);
        console.log(convertToRaw(newState.getCurrentContent()));
        this.props.focusEditor(newState);
    }

    getFontSize = () => {
        const defaultSize = '11';
        const currentStyle = this.props.editorState.getCurrentInlineStyle();
        const fontSizes = currentStyle.filter(style => style.startsWith("font-")).toArray();
        return fontSizes.length > 0 ? fontSizes[0].substring("font-".length) : defaultSize
    }

    render() {
        const sizes = [8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
        let options = sizes.map(size => {
            return {
                label: size,
                value: size + ''
            }
        });
        return (
            <Select
                onChange={this.changeFontSize}
                options={options}
                value={this.getFontSize()}
                quite
                flexible
            />
        );
    }
}