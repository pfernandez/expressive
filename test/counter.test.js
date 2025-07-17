import assert from 'assert'
import counter from '../src/components/counter.js'
import { test } from 'node:test'

test('counter() returns valid wrapped vdom', () => {
  const vdom = counter()

  assert.ok(Array.isArray(vdom), 'vdom should be an array')
  assert.strictEqual(vdom[0], 'wrap', 'vdom should be wrapped')

  const inner = vdom[2]
  assert.ok(Array.isArray(inner), 'inner should be an array')
  assert.strictEqual(inner[0], 'div', 'root element should be div')

  const children = inner.slice(2)
  const preNode = children.find(c => Array.isArray(c) && c[0] === 'pre')
  const buttonNode = children.find(c => Array.isArray(c) && c[0] === 'button')

  assert.ok(preNode, 'pre element should exist')
  assert.strictEqual(preNode[2], 0, 'initial count should be 0')
  assert.ok(buttonNode, 'button element should exist')
  assert.ok(typeof buttonNode[1].onclick === 'function', 'button should have onclick handler')
})
