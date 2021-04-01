package libvirt

import (
	"log"
	"strings"

	libvirtProvider "github.com/dmacvicar/terraform-provider-libvirt/libvirt"
	"github.com/hashicorp/terraform-plugin-sdk/helper/schema"
	"github.com/kevinklinger/consilio/model"
)

var (
	provider = libvirtProvider.Provider().(*schema.Provider)
)

// GetLibvirtFields returns a list of elements the terraform provider for libvirt supports
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
	var subfields *[]model.FieldType
	fields := []model.FieldType{}

	for fieldName, fieldAttributes := range rscAttr.Schema {
		if !fieldAttributes.Computed && fieldName != "xml" {
			if fieldAttributes.Elem != nil {
				subfields = extractSubFields(fieldAttributes.Elem, fieldName)
			}

			fields = append(fields, model.FieldType{
				Name:          fieldName,
				Type:          strings.TrimLeft(fieldAttributes.Type.String(), "Type"),
				Required:      fieldAttributes.Required,
				Subfields:     subfields,
				ConflictsWith: fieldAttributes.ConflictsWith,
				Description:   fieldAttributes.Description,
				MinItems:      fieldAttributes.MinItems,
				MaxItems:      fieldAttributes.MaxItems,
			})
		}
	}
	return fields
}

func extractSubFields(subfield interface{}, parentName string) *[]model.FieldType {
	if elem, ok := subfield.(*schema.Resource); ok {
		result := extractFields(elem)
		if len(result) > 0 {
			return &result
		}
		return nil
	}

	if element, ok := subfield.(*schema.Schema); ok {
		if !element.Computed {
			return &[]model.FieldType{
				{
					Type:          strings.TrimLeft(element.Type.String(), "Type"),
					Required:      element.Required,
					ConflictsWith: element.ConflictsWith,
					Description:   element.Description,
					MinItems:      element.MinItems,
					MaxItems:      element.MaxItems,
				},
			}
		}
		return nil
	}

	log.Printf("Error converting subelement of %s to schema.Resource \n", parentName)
	return nil
}
