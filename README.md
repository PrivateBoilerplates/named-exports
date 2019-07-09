# named-exports

> A Webpack Plugin for making `named exports` from a directory.

## Usage

This Webpack Plugin exports all modules from a directory (except `index.js`) into a dictionary suited for for you to do grouped and named imports using `import {}`. The module names will be the file name itself.

This plugin uses a `Webpack Compiler Hooks` to call a function during the `compilation` process that will make the named exports, also uses the `chokidar` to watch changes made to the chosen path and handle the changes, that is, when you `create`, `edit` or `rename` a module.

## Getting started

Install with npm:

```bash
npm i named-exports
```

In your `webpack.config.js` file:

```js
const NamedExports = require('named-exports')

module.exports = {
  // ... other config here ...
  plugins: [
    // ... other plugins here ...
    new NamedExports({ path: 'src/components' })
  ]
}
```

Then an `index.js` is generated in `src/components/index.js`

```js
export { default as ButtonStyled } from './ButtonStyled.vue'
export { default as InputStyled } from './InputStyled.vue'
```

Now you can make grouped and named imports

```js
import { ButtonStyled, InputStyled } from '@/components/atoms/'
```

## Options

You can use some options to make it more fun.

- `recursive: Boolean` (default `true`)

To watch the subdirectories.

  ```js
  // watch only in the component directory
  new NamedExports({
    path: 'src/components',
    recursive: false
  })

  // watch all folders on the first level within components
  // result 'src/components/folder/index.js'
  new NamedExports({
    path: 'src/components',
    recursive: true
  })
  ```

- `ignore: Array | String`

Defines files to be ignored, you can pass the full file name or extension.

  ```js
  // ignores all files with the .css extension
  new NamedExports({
    path: 'src/omponents',
    ignore: '.css'
  })

  // ignores the test.js file
  new NamedExports({
    path: 'src/omponents',
    ignore: 'test.js'
  })

  // ignores the test.js file and all files with .css extension
  new NamedExports({
    path: 'src/omponents',
    ignore: ['test.js', '.css']
  })
  ```


## Contributors

[Vitor Leonel](https://github.com/vitorleonel/)

Contributions of any kind welcome!


## License

MIT

Copyright (c) [Yung Silva](https://yungsilva.com)
