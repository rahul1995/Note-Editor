export default function flashToDraft(xml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(wrapTagAround(xml, "root"), "text/xml");
    const blockList = parseNode(doc.documentElement);
}

function parseNode(domNode: Node) {
    if(!domNode) return;
    const nodeType = domNode.nodeType;
    if(nodeType === Node.ELEMENT_NODE) {
        
    }
}

function wrapTagAround(xml, tag) {
    return `<${tag}>${xml}</${tag}>`
}