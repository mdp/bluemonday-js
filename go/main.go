package main

import (
	"github.com/gopherjs/gopherjs/js"
	"github.com/microcosm-cc/bluemonday"
)

func UGCPolicy(name string) *js.Object {
	return js.MakeWrapper(bluemonday.UGCPolicy())
}

func NewPolicy(name string) *js.Object {
	return js.MakeWrapper(bluemonday.NewPolicy())
}

func main() {
	js.Module.Get("exports").Set("NewPolicy", NewPolicy)
	js.Module.Get("exports").Set("UGCPolicy", UGCPolicy)
}
