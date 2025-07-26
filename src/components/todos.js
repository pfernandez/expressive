import { button, div, element,
         form, input, li, span, ul } from '../lib/elements.js'

export const todos = element(
  (items = [{ text: 'Add my first todo', done: true }]) => {
    const add = text => todos([...items, { text, done: false }])
    const remove = item => todos(items.filter(i => i !== item))
    const toggle = item =>
      todos(items.map(i => i === item ? { ...i, done: !item.done } : i))

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
          button({ onclick: () => remove(item) }, '✕')))))
  })

