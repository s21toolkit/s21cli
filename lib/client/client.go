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

	_, err := client.R().GetCurrentUser(requests.GetCurrentUser_Variables{})

	if err != nil {
		return -1
	}

	return 1
}

func getCurrentBooking(events requests.GetAgendaEvents_Data) *requests.GetAgendaEvents_Data_GetMyAgendaEvent {
	bookings := []requests.GetAgendaEvents_Data_GetMyAgendaEvent{}

	for _, event := range events.Student.GetMyAgendaEvents {
		if event.AgendaItemContext.EntityType != "BOOKING" {
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

	events, err := client.R().GetAgendaEvents(requests.GetAgendaEvents_Variables{
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

	review, err := client.R().GetAgendaP2P(requests.GetAgendaP2P_Variables{
		BookingID: currentBooking.AgendaItemContext.EntityID,
	})

	if err != nil {
		return nil
	}

	checklist, err := client.R().CreateFilledChecklist(requests.CreateFilledChecklist_Variables{
		StudentAnswerID: *review.Student.GetEnrichedBooking.AnswerID,
	})

	if err != nil {
		return nil
	}

	return C.CString(checklist.Student.CreateFilledChecklist.GitlabStudentProjectURL.SSHLink)
}
