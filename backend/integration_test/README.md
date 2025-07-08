# Integration Tests

This folder contains integration tests that use the black box testing method against a real database connection to ensure features are correctly implemented.

## Overview

Integration tests validate the complete functionality of the application by testing the interaction between different components and services. Unlike unit tests that test individual components in isolation, these tests verify that the entire system works together as expected.

## Test Methodology

### Black Box Testing
- Tests are written from the user's perspective without knowledge of internal implementation details
- Focus on validating input/output behavior and business logic
- Ensures the system meets functional requirements

### Real Database Connection
- Tests run against an actual database instance (not mocks or in-memory databases)
- Validates database schema, queries, and data persistence
- Ensures proper handling of database transactions and constraints

## Project Structure

```
integration_test/
├── README.md              # This file
├── setup/                 # Test setup and configuration utilities
└── .env.test             # Environment variables for test execution
```

### Directory Descriptions

- **`setup/`** - Contains test setup utilities, database configuration, and common test helpers
- **`.env.test`** - Environment configuration file containing all variables needed for test execution

## Environment Configuration

The `.env.test` file contains all environment variables required for the integration tests to run properly. This includes:

- Database connection strings
- API endpoints
- Authentication keys
- Test-specific configuration values

Make sure to configure this file before running the integration tests.

## Database Isolation

Each test runs in an isolated database schema to ensure:

- **Consistency** - Tests don't interfere with each other
- **Reliability** - Test results are predictable and repeatable
- **Parallelization** - Multiple tests can run simultaneously without conflicts
- **Clean State** - Each test starts with a known, clean database state

### Schema Isolation Benefits

1. **No Data Pollution** - Test data from one test doesn't affect others
2. **Concurrent Execution** - Tests can run in parallel safely
3. **Deterministic Results** - Each test has predictable outcomes
4. **Easy Cleanup** - Schema can be dropped after test completion

## Running Integration Tests

Before running the tests, ensure:

1. The `.env.test` file is properly configured
2. The database server is running and accessible
3. Required permissions are set for schema creation/deletion

To run all the test suite, use:
```bash
go test ./integration_test/... -v
```

## Best Practices

### Test Organization
- Group related tests in appropriate subdirectories
- Use descriptive test names that explain the scenario being tested
- Keep tests focused on specific functionality

### Data Management
- Use test fixtures for consistent test data
- Clean up test data after each test (handled by schema isolation)
- Avoid dependencies between tests

### Error Handling
- Test both success and failure scenarios
- Validate error messages and status codes
- Ensure proper cleanup even when tests fail

## Adding New Tests

When adding new integration tests:

1. Create tests in the appropriate subdirectory based on feature area
2. Follow the existing naming conventions
3. Ensure tests are independent and can run in any order
4. Include both positive and negative test cases
5. Document any special setup requirements

## Debugging Tests

For debugging failed tests:

1. Check the test database schema for unexpected data
2. Verify environment variables in `.env.test`
3. Review database logs for connection or query issues
4. Use verbose test output to trace execution flow
