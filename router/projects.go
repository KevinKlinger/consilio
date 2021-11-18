package router

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (s *ConsilioRouter) handleCreateProject() httprouter.Handle {
	return func(rw http.ResponseWriter, r *http.Request, p httprouter.Params) {
		// TODO create a new project in the DB and to return the ID
	}
}

func (s *ConsilioRouter) handleUpdateProject() httprouter.Handle {
	return func(rw http.ResponseWriter, r *http.Request, p httprouter.Params) {
		//projectID := p.ByName("id")
		// TODO overwrite the config for the given project
	}
}

func (s *ConsilioRouter) handleGetProject() httprouter.Handle {
	return func(rw http.ResponseWriter, r *http.Request, p httprouter.Params) {
		//projectID := p.ByName("id")
		// TODO read in information for the project with the given ID
	}
}

func (s *ConsilioRouter) handleGetAllProjects() httprouter.Handle {
	return func(rw http.ResponseWriter, r *http.Request, p httprouter.Params) {
		// TODO return all projects of the given user
	}
}
