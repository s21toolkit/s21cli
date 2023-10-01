.RECIPEPREFIX := >

BUILD_DIRECTORY := build

# Default target arch
TARGETS ?= linux/amd64

.PHONY: all
all: build

.PHONY: build
build: tidy
>	xgo -buildmode=c-shared -out=build/libclient -targets='$(TARGETS)' .

.PHONY: tidy
tidy:
>	go mod tidy

.PHONY: clean
clean:
>	rm -rf $(BUILD_DIRECTORY)
