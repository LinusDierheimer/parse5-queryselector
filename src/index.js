const parse5 = require("parse5");
const TreeAdapter = require("./TreeAdapter");

function extendOptions(options = {}) {
    if(!options.treeAdapter)
        options.treeAdapter = TreeAdapter;
    return options;
}

module.exports = {
    TreeAdapter: TreeAdapter,
    Node: TreeAdapter.Node,
    parse: (html, options) => parse5.parse(html, extendOptions(options)),
    parseFragment: (fragmentContext, html, options) => {
        return typeof fragmentContext === 'string' ? 
            parse5.parseFragment(fragmentContext, extendOptions(html)) :
            parse5.paseFragment(fragmentContext, html, extendOptions(options));
    },
    serialize: (node, options) => parse5.serialize(node, options)
};