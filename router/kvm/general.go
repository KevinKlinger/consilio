package libvirt

import (
	"strings"

	libvirtProvider "github.com/dmacvicar/terraform-provider-libvirt/libvirt"
	"github.com/hashicorp/terraform-plugin-sdk/helper/schema"
	"github.com/kevinklinger/consilio/model"
)

var (
	provider = libvirtProvider.Provider().(*schema.Provider)
)

// GetLibvirtFields returns all fields possible to create a libvirt disk pool
func GetLibvirtFields() []model.DynamicElement {
	var result []model.DynamicElement

	for rscName, rscAttr := range provider.ResourcesMap {
		fields := extractFields(rscAttr)
		if len(fields) != 0 {
			result = append(result, model.DynamicElement{
				Name:   rscName,
				Fields: fields,
			})
		}
	}

	return result
}

func extractFields(rscAttr *schema.Resource) []model.FieldType {
	fields := []model.FieldType{}
	for fieldName, fieldAttributes := range rscAttr.Schema {
		if !fieldAttributes.Computed && fieldName != "xml" {
			fields = append(fields, model.FieldType{
				Name:     fieldName,
				Type:     strings.TrimLeft(fieldAttributes.Type.String(), "Type"),
				Required: fieldAttributes.Required,
			})
		}
	}
	return fields
}
