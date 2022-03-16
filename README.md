# consilio

Consilio is an open source application to visualize and manage Terraform configurations and deployments.



## Requirements
* git
* golang 1.17
* libvirt-dev package

## Quick Start

To start the application, execute ```go mod tidy && go run cmd/consilio/main.go```.
The frontend, delivered by the golang server, will be reachable at ```http://localhost:33334```.


## TODO:

- [ ] Backend can handle incoming requests to create/manage/destroy resources
- [ ] Frontend offers mutliple providers which can be mixed
- [ ] Frontend allows modules
- [ ] Dockerfile to (optionaly) run consilio in a container
- [ ] ? Database connection to store/share configs between users (user authentication)