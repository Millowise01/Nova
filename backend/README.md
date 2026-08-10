# Backend Scaffold

This package is reserved for the API server work that will come after the frontend pass.

The repo is now split so frontend work can proceed independently.

## Known Windows dev-workflow gotchas

### `prisma generate` fails with `EPERM: operation not permitted, rename ... query_engine-windows.dll.node`

Cause: a running backend process (`pnpm dev`, i.e. `nest start --watch`, or its compiled
`dist/main.js` child) still has the current Prisma query engine DLL loaded/mapped in
memory. Windows won't let `prisma generate` overwrite a file that's in use — this is a
Windows file-locking behavior, not a Prisma bug (the same command works fine on
macOS/Linux while the server is running).

Fix: stop every running backend Node process before regenerating the client.

```powershell
# Find anything holding it
Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -match 'nest|Nova\\backend' } | Select-Object ProcessId, CommandLine

# Stop it (repeat for both the "nest start --watch" parent and its dist\main child)
Stop-Process -Id <pid> -Force

# Then retry
pnpm prisma generate
```

`TaskStop`/Ctrl+C on a `pnpm dev` process doesn't always kill the whole process tree on
Windows — `nest start --watch` spawns a separate child process for the compiled output
and restarts it on file changes, so the parent can be gone while the child (holding the
DLL) is still alive. If `Ctrl+C` doesn't clear the lock, check for and kill both PIDs
explicitly as shown above.
