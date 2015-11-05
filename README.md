# BlueMonday-JS

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

## GopherJS

More details about the gopher setup here
