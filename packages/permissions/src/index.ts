export type Permission = "admin" | "seller" | "customer";

export function hasPermission(permissions: Permission[], permission: Permission) {
  return permissions.includes(permission);
}