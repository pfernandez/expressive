# Expressive JS

A new project that (so far anyway), is split into two totally separate, complimentary parts:

* A toolkit for creating web interfaces. Let's call it _elements.js_.
* A suite of utility functions featuring a Lisp-style interpreter for JavaScript arrays. How about _functions.js_?

I may break these into separate libraries at some point, but for now they live together for convenience. They'll be "done" when I've proven to myself that they add something of value to the JavaScript landscape (and when I've built something substantial enough with them to prove production-readiness).

**This is still a just a brain dump**, an evolving group of ideas still in the process of formation. For the most part the code does work as described, but it's constantly evolving too.

# Elements.js

The idea is to compose the UI with _function elements_ that emit HTML, creating a structure that immediately generates the real DOM. Running the code below will render a web page.

## Hello World
```js
import './expressive/global.js'

html(
  head(
    title('Expressive'),
    link({ rel: 'icon', href: 'img/favicon.ico' })),
  body(
    { style:
      { background: '#222',
        color: '#eee',
        textAlign: 'center' } },
    main(
      h1('Hello World'))))
```

### Modular CSS

There's no reason we shouldn't use the CSS modules approach here, and we can certainly use the CSS Modules library if desired. But why not simply move our styles into a normal JavaScript object in a separate file? This may or may not be a good idea, but it deserves some exploration to see what problems will arise.

```js
import style from './style.js'

const { container } = style 

body({ style: container }, main(h1('Hello World'))
```

## Stateless Components

**State really only _must_ exist in two places, neither of which is our component:**

1. In persistent storage such as a database server.
2. In the state rendered on the screen.

The code itself also may carry "state" as default function arguments or in separate fixtures. While not stricly necessary, these values can be useful while waiting for results from an API, for unit testing, and to enable static type checking in an otherwise dynamic system. We'll explore this idea more later.

### A Simple Recursive Counter

Any function that returns an element can be composed together with elements, allowing us to create components analagous to those in React.js. But instead of mutating state to reload an element like we would in a React app, we simply call the component directly, with new arguments.

If a function element is called while it already exists on the page, any changes to its input arguments (or those of its child elements) will cause a corresponding update on the screen.

```js
import { body, div, pre, button } from './expressive/elements.js'

const counter = (count = 0) =>
  div(
    pre(count),
    button(
      { onclick: () => counter(count + 1) },
      'Increment'))

body(counter())
```

A function element can take any number of children, and accepts an optional object of [DOM properties](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement#properties) as a first argument.

### Selecting DOM Elements

While we can compare function elements to React components, they also have a similarity to jQuery selectors.

The counter example above, if included in a larger web page, would have updated every `<div>` on the page. To target a specific element or group of elements, pass it an ID or class name.

```js
const counter = (id = 'counter-1', count = 0) =>
  div({ id },
    pre(count),
    button(
      { onclick: () => counter({ id }, count + 1) },
      'Increment'))

body(counter())
```

### Web Components

Another option is to use the `element` function (which elements.js uses internally to generate the default elements) to generate a web component. With this approach, an actual `<counter />` element will be inserted into the DOM. An advantage to doing it this way is that the element name itself acts as a unique `tagName` selector.

```js
import { element } from './expressive/elements.js'

const counter = (count = 0) =>
  element('counter',
    div(
      pre(count),
      button(
        { onclick: () => counter(count + 1) },
        'Increment')))
```

### API Data

After loading the app with initial arguments, we might want to render it again with data fetched or computed asychronously. Let's replace the start count again, this time with an API response that returns `{ count: 1 }`.

```js
fetch('/data')
  .then(response => response.json())
  .then(({ count }) => counter(count))
```

Our counter now begins at `1` instead of `0`.

Notice that the functional purity of our component is preserved because we've limited the side effect to a thin external function-- devoid of internal logic-- that _passes data into_ the component as an argument.


### Alternatively...

Although immediately selecting and rendering a function element reduces the syntax needed to update the document, it may be too "magical". An alternative implementation is to keep the actual DOM mutations explicit.

```js
import { body, div, pre, button, append, replace } from './expressive/elements.js'

const counter = (count = 0) =>
  div({ id: 'counter-1' },
    pre(count),
    button(
      { onclick: () => replace('#counter-1', counter(count + 1)) },
      'Increment'))

append(body, counter())
```

Here `body`, `append`, and `replace` are just syntactic sugar for `document.body.append()` and `document.querySelector('#id').replaceWith()`. This approach also simplifies the implementation of the function elements-- they're now just a fairly thin wrapper around `document.createElement()`.

# Functions.js

This project began as an exploration of Lisp, lambda calculus, and functional programming. I wondered if it might be possible to implement a list processor using arrays, in order to gain the benefits of a Lisp syntax while being able to levarage all of the libraries we know and love because _it's just JavaScript_.

## `evaluate(array)`

The `evaluate` function works much like the core Lisp function `eval`, which recursively evaluates a tree of nested lists.

Given the functions `log(x)` and `sum(x, y)`,

```js
import { evaluate, log, sum } from './expressive/functions.js'

evaluate(
  [log,
    1,
    [sum, 1, 1],
    [sum,
      1,
      [sum, 1, 1]]])
```

will log `1 2 3` to the console.

* If first element in the array is a function, the array is a _function application_. The remaining elements will be passsed to it as arguments.
* Any arguments that are themselves function applications will be evaluated first, and so on down the tree.
* Arrays without a leading function are treated as data and returned unaffected. Any function applications they contain will _not_ be evaluated.

### Data as Code

Let's use our function elements as we did before, but this time refrain from immediately evaluating the code.

```js
const app =
  [html,
    [doctype, 'html'],
    [head,
      [title, 'Expressive'],
      [link, { rel: 'icon', href: 'img/favicon.ico' }]],
    [body,
      { style:
        { background: '#222',
          color: '#eee',
          textAlign: 'center' } },
      [main,
        [h1, 'Recursive counter'],
        [counter, 0]]]]
```

Now, because the app code is represented as data, we can change the structure of the code using plain JavaScript as a meta-language. In this case, we'll update the UI between render cycles by creating a copy of the application with the start of 2 instead of 0.

```js
const app2 = deepMap(app, node => node === 0 ? 2 : node)

evaluate(app2)
```

And now the counter begins at 2. See the **Why Bother...** section below for a bit more on this topic and its relationship to Lisp macros.

# Utilities

I found myself adding utility functions to facilitate function composition (as opposed to sequential, procedural statements), to avoid mutation when it isn't really necessary, and to remove the visual noise of dot-property accessors. For example, `console.log(a, b, ...)` is exported as `log(a, b, ...)`. The final argument is returned, allowing us to transparently wrap a function while logging to the console. `reverse()` is implemented as `[...array].reverse()`, producing a new array rather than modifying the original array in place. `Object.keys(object)` becomes `keys(object)`, `array.map(fn)` becomes `map(array, fn)`, and so on.

## A Simpler, More Readable Syntax

Take the definition of `deepMap`. With plain ES6, the most concise, purely functional way I could come up with to write it was

```js
export const deepMap = (value, fn) =>
  Array.isArray(value)
    ? value.map(v => deepMap(v, fn))
    : typeof value === 'object' && value !== null
      ? Object.entries(object).reduce((o, [k, v]) => ({ ...o, [k]: fn(v) }), {})
      : fn(value)
```

Not terrible, but the underlying object-oriented implementation of JavaScript clutters it with unnecessary information. Why do we need to express that `entries` is a property of the `Object` prototype? Why are we checking for `null`? And that `reduce` is just a hard-to-read way of creating one object from another. _functions.js_ cleans it up.

```js
export const deepMap = (value, fn) =>
  isArray(value) ? map(value, v => deepMap(v, fn))
    : isObject(value) ? omap(value, v => deepMap(v, fn))
      : fn(value)
```

## Functions Provided

The list of functions is, of course, evolving, but at the time of this writing the signatures are

* `and(x, y)`
* `append(value, array)`
* `apply(fn, array)`
* `bool(value)`
* `deepMap(value, fn)`
* `each(array, fn)`
* `entries(object)`
* `eq(x, y)`
* `evaluate(array)`
* `every(...values)`
* `exists(value)`
* `filter(array, fn)`
* `find(array, fn)`
* `first(array)`
* `globalize(object)`
* `identity(value)`
* `ifElse(value, then, otherwise)`
* `isArray(value)`
* `isEmpty(value)`
* `isFunction(value)`
* `isInstance(value, type)`
* `isObject(value)`
* `join(array, separator)`
* `keys(object)`
* `lastarray`
* `length(array)`
* `log(...values)`
* `map(array, fn)`
* `not(value)`
* `omap(object, fn)`
* `omit(object, key)`
* `or(x, y)`
* `partial(fn, ...values)`
* `reduce(array, fn, value)`
* `rest(array)`
* `reverse(array)`
* `slice(array, start, end)`
* `some(array, fn)`
* `split(array, separator, limit)`
* `sum(...values)`
* `type(value, type)`
* `walk(root, f)`

**Why bother creating functions like `and()`, `not()`, and `ifElse()`?**

Some might feel that a syntax composed of nothing but functions is beautiful in its simplicity, even if it is a bit more verbose. But perhaps more importantly...

### Deferred Evaluation, Metaprogramming, and Lisp Macros

Consider the **Data as Code** section above. If you want to include (say) a conditional expression, we'd normally write it like so:

```js
const twoOrThree = [sum, 1, x ? 1 : 2]
```

Now imagine we wanted to change the value `2` to `3`. If `x` is `true`, we'd be unable to do so because the expression `x ? 1 : 2` will immediately evaluate to `1`. But if we write

```js
const twoOrThree = [sum, 1, [ifElse, x, 1, 2]]
```

we _can_ change `2` to `3` because we've converted the conditional expression to a function application, which is really just an array of data.

It may or may not be possible to realize the full power of Lisp macros while limiting ourselves to native JavaScript. But it's instructive to see how far we can get. Is escaping and unescaping code really the only way to write a macro? What are the limits of treating code as data by decomposing it into small functions instead? Could a self-improving machine learning algorithm be written this way?
