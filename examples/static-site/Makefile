
default: server

server: build
	node node_modules/http-server/bin/http-server ./build -o

build: node_modules
	node index.js

node_modules: package.json
	npm install

.PHONY: server build
