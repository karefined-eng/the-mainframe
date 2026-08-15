---
name: Mainframe IPC Error-Handling Standard
description: >
  Strict constraints on how Rust Tauri commands handle, log, and propagate
  errors across the IPC boundary in The Mainframe. Applies to all new and
  modified Tauri commands in src-tauri/src/.
---
# Mainframe IPC Error-Handling Standard

Apply these rules whenever writing or modifying Tauri `#[tauri::command]` functions
or any Rust code they call.

## 1. No Panics — Replace All `unwrap()` on Fallible Paths

NEVER use `.unwrap()` or `.expect()` on any value that could realistically fail at runtime:
- Mutex locks → `state.server.lock().map_err(|e| format!("[lock poisoned] {}", e))?`
- File/IO ops → `.map_err(|e| format!("[io: context] {}", e))?`
- Plugin/SQL errors → `.map_err(|e| format!("[sql: context] {}", e))?`

Exception: `.expect("error while running tauri application")` in `main.rs`/`lib.rs` at the top-level `run()` call is a legitimate startup panic and MUST remain unchanged.

`unwrap()` is only acceptable on provably infallible values (compile-time constants, regexes compiled at startup with known-valid patterns).

## 2. Structured Error Shape Across IPC

All `#[tauri::command]` functions MUST return `Result<T, String>` where the `Err` variant is a **prefixed, context-rich string**:

```
"[domain:operation] human-readable description: {underlying_error}"
```

Examples:
- `"[sync:pull] Failed to connect to 192.168.1.5:9377: connection refused"`
- `"[db:insert:certifications] UNIQUE constraint violated: {e}"`
- `"[io:backup] Failed to copy mainframe.db: permission denied: {e}"`

This gives the frontend enough structure to prefix-match without requiring a typed enum.

## 3. Server-Side Logging Before Propagating

Before returning any `Err(...)`, log it with `eprintln!`:

```rust
let result = some_operation().map_err(|e| {
    let msg = format!("[domain:op] Failed to {context}: {e}");
    eprintln!("ERROR: {}", msg);
    msg
});
```

Never silently swallow or return an error without logging it first.

## 4. Sync/Network Errors Are Always Recoverable

In `sync.rs`, ALL network and connection errors MUST be returned as `Err(String)` — never panic.
Never `.unwrap()` on UDP/TCP socket operations. The frontend MUST offer a retry option for any sync error.

## 5. Plugin Error Context

When wrapping `tauri-plugin-sql` or any other plugin error, always include:
1. The SQL operation (INSERT, SELECT, UPDATE, DELETE)
2. The target table name
3. The raw plugin error appended

```rust
// Good
.map_err(|e| {
    let msg = format!("[sql:insert:certifications] {e}");
    eprintln!("ERROR: {}", msg);
    msg
})
```

## 6. Compile-Time Enforcement

Add the following to `src-tauri/Cargo.toml` under `[lints.clippy]` to catch violations at build time:

```toml
[lints.clippy]
unwrap_used = "warn"
```

This surfaces every `.unwrap()` as a compiler warning, making violations visible during `cargo build` or `cargo clippy`.

## 7. Frontend Contract

The React frontend MUST treat all IPC `Err` responses as `string` and:
- Display them in a neutral, non-punitive toast/alert (per Neuro-UX rules — no flashing red, no shame)
- Log to the browser console for debugging
- For sync errors specifically, always offer a **Retry** button

TypeScript helper pattern (add once to a shared util file):

```typescript
export function ipcErrorToast(err: unknown, fallback = "Something went wrong") {
  const msg = typeof err === "string" ? err : fallback;
  console.error("[IPC Error]", msg);
  // pass msg to your toast system
  return msg;
}
```
