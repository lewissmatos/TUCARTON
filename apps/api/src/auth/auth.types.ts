export interface AuthenticatedIdentity {
  subject: string;
  email?: string;
}

export interface PhoneVerificationProvider {
  start(userId: string, phoneE164: string): Promise<{ verificationId: string }>;
  verify(
    userId: string,
    verificationId: string,
    code: string,
  ): Promise<{ approved: boolean; phoneE164?: string }>;
}
