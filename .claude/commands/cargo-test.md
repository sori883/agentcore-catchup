---
description: Run cargo test or cargo nextest, analyze failures, and fix failing tests until all pass.
---

# Cargo Test Command

This command runs the test suite using `cargo test` or `cargo nextest`, analyzes failures, and fixes issues until all tests pass.

## What This Command Does

1. **Run Tests** - Execute `cargo nextest run` (if available) or `cargo test`
2. **Analyze Failures** - Understand why tests are failing
3. **Fix Issues** - Correct the implementation or update tests
4. **Verify Coverage** - Ensure 80%+ test coverage
5. **Report Results** - Summarize test outcomes

## When to Use

Use this command when:
- After implementing new features
- Before committing changes
- After refactoring code
- Debugging failing tests
- Verifying test coverage

## How It Works

The command will:

1. Run the test suite with `cargo nextest run` (faster) or `cargo test`
2. Parse test output to identify failures
3. Analyze each failure and determine the cause
4. Apply fixes to implementation or tests
5. Re-run tests after each fix
6. Continue until all tests pass
7. Check coverage with `cargo llvm-cov` if available

## Example Usage

```
User: /cargo-test

Agent:
# Cargo Test Session

## Step 1: Running Tests

Executing: cargo nextest run

Results:
✓ 134 tests passed
✗ 3 tests failed

Failed tests:
1. tests::test_user_validation
2. services::test_order_processing
3. integration::test_api_endpoint

## Step 2: Analyzing Failure 1

Test: tests::test_user_validation
File: src/models/user.rs:125

Failure output:
```
assertion `left == right` failed
  left: Err(ValidationError("Email is required"))
 right: Ok(User { ... })
```

Analysis: Test expects validation to pass with empty email, but implementation correctly rejects it.
The test expectation is wrong.

Fix: Update test to expect validation error.

Applied fix to src/models/user.rs:125

## Step 3: Re-running Tests

Executing: cargo nextest run

Results:
✓ 135 tests passed
✗ 2 tests failed

✓ Failure 1 resolved!

## Step 4: Analyzing Failure 2

Test: services::test_order_processing
File: src/services/order_service.rs:89

Failure output:
```
thread 'services::test_order_processing' panicked at:
called `Result::unwrap()` on an `Err` value: DatabaseError("Connection refused")
```

Analysis: Test is trying to connect to a real database. Should use a mock instead.

Fix: Replace database connection with mock.

Applied fix to src/services/order_service.rs:89

[... continues for remaining failures ...]

## Final Results

Executing: cargo nextest run

✅ All 137 tests passed!

## Coverage Check

Executing: cargo llvm-cov --html

Coverage: 87.3% (Target: 80%)

✅ Coverage target met!

Test session complete!
```

## Test Categories

### 1. Unit Tests

Test individual functions and methods in isolation:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_email_validation() {
        // Happy path
        let email = Email::new("user@example.com");
        assert!(email.is_ok());

        // Error case
        let invalid = Email::new("not-an-email");
        assert!(invalid.is_err());
    }

    #[test]
    fn test_edge_case_empty_string() {
        let result = process_text("");
        assert_eq!(result, "");
    }
}
```

### 2. Integration Tests

Test interaction between components:

```rust
#[tokio::test]
async fn test_user_registration_flow() {
    let db = setup_test_db().await;
    let service = UserService::new(db);

    // Register user
    let user = service.register("test@example.com", "password").await.unwrap();
    assert!(!user.id.is_nil());

    // Verify user can login
    let logged_in = service.login("test@example.com", "password").await.unwrap();
    assert_eq!(logged_in.id, user.id);
}
```

### 3. Property-Based Tests

Test properties that should hold for many inputs:

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn test_reversible_encoding(s in "\\PC*") {
        let encoded = encode(&s);
        let decoded = decode(&encoded).unwrap();
        prop_assert_eq!(&decoded, &s);
    }

    #[test]
    fn test_parse_never_panics(input in any::<Vec<u8>>()) {
        let _ = parse(&input); // Should not panic
    }
}
```

## Common Test Failure Patterns

### 1. Assertion Failures

```rust
// Failure
assert_eq!(result, expected);
// left: 42, right: 41

// Analysis: Off-by-one error in implementation
// Fix: Review calculation logic
```

