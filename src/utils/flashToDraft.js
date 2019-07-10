import { CharacterMetadata, genKey, ContentBlock, ContentState } from 'draft-js';
import { OrderedSet, List } from 'immutable';

const SOFT_BREAK_PLACEHOLDER = '\r';
const ZERO_WIDTH_SPACE = '\u200B'
const LINE_BREAKS = /(\r\n|\r|\n)/g;

export default function flashToDraft(xml) {
    const parser = new DOMParser();
    return new FlashToDraftGenerator(parser, wrapTagAround(xml, "root")).generate();
}

class FlashToDraftGenerator {
    constructor(parser, xml) {
        this.doc = parser.parseFromString(xml, "text/xml");
        this.INLINE_STYLE_MAP = {
            "B": {"font-weight": "bold"},
            "I": {"font-style": "italic"},
            "U": {"text-decoration": "underline"}
        };
        this.ENTITY_FNS = {
            "A": createLinkEntity
        }
        this.inlineTags = Object.keys(this.INLINE_STYLE_MAP).concat(["FONT", "A"]);
        this.blockTags = ["P", "LI"];
        this.fontStyles = ["SIZE", "COLOR"];
        this.blockType = {
            "LI": "unordered-list-item"
        }
        this.contentStateForEntities = ContentState.createFromBlockArray([]);
    }

    generate() {
        const children = [...this.doc.documentElement.children];
        const blockList = children.map(childNode => this.parseNode(childNode));
        return ContentState.createFromBlockArray(blockList);
    }

    // On parsing an inline node, returns TextFragment
    // For a block node, returns a ContentBlock (assumption that there will be no nesting of blocks)
    parseNode(domNode, inlineStyles={}, entity) {
        if(!domNode) return;
        const nodeType = domNode.nodeType;
        if (nodeType === Node.ELEMENT_NODE) {
            let latestInlineStyles = { ...inlineStyles };
            const tagName = domNode.tagName.toUpperCase();
            if (tagName === 'FONT' || this.inlineTags.includes(tagName)) {
                return this.parseInlineNode(domNode, latestInlineStyles, entity);
            } else if(this.blockTags.includes(tagName)) {
                return this.parseBlockNode(domNode, latestInlineStyles, entity);
            } else {
                // Tag not supported
                return this.parseNode(domNode.firstElementChild, latestInlineStyles, entity);
            }
        } else if(nodeType === Node.TEXT_NODE) {
            let text = domNode.nodeValue;
            text = text.replace(LINE_BREAKS, '\n');
            text = text.split(ZERO_WIDTH_SPACE).join(SOFT_BREAK_PLACEHOLDER);
            const txtFragment = TextFragment
                .create(text)
                .applyStyles(this.getStyleSetFromInlineStyles(inlineStyles))
                .applyEntity(entity || null);
            return txtFragment;
        }
    }

    parseInlineNode(domElement, inlineStyles, entity) {
        let latestInlineStyles = {...inlineStyles};
        const tagName = domElement.tagName.toUpperCase();
        if(tagName === 'FONT') {
            this.fontStyles.forEach(styleName => {
                const styleVal = domElement.getAttribute(styleName);
                if (styleVal) {
                    latestInlineStyles[styleName] = styleVal;
                }
            });
        }
        if(this.ENTITY_FNS[tagName]) {
            this.contentStateForEntities = this.ENTITY_FNS[tagName](domElement, this.contentStateForEntities);
            entity = this.contentStateForEntities.getLastCreatedEntityKey();
        }
        latestInlineStyles = {...latestInlineStyles, ...this.INLINE_STYLE_MAP[tagName]};
        const children = [...domElement.childNodes];
        return children.reduce((acc, childNode) => {
            const nextTextFragment = this.parseNode(childNode, latestInlineStyles, entity);
            return TextFragment.merge(acc, nextTextFragment);
        }, TextFragment.createEmpty());
    }

    //Assumes no nested block node (only inline nodes or text nodes under this block node)
    parseBlockNode(domElement, inlineStyles, entity) {
        let children = [...domElement.childNodes];
        //children = removeLeadingWhitespace
        
        const textFragment = children.reduce((acc, childNode) => {
            const nextTextFragment = this.parseNode(childNode, inlineStyles, entity);
            return TextFragment.merge(acc, nextTextFragment);
        }, TextFragment.createEmpty());
        return new ContentBlock({
            key: genKey(),
            text: textFragment.text,
            type: this.getBlockType(domElement.tagName),
            characterList: textFragment.characterMetaList,
            depth: 0
        });
    }

    getBlockType(tagName) {
        return this.blockType[tagName.toUpperCase()] || 'unstyled';
    }

    getStyleSetFromInlineStyles(inlineStyles) {
        let stylesArr = [];
        if (inlineStyles.hasOwnProperty("COLOR")) {
            stylesArr.push(`CUSTOM_COLOR_${inlineStyles.COLOR}`);
        }
        if (inlineStyles.hasOwnProperty("SIZE")) {
            stylesArr.push(`CUSTOM_FONT_SIZE_${inlineStyles.SIZE}px`);
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

    applyEntity(entity) {
        this.characterMetaList = List.of(...(this.characterMetaList.toArray().map(characterMeta => {
            return CharacterMetadata.applyEntity(characterMeta, entity);
        })));
        return this;
    }
}

function wrapTagAround(xml, tag) {
    return `<${tag}>${xml}</${tag}>`
}

function createLinkEntity(domElement, contentState) {
    const url = domElement.getAttribute("HREF");
    return contentState.createEntity("LINK", "MUTABLE", {url});
}