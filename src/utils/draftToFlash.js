import { getEntityRanges } from 'draft-js-utils';

class CustomElement {

    static TYPE = {
        ELEMENT: "element",
        TEXT: "text"
    }

    // For text node, tag and children are not applicable, text data should be provided as attrs
    constructor({tag, type=CustomElement.TYPE.ELEMENT, children=[], attrs={}}) {
        this.tag = tag;
        this.type = type;
        this.children = children;
        this.attrs = attrs;
    }

    toXML() {
        if(this.type === CustomElement.TYPE.TEXT) {
            return typeof this.attrs !== "string" ? "" : this.attrs;
        }
        const childrenXML = this.children.map(el => el.toXML()).join('');
        const attrsStr = this.attrs && Object.keys(this.attrs).map(key => `${key}="${this.attrs[key]}"`).join(" ");
        return `<${this.tag}${(attrsStr && attrsStr.length) > 0 ? ' ' + attrsStr : ''}>${childrenXML}</${this.tag}>`;
    }
}

// ob1 - ob2
function objectDiff(ob1, ob2) {
    return Object.keys(ob1).reduce((acc, key) => {
        if(ob1[key] !== ob2[key]) {
            acc[key] = ob1[key];
        }
        return acc;
    }, {});
}

class DraftToFlashGenerator {
    constructor(contentState) {
        this.contentState = contentState;
        this.stylesOrder = ["BOLD", "ITALIC", "UNDERLINE"];
        this.stylesElementMap = {
            "BOLD": "b",
            "ITALIC": "i",
            "UNDERLINE": "u"
        }
        this.defaultFontStyles = {
            FACE: "CLEAN",
            SIZE: "14",
            COLOR: "#000000",
            LETTERSPACING: "0",
            KERNING: "0"
        }
    }

    processBlock(block) {
        const text = block.getText();
        const charList = block.getCharacterList();
        const entityRanges = getEntityRanges(text, charList);
        let inlineElements = this.processInline(entityRanges);
        let blockElement = this.getBlockElement(block.getType(), inlineElements);
        blockElement = new CustomElement({
            tag: "TEXTFORMAT",
            children: [blockElement],
            attrs: {"LEADING": "2"}
        });
        return blockElement.toXML();
    }

    processInline(entityRanges) {
        return entityRanges.map(entityRange => {
            const [entityKey, textFragments] = entityRange;
            let inlineElement = this.processTextFragments(textFragments);
            return this.processEntity(entityKey, inlineElement);
        });
    }
    
    getBlockElement(blockType, inlineChildren) {
        if(blockType === 'unordered-list-item') {
            return new CustomElement({
                tag: "LI",
                children: inlineChildren
            });
        }
        return new CustomElement({
            tag: "P",
            children: inlineChildren,
            attrs: {"ALIGN": "LEFT"}
        });
    }

    processTextFragments(fragments) {
        let rootFontEl = null, latestFontEl = null, latestFontStyles = {};
        fragments.forEach(fragment => {
            const [text, styleSet] = fragment;
            const fontStyles = this.getFontStyles(styleSet);
            const fontStylesDiff = objectDiff(fontStyles, latestFontStyles) //fontStylesDiff = fontStyles - latestFontStyles
            if(Object.keys(fontStylesDiff).length > 0) {
                let newFontEl = new CustomElement({
                    tag: "FONT",
                    children: [],
                    attrs: fontStylesDiff
                });
                if(rootFontEl === null) {
                    rootFontEl = latestFontEl = newFontEl;
                } else {
                    latestFontEl.children.push(newFontEl);
                    latestFontEl = newFontEl;
                }
            }
            latestFontEl.children.push(this.processTextFragment(text, styleSet));
            latestFontStyles = fontStyles;
        });
        return rootFontEl;
    }

    processEntity(entityKey, childElement) {
        if(entityKey !== null) {
            const entity = this.contentState.getEntity(entityKey); // TODO catch exception which is thrown in case no entity exists
            if(entity && entity.getType() === "LINK") {
                const link = entity.getData().url || "";
                return new CustomElement({
                    tag: "A",
                    children: [childElement],
                    attrs: {"HREF": link}
                });
            }
        }
        return childElement;
    }

    getFontStyles(stylesSet) {
        return stylesSet.reduce((acc, style) => {
            if (style.startsWith("CUSTOM_COLOR_")) {
                acc.COLOR = style.substring("CUSTOM_COLOR_".length);
            } else if (style.startsWith("CUSTOM_FONT_SIZE_")) {
                acc.SIZE = style.substring("CUSTOM_FONT_SIZE_".length).slice(0, -2);
            }
            return acc;
        }, {...this.defaultFontStyles});
    }

    processTextFragment(text, styleSet) {
        let rootTag = null, parent = null;
        this.stylesOrder.forEach(style => {
            if(styleSet.includes(style)) {
                let tag = new CustomElement({ tag: this.stylesElementMap[style] });
                if(rootTag == null) {
                    rootTag = tag;
                } else {
                    parent.children = [tag];
                }
                parent = tag;
            }
        });
        let textTag = new CustomElement({
            type: CustomElement.TYPE.TEXT,
            attrs: text
        });
        if(parent != null) {
            parent.children = [textTag];
        } else {
            rootTag = textTag;
        }
        return rootTag;
    }

    generate() {
        return this.contentState.getBlockMap().map(block => this.processBlock(block)).join('');
    }
}

export default function draftToFlash(contentState) {
    return new DraftToFlashGenerator(contentState).generate();
}
