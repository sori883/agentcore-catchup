---
description: Run cargo clippy to check for common mistakes, anti-patterns, and code quality issues. Fix all warnings.
---

# Cargo Clippy Command

This command runs `cargo clippy` to identify code quality issues, common mistakes, and anti-patterns, then fixes all warnings.

## What This Command Does

1. **Run Clippy** - Execute `cargo clippy` with appropriate flags
2. **Analyze Warnings** - Categorize and prioritize issues
3. **Apply Fixes** - Automatically fix issues or provide manual fixes
4. **Re-run** - Verify fixes don't introduce new issues
5. **Report** - Summary of all improvements

## When to Use

Use this command:
- Before committing code
- After implementing new features
- During code review preparation
- When refactoring
- As part of CI/CD pipeline

## How It Works

The command will:

1. Run `cargo clippy -- -D warnings` (treat warnings as errors)
2. Parse and categorize all warnings
3. Apply automatic fixes with `cargo clippy --fix` where possible
4. Provide manual fix guidance for remaining issues
5. Re-run to verify all warnings are resolved

## Example Usage

```
User: /cargo-clippy

Agent:
# Cargo Clippy Session

## Step 1: Initial Check

Running: cargo clippy

Found 8 warnings:

**Correctness Issues (2):**
1. warning: using `clone` on type `Copy`
   --> src/models.rs:45:18

2. warning: this expression creates a reference which is immediately dereferenced
   --> src/handlers.rs:78:25

**Performance Issues (3):**
3. warning: using `to_string()` on a `&str`
   --> src/utils.rs:12:20

4. warning: unnecessary allocation in loop
   --> src/services.rs:156:9

5. warning: inefficient use of String::from
   --> src/config.rs:34:15

**Style Issues (2):**
6. warning: field assignment outside of initializer
   --> src/models.rs:89:5

7. warning: redundant field names in struct initialization
   --> src/api.rs:201:9

**Complexity (1):**
8. warning: function has too many lines (126/100)
   --> src/handlers.rs:45:1

## Step 2: Applying Automatic Fixes

Running: cargo clippy --fix --allow-dirty

✓ Fixed 4 warnings automatically:
- Removed unnecessary clone (1)
- Removed unnecessary dereferencing (1)
- Optimized string allocations (2)

Remaining: 4 warnings requiring manual fixes

## Step 3: Manual Fix 1 - Field Assignment

Warning: field assignment outside of initializer
Location: src/models.rs:89:5

Current code:
```rust
let mut user = User {
    name: name.clone(),
    email: email.clone(),
};
user.created_at = Utc::now();
user.id = generate_id();
```

Recommended fix:
```rust
let user = User {
    name: name.clone(),
    email: email.clone(),
    created_at: Utc::now(),
    id: generate_id(),
};
```

Applied fix to src/models.rs:89

## Step 4: Manual Fix 2 - Redundant Field Names

Warning: redundant field names in struct initialization
Location: src/api.rs:201:9

Current code:
```rust
Response {
    status: status,
    body: body,
    headers: headers,
}
```

Recommended fix:
```rust
Response {
    status,
    body,
    headers,
}
```

Applied fix to src/api.rs:201

## Step 5: Manual Fix 3 - Function Complexity

Warning: function has too many lines (126/100)
Location: src/handlers.rs:45:1

Analysis: Function `handle_request` is doing too much. Should be split into smaller functions.

Refactoring:
- Extract validation logic → `validate_request()`
- Extract processing logic → `process_request()`
- Extract response building → `build_response()`

Applied refactoring to src/handlers.rs

## Final Check

Running: cargo clippy

✅ 0 warnings! All issues resolved.

Clippy session complete!
```

## Clippy Warning Categories

### 1. Correctness

Issues that could cause bugs:

```rust
// Warning: using clone on Copy type
let x = value.clone(); // value implements Copy
// Fix:
let x = value;

// Warning: suspicious else formatting
if condition { } else
{ // Wrong
}
// Fix:
if condition {
} else {
}
```

### 2. Performance

Inefficiencies that could be optimized:

```rust
// Warning: unnecessary allocation
let s = String::from("hello");
// Fix: Use &str for string literals
let s = "hello";

// Warning: using to_string() on &str
let s = my_str.to_string();
// Fix: Only if you need String
let s = my_str; // Keep as &str if possible

// Warning: manual implementation of Iterator method
let mut result = Vec::new();
for item in items {
    result.push(item.transform());
}
// Fix: Use map
let result: Vec<_> = items.iter().map(|item| item.transform()).collect();
```

### 3. Style

Idiomatic Rust patterns:

```rust
// Warning: redundant field names
User { name: name, age: age }
// Fix:
User { name, age }

// Warning: manual implementation of Option::map
let result = if let Some(x) = option {
    Some(x + 1)
} else {
    None
};
// Fix:
let result = option.map(|x| x + 1);

// Warning: unnecessary return
fn get_value() -> i32 {
    return 42;
}
// Fix:
fn get_value() -> i32 {
    42
}
```

