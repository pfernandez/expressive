import counter from '../src/components/counter.js'
import { serializeTree } from '../src/lib/expressive/functions.js'

const assertEqual = (a, b, msg) => {
  if (a !== b)
    throw new Error(`Assertion failed: ${msg} (expected ${b}, got ${a})`)
}

const assertDeepEqual = (a, b, msg) => {
  const jsonA = JSON.stringify(a)
  const jsonB = JSON.stringify(b)
  if (jsonA !== jsonB)
    throw new Error(
      `Assertion failed: ${msg}\nExpected: ${jsonB}\nGot: ${jsonA}`)
}

console.log('Running tests...')

// --- Test 1: counter(3) structure ---
const tree = counter(3)
const serialized = serializeTree(tree)

assertEqual(serialized[0], 'div', 'Root element should be div')
assertEqual(serialized[2][2], 3, 'Counter text should be 3')

assertDeepEqual(serialized, [
  'div',
  { style: { fontSize: '3em', maxWidth: '250px', textAlign: 'center' } },
  ['pre', {}, 3],
  ['button', {}, 'Increment']
], 'Serialized tree should exactly match expected')

console.log('✅ All tests passed')