### 2. Panic in Test

```rust
// Failure
thread 'test_process_data' panicked at 'index out of bounds'

// Analysis: Not handling empty input
// Fix: Add guard clause or use .get() instead of indexing
```

### 3. Async Test Timeout

```rust
// Failure
test test_async_operation ... timeout after 60s

// Analysis: Infinite loop or deadlock in async code
// Fix: Add proper exit conditions, use timeout wrapper
```

### 4. Flaky Tests

```rust
// Failure (intermittent)
test test_concurrent_access ... FAILED
test test_concurrent_access ... ok

// Analysis: Race condition in test
// Fix: Properly synchronize test setup/teardown
```

## Test Helpers

### Setup and Teardown

```rust
#[cfg(test)]
mod tests {
    use super::*;

    fn setup() -> TestDb {
        TestDb::new()
    }

    #[test]
    fn test_with_setup() {
        let db = setup();
        // test code
    }
}
```

### Test Fixtures

```rust
#[fixture]
fn user() -> User {
    User {
        id: UserId::new(),
        email: "test@example.com".to_string(),
        created_at: Utc::now(),
    }
}

#[rstest]
fn test_user_operations(user: User) {
    assert!(!user.id.is_nil());
}
```

### Mock Objects

```rust
#[cfg(test)]
use mockall::mock;

mock! {
    pub Database {
        fn get_user(&self, id: UserId) -> Result<User>;
        fn save_user(&mut self, user: &User) -> Result<()>;
    }
}

#[test]
fn test_service_with_mock() {
    let mut mock_db = MockDatabase::new();
    mock_db.expect_get_user()
        .returning(|_| Ok(User::default()));

    let service = UserService::new(mock_db);
    let result = service.process_user(UserId::new());
    assert!(result.is_ok());
}
```

## Test Coverage

### Generate Coverage Report

```bash
# HTML report
cargo llvm-cov --html
open target/llvm-cov/html/index.html

# Text summary
cargo llvm-cov

# Check coverage threshold
cargo llvm-cov --fail-under-lines 80
```

### Coverage Guidelines

- **80% minimum** for all production code
- **100% required** for:
  - Financial calculations
  - Security-critical code
  - Core business logic
  - Public API surface

## Test Organization

```
src/
  lib.rs
  models/
    user.rs
    mod.rs
  services/
    user_service.rs
    mod.rs

tests/
  integration_test.rs        # Integration tests
  common/
    mod.rs                   # Shared test utilities
    fixtures.rs              # Test data
```

## Test Performance

### Parallel Testing

```bash
# cargo nextest runs tests in parallel by default
cargo nextest run

# Control parallelism
cargo nextest run --test-threads 4
```

### Filter Tests

```bash
# Run specific test
cargo test test_user_validation

# Run tests matching pattern
cargo test user::

# Run tests in specific module
cargo test --test integration_test
```

## Benchmarking

For performance-critical code:

```rust
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn benchmark_calculation(c: &mut Criterion) {
    c.bench_function("calculate_score", |b| {
        b.iter(|| {
            calculate_score(black_box(&test_data))
        });
    });
}

criterion_group!(benches, benchmark_calculation);
criterion_main!(benches);
```

## TDD Workflow Integration

This command works best with TDD:

1. Write failing test (RED)
2. Run `/cargo-test` - verify failure
3. Implement minimal code (GREEN)
4. Run `/cargo-test` - verify pass
5. Refactor (REFACTOR)
6. Run `/cargo-test` - verify still passing

## Integration with Other Commands

- Use `/tdd` for test-driven development workflow
- Use `/cargo-build-fix` if tests don't compile
- Use `/cargo-clippy` after tests pass
- Use `/code-review` to review test quality

## Tips

**Test behavior, not implementation**: Focus on what the code does, not how it does it.

**Keep tests simple**: Tests should be easier to understand than the code they test.

**One assertion per test**: Makes failures easier to diagnose.

**Use descriptive names**: `test_rejects_invalid_email` is better than `test_email`.

**Test edge cases**: Empty strings, max values, null/None, concurrent access.

## Related Commands

- `/tdd` - Test-driven development workflow
- `/cargo-build-fix` - Fix compilation errors
- `/cargo-clippy` - Linter checks
- `/test-coverage` - Detailed coverage analysis
