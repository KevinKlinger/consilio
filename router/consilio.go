package router

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func NewConsilioRouter() *ConsilioRouter {
	router := &ConsilioRouter{
		router: httprouter.New(),
	}
	router.routes()
	return router
}

type ConsilioRouter struct {
	router *httprouter.Router
}

func (s *ConsilioRouter) routes() {

	// Metadata endpoints
	s.router.GET("/service", s.mw(s.handleGetService()))
	s.router.GET("/health", s.mw(s.handleGetHealth()))
	s.router.GET("/version", s.mw(s.handleGetVersion()))

	// Action endpoints
	// TODO receive config here and deploy/destroy/update with Terraform

	// API endpoints
	s.router.GET("/api", s.mw(s.handleGetAPI()))
}

func (s *ConsilioRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}

func (s *ConsilioRouter) mw(next httprouter.Handle) httprouter.Handle {
	return s.log(next)
}
