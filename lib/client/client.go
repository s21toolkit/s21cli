package main

import "C"
import (
	"runtime/cgo"
	"time"

	"github.com/golang-module/carbon/v2"
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

func getCurrentBooking(events requests.Data_GetAgendaEvents) *requests.Data_GetMyAgendaEvent_GetAgendaEvents {
	bookings := []requests.Data_GetMyAgendaEvent_GetAgendaEvents{}

	for _, event := range events.Data_Student_GetAgendaEvents.GetMyAgendaEvents {
		if event.Data_AgendaItemContext_GetAgendaEvents.EntityType != "BOOKING" {
			continue
		}

		startTime, err := time.Parse(time.RFC3339, event.Start)

		if err != nil || time.Now().Before(startTime) {
			continue
		}

		bookings = append(bookings, event)
	}

	if len(bookings) > 0 {
		return &bookings[0]
	}

	return nil
}

//export ClientGetPeerReviewSSHLink
func ClientGetPeerReviewSSHLink(handle uintptr) *C.char {
	client := useClient(handle)

	events, err := client.R().GetAgendaEvents(requests.Variables_GetAgendaEvents{
		From:  carbon.Now().ToIso8601String(),
		To:    carbon.Now().AddMinutes(15).ToIso8601String(),
		Limit: 10,
	})

	if err != nil {
		return nil
	}

	currentBooking := getCurrentBooking(events)

	if currentBooking == nil {
		return nil
	}

	review, err := client.R().GetAgendaP2P(requests.Variables_GetAgendaP2P{
		BookingID: currentBooking.Data_AgendaItemContext_GetAgendaEvents.EntityID,
	})

	if err != nil {
		return nil
	}

	checklist, err := client.R().CreateFilledChecklist(requests.Variables_CreateFilledChecklist{
		StudentAnswerID: *review.Data_Student_GetAgendaP2P.Data_GetEnrichedBooking_GetAgendaP2P.AnswerID,
	})

	if err != nil {
		return nil
	}

	return C.CString(checklist.Data_Student_CreateFilledChecklist.Data_CreateFilledChecklist_CreateFilledChecklist.Data_GitlabStudentProjectURL_CreateFilledChecklist.SSHLink)
}