### 4. Complexity

Code that's too complex:

```rust
// Warning: function has too many lines
// Fix: Split into smaller functions

// Warning: too many arguments
fn process(a: i32, b: i32, c: i32, d: i32, e: i32, f: i32) { }
// Fix: Use a struct to group related parameters
struct ProcessParams {
    a: i32,
    b: i32,
    // ...
}
fn process(params: ProcessParams) { }

// Warning: cognitive complexity too high
// Fix: Reduce nesting, extract methods
```

### 5. Pedantic

Extra-strict lints (optional):

```rust
// Enable with: cargo clippy -- -W clippy::pedantic

// Warning: missing inline
pub fn small_fn() { }
// Fix:
#[inline]
pub fn small_fn() { }

// Warning: must_use_candidate
pub fn calculate() -> i32 { 42 }
// Fix:
#[must_use]
pub fn calculate() -> i32 { 42 }
```

## Clippy Configuration

### Project-level Config

Create `.clippy.toml`:

```toml
# Allow some warnings
too-many-arguments-threshold = 8
type-complexity-threshold = 500

# Set lint levels
avoid-breaking-exported-api = true
```

### In Code

```rust
// Disable for entire file
#![allow(clippy::module_name_repetitions)]

// Disable for item
#[allow(clippy::needless_return)]
fn my_function() {
    return 42;
}

// Disable for block
#[allow(clippy::cast_lossless)]
{
    let x = value as u64;
}

// Warn for specific lint
#[warn(clippy::pedantic)]
mod careful_code {
    // Extra strict lints here
}
```

## Common Clippy Lints

### must_use

```rust
// Warning: function result should be used
#[must_use]
pub fn important_calculation() -> i32 {
    // If caller ignores this, they should get a warning
    42
}
```

### expect_used / unwrap_used

```rust
// Warning: using unwrap/expect
let value = result.unwrap();
// Fix: Propagate error
let value = result?;
```

### needless_borrow

```rust
// Warning: unnecessary reference
fn process(data: &String) { }
let s = String::from("hello");
process(&s);
// Fix: String already references
fn process(data: &str) { }
process(&s);
```

### redundant_closure

```rust
// Warning: unnecessary closure
items.map(|x| x.to_string())
// Fix: Direct method reference
items.map(ToString::to_string)
```

## Clippy Lint Groups

```bash
# Default lints
cargo clippy

# Pedantic (extra strict)
cargo clippy -- -W clippy::pedantic

# Nursery (experimental)
cargo clippy -- -W clippy::nursery

# All lints (very strict)
cargo clippy -- -W clippy::all

# Treat warnings as errors
cargo clippy -- -D warnings

# Fix automatically
cargo clippy --fix
cargo clippy --fix --allow-dirty  # Even with uncommitted changes
```

## Integration with CI/CD

```yaml
# .github/workflows/ci.yml
- name: Clippy
  run: cargo clippy -- -D warnings

# Only check, don't fix
- name: Clippy check
  run: cargo clippy --no-deps -- -D warnings -D clippy::pedantic
```

## Custom Lints

```rust
// Enable custom lint groups
#![warn(
    clippy::all,
    clippy::pedantic,
    clippy::nursery,
    clippy::cargo,
)]

// Allow specific pedantic lints
#![allow(
    clippy::module_name_repetitions,
    clippy::similar_names,
)]
```

## Priority Order

Fix warnings in this order:

1. **Correctness** - Could cause bugs
2. **Security** - Security implications (use cargo-audit too)
3. **Performance** - Measurable impact
4. **Complexity** - Maintainability
5. **Style** - Consistency

## Best Practices

**Run Clippy often**: Don't let warnings accumulate.

**Treat warnings as errors in CI**: Use `-D warnings` in your CI pipeline.

**Be pragmatic**: Some warnings are false positives. Use `#[allow]` judiciously with a comment explaining why.

**Stay updated**: Clippy improves constantly. Update regularly.

**Read the docs**: Each warning links to documentation explaining the issue.

## Related Commands

- `/cargo-build-fix` - Fix compilation errors first
- `/cargo-test` - Verify fixes don't break tests
- `/code-review` - Human review after automated fixes
- `/refactor-clean` - Deeper refactoring

## Integration with Other Commands

```
1. /cargo-build-fix   # Fix compilation errors
2. /cargo-test        # Ensure tests pass
3. /cargo-clippy      # Fix linter warnings
4. /code-review       # Final human review
```

## Tips

**Read the explanations**: Clippy provides detailed explanations for each warning. Click the link or run `cargo clippy --explain <code>`.

**Use clippy::pedantic selectively**: The pedantic group is very strict. Enable it for critical code paths, but it may be too strict for all code.

**Document why you allow**: When using `#[allow]`, add a comment explaining why the warning is allowed.

**Learn from Clippy**: Clippy teaches idiomatic Rust. Understanding why warnings exist makes you a better Rust developer.
