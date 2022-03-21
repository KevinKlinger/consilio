package alicloud

import (
	alicloud "github.com/aliyun/terraform-provider-alicloud/alicloud"
	"github.com/hashicorp/terraform-plugin-sdk/helper/schema"
	"github.com/kevinklinger/consilio/libs"
	"github.com/kevinklinger/consilio/model"
)

var (
	provider = alicloud.Provider().(*schema.Provider)
)

// GetAliCloudFields returns a list of elements the terraform provider for alicloud supports
func GetAliCloudFields() []model.DynamicElement {
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
