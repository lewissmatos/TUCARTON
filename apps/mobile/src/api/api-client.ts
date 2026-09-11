import type {
  Business,
  Customer,
  CustomerRelationship,
  Debt,
  RelationshipLedger,
  Session,
  User,
} from '../types/core';

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
  register: (displayName: string, phone: string, passcode: string) =>
    request<Session>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ displayName, passcode, phone }),
    }),
  login: (phone: string, passcode: string) =>
    request<Session>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ passcode, phone }) }),
  me: (session: Session) => request<User>('/api/v1/auth/session/me', {}, session),
  logout: (session: Session) =>
    request<{ ok: true }>(
      '/api/v1/auth/session/logout',
      { method: 'POST', body: JSON.stringify({ refreshToken: session.refreshToken }) },
      session,
    ),
  businesses: (session: Session) => request<Business[]>('/api/v1/businesses', {}, session),
  createBusiness: (session: Session, name: string) =>
    request<Business>(
      '/api/v1/businesses',
      { method: 'POST', body: JSON.stringify({ name }) },
      session,
    ),
  addCustomer: (session: Session, businessId: string, identifier: string) =>
    request(
      '/api/v1/businesses/' + businessId + '/customers',
      { method: 'POST', body: JSON.stringify({ identifier }) },
      session,
    ),
  customers: (session: Session, businessId: string) =>
    request<Customer[]>(`/api/v1/businesses/${businessId}/customers`, {}, session),
  createDebt: (
    session: Session,
    businessId: string,
    identifier: string,
    amountMinor: number,
    note: string,
  ) =>
    request(
      '/api/v1/businesses/' + businessId + '/debts',
      { method: 'POST', body: JSON.stringify({ amountMinor, identifier, note }) },
      session,
    ),
  pendingDebts: (session: Session) =>
    request<Debt[]>('/api/v1/customer/debts/pending', {}, session),
  acknowledgeDebt: (session: Session, debtId: string) =>
    request(`/api/v1/customer/debts/${debtId}/acknowledge`, { method: 'POST' }, session),
  rejectDebt: (session: Session, debtId: string, reason?: string) =>
    request(
      `/api/v1/customer/debts/${debtId}/reject`,
      { body: JSON.stringify({ reason }), method: 'POST' },
      session,
    ),
  businessLedger: (session: Session, businessId: string, customerCode: string, cursor?: string) =>
    request<RelationshipLedger>(
      `/api/v1/businesses/${businessId}/customers/${customerCode}/ledger${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`,
      {},
      session,
    ),
  customerRelationships: (session: Session) =>
    request<CustomerRelationship[]>('/api/v1/customer/relationships', {}, session),
  customerLedger: (session: Session, businessId: string, cursor?: string) =>
    request<RelationshipLedger>(
      `/api/v1/customer/businesses/${businessId}/ledger${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`,
      {},
      session,
    ),
};
