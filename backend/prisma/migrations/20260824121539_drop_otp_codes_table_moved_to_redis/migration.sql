-- OTP codes moved off Postgres to Redis (backend/src/modules/identity/domain/otp.service.ts):
-- a 10-minute one-time code is transient session state, which backend/docs/03-database-
-- conventions.md's storage-topology table already scopes to Redis, not the Postgres system
-- of record. Redis TTL replaces the manual expires_at check; DEL-on-verify replaces
-- consumed_at.
DROP TABLE "otp_codes";
