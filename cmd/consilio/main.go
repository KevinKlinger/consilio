package main

import (
	"flag"
	"log"
	"net"
	"net/http"
	"strconv"
	"time"

	"github.com/kevinklinger/consilio/router"
	"github.com/pkg/errors"
)

var (
	apiport = flag.Int("apiport", 33334, "http port to listen for API requests")
	uiport  = flag.Int("uiport", 33333, "http port to serve the UI on")
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	flag.Parse()
	errChan := make(chan error)

	// Serve REST API
	go func(errChan *chan error) {
		defaultRouter := router.NewConsilioRouter()

		listener, err := net.Listen("tcp", ":"+strconv.Itoa(*apiport))
		if err != nil {
			log.Println(err.Error())
			listener, err = net.Listen("tcp", ":")
			if err != nil {
				*errChan <- errors.WithStack(err)
			}
		}

		srv := &http.Server{
			ReadHeaderTimeout: 10 * time.Second,
			Handler:           defaultRouter,
		}

		log.Printf("Listening on htt port %d\n", listener.Addr().(*net.TCPAddr).Port)
		*errChan <- srv.Serve(listener)
	}(&errChan)

	// Serve WebUI
	go func(errChan *chan error) {
		fs := http.FileServer(http.Dir("./static"))
		http.Handle("/", fs)
		log.Printf("Listening on port: %d", *uiport)
		*errChan <- http.ListenAndServe(":"+strconv.Itoa(*uiport), nil)
	}(&errChan)

	return <-errChan
}
