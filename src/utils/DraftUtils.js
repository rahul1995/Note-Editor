export default class DraftUtils {
    static getLinkFromState(editorState) {
        const selection = editorState.getSelection();
        const contentState = editorState.getCurrentContent();
        const block = contentState.getBlockForKey(selection.getFocusKey());
        const offset = selection.getAnchorOffset();
        const entityKey = block.getEntityAt(offset);
        const entity = entityKey && contentState.getEntity(entityKey);
        return entity && (entity.getType() === "LINK") && entity.getData().url;
    }

    static getSelectedText(contentState, selection, blockDelimiter) {
        blockDelimiter = blockDelimiter || '\n';
        const startKey = selection.getStartKey();
        const endKey = selection.getEndKey();
        const blocks = contentState.getBlockMap();

        let lastWasEnd = false;
        const selectedBlock = blocks
            .skipUntil(block => block.getKey() === startKey)
            .takeUntil(block => {
                let result = lastWasEnd;
                if (block.getKey() === endKey) {
                    lastWasEnd = true;
                }
                return result;
            });

        return selectedBlock
            .map(block => {
                const key = block.getKey();
                let text = block.getText();

                let start = 0;
                let end = text.length;

                if (key === startKey) {
                    start = selection.getStartOffset();
                }
                if (key === endKey) {
                    end = selection.getEndOffset();
                }

                text = text.slice(start, end);
                return text;
            })
            .join(blockDelimiter);
    }
}