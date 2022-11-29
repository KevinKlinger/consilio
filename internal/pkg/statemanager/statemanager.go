package statemanager

import (
	"bytes"
	"github.com/kevinklinger/open_terraform/noninternal/states/statefile"
	"log"
)

func DeleteState(stateFileContent []byte) (err error) {
	currentState, err := statefile.Read(bytes.NewReader(stateFileContent))
	if err != nil {
		return err
	}

	for _, module := range currentState.State.Modules {
		for _, resource := range module.Resources {
			log.Println(resource.Addr.String())
			for _, instance := range resource.Instances {
				log.Println(instance.Current.AttrsJSON)
			}
		}
	}

	return nil
}
