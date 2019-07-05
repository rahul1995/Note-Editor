export default {
    getLinkFromState: (editorState) => {
        const selection = editorState.getSelection();
        const contentState = editorState.getCurrentContent();
        const block = contentState.getBlockForKey(selection.getFocusKey());
        const offset = selection.getFocusOffset();
        const entityKey = block.getEntityAt(offset);
        const entity = entityKey && contentState.getEntity(entityKey);
        return entity && (entity.getType() === "LINK") && entity.getData().url;
    }
} as LinkUtils;