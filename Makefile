
# Install dependencies with npm.
node_modules: package.json
	@npm install
	@touch node_modules # hack to fix mtime after npm installs

# Run the tests.
test: node_modules
	@./node_modules/.bin/mocha \
		--reporter spec \
		--slow 300 \
		--bail

# Phony targets.
.PHONY: test