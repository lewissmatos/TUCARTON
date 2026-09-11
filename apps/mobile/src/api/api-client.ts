import type { Business, Debt, Session, User } from '../types/core';

const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}, session?: Session): Promise<T> {
  if (!baseUrl) throw new ApiError('Falta conectar esta app con el servicio local.');
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (session) headers.set('Authorization', `Bearer ${session.accessToken}`);
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const body = (await response.json().catch(() => null)) as { message?: string } | null;
  if (!response.ok) throw new ApiError(body?.message ?? 'No pudimos completar la solicitud.');
  return body as T;
}

export const api = {
  startPhone: (phone: string) =>
    request<{ verificationId: string; developmentCode?: string }>(
      '/api/v1/auth/phone-access/start',
      { method: 'POST', body: JSON.stringify({ phone }) },
    ),
  verifyPhone: (phone: string, verificationId: string, code: string) =>
    request<Session>('/api/v1/auth/phone-access/verify', {
      method: 'POST',
      body: JSON.stringify({ code, phone, verificationId }),
    }),
  me: (session: Session) => request<User>('/api/v1/auth/phone-access/me', {}, session),
  businesses: (session: Session) => request<Business[]>('/api/v1/businesses', {}, session),
  createBusiness: (session: Session, name: string) =>
    request<Business>(
      '/api/v1/businesses',
      { method: 'POST', body: JSON.stringify({ name }) },
      session,
    ),
  addCustomer: (session: Session, businessId: string, tuCartonCode: string) =>
    request(
      '/api/v1/businesses/' + businessId + '/customers',
      { method: 'POST', body: JSON.stringify({ tuCartonCode }) },
      session,
    ),
  createDebt: (
    session: Session,
    businessId: string,
    tuCartonCode: string,
    amountMinor: number,
    note: string,
  ) =>
    request(
      '/api/v1/businesses/' + businessId + '/debts',
      { method: 'POST', body: JSON.stringify({ amountMinor, note, tuCartonCode }) },
      session,
    ),
  pendingDebts: (session: Session) =>
    request<Debt[]>('/api/v1/customer/debts/pending', {}, session),
  acknowledgeDebt: (session: Session, debtId: string) =>
    request(`/api/v1/customer/debts/${debtId}/acknowledge`, { method: 'POST' }, session),
};
