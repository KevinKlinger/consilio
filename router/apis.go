package router

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/julienschmidt/httprouter"
	libvirt "github.com/kevinklinger/consilio/router/kvm"
	"github.com/pkg/errors"
)

func (s *ConsilioRouter) handleGetAPI() httprouter.Handle {
	return func(rw http.ResponseWriter, r *http.Request, p httprouter.Params) {
		queryValues := r.URL.Query()
		provider := queryValues.Get("provider")

		switch provider {
		case "libvirt":
			rw.Header().Set("Content-Type", "application/json")
			rw.WriteHeader(http.StatusOK)

			fields := libvirt.GetLibvirtFields()
			output, err := json.MarshalIndent(fields, "", "\t")
			if err != nil {
				log.Panicln(errors.WithStack(err))
			}
			_, _ = rw.Write(output)
		default:
			rw.WriteHeader(http.StatusBadRequest)
			_, _ = rw.Write([]byte("Missing parameter 'provider'"))
			return
		}
	}
}
