import { CharacterMetadata, genKey, ContentBlock } from 'draft-js';
import { OrderedSet, List } from 'immutable';

const SOFT_BREAK_PLACEHOLDER = '\r';
const ZERO_WIDTH_SPACE = '\u200B'
const LINE_BREAKS = /(\r\n|\r|\n)/g;

export default function flashToDraft(xml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(wrapTagAround(xml, "root"), "text/xml");
    const children = Array.prototype.slice.call(doc.documentElement.children);
    const blockList = children.map(childNode => parseNode(childNode));
    return blockList;
}

//TODO collapse whitespace

class TextFragment {
    // text: String;
    // characterMetaList: IndexedSeq<CharacterMetadata>

    constructor(text, characterMetaList) {
        this.text = text;
        this.characterMetaList = characterMetaList
    }

    static createEmpty() {
        return TextFragment.create('');
    }

    static create(text) {
        return new TextFragment(text, List.of(...(new Array(text.length).fill(CharacterMetadata.create()))));
    }

    static merge(fragment1, fragment2) {
        return new TextFragment(
            fragment1.text + fragment2.text,
            fragment1.characterMetaList.concat(fragment2.characterMetaList)
        );
    }

    applyStyles(styles) {
        this.characterMetaList = List.of(...(this.characterMetaList.toArray().map(characterMeta => {
            return styles.reduce((acc, style) => {
                return CharacterMetadata.applyStyle(acc, style);
            }, characterMeta);
        })));
        return this;
    }
}

const INLINE_STYLE_MAP = {
    "B": {"font-weight": "bold"},
    "I": {"font-style": "italic"},
    "U": {"text-decoration": "underline"}
}

function isInlineStyleTag(tag) {
    return !!INLINE_STYLE_MAP[tag];
}

// On parsing an inline node, returns TextFragment
// For a block node, returns a ContentBlock (assumption that there will be no nesting of blocks)

function parseNode(domNode, inlineStyles) {
    if(!domNode) return;
    inlineStyles = inlineStyles || {};
    const nodeType = domNode.nodeType;
    if (nodeType === Node.ELEMENT_NODE) {
        let latestInlineStyles = { ...inlineStyles };
        const tagName = domNode.tagName.toUpperCase();
        if (tagName === 'FONT' || INLINE_STYLE_MAP.hasOwnProperty(tagName)) {
            return parseInlineNode(domNode, latestInlineStyles);
        } else if(tagName === 'P' || tagName === 'LI') {
            return parseBlockNode(domNode, latestInlineStyles);
        } else {
            return parseNode(domNode.firstElementChild, latestInlineStyles);
        }
    } else if(nodeType === Node.TEXT_NODE) {
        let text = domNode.nodeValue;
        text = text.replace(LINE_BREAKS, '\n');
        text = text.split(ZERO_WIDTH_SPACE).join(SOFT_BREAK_PLACEHOLDER);
        const txtFragment = TextFragment.create(text).applyStyles(getStyleSetFromInlineStyles(inlineStyles));
        return txtFragment;
    }
}

//Assumes no nested block node (only inline nodes or text nodes under this block node)
function parseBlockNode(domElement, inlineStyles) {
    let children = Array.prototype.slice.call(domElement.childNodes);
    //children = removeLeadingWhitespace
    
    const textFragment = children.reduce((acc, childNode) => {
        const nextTextFragment = parseNode(childNode, inlineStyles);
        return TextFragment.merge(acc, nextTextFragment);
    }, TextFragment.createEmpty());
    return new ContentBlock({
        key: genKey(),
        text: textFragment.text,
        type: domElement.tagName.toUpperCase() === 'LI' ? 'unordered-list-item' : 'unstyled',
        characterList: textFragment.characterMetaList,
        depth: 0
    });
}

function parseInlineNode(domElement, inlineStyles) {
    let latestInlineStyles = {...inlineStyles};
    const tagName = domElement.tagName.toUpperCase();
    if(tagName === 'FONT') {
        const styleNames = ["size", "color"];
        styleNames.forEach(styleName => {
            const styleVal = domElement.getAttribute(styleName);
            if (styleVal) {
                latestInlineStyles[styleName] = styleVal;
            }
        });
    }
    latestInlineStyles = Object.assign(latestInlineStyles, INLINE_STYLE_MAP[tagName]);
    const children = Array.prototype.slice.call(domElement.childNodes);
    return children.reduce((acc, childNode) => {
        const nextTextFragment = parseNode(childNode, latestInlineStyles);
        return TextFragment.merge(acc, nextTextFragment);
    }, TextFragment.createEmpty());
}

function getStyleSetFromInlineStyles(inlineStyles) {
    let stylesArr = [];
    if (inlineStyles.hasOwnProperty("color")) {
        stylesArr.push(`CUSTOM_COLOR_${inlineStyles.color}`);
    }
    if (inlineStyles.hasOwnProperty("size")) {
        stylesArr.push(`CUSTOM_FONT_SIZE_${inlineStyles.size}px`);
    }
    if(inlineStyles.hasOwnProperty("font-weight")) {
        stylesArr.push("BOLD");
    }
    if (inlineStyles.hasOwnProperty("font-style")) {
        stylesArr.push("ITALIC");
    }
    if (inlineStyles.hasOwnProperty("text-decoration")) {
        stylesArr.push("UNDERLINE");
    }
    return OrderedSet.of(...stylesArr);
}

function wrapTagAround(xml, tag) {
    return `<${tag}>${xml}</${tag}>`
}