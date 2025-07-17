import assert from 'assert'
import { renderTree } from '../src/lib/expressive/reconciler.js'
import { test } from 'node:test'

test('renderTree() returns serializable structure in Node', () => {
  const tree = ['div', { id: 'foo' }, 'bar']
  const el = renderTree(tree)

  assert.ok(typeof el === 'object', 'renderTree should return an object')
  assert.strictEqual(el.tag, 'div', 'tag should be div')
  assert.strictEqual(el.props.id, 'foo', 'id prop should be foo')
  assert.ok(el.children.includes('bar'), 'children should include "bar"')
})
