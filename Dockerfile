FROM golang:1.17.0-alpine as builder

# Install SSL ca certificates and create appuser
RUN apk update && \
    apk add gcc && \
    apk add g++ && \
    apk add libvirt-dev && \
    apk add libvirt && \
    adduser -D -g '' appuser

# source code
COPY . $GOPATH/src/consilio
WORKDIR $GOPATH/src/consilio/cmd/consilio

# build
ENV GO111MODULE=on
RUN go mod download && \
    GOOS=linux GOARCH=amd64 go build -o /go/bin/consilio

# Build a minimal and secured container
FROM alpine
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /go/bin/consilio /app/
COPY --from=builder /go/src/consilio/static/ /app/static/
RUN apk add libvirt-dev && \
    chown -R appuser.users /app
WORKDIR /app
EXPOSE 33334
USER appuser
ENTRYPOINT ["/app/consilio"]
