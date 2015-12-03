test:
	@echo "Run mocha tests..."
	node mocha-parallel-tests --timeout 60000 --slow 30000 test/integration/test

.PHONY: test
