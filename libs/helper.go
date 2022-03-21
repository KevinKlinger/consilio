package libs

import (
	"log"
	"strings"

	"github.com/hashicorp/terraform-plugin-sdk/helper/schema"
	"github.com/kevinklinger/consilio/model"
)

func ExtractFields(rscAttr *schema.Resource) []model.FieldType {
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
		result := ExtractFields(elem)
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
