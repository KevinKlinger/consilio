package libvirt

import (
	libvirtProvider "github.com/dmacvicar/terraform-provider-libvirt/libvirt"
	"github.com/hashicorp/terraform-plugin-sdk/helper/schema"
	"github.com/kevinklinger/consilio/libs"
	"github.com/kevinklinger/consilio/model"
)

var (
	provider = libvirtProvider.Provider().(*schema.Provider)
)

// GetLibvirtFields returns a list of elements the terraform provider for libvirt supports
func GetLibvirtFields() []model.DynamicElement {
	var result []model.DynamicElement

	for rscName, rscAttr := range provider.ResourcesMap {
		fields := libs.ExtractFields(rscAttr)
		if len(fields) != 0 {
			result = append(result, model.DynamicElement{
				Name:   rscName,
				Fields: fields,
			})
		}
	}

	return result
}
