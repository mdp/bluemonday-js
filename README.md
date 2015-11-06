# bluemonday-js
![Travis status](https://travis-ci.org/mdp/bluemonday-js.svg)

A golang -> javascript compiled version of the excellent [bluemonday](https://github.com/microcosm-cc/bluemonday) HTML sanitizer

## Install

`npm install bluemonday`

## Usage

Works exactly like the golang version of bluemonday

```
var p = bluemonday.UGCPolicy()
var html = p.Sanitize(
    `<a onblur="alert(secret)" href="http://www.google.com">Google</a>`,
)
// Output:
// <a href="http://www.google.com" rel="nofollow">Google</a>
```

## Credit

All credit goes to [bluemonday](https://github.com/microcosm-cc/bluemonday) and the [GopherJS](https://github.com/gopherjs/gopherjs) project for making this possible; I simply packaged it for npm.

----

# Turning GoLang code into an npm module with GopherJS

Rather than write up a seperate blog post about this, I thought I'd just stick it into the repo to keep things simple.

See the code [here](https://github.com/mdp/bluemonday-js)

### Intro

GopherJs compiles go to JavaScript and it works incredibly well for most projects. That being said, I didn't find any guides on how best to integrate that process into a modular JavaScript codebase. I built this project mostly as a demo of how to take go code and turn it into an npm module that can be used in Node or a modern browser.

My goals for this demonstration project are as follows:

- Write go code that can be used from JavaScript
- Package the code in an npm module
- Write unit tests for the generated javascript code
- Build and test the package using Travis
- Deploy the package to npmjs.com's public repo

### Structure

```
-- bluemonday-js
  \- index.js 		<-- Our compiled go code
  \- test 			<-- Unit tests for the javascript code
  \- go 			<-- Directory containing all our go code
  \- package.json 	<-- NPM's package.json
  \- Makefile 		<-- the Makefile for Travis to build and test our repo
  \- .gitignore 	<-- We ignore the index.js to prevent checking in generated code
  \- .npmigonre 	<-- No need to have NPM include the go code in the package
  \- .travis.yml 	<-- Travis setup
```

### The GoLang code

In this project I'm simply wrapping the [bluemonday](https://github.com/microcosm-cc/bluemonday) HTML sanitizer library with the necessary code to expose it in JavaScript.

Since this will become a CommonJS module, we need to 'export' the functions we want to expose, just like in JS land. GopherJS provides a way to get global objects, so it's just a matter of grabbing `exports` and setting the properties like so:

```go
func myGoFunc() string {
  return "I'm written in go"
}
func main() {
	js.Module.Get("exports").Set("myGoFunc", myGoFunc)
}
```

Now on the JS side, when we require the generated JS code, we'll be able to call `myGoFunc` just like you would expect.

The next step is wrapping and returning a more complex type rather than just a `string`. In my case I want to expose bluemonday's instance of the `Policy` struct to Javascript

```go
func UGCPolicy(name string) *js.Object {
  return js.MakeWrapper(bluemonday.UGCPolicy())
}

func main() {
  js.Module.Get("exports").Set("UGCPolicy", UGCPolicy)
}
```

Here bluemonday will return the `*Policy` object when we call UGCPolicy, and we will then wrap it using Gopher's `MakeWrapper` function.

Calling it from Node/JavaScript is then simply:

```js
let bluemonday = require('bluemonday')
let p = bluemonday.UGCPolicy()
let html = p.Sanitize('"<a onblur="alert(secret)" href="http://google.com">Dangerous Input</a>"')
```

### Build and Test process

The build process is simple with GopherJS:

`gopherjs build go/main.go -o index.js`

We build the main.go file and output it to index.js.

Next, we can run our tests directly against the index.js that we just outputted. In my case I use mocha, so the tests look something like:

```js
let assert = require('chai').assert
let bluemonday = require('../index')

let input = '<a onblur="alert(secret)" href="http://www.google.com">Google</a><p>Yo</p>'
let sanitized = '<a href="http://www.google.com" rel="nofollow">Google</a><p>Yo</p>'

describe('Basic markdown', function() {
  it('should work with UGCPolicy', function(done) {
    let p = bluemonday.UGCPolicy()
    let html = p.Sanitize(input)
    assert.equal(html, sanitized)
    done()
  })
})
```

#### Travis CI

This ones a little less obvious. We have a bit of a Frankenstein project here; we want to test the JS code, but we also want Travis to build the JS code from our go code first. We could include the compiled JS in the repo, but I'd like to avoid that.

Therefore, the requirements are a test image capable of running go >= 1.5 and Node.js. In my experimenting with Travis we can easily get this by asking for a 'go' container with version 1.5 and then manually installing Node.js via `nvm`.

My .travis.yml looks like this.

```yaml
language: go

go:
  - 1.5

before_script:
  - nvm install 5.0; npm install

install:
  - go get github.com/microcosm-cc/bluemonday
  - go get github.com/gopherjs/gopherjs
```

This should all be fairly obvious. The next step is running the tests. In a 'go' project Travis will run `go test` unless there is a Makefile present, in which case it will simple run `make`. We will therefore need a Makefile to kick off the mocha tests. It's pretty simple:

```make
all: test

test:
	npm run build; npm test

.PHONY: all test

```

I'm calling the npm cli to run two scripts as part of the test. I have those scripts inside my package.json file as follows:

1. `"build": "gopherjs build go/main.go -m -o index.js"`
1. `"test": "mocha --compilers js:babel-core/register test/*_test.js"`

### Deploying to npm

There are plenty of articles on how to do this (Basically `npm publish`), so I'll just point out a one caveat.

I use `.gitignore` to prevent our compiled JS code from ending up in source control. npm will therefore also ignore the compiled code when it packages up the module, so we will need to use a `.npmignore` file to negate this. In the `.npmignore` I'm also excluding our go source from getting packaged.

```
/go
```

Now we have the git repo ignoring our compiled JS, and the npm package including it but excluding the go source code from the distributed module.

### Conclusion

This all works surprisingly well. The module we end up with can be consumed by anyone via NPM and the process is farily easy once it's setup. I hope this helps anyone looking to do something similar. Feel free to file a pull request if you have anything to add.
