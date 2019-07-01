import { getEntityRanges } from 'draft-js-utils';

class CustomElement {
    constructor(tag, attrs, children) {
        this.tag = tag;
        this.attrs = attrs || {};
        this.children = children || [];
    }

    getXML() {
        if(this.tag === "TEXT") return typeof this.attrs !== "string" ? "" : this.attrs; // Text node special format
        const childrenXML = this.children.map(el => el.getXML()).join('');
        const attrsStr = this.attrs && Object.keys(this.attrs).map(key => `${key}="${this.attrs[key]}"`).join(" ");
        return `<${this.tag}${(attrsStr && attrsStr.length) > 0 ? ' ' + attrsStr : ''}>${childrenXML}</${this.tag}>`;
    }
}

const stylesOrder = ["BOLD", "ITALIC", "UNDERLINE"];

const stylesElementMap = {
    "BOLD": "b",
    "ITALIC": "i",
    "UNDERLINE": "u"
}

export default function draftToFlash(contentState) {
    const blocks = contentState.getBlockMap();
    return blocks.map(block => processBlock(block)).join('');
}

function processBlock(block) {
    const text = block.getText();
    const charList = block.getCharacterList();
    const entityRanges = getEntityRanges(text, charList);
    let inlineElements = processInline(entityRanges);
    const blockTag = block.getType() === 'unordered-list-item' ? 'LI' : 'P';
    let blockEl = new CustomElement(blockTag, null, inlineElements);
    blockEl = new CustomElement("TEXTFORMAT", null, [blockEl]);
    return blockEl.getXML();
}

function processInline(entities) {
    let inlineElements = [];
    for(let i = 0; i < entities.length; i++) {
        const entityType = entities[i][0];
        const textFragments = entities[i][1];
        if(entityType == null) {
            inlineElements.push(fragmentsToElement(textFragments));
        } else {
            let anchorEl = new CustomElement("a", null, [fragmentsToElement(textFragments)]);
            inlineElements.push(anchorEl);
        }
        textFragments.forEach(textFragment => {
            let text = textFragment[0];
            let stylesSet = textFragment[1];
        });
    }
    return inlineElements;
}

function fragmentsToElement(fragments) {
    // fragments = [[text, styles], [text, styles]] (array of [text, styles])
    let rootFont = null, lastFont = null;
    fragments.forEach(fragment => {
        let text = fragment[0], stylesSet = fragment[1];
        let { color, fontSize } = getFontStyles(stylesSet);
        if(rootFont == null) {
            rootFont = lastFont = new CustomElement("font", {color, size: fontSize});
        } else {
            let prevColor = lastFont.attrs.color, prevFontSize = lastFont.attrs.size;
            if(prevColor != color || prevFontSize != fontSize) {
                let newFont = new CustomElement("font");
                if(prevColor != color) newFont.attrs.color = color;
                if(prevFontSize != fontSize) newFont.attrs.size = fontSize;
                lastFont.children = lastFont.children || [];
                lastFont.children.push(newFont);
                lastFont = newFont;
            }
        }
        lastFont.children = lastFont.children || [];
        lastFont.children.push(textFragmentToCustomElement(text, stylesSet))
    })
    return rootFont;
}

function getFontStyles(stylesSet) {
    let color = "#000000", fontSize = "14";
    // TODO Use exporter's inlineStyles way to get color and font-size custom style values from state
    stylesSet.forEach(style => {
        if (style.startsWith("CUSTOM_COLOR_")) {
            color = style.substring("CUSTOM_COLOR_".length);
        } else if (style.startsWith("CUSTOM_FONT_SIZE_")) {
            fontSize = style.substring("CUSTOM_FONT_SIZE_".length).slice(0, -2);
        }
    });
    return {color, fontSize};
}

function textFragmentToCustomElement(text, stylesSet) {
    let rootTag = null, parent = null;
    stylesOrder.forEach(style => {
        if(stylesSet.includes(style)) {
            let tag = new CustomElement(stylesElementMap[style]);
            if(rootTag == null) {
                rootTag = tag;
            } else {
                parent.children = [tag];
            }
            parent = tag;
        }
    });
    let textTag = new CustomElement("TEXT", text);
    if(parent != null) {
        parent.children = [textTag];
    } else {
        rootTag = textTag;
    }
    return rootTag;
}