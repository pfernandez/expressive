
const counter = (id, count) =>
  div(
    { id,
      style: { fontSize: '3em',
               maxWidth: '250px',
               textAlign: 'center' } },
    pre(
      {},
      count),
    button(
      { onclick: () => counter(id, count + 1) },
      'Increment'))

export default counter

