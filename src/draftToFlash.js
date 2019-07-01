import { getEntityRanges } from 'draft-js-utils';

class CustomElement {
    constructor(tag, attrs, children) {
        this.tag = tag;
        this.attrs = attrs;
        this.children = children;
    }

    getXML() {
        if(this.tag === "TEXT") return this.attrs; // Text node special format
        const childrenXML = this.children.map(el => el.getXML()).join('');
        const attrsStr = this.attrs && Object.keys(this.attrs).map(key => `${key}=${this.attrs[key]}`).join(" ");
        return `<${this.tag}${(attrsStr && attrsStr.length) > 0 ? ' ' + attrsStr : ''}>${childrenXML}</>`;
    }
}

export default function draftToFlash(contentState) {
    const blocks = contentState.getBlockMap();
    return blocks.map(block => processBlock(block)).join('');
}

function processBlock(block) {
    const text = block.getText();
    const charList = block.getCharacterList();
    const entityRanges = getEntityRanges(text, charList);
    /* console.log(entityRanges[0][1].map(entry => {
        return [entry[0], entry[1].toJS()]
    })); */
    let inlineElement = processInline(entityRanges[0][1])
    // order b > i > u
    // use font tag
    const blockTag = block.getType() === 'unordered-list-item' ? 'LI' : 'P';
    //let retVal;
    //return wrapTagAround(wrapTagAround(retVal, blockTag), 'TEXTFORMAT');
}

function wrapTagAround(xml, tag) {
    return tag === 'P' ? `<P ALIGN="2">${xml}</P>` : `<${tag}>${xml}</${tag}>`
}

function processInline(state) {
    let fontElement = null;
    console.log("Block start")
    for(let i = 0; i < state.length; i++) {
        let text = state[i][0];
        let stylesSet = state[i][1];
        console.log(text, stylesSet.toJS())
        let color = "#000000", fontSize = "14px";
        // TODO Use exporter's inlineStyles way to get color and font-size custom style values from state
        stylesSet.forEach(style => {
            if(style.startsWith("CUSTOM_COLOR_")) {
                color = style.substring("CUSTOM_COLOR_".length);
            } else if(style.startsWith("CUSTOM_FONT_SIZE_")) {
                fontSize = style.substring("CUSTOM_FONT_SIZE_".length);
            }
        });
        fontSize = fontSize.substring(0, fontSize.length - 2);

        if(fontElement == null) {
            fontElement = new CustomElement(text, {
                face: "clean",
                color: color,
                size: fontSize,
                letterspacing: "0",
                kerning: "0"
            })
        }
    }
    console.log("Block End");
}