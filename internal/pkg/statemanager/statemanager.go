package statemanager

import (
	"context"
	"github.com/hashicorp/terraform-exec/tfexec"
	"os"
	"path/filepath"
)

var tfProviderConfig = `
terraform {
  required_providers {
    libvirt = {
      source = "dmacvicar/libvirt"
    }
  }
}
`

func DeleteState(stateFileContent []byte) (err error) {

	dir, err := os.MkdirTemp("", "dir")
	if err != nil {
		return err
	}
	defer os.RemoveAll(dir)

	err = os.WriteFile(filepath.Join(dir, "terraform.tfstate"), stateFileContent, 0777)
	if err != nil {
		return err
	}
	err = os.WriteFile(filepath.Join(dir, "provider.tf"), []byte(tfProviderConfig), 0777)
	if err != nil {
		return err
	}
	tr, err := tfexec.NewTerraform(dir, "terraform")
	if err != nil {
		return err
	}
	err = tr.Init(context.Background(), tfexec.Upgrade(true))
	if err != nil {
		return err
	}
	err = tr.Destroy(context.Background())
	if err != nil {
		return err
	}

	return nil
}
