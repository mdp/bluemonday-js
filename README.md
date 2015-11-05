# BlueMonday-JS
![Travis status](https://travis-ci.org/mdp/bluemonday-js.svg)

A golang -> javascript compiled version of the excellent [Bluemonday](https://github.com/microcosm-cc/bluemonday) HTML sanitizer

## Install

`npm install bluemonday`

## Usage

Works exactly like the golang version of Bluemonday

```
var p = bluemonday.UGCPolicy()
var html = p.Sanitize(
    `<a onblur="alert(secret)" href="http://www.google.com">Google</a>`,
)
// Output:
// <a href="http://www.google.com" rel="nofollow">Google</a>
```

## Credit

All credit goes to [Bluemonday](https://github.com/microcosm-cc/bluemonday) and the [GopherJS](https://github.com/gopherjs/gopherjs) project for making this possible; I simply packaged it for npm.

## Turning GoLang code into an NPM module with GopherJS

Rather than write up a seperate blog post about this, I thought I'd just stick it into the repo to keep things simple.

### Intro

GopherJs compiles go to JavaScript and it works incredibly well for most projects. That being said, I didn't find any guides on how best to integrate that process into a modular JavaScript codebase. I built this project mostly as a demo of how to take go code and turn it into an NPM module that can be used in Node or a modern browser.

### Structure

At the root we simply have a standard NPM module layout. `index.js` will be out entrypoint to the code and the `test` subdirectory will hold our unit tests. `index.js` will be compiled from the code sitting in the subdirectory `go`

### The GoLang code

In this project I'm simply wrapping the bluemonday library with the necessary code to expose it in JavaScript.

Since this will become a node module, we need to 'export' the functions we want to expose, just like in JS land. GopherJS provides a way to get global object, so it's just a matter of grabbing `exports` and setting the properties like so:

```go
func myFunc() string {
  return "Hello"
}
func main() {
	js.Module.Get("exports").Set("myFunc", myFunc)
}
```

Now on the JS side, when we require generate JS code, we'll be able to call `myFunc` just like you would expect.

The next step is wrapping and returning a more complex type rather than just a `string`. In my case I want to expose Bluemonday's instance of the `Policy` struct to Javascript

```go
func UGCPolicy(name string) *js.Object {
  return js.MakeWrapper(bluemonday.UGCPolicy())
}

func main() {
  js.Module.Get("exports").Set("UGCPolicy", UGCPolicy)
}
```

Here bluemonday will return the `*Policy` object when we call UGCPolcy, and we will then wrap it using Gopher's `MakeWrapper` function. 

### Build and Test process

The build process is simple with GopherJS:

`gopherjs build go/main.go -o index.js`

We build the main.go file and output it to index.js.

Next, we can run our tests directly on the index.js that we just outputted. In my case I use mocha, so the tests look something like

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

This ones a little less obvious. We have a bit of a Frankenstein project here, we want to test the JS code, but we also would like Travis to build the JS code from our go code. We could include the compile JS in the repo, but I'd like to avoid that.

The requirements, then, are a test image capable of running go >= 1.5 and Node.js. In my experimenting with Travis we can only get this by asking for a 'go' container with version 1.5 and then manually installing Node.js via `nvm`.

My .travis.yml looks like this.

```yaml
language: go

go:
  - 1.5

before_script:
  - nvm install 5.0; npm install

install:
  - go get github.com/microcosm-cc/bluemonday
  - go get -u github.com/gopherjs/gopherjs
```

This should all be fairly obvious. The next step is running the tests. In a 'go' project Travis expects either a Makefile, or it will run `go test` by default. In our case need a Makefile to kick off the mocha tests. It's pretty simple:

```make
all: test

test:
	npm run build; npm test

.PHONY: all test

```

I'm simply calling out to npm to run two scripts as part of the test. I have those script inside my package.json file as follows:
1. `"build": "gopherjs build go/main.go -m -o index.js"`
1. `"test": "mocha --compilers js:babel-core/register test/*_test.js"`

### Conclusion

This all works surprisingly well. The module we end up with can be consumed by anyone via NPM andthe process is quite easy. I hope this helps anyone looking to do something similar. Feel free to file a pull request if you have anything to add.
