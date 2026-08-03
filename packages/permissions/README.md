# Permissions Package

Shared permission-checking primitives. Public API: the `Permission` union type (currently `"admin" | "seller" | "customer"`) and `hasPermission(permissions, permission)`, a simple membership check. This is a minimal placeholder, not yet the RBAC/ABAC engine and 14-role admin permission matrix specified in the Enterprise Blueprint (Volume 3, Part B3 / Volume 1, Part G2) — treat this package as the intended home for that engine as it's built out, rather than reimplementing permission logic elsewhere.
