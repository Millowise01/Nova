// Re-exported from @nova/validation — the canonical, backend-shared source. Do not
// redefine these schemas locally; that duplication was already found and fixed once.
export {
  loginSchema,
  registerSchema,
  otpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput as LoginFormValues,
  type RegisterInput as RegisterFormValues,
  type OtpInput as OtpFormValues,
  type ForgotPasswordInput as ForgotPasswordFormValues,
  type ResetPasswordInput as ResetPasswordFormValues,
} from "@nova/validation";
