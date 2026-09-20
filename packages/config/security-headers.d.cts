export interface SecurityHeader {
  key: string;
  value: string;
}

export interface SecurityHeaderRule {
  source: string;
  headers: SecurityHeader[];
}

export const securityHeaders: SecurityHeader[];
export const securityHeaderRules: SecurityHeaderRule[];
