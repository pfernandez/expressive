import { button, div, element, pre } from '../lib/expressive/elements.js'

const Counter = element(
  (count = 0) =>
    div(
      pre(count),
      button(
        { onclick: prev => Counter(prev + 1) },
        'Increment')))

export default Counter

