package router

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/kevinklinger/consilio/model"
	"github.com/kevinklinger/consilio/router/alicloud"
	libvirt "github.com/kevinklinger/consilio/router/kvm"
	"github.com/pkg/errors"
)

func (s *ConsilioRouter) handleGetAPI() httprouter.Handle {
	return func(rw http.ResponseWriter, r *http.Request, p httprouter.Params) {
		queryValues := r.URL.Query()
		provider := queryValues.Get("provider")
		var fields []model.DynamicElement

		switch provider {
		case "libvirt":
			fields = libvirt.GetLibvirtFields()
		case "azure":
			rw.Header().Set("Content-Type", "application/json")
			rw.WriteHeader(http.StatusOK)

		case "alicloud":
			fields = alicloud.GetAliCloudFields()
		default:
			rw.WriteHeader(http.StatusBadRequest)
			_, _ = rw.Write([]byte("Missing parameter 'provider'"))
			return
		}

		rw.Header().Set("Content-Type", "application/json")
		rw.WriteHeader(http.StatusOK)

		output, err := json.MarshalIndent(fields, "", "\t")
		if err != nil {
			log.Panicln(errors.WithStack(err))
		}
		_, _ = rw.Write(output)
	}
}
