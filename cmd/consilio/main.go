package main

import (
	"flag"
	"log"
	"net/http"
	"strconv"

	"github.com/kevinklinger/consilio/router"
)

var (
	port = flag.Int("apiport", 33334, "http port to listen for API requests")
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	flag.Parse()

	defaultRouter := router.NewConsilioRouter()
	log.Printf("Listening on http port %d\n", *port)
	return http.ListenAndServe(":"+strconv.Itoa(*port), defaultRouter)
}
