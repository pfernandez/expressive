// todos.js
import { button, div, element, form, input, li, span, ul } from '../lib/expressive/elements.js'
import { filter, map } from '../lib/expressive/functions.js'

export const Todos = element((items = [{ text: 'foo', done: false }]) => {
  const addTodo = text => Todos([...items, { text, done: false }])

  const toggleTodo = index =>
    Todos(map(items, (item, i) =>
      i === index ? { ...item, done: !item.done } : item))

  const removeTodo = index =>
    Todos(filter(items, (_, i) => i !== index))

  const submitForm = e => {
    e.preventDefault()
    const text = e.target.elements.todo?.value
    if (text) return addTodo(text)
  }

  return div(
    form(
      { onsubmit: submitForm },
      input({ name: 'todo', placeholder: 'What needs doing?', }),
      button({ type: 'submit' }, 'Add')),
    ul(...map(items, ({ text, done }, i) =>
      li({ style: `cursor: pointer; text-decoration: ${done ? 'line-through' : 'none'};` },
        span({ onclick: () => toggleTodo(i) }, text),
        button({ onclick: () => removeTodo(i) }, '✕')))))
})

