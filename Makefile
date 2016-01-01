
NODE ?= node
# Adds --harmony-generators flag when available/necessary
NODE_FLAGS ?= $(shell $(NODE) --v8-options | grep generators | cut -d ' ' -f 3)

MOCHA     = $(NODE) $(NODE_FLAGS) ./node_modules/.bin/_mocha
ISTANBUL  = $(NODE) $(NODE_FLAGS) ./node_modules/.bin/istanbul
COVERALLS = $(NODE) $(NODE_FLAGS) ./node_modules/.bin/coveralls

# Install dependencies with npm.
node_modules: package.json
	@npm install
	@touch node_modules # hack to fix mtime after npm installs

# Run the tests.
test: node_modules
	@$(MOCHA)

# Run the tests in debugging mode.
test-debug: node_modules
	@$(MOCHA) debug

# Build Coverage report
coverage: node_modules
	@$(ISTANBUL) cover ./node_modules/.bin/_mocha

# Send coverage report to Coveralls
coveralls: coverage
	@cat coverage/lcov.info | $(COVERALLS)

.PHONY: test test-debug coverage coveralls
