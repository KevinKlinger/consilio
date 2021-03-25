package router

import (
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/pkg/errors"
)

func getURL(r *http.Request) string {
	if r.URL == nil {
		return ""
	}
	return r.URL.String()
}

func decodeBody(r *http.Request, result interface{}) error {
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(result)
	if err != nil {
		log.Println(errors.WithStack(err))
		if err == io.EOF {
			err := errors.New("Request body not found")
			return err
		}
		return err
	}
	return nil
}
