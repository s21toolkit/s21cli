package main

import "C"
import (
	"runtime/cgo"

	"github.com/s21toolkit/s21client"
	"github.com/s21toolkit/s21client/requests"
)

//export ClientCreate
func ClientCreate(username, password *C.char) uintptr {
	client := s21client.New(s21client.DefaultAuth(C.GoString(username), C.GoString(password)))

	return uintptr(cgo.NewHandle(client))
}

//export ClientDestroy
func ClientDestroy(handle uintptr) {
	cgo.Handle(handle).Delete()
}

//export ClientTestCredentials
func ClientTestCredentials(handle uintptr) int {
	client := useClient(handle)

	_, err := client.R().GetCurrentUser(requests.Variables_GetCurrentUser{})

	if err != nil {
		return -1
	}

	return 1
}
