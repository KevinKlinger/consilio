package router

import (
	"fmt"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

var version string

func (s *ConsilioRouter) handleGetService() httprouter.Handle {
	return func(rw http.ResponseWriter, r *http.Request, p httprouter.Params) {
		rw.Header().Set("Content-Type", "application/json")
		rw.WriteHeader(http.StatusOK)
		_, _ = rw.Write([]byte("{\"service\":\"Consilio\"}\n"))
	}
}

func (s *ConsilioRouter) handleGetHealth() httprouter.Handle {
	return func(rw http.ResponseWriter, r *http.Request, p httprouter.Params) {
		rw.Header().Set("Content-Type", "application/json")
		rw.WriteHeader(http.StatusOK)
		_, _ = rw.Write([]byte("{\"health\":\"healthy\"}\n"))
	}
}

func (s *ConsilioRouter) handleGetVersion() httprouter.Handle {
	return func(rw http.ResponseWriter, r *http.Request, p httprouter.Params) {
		rw.Header().Set("Content-Type", "application/json")
		rw.WriteHeader(http.StatusOK)

		if version == "" {
			_, _ = rw.Write([]byte(fmt.Sprintf("{\"version\":\"%s\"}\n", "Unknown version")))
			return
		}
		_, _ = rw.Write([]byte(fmt.Sprintf("{\"version\":\"%s\"}\n", version)))
	}
}
