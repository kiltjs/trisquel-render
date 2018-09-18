/* global describe, it, beforeEach, assert, renderNodes */

describe('rendering HTML', function () {

  beforeEach(function () {
    while( document.body.firstChild ) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('render div', function () {

    var html_nodes = [{ $:'div', attrs: { 'class': 'foo-bar' }, _: 'foobar' }];

    renderNodes(document.body, html_nodes);

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar">foobar</div>' );

  });

  it('withNode', function () {

    var html_nodes = [{ $:'div', attrs: { 'class': 'foo-bar' }, _: 'foobar' }, { $:'div', attrs: { 'data-if': ' foo === bar ' }, _: 'foobar' }];

    renderNodes(document.body, html_nodes, {
      withNode: function (node) {
        if( node.attrs && 'data-if' in node.attrs ) return {
          replace_by_comment: ' data-if replaced by comment '
        };
      },
    });

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar">foobar</div><!-- data-if replaced by comment -->' );

  });

  it('initNode', function () {

    var html_nodes = [{ $:'div', attrs: { 'class': 'foo-bar' }, _: 'foobar' }, { $:'div', attrs: { 'data-if': ' foo === bar ' }, _: 'foobar' }],
        matched_node;

    renderNodes(document.body, html_nodes, {
      withNode: function (node) {
        if( node.attrs && 'data-if' in node.attrs ) return {
          initNode: function (node_el) {
            matched_node = node_el;
          },
        };
      },
    });

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar">foobar</div><div data-if=" foo === bar ">foobar</div>' );
    assert.strictEqual( matched_node.nodeName, 'DIV' );
    assert.strictEqual( matched_node.getAttribute('data-if'), ' foo === bar ' );

  });

});
