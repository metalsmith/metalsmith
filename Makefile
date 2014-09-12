
# Install dependencies with npm.
node_modules: package.json
	@npm install

# Run the tests.
test: node_modules
	@./node_modules/.bin/mocha \
		--reporter spec \
		--slow 300
		--bail

# Phony targets.
.PHONY: test