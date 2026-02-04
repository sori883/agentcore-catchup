---
name: rust-patterns
description: Idiomatic Rust patterns, best practices, and conventions for building robust, efficient, and safe Rust applications.
---

# Rust Development Patterns

Idiomatic Rust patterns and best practices for building robust, efficient, safe, and maintainable applications.

## When to Activate

- Writing new Rust code
- Reviewing Rust code
- Refactoring existing Rust code
- Designing Rust crates/modules

## Core Principles

### 1. Ownership & Borrowing

Rust's ownership system eliminates entire classes of bugs. Follow these patterns:

```rust
// Good: Accept borrowed data when you don't need ownership
fn analyze_text(text: &str) -> usize {
    text.lines().count()
}

// Good: Return owned data when the caller needs it
fn generate_report(data: &[Record]) -> String {
    data.iter()
        .map(|r| format!("{}: {}", r.name, r.value))
        .collect::<Vec<_>>()
        .join("\n")
}

// Good: Use Cow for flexible string handling
use std::borrow::Cow;

fn process_text(input: &str) -> Cow<str> {
    if input.contains("bad") {
        Cow::Owned(input.replace("bad", "good"))
    } else {
        Cow::Borrowed(input)
    }
}
```

### 2. Builder Pattern

For structs with many optional fields:

```rust
#[derive(Default)]
pub struct ServerConfig {
    host: String,
    port: u16,
    timeout: Option<Duration>,
    max_connections: Option<usize>,
    tls_enabled: bool,
}

impl ServerConfig {
    pub fn builder() -> ServerConfigBuilder {
        ServerConfigBuilder::default()
    }
}

#[derive(Default)]
pub struct ServerConfigBuilder {
    host: Option<String>,
    port: Option<u16>,
    timeout: Option<Duration>,
    max_connections: Option<usize>,
    tls_enabled: bool,
}

impl ServerConfigBuilder {
    pub fn host(mut self, host: impl Into<String>) -> Self {
        self.host = Some(host.into());
        self
    }

    pub fn port(mut self, port: u16) -> Self {
        self.port = Some(port);
        self
    }

    pub fn timeout(mut self, timeout: Duration) -> Self {
        self.timeout = Some(timeout);
        self
    }

    pub fn max_connections(mut self, max: usize) -> Self {
        self.max_connections = Some(max);
        self
    }

    pub fn enable_tls(mut self) -> Self {
        self.tls_enabled = true;
        self
    }

    pub fn build(self) -> Result<ServerConfig> {
        Ok(ServerConfig {
            host: self.host.ok_or_else(|| anyhow!("host is required"))?,
            port: self.port.ok_or_else(|| anyhow!("port is required"))?,
            timeout: self.timeout,
            max_connections: self.max_connections,
            tls_enabled: self.tls_enabled,
        })
    }
}

// Usage:
let config = ServerConfig::builder()
    .host("localhost")
    .port(8080)
    .timeout(Duration::from_secs(30))
    .enable_tls()
    .build()?;
```

### 3. Newtype Pattern

Wrap primitives for type safety:

```rust
use std::fmt;

// Strong typing prevents mistakes
pub struct UserId(uuid::Uuid);
pub struct Email(String);
pub struct Age(u8);

impl Email {
    pub fn new(email: impl Into<String>) -> Result<Self> {
        let email = email.into();
        if !email.contains('@') {
            anyhow::bail!("Invalid email format");
        }
        Ok(Email(email))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for Email {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

// Can't accidentally mix up UserId and OrderId
pub struct OrderId(uuid::Uuid);

fn get_user(id: UserId) -> Result<User> { /* ... */ }
fn get_order(id: OrderId) -> Result<Order> { /* ... */ }
```

### 4. Extension Traits

Add methods to existing types:

```rust
// Extend Result with convenience methods
pub trait ResultExt<T, E> {
    fn log_error(self, context: &str) -> Result<T, E>;
}

impl<T, E: std::fmt::Display> ResultExt<T, E> for Result<T, E> {
    fn log_error(self, context: &str) -> Result<T, E> {
        if let Err(ref e) = self {
            eprintln!("Error in {}: {}", context, e);
        }
        self
    }
}

// Usage:
let result = read_file(path)
    .log_error("reading config file")?;
```

### 5. Type State Pattern

Use the type system to enforce state transitions:

