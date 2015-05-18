
#
# Adds --harmony-generators flag when available/necessary
#

node_flags ?= $(shell $(NODE) --v8-options | grep generators | cut -d ' ' -f 3)

#
# Binaries.
#

mocha = ./node_modules/.bin/mocha

#
# Targets.
#

# Install dependencies with npm.
node_modules: package.json
	@npm install
	@touch node_modules # hack to fix mtime after npm installs

# Run the tests.
test: node_modules
	@$(mocha) $(node_flags)

# Run the tests in debugging mode.
test-debug: node_modules
	@$(mocha) $(node_flags) debug

#
# Phonies.
#

.PHONY: test
.PHONY: test-debug
