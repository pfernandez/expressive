import { button, div, element, pre } from '../lib/expressive/elements.js'

const counter = element(
  (count = 0) =>
    div(
      pre(count),
      button(
        { onclick: prev => counter(prev + 1) },
        'Increment')))

export default counter

