all: test

test:
	npm run build; npm test

.PHONY: all test

