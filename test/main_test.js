"use strict"

let assert = require('chai').assert

let bluemonday = require('../index')

let input = '<a onblur="alert(secret)" href="http://www.google.com">Google</a><p>Yo</p>'
let sanitized = '<a href="http://www.google.com" rel="nofollow">Google</a><p>Yo</p>'
let sanitizedNoHref = 'Google<p>Yo</p>'

describe('Basic markdown', function() {
  it('should work with UGCPolicy', function(done) {
    let p = bluemonday.UGCPolicy()
    let html = p.Sanitize(input)
    assert.equal(html, sanitized)
    done()
  })
  it('should work with a custom policy', function(done) {
    let p = bluemonday.NewPolicy()
    p.AllowElements("p")
    let html = p.Sanitize(input)
    assert.equal(html, sanitizedNoHref)
    done()
  })
})

