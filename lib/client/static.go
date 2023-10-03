package main

import "C"
import (
	"github.com/s21toolkit/s21client"
	"github.com/s21toolkit/s21client/requests"
)

//export TestCredentials
func TestCredentials(username, password *C.char) int {
	client := s21client.New(s21client.DefaultAuth(C.GoString(username), C.GoString(password)))

	_, err := client.R().GetCurrentUser(requests.GetCurrentUser_Variables{})

	if err != nil {
		return -1
	}

	return 1
}
