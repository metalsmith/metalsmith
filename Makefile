
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
	@$(mocha)

# Run the tests in debugging mode.
test-debug: node_modules
	@$(mocha) debug

#
# Phonies.
#

.PHONY: test
.PHONY: test-debug
