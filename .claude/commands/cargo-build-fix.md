---
description: Run cargo build/check, analyze errors, and fix them iteratively until the build succeeds.
---

# Cargo Build & Fix Command

This command runs `cargo check` or `cargo build`, analyzes compilation errors, and fixes them one by one until the build succeeds.

## What This Command Does

1. **Run Build** - Execute `cargo check` (faster) or `cargo build`
2. **Analyze Errors** - Parse compiler output and understand issues
3. **Fix Issues** - Apply fixes based on compiler suggestions
4. **Repeat** - Continue until build succeeds
5. **Verify** - Run tests to ensure nothing broke

## When to Use

Use this command when:
- Compilation errors need to be resolved
- After making significant changes
- Dealing with complex type errors
- Upgrading dependencies causes breakage
- Refactoring causes cascading errors

## How It Works

The command will:

1. Run `cargo check` to identify all errors quickly
2. Prioritize errors (start with root causes)
3. Apply fixes one at a time
4. Re-run check after each fix
5. Continue until all errors are resolved
6. Run `cargo test` to verify functionality

## Example Usage

```
User: /cargo-build-fix

Agent:
# Cargo Build & Fix Session

## Step 1: Initial Check

Running: cargo check

Found 5 errors:
1. error[E0425]: cannot find value `user_id` in this scope
   --> src/service.rs:45:20
2. error[E0308]: mismatched types (expected String, found &str)
   --> src/models.rs:78:15
3. error[E0599]: no method named `validate` found for type `User`
   --> src/handlers.rs:23:10
4. error[E0382]: borrow of moved value: `config`
   --> src/main.rs:67:5
5. error[E0277]: the trait bound `Order: Serialize` is not satisfied
   --> src/api.rs:102:12

## Step 2: Fixing Error 1 - Undefined variable

Error: cannot find value `user_id` in this scope

Analysis: Variable `user_id` is referenced but not defined. Checking context...
The function signature shows `id: UserId` but code uses `user_id`.

Fix: Rename variable usage to match parameter name.

Applied fix to src/service.rs:45

## Step 3: Re-check

Running: cargo check

✓ Error 1 resolved!
Remaining: 4 errors

## Step 4: Fixing Error 2 - Type mismatch

Error: mismatched types (expected String, found &str)

Analysis: Function expects owned String but receives string slice.

Fix: Convert &str to String with .to_string()

Applied fix to src/models.rs:78

## Step 5: Re-check

Running: cargo check

✓ Error 2 resolved!
Remaining: 3 errors

[... continues until all errors are fixed ...]

## Final Check

Running: cargo check

✅ Build successful! 0 errors, 0 warnings.

## Verification

Running: cargo test

✅ All tests passed (142 tests)

Build & Fix session complete!
```

## Common Error Categories

### 1. Ownership & Borrowing Errors

**E0382 - Borrow of moved value**
```rust
// Error
let config = load_config();
process_config(config);  // Moves config
log_config(config);      // Error: value moved

// Fix 1: Clone if needed
let config = load_config();
process_config(config.clone());
log_config(config);

// Fix 2: Use references
let config = load_config();
process_config(&config);
log_config(&config);
```

**E0502 - Cannot borrow as mutable because also borrowed as immutable**
```rust
// Error
let mut data = vec![1, 2, 3];
let first = &data[0];
data.push(4);  // Error: mutable borrow while immutable borrow exists

// Fix: Scope the immutable borrow
let mut data = vec![1, 2, 3];
{
    let first = &data[0];
    println!("{}", first);
}
data.push(4);  // OK
```

### 2. Type Errors

**E0308 - Mismatched types**
```rust
// Error
fn get_name() -> String {
    "Alice"  // Error: expected String, found &str
}

// Fix
fn get_name() -> String {
    "Alice".to_string()
}
```

**E0277 - Trait bound not satisfied**
```rust
// Error
#[derive(Debug)]
struct User { name: String }

fn serialize(user: User) -> String {
    serde_json::to_string(&user).unwrap()  // Error: User doesn't implement Serialize
}

// Fix
#[derive(Debug, serde::Serialize)]
struct User { name: String }
```

### 3. Lifetime Errors

**E0106 - Missing lifetime specifier**
```rust
// Error
fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() { x } else { y }
}

// Fix
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

### 4. Method Not Found

**E0599 - No method named X**
```rust
// Error
let user = User::new();
user.validate();  // Error: method not found

// Fix: Implement the method or import the trait
impl User {
    fn validate(&self) -> Result<()> {
        // implementation
    }
}
```

## Priority System

The command prioritizes fixes in this order:

1. **Missing imports** - Quick wins, often fix multiple errors
2. **Type mismatches** - Usually straightforward
3. **Ownership errors** - May require design changes
4. **Trait bounds** - Add derives or implementations
5. **Lifetime issues** - Most complex, handle carefully

## Integration with Other Commands

After fixing build errors:
- Use `/cargo-test` to run the test suite
- Use `/code-review` to review the changes
- Use `/cargo-clippy` to check for additional issues

## Tips

**Listen to the compiler**: Rust's error messages often include suggestions. The command will parse and apply these suggestions when appropriate.

**Fix root causes first**: Some errors cascade from earlier issues. The command identifies and prioritizes root causes.

**Don't fight the borrow checker**: If you're getting complex ownership errors, it might indicate a design issue. Consider refactoring instead of working around it.

## Related Commands

- `/cargo-test` - Run tests after fixing build
- `/cargo-clippy` - Check for additional issues
- `/refactor-clean` - Improve code quality after fixes
