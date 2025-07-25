// todos.js
import { button, div, element, form, input, li, span, ul } from '../lib/expressive/elements.js'
import Counter from './counter.js'

export const Todos = element((items = []) => {
  const add = text => Todos([...items, { text, done: false }])
  const remove = item => Todos(items.filter(i => i !== item))
  const toggle = item =>
    Todos(items.map(i => i === item ? { ...i, done: !item.done } : i))

  const submit = e => {
    e.preventDefault()
    const text = e.target.elements.todo?.value
    if (text) return add(text)
  }

  return div(
    form(
      { onsubmit: submit },
      input({ name: 'todo', placeholder: 'What needs doing?', }),
      button({ type: 'submit' }, 'Add')),
    ul(...items.map(item =>
      li({ style: `cursor: pointer; text-decoration: ${item.done ? 'line-through' : 'none'};` },
        span({ onclick: () => toggle(item) }, item.text),
        button({ onclick: () => remove(item) }, '✕')))),
    Counter(),
    Counter())
})

