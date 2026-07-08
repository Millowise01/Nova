export type Permission = "admin" | "seller" | "customer";
export declare function hasPermission(permissions: Permission[], permission: Permission): boolean;
