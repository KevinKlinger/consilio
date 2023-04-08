package router

import (
	"encoding/json"
	"github.com/julienschmidt/httprouter"
	"github.com/kevinklinger/consilio/internal/pkg/statemanager"
	"github.com/kevinklinger/consilio/model"
	"github.com/pkg/errors"
	"io"
	"log"
	"net/http"
)

func (s *ConsilioRouter) handleGetAPI() httprouter.Handle {
	return func(rw http.ResponseWriter, r *http.Request, p httprouter.Params) {
		queryValues := r.URL.Query()
		provider := queryValues.Get("provider")
		var fields []model.DynamicElement

		switch provider {

		case "azure":
			rw.Header().Set("Content-Type", "application/json")
			rw.WriteHeader(http.StatusOK)

		//case "alicloud":
		//fields = alicloud.GetAliCloudFields()
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

func (s *ConsilioRouter) deleteImportStateHandler() httprouter.Handle {
	return func(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
		err := request.ParseMultipartForm(10 * 1024 * 1024)
		if err != nil {
			writer.WriteHeader(http.StatusBadRequest)
			_, _ = writer.Write([]byte(err.Error()))
			return
		}

		stateFile, _, err := request.FormFile("stateFile")
		if err != nil {
			writer.WriteHeader(http.StatusBadRequest)
			_, _ = writer.Write([]byte(err.Error()))
			return
		}
		defer stateFile.Close()

		stateFileContent, err := io.ReadAll(stateFile)
		if err != nil {
			writer.WriteHeader(http.StatusBadRequest)
			_, _ = writer.Write([]byte(err.Error()))
			return
		}

		err = statemanager.DeleteState(stateFileContent)
		if err != nil {
			writer.WriteHeader(http.StatusBadRequest)
			_, _ = writer.Write([]byte(err.Error()))
			return
		}

		writer.WriteHeader(http.StatusNoContent)
	}
}
