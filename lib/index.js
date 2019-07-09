const fs = require('fs') // https://nodejs.org/api/fs.html
const path = require('path') // https://nodejs.org/api/path.html
const chokidar = require('chokidar') // https://github.com/paulmillr/chokidar

class NamedExports {
  constructor(options) {
    this.rootPath = path.resolve(options.path)
    this.directories = []
    this.recursive =
      typeof options.recursive === 'undefined' ? true : options.recursive
    this.ignore = typeof options.ignore === 'undefined' ? [] : options.ignore
  }

  fileOrExtension(string) {
    return string.split('.')[0] === '' ? 'extension' : 'file'
  }

  fileOrFolder(string) {
    return string.indexOf('.') === -1 ? 'folder' : 'file'
  }

  ArrayOrString(variable) {
    return Array.isArray(variable) ? 'array' : 'string'
  }

  getExtension(file) {
    let re = /(?:\.([^.]+))?$/
    return '.' + re.exec(file)[1]
  }

  getBaseName(file) {
    return file.split('.')[0]
  }

  isDirectory(directory) {
    return fs.lstatSync(directory).isDirectory()
  }

  fetchDirectories() {
    // put root path in directories list to generate index.js
    this.directories = [this.rootPath]

    // includes subdirectories
    if (this.recursive) {
      fs.readdirSync(this.rootPath).forEach(i => {
        let directory = this.rootPath + '/' + i
        if (this.isDirectory(directory)) {
          this.directories.push(directory)
        }
      })
    }
  }

  makeExports() {
    for (let directory of this.directories) {
      let indexJS = directory + '/index.js'
      let content = []

      fs.readdirSync(directory).forEach(file => {
        // check if it's a file or folder
        if (this.fileOrFolder(file) === 'folder') return

        // check if the file is index.js
        if (file === 'index.js') return

        // check if file needs to be ignored
        let ignoreType = this.ArrayOrString(this.ignore)
        if (ignoreType === 'string') {
          if (this.fileOrExtension(this.ignore) === 'extension') {
            if (this.ignore.includes(this.getExtension(file))) return
          }

          if (this.fileOrExtension(this.ignore) === 'file') {
            if (this.ignore.includes(file)) return
          }
        }
        if (ignoreType === 'array') {
          if (this.ignore.includes(file)) return
          if (this.ignore.includes(this.getExtension(file))) return
        }

        // if all goes well, create a line
        let baseName = this.getBaseName(file)
        let line =
          'export { default as ' + baseName + ' } from "./' + file + '"'

        content = [...content, line]
      })

      // if content array is not empty, create index.js
      if (content.length > 0) {
        fs.writeFile(indexJS, content.join('\n'), 'utf8', function(err) {
          if (err) {
            return console.log(err)
          }
        })
        // if content array is empty,
      } else {
        //check if index.js exists,
        if (fs.existsSync(indexJS)) {
          // if exists, delete
          fs.unlink(indexJS, err => {
            if (err) throw err
          })
        }
      }
    }
  }

  apply(compiler) {
    // run only once in the first build
    compiler.hooks.entryOption.tap('NamedExports', (compiler, entry) => {
      // defines directories within root path
      this.fetchDirectories()

      // generates an `index.js` within each directory
      this.makeExports()

      // watch changes within root path directory
      // any file created, renamed, or deleted, except of type index.js
      // calls the above functions
      chokidar
        .watch(this.rootPath, { ignoreInitial: true })
        .on('all', (event, filename) => {
          if (event !== 'add' && event !== 'unlink') return
          if (event === 'add' && path.basename(filename) === 'index.js') return
          this.fetchDirectories()
          this.makeExports()
        })
    })
  }
}

module.exports = NamedExports
