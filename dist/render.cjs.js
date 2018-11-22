'use strict';

function _appendChildren (parent_el, nodes, ns_scheme, options, _withNode, inits_list) {
  var inserted_nodes = [],
      insert_before = options.insert_before;

  options.insert_before = null;

  nodes.forEach(function (node) {

    if( typeof node === 'string' ) node = { text: node };
    if( options.remove_comments && node && typeof node === 'object' && 'comments' in node ) return;

    var with_node = _withNode(node) ||{};
    var node_el;

    if( with_node.replace_by_comment ) node_el = document.createComment(with_node.replace_by_comment);
    else node_el = _create(node, parent_el, ns_scheme, options, _withNode, inits_list, with_node.replace_text);

    if( with_node.onCreate instanceof Function ) with_node.onCreate.call(node_el, node_el, node, options, with_node);

    if( insert_before ) parent_el.insertBefore(node_el, insert_before);
    else parent_el.appendChild( node_el );

    if( with_node.initNode ) inits_list.push(function () {
      with_node.initNode.call(node_el, node_el, node, options, with_node);
    });

    inserted_nodes.push({
      el: node_el,
      options: node,
      with_node: with_node,
    });

  });

  return inserted_nodes;
}

var ns_tags = {
  svg: 'http://www.w3.org/2000/svg',
  xbl: 'http://www.mozilla.org/xbl',
  xul: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
};

function _create(node, _parent, ns_scheme, options, _withNode, inits_list, replace_text) {
  var node_el;

  if( 'text' in node ) return document.createTextNode( replace_text === undefined ? node.text : replace_text );
  if( 'comments' in node ) return document.createComment(node.comments);

  if( !node.$ ) throw new TypeError('unknown node format');

  ns_scheme = ns_scheme || ns_tags[node.$];
  if( ns_scheme ) node_el = document.createElementNS(ns_scheme, node.$);
  else node_el = document.createElement(node.$);

  if( node.attrs ) {
    for( var key in node.attrs ) node_el.setAttribute(key, node.attrs[key] instanceof Function ? node.attrs[key](options, node) : node.attrs[key] );
  }

  if( '_' in node ) _appendChildren(node_el, node._ instanceof Array ? node._ : [node._], ns_scheme, options, _withNode, inits_list);

  return node_el;
}

function renderNodes (parent, nodes, options) {
  options = Object.create(options || {});
  var _withNode = options.withNode || function () {};

  options.withNode = null;

  if( typeof options.withNode !== 'function' ) options.withNode = function () {};

  if( !options.insert_before && options.keep_content !== true ) {
    while( parent.firstChild )
      parent.removeChild(parent.firstChild);
  }

  var inits_list = [],
      inserted_nodes = _appendChildren(parent, nodes, null, options, _withNode, inits_list);

  inits_list.forEach(function (initFn) { initFn(); });

  return inserted_nodes;
}

module.exports = renderNodes;
