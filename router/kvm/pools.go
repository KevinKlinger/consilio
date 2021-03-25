package libvirt

import (
	"log"

	"github.com/pkg/errors"
)

// TODO
//CreatePool creates a given pool
func CreatePool() {
	if err := provider.ResourcesMap["libvirt_pool"].Create(nil, nil); err != nil {
		log.Println(errors.WithStack(err))
	}
}
