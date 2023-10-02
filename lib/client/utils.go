package main

import (
	"runtime/cgo"

	"github.com/s21toolkit/s21client"
)

func useHandle[TTarget any, THandle ~uintptr](handle THandle) TTarget {
	return cgo.Handle(handle).Value().(TTarget)
}

type Client = *s21client.Client

func useClient[T ~uintptr](handle T) Client {
	return useHandle[Client](handle)
}