```rust
// States as types
pub struct Draft;
pub struct Published;
pub struct Archived;

pub struct Article<S> {
    title: String,
    content: String,
    state: PhantomData<S>,
}

impl Article<Draft> {
    pub fn new(title: String, content: String) -> Self {
        Article {
            title,
            content,
            state: PhantomData,
        }
    }

    pub fn publish(self) -> Article<Published> {
        Article {
            title: self.title,
            content: self.content,
            state: PhantomData,
        }
    }
}

impl Article<Published> {
    pub fn archive(self) -> Article<Archived> {
        Article {
            title: self.title,
            content: self.content,
            state: PhantomData,
        }
    }
}

// Compile-time enforcement:
let article = Article::new("Title".into(), "Content".into());
// article.archive(); // Compile error! Can't archive a draft
let published = article.publish();
let archived = published.archive(); // OK
```

### 6. Error Handling Patterns

#### Application Errors (use anyhow)

```rust
use anyhow::{Context, Result};

fn load_config(path: &Path) -> Result<Config> {
    let contents = fs::read_to_string(path)
        .context(format!("Failed to read config: {}", path.display()))?;

    let config: Config = toml::from_str(&contents)
        .context("Failed to parse TOML")?;

    Ok(config)
}
```

#### Library Errors (use thiserror)

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum DatabaseError {
    #[error("Connection failed: {0}")]
    ConnectionFailed(String),

    #[error("Query failed: {query}")]
    QueryFailed { query: String },

    #[error("Record not found: {id}")]
    NotFound { id: String },

    #[error(transparent)]
    Other(#[from] anyhow::Error),
}

pub type Result<T> = std::result::Result<T, DatabaseError>;
```

### 7. Async Patterns

#### Concurrent Operations

```rust
use tokio::try_join;

async fn fetch_all_data(user_id: UserId) -> Result<UserData> {
    let (profile, orders, preferences) = try_join!(
        fetch_profile(user_id),
        fetch_orders(user_id),
        fetch_preferences(user_id)
    )?;

    Ok(UserData {
        profile,
        orders,
        preferences,
    })
}
```

#### Timeout Pattern

```rust
use tokio::time::{timeout, Duration};

async fn fetch_with_timeout(url: &str) -> Result<Response> {
    let request = reqwest::get(url);

    timeout(Duration::from_secs(5), request)
        .await
        .context("Request timed out")?
        .context("Request failed")
}
```

#### Graceful Shutdown

```rust
use tokio::signal;
use tokio::sync::broadcast;

async fn server_with_shutdown() -> Result<()> {
    let (shutdown_tx, _) = broadcast::channel(1);

    let server_handle = tokio::spawn({
        let mut shutdown_rx = shutdown_tx.subscribe();
        async move {
            tokio::select! {
                _ = run_server() => {},
                _ = shutdown_rx.recv() => {
                    println!("Shutting down gracefully...");
                }
            }
        }
    });

    signal::ctrl_c().await?;
    shutdown_tx.send(())?;
    server_handle.await?;

    Ok(())
}
```

### 8. Iterator Patterns

#### Custom Iterator

```rust
pub struct Fibonacci {
    curr: u64,
    next: u64,
}

impl Fibonacci {
    pub fn new() -> Self {
        Fibonacci { curr: 0, next: 1 }
    }
}

impl Iterator for Fibonacci {
    type Item = u64;

    fn next(&mut self) -> Option<Self::Item> {
        let current = self.curr;
        self.curr = self.next;
        self.next = current + self.next;
        Some(current)
    }
}

// Usage:
let fibs: Vec<u64> = Fibonacci::new().take(10).collect();
```

#### Iterator Adapters

```rust
// Chain complex transformations
let result: Vec<_> = data
    .iter()
    .filter(|item| item.is_valid())
    .filter_map(|item| item.process().ok())
    .flat_map(|item| item.children())
    .take(100)
    .collect();
```

### 9. Smart Pointer Patterns

#### Reference Counting

```rust
use std::rc::Rc;
use std::sync::Arc;

// Single-threaded
let data = Rc::new(vec![1, 2, 3]);
let data_clone = Rc::clone(&data);

// Multi-threaded
let shared_data = Arc::new(vec![1, 2, 3]);
let data_clone = Arc::clone(&shared_data);
```

#### Interior Mutability

```rust
use std::cell::RefCell;
use std::sync::Mutex;

// Single-threaded
let data = RefCell::new(vec![1, 2, 3]);
data.borrow_mut().push(4);

// Multi-threaded
let data = Arc::new(Mutex::new(vec![1, 2, 3]));
data.lock().unwrap().push(4);
```

### 10. Testing Patterns

#### Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_email_validation() {
        assert!(Email::new("valid@example.com").is_ok());
        assert!(Email::new("invalid").is_err());
    }

    #[test]
    #[should_panic(expected = "age out of range")]
    fn test_age_validation_panics() {
        Age::new(200).unwrap();
    }
}
```

#### Property-Based Testing

```rust
#[cfg(test)]
mod proptests {
    use proptest::prelude::*;

    proptest! {
        #[test]
        fn test_parse_roundtrip(s in "[a-z]+") {
            let email = format!("{}@example.com", s);
            let parsed = Email::new(email.clone()).unwrap();
            assert_eq!(parsed.as_str(), email);
        }
    }
}
```

#### Integration Tests

```rust
// tests/integration_test.rs
use myapp::*;

#[tokio::test]
async fn test_full_workflow() {
    let db = setup_test_db().await;

    let user = create_user(&db, "test@example.com").await.unwrap();
    let order = create_order(&db, user.id).await.unwrap();

    assert_eq!(order.user_id, user.id);
}
```

## Module Organization Best Practices

```
src/
  lib.rs              # Public API, re-exports
  error.rs            # Error types
  config.rs           # Configuration
  domain/             # Business logic
    mod.rs
    user.rs
    order.rs
    payment.rs
  services/           # Application services
    mod.rs
    user_service.rs
    order_service.rs
  repositories/       # Data access
    mod.rs
    user_repo.rs
    order_repo.rs
  api/                # HTTP/API layer
    mod.rs
    routes.rs
    handlers.rs
  utils/              # Shared utilities
    mod.rs
    validation.rs
    formatting.rs

tests/
  integration_test.rs
  common/
    mod.rs            # Test utilities
```

## Performance Patterns

### Pre-allocate Collections

```rust
// Good: Pre-allocate capacity
let mut items = Vec::with_capacity(1000);
for i in 0..1000 {
    items.push(i);
}

// Good: Collect with size hint
let items: Vec<_> = (0..1000).collect();
```

### Avoid Unnecessary Clones

```rust
// Bad: Unnecessary clone
fn process(data: Vec<String>) -> Vec<String> {
    data.clone().iter().map(|s| s.to_uppercase()).collect()
}

// Good: Consume or borrow
fn process(data: Vec<String>) -> Vec<String> {
    data.into_iter().map(|s| s.to_uppercase()).collect()
}
```

### Use Lazy Initialization

```rust
use once_cell::sync::Lazy;

static REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"^\d{4}-\d{2}-\d{2}$").unwrap()
});

fn validate_date(date: &str) -> bool {
    REGEX.is_match(date)
}
```

## Common Anti-Patterns to Avoid

❌ **String Abuse**
```rust
// Bad
fn get_name() -> String {
    "default".to_string()  // Unnecessary allocation
}

// Good
fn get_name() -> &'static str {
    "default"
}
```

❌ **Clone Everything**
```rust
// Bad
fn process_user(user: User) -> User {
    let mut u = user.clone();
    u.name = u.name.clone().to_uppercase();
    u
}

// Good
fn process_user(mut user: User) -> User {
    user.name = user.name.to_uppercase();
    user
}
```

❌ **Ignoring Errors**
```rust
// Bad
let data = read_file(path).unwrap();

// Good
let data = read_file(path)
    .context("Failed to read configuration")?;
```

## Recommended Crate Ecosystem

**Essential:**
- `serde` + `serde_json` - Serialization
- `anyhow` - Error handling (apps)
- `thiserror` - Error handling (libs)
- `tokio` - Async runtime
- `clap` - CLI parsing

**Web Development:**
- `axum` or `actix-web` - Web frameworks
- `tower` - Middleware
- `reqwest` - HTTP client

**Database:**
- `sqlx` - SQL with compile-time checking
- `diesel` - ORM
- `redis` - Redis client

**Testing:**
- `proptest` - Property-based testing
- `criterion` - Benchmarking
- `mockall` - Mocking

**Utilities:**
- `tracing` - Structured logging
- `uuid` - UUID generation
- `chrono` or `time` - Date/time handling

## CLI Commands Reference

```bash
# Development
cargo watch -x check          # Auto-check on file changes
cargo watch -x test           # Auto-test on file changes
cargo watch -x run            # Auto-run on file changes

# Testing
cargo nextest run             # Fast test runner
cargo test -- --nocapture     # Show println! output
cargo test --release          # Test with optimizations
cargo llvm-cov                # Coverage report

# Quality
cargo clippy                  # Linter
cargo clippy -- -W clippy::pedantic  # Strict linting
cargo fmt                     # Formatter
cargo audit                   # Security vulnerabilities

# Build
cargo build --release         # Optimized build
cargo build --target x86_64-unknown-linux-musl  # Static binary

# Documentation
cargo doc --open              # Generate and open docs
cargo doc --no-deps           # Only document your crate
```

**Remember**: Rust's compiler is your friend. Trust the borrow checker, embrace explicit error handling, and let the type system guide your design.
