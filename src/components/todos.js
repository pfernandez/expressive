import { button, div, element, input, li, span, ul } from '../lib/expressive/elements.js'
import { filter, map } from '../lib/expressive/functions.js'

const Todos = element(
  (state = { items: [], input: '' }) => {
    const addTodo = () =>
      state.input.trim()
        ? Todos({
          ...state,
          items: [...state.items, { text: state.input.trim(), done: false }],
          input: ''
        })
        : Todos(state)

    const toggleTodo = index =>
      Todos({
        ...state,
        items: map(state.items, (item, i) =>
          i === index ? { ...item, done: !item.done } : item
        )
      })

    const removeTodo = index =>
      Todos({
        ...state,
        items: filter(state.items, (_, i) => i !== index)
      })

    const updateInput = _ =>
      Todos({ ...state, input: document.querySelector('input')?.value ?? '' })

    return div(
      input({
        type: 'text',
        placeholder: 'What needs doing?',
        value: state.input,
        oninput: updateInput,
        onkeydown: e => (console.log({e}), e.key === 'Enter' && addTodo())
      }),
      button({ onclick: addTodo }, 'Add'),
      ul(
        ...map(state.items, (item, i) =>
          li(
            {
              style: `text-decoration: ${item.done ? 'line-through' : 'none'};`
            },
            span({ onclick: () => toggleTodo(i), style: 'cursor: pointer;' }, item.text),
            button({ onclick: () => removeTodo(i) }, '✕')
          )
        )
      )
    )
  }
)

export default Todos

