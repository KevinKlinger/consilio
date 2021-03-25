package model

type DynamicElement struct {
	Name   string      `json:"Name"`
	Fields []FieldType `json:"Fields"`
}

type FieldType struct {
	Name     string `json:"Name"`
	Type     string `json:"Type"`
	Required bool   `json:"Required"`
}
