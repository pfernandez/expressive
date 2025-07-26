import { button, div, element, output } from '../lib/elements.js'

export const counter = element(
  (count = 0) =>
    div(
      output(count),
      button(
        { onclick: () => counter(count + 1) },
        'Increment')))

