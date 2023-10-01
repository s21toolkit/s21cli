package main

import (
	"runtime/cgo"

	"github.com/s21toolkit/s21client"
)

type Client = *s21client.Client

func useClient[T ~uintptr](handle T) Client {
	return cgo.Handle(handle).Value().(*s21client.Client)
}
