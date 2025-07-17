import { circle, div, svg } from '../src/lib/expressive/elements.js'
import assert from 'assert'
import { test } from 'node:test'

test('div() produces correct vdom structure', () => {
  const d = div({ id: 'test' }, 'Hello')

  assert.strictEqual(d[0], 'div')
  assert.strictEqual(d[1].id, 'test')
  assert.strictEqual(d[2], 'Hello')
})

test('svg() and circle() produce correct structure', () => {
  const s = svg(circle({ r: 10 }))

  assert.strictEqual(s[0], 'svg')
  assert.strictEqual(s[2][0], 'circle')
})
