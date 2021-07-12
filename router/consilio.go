package router

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/google/martian/v3/log"
	"github.com/hashicorp/hcl/hcl/printer"
	jsonParser "github.com/hashicorp/hcl/json/parser"
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
	s.router.GET("/test", s.mw(s.convertJSON()))

	// API endpoints
	s.router.GET("/api", s.mw(s.handleGetAPI()))
	s.router.OPTIONS("/api", s.mw(s.handleGetAPI()))

	static := httprouter.New()
	static.ServeFiles("/*filepath", http.Dir("static"))

	s.router.NotFound = static
}

func (s *ConsilioRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}

func (s *ConsilioRouter) mw(next httprouter.Handle) httprouter.Handle {
	return s.log(next)
}

func (s *ConsilioRouter) convertJSON() httprouter.Handle {
	return func(rw http.ResponseWriter, r *http.Request, p httprouter.Params) {
		type test struct {
			Name string
			Body string
			Time int64
		}
		x := test{}

		input, err := json.Marshal(x)
		if err != nil {
			log.Errorf("Failed to marshal JSON: %s", err)
		}

		ast, err := jsonParser.Parse([]byte(input))
		if err != nil {
			log.Errorf("unable to parse JSON: %s", err)
		}

		err = printer.Fprint(os.Stdout, ast)
		if err != nil {
			log.Errorf("unable to print HCL: %s", err)
		}
	}
}
