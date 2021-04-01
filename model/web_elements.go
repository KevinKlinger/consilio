package model

// DynamicElement
type DynamicElement struct {
	Name   string      `json:"Name"`
	Fields []FieldType `json:"Fields"`
}

// FieldType
type FieldType struct {
	Name          string       `json:"Name"`
	Type          string       `json:"Type"`
	ConflictsWith []string     `json:"ConflictsWith,omitempty"`
	Required      bool         `json:"Required"`
	Description   string       `json:"Description,omitempty"`
	MaxItems      int          `json:"MaxItems,omitempty"`
	MinItems      int          `json:"MinItems,omitempty"`
	Subfields     *[]FieldType `json:"Subfields,omitempty"`
}
