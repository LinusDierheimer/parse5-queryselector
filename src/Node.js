const SelectorParser = require("css-selector-parser").CssSelectorParser;
const selcectorParser = new SelectorParser();

//Conversion tables for DOM Level1 structure emulation
const nodeTypes = {
    element: 1,
    text: 3,
    cdata: 4,
    comment: 8
};

function buildMatcher(rule) {
    return element => {

        if(rule.id)
            if(element.getId() !== rule.id)
                return false;

        if(rule.attrs) {
            for(let i = 0; i < rule.attrs.length; i++) {
                const found = element.getAttribute(rule.attrs[i].name);
                if(rule.attrs[i].operator === "=")
                    if(found !== rule.attrs[i].value)
                        return false;
            }
        }

        return true;
    }
}

function executeQuery(query, element) {
    const matcher = buildMatcher(query);

    if(query.rule) {
        const possible = element.getElementsByMatcher(matcher);
        for(let i = 0; i < possible.length; i++) {
            const child = executeQuery(query.rule, possible[i]);
            if(child != null)
                return child;
        }
        return null;
    } else {
        return element.getElementByMatcher(matcher);
    }
}

function executeQueryAll(query, element) {
    const matcher = buildMatcher(query);
    const current = element.querySelectorAll(matcher);

    if(query.rule) {
        let result = [];
        for(let i = 0; i < current.length; i++) {
            const child = executeQueryAll(query.rule, current[i]);
            result = result.concat(child);
        }
        return result;
    } else {
        return current;
    }
}

function createQueryTree(query) {
    try {
        queryTree = selcectorParser.parse(query);
        if(!queryTree.rule)
            return null;
        return queryTree;
    } catch(error) {
        return null;
    }
}

class Node {
    constructor(props) {
        for (const key of Object.keys(props)) {
            this[key] = props[key];
        }

        this.children = this.children || [];
    }

    get firstChild() {
        const children = this.children;

        return (children && children[0]) || null;
    }

    get lastChild() {
        const children = this.children;

        return (children && children[children.length - 1]) || null;
    }

    get nodeType() {
        return nodeTypes[this.type] || nodeTypes.element;
    }

    getAttribute(name) {
        if(!this.attribs)
            return null;
        return this.attribs[name] || null;
    }

    getId() {
        return this.getAttribute("id");
    }

    getValue() {
        return this.getAttribute("value");
    }

    getName() {
        return this.getAttribute("name");
    }

    getElementByMatcher(matcher) {

        if(!matcher || matcher === null)
            return null;

        if(matcher(this))
            return this;
            
        for(let i = 0; i < this.children.length; i++) {
            const sibling = this.children[i].getElementByMatcher(matcher);
            if(sibling !== null)
                return sibling;
        }

        return null;
    }

    get rawText() {
        if(this.children.length > 0) {
            if(this.children[0].type === "text") 
                return this.children[0].data;
        }
        return "";
    }

    get text() {
        return this.rawText.trim();
    }

    getElementsByMatcher(matcher) {

        let result = [];

        if(!matcher || matcher === null)
            return result;

        if(matcher(this))
            result.push(this);

        for(let i = 0; i < this.children.length; i++) {
            const sibling = this.children[i].getElementsByMatcher(matcher);
            result = result.concat(sibling);
        }

        return result;
    }

    getElementByTagName(name) {
        return this.getElementByMatcher(element => element.name === name);
    }

    getElementsByTagName(name) {
        return this.getElementsByMatcher(element => element.name === name);
    }

    getElementByAttribute(attribute, value) {
        return this.getElementByMatcher(element => element.getAttribute(attribute) === value);
    }

    getElementsByAttribute(attribute, value) {
        return this.getElementsByMatcher(element => element.getAttribute(attribute) === value);
    }

    getElementByName(name) {
        return this.getElementByAttribute("name", name);
    }

    getElementsByName(name) {
        return this.getElementsByAttribute("name", name);
    }

    getElementById(id) {
        return this.getElementByAttribute("id", id);
    }

    querySelector(query) {
        const queryTree = createQueryTree(query);
        if(queryTree === null)
            return null;
        return executeQuery(queryTree.rule, this);
    }

    querySelectorAll(query) {
        const queryTree = createQueryTree(query);
        if(queryTree === null)
            return null;
        return executeQueryAll(queryTree.rule, this);
    }
}

module.exports = Node;