package router

import (
	"log"
	"net/http"
	"time"

	"github.com/julienschmidt/httprouter"
	"github.com/pkg/errors"
)

func (s *ConsilioRouter) log(next httprouter.Handle) httprouter.Handle {
	return func(rw http.ResponseWriter, req *http.Request, p httprouter.Params) {
		var start = time.Now()

		defer func() {
			// panic handling
			if r := recover(); r != nil {
				url := getURL(req)
				err, ok := r.(error)
				if !ok {
					err = errors.Errorf("%+v", r)
				}
				log.Println((err), "url:", url)
			}

			logCall(req, start)
		}()

		next(rw, req, p)
	}
}

func logCall(r *http.Request, start time.Time) {
	log.Printf("[http] %12v | %s %s | %s", time.Since(start), r.Method, r.Host, r.URL.Path)
}
