import { supabase } from './supabase-client';
import type {
  Activity,
  Company,
  Contact,
  CrmTask,
  CrmUser,
  Deal,
  DealStage,
  Order,
  OrderStatus,
  Product,
  ProductionJob,
  ProductionStatus,
  ProductCategory,
  Proposal,
} from './crm/types';

function resolveApiBase(): string {
  // Browser calls stay same-origin so Next.js can proxy /api/v1 to the backend.
  // That avoids CORS preflight failures between localhost and 127.0.0.1.
  if (typeof window !== 'undefined') {
    return '/api/v1';
  }

  const raw = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001')
    .replace(/\/$/, '')
    .replace('://localhost', '://127.0.0.1');
  return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
}

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

function toQuery(params?: ApiRequestOptions['params']): string {
  if (!params) {
    return '';
  }

  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 'all') {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `?${query}` : '';
}

class ApiClient {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers: Record<string, string> = {};

    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    return headers;
  }

  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { method = 'GET', body, params } = options;
    const apiBase = resolveApiBase();

    const headers = await this.getAuthHeaders();
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    let response: Response;

    try {
      response = await fetch(`${apiBase}${endpoint}${toQuery(params)}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new Error(
        `API indisponible (${apiBase}). Verifie que le backend tourne.`,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const payload = await response.json().catch(() => ({ message: 'An error occurred' }));

    if (!response.ok) {
      const message = Array.isArray(payload?.message)
        ? payload.message.join(', ')
        : payload?.message || `HTTP error! status: ${response.status}`;
      throw new Error(message);
    }

    return payload as T;
  }

  get<T>(endpoint: string, params?: ApiRequestOptions['params']) {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  post<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  put<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async downloadBlob(endpoint: string, filename: string) {
    const apiBase = resolveApiBase();
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${apiBase}${endpoint}`, { headers });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({ message: 'Telechargement impossible' }));
      const message = Array.isArray(payload?.message)
        ? payload.message.join(', ')
        : payload?.message || `HTTP ${response.status}`;
      throw new Error(message);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
}

export const apiClient = new ApiClient();

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EnhancedDashboardStats {
  filters?: { from?: string | null; to?: string | null; wilaya?: string };
  wilayas?: string[];
  revenue: {
    total: number;
    gmv?: number;
    avgOrderValue: number;
    totalOrders: number;
    deliveredOrders?: number;
    deliveryFee?: number;
    discount?: number;
  };
  funnel?: {
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    confirmationRate: number;
    deliveryRate: number;
    cancelRate: number;
  };
  orderStatusBreakdown: Array<{
    status: string;
    count: number;
    total: number;
  }>;
  paymentBreakdown?: Array<{ status: string; count: number; total: number }>;
  deliveryTypeBreakdown?: Array<{ type: string; count: number; total: number }>;
  topWilayas: Array<{
    wilaya: string;
    count: number;
    total: number;
  }>;
  revenueTrends: Array<{
    date: string;
    revenue: number;
    gmv?: number;
    orders: number;
  }>;
  productionQueue: Array<{
    status: string;
    count: number;
  }>;
  dealsPipeline: Array<{
    stage: string;
    count: number;
    total: number;
  }>;
  recentOrders: Array<Partial<Order>>;
}

export interface KPIs {
  revenue: {
    currentMonth: number;
    lastMonth: number;
    growthRate: number;
    gmv?: number;
  };
  orders: {
    currentMonth: number;
    pending?: number;
    cancelled?: number;
    confirmationRate: number;
    deliveryRate: number;
    avgOrderValue?: number;
  };
  production: {
    inProgress: number;
  };
  sales: {
    pipelineAmount: number;
  };
  tasks?: {
    open: number;
  };
}

export const dashboardApi = {
  getStats: (params?: { from?: string; to?: string; wilaya?: string }) =>
    apiClient.get<EnhancedDashboardStats>('/crm/dashboard/stats', params),
  getEnhancedStats: (params?: { from?: string; to?: string; wilaya?: string }) =>
    apiClient.get<EnhancedDashboardStats>('/crm/dashboard/enhanced-stats', params),
  getKPIs: (params?: { from?: string; to?: string; wilaya?: string }) =>
    apiClient.get<KPIs>('/crm/dashboard/kpis', params),
};

export const crmOrdersApi = {
  getAll: (params?: {
    status?: string;
    wilaya?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => apiClient.get<PaginatedOrders>('/crm/orders', params),
  getById: (id: string) => apiClient.get<Order>(`/crm/orders/${id}`),
  updateStatus: (id: string, status: OrderStatus | string, note?: string) =>
    apiClient.put<Order>(`/crm/orders/${id}/status`, { status, note }),
  create: (orderData: {
    firstName: string;
    lastName?: string;
    phone: string;
    wilayaName?: string;
    wilayaCode?: number;
    productId?: string;
    contactId?: string;
    quantity?: number;
    notes?: string;
    email?: string;
  }) => apiClient.post<Order>('/crm/orders', orderData),
};

export const crmCustomersApi = {
  getAll: (params?: { companyId?: string; wilaya?: string }) =>
    apiClient.get<Contact[]>('/crm/customers', params),
  getById: (id: string) => apiClient.get<Contact>(`/crm/customers/${id}`),
  create: (customerData: Partial<Contact> & { firstName: string; lastName: string; phone: string; wilaya: string; type: Contact['type'] }) =>
    apiClient.post<Contact>('/crm/customers', customerData),
  update: (id: string, customerData: Partial<Contact>) =>
    apiClient.put<Contact>(`/crm/customers/${id}`, customerData),
  delete: (id: string) => apiClient.delete(`/crm/customers/${id}`),
};

export const crmCompaniesApi = {
  getAll: () => apiClient.get<Company[]>('/crm/companies'),
  create: (data: { name: string; sector: string; commercialTerms?: string }) =>
    apiClient.post<Company>('/crm/companies', data),
  update: (id: string, data: Partial<Company>) =>
    apiClient.put<Company>(`/crm/companies/${id}`, data),
  delete: (id: string) => apiClient.delete(`/crm/companies/${id}`),
};

export const crmDealsApi = {
  getAll: () => apiClient.get<Deal[]>('/crm/deals'),
  create: (data: {
    title: string;
    estimatedAmount: number;
    stage?: DealStage;
    contactId?: string;
    companyId?: string;
    expectedCloseAt?: string;
  }) => apiClient.post<Deal>('/crm/deals', data),
  update: (id: string, data: Partial<Deal>) =>
    apiClient.put<Deal>(`/crm/deals/${id}`, data),
  delete: (id: string) => apiClient.delete(`/crm/deals/${id}`),
};

export const crmProposalsApi = {
  getAll: () => apiClient.get<Proposal[]>('/crm/proposals'),
  create: (data: {
    dealId: string;
    status?: Proposal['status'];
    items: Proposal['items'];
    total: number;
  }) => apiClient.post<Proposal>('/crm/proposals', data),
  update: (id: string, data: Partial<Proposal>) =>
    apiClient.put<Proposal>(`/crm/proposals/${id}`, data),
  delete: (id: string) => apiClient.delete(`/crm/proposals/${id}`),
};

export const crmActivitiesApi = {
  getAll: () => apiClient.get<Activity[]>('/crm/activities'),
  create: (data: {
    type: Activity['type'];
    target: string;
    description: string;
    ownerId?: string;
  }) => apiClient.post<Activity>('/crm/activities', data),
  delete: (id: string) => apiClient.delete(`/crm/activities/${id}`),
};

export const crmProductionApi = {
  getAll: () => apiClient.get<ProductionJob[]>('/crm/production'),
  create: (data: {
    orderId: string;
    orderRef: string;
    clientName: string;
    productSummary: string;
    status?: ProductionStatus;
  }) => apiClient.post<ProductionJob>('/crm/production', data),
  update: (id: string, data: Partial<ProductionJob>) =>
    apiClient.put<ProductionJob>(`/crm/production/${id}`, data),
};

export const crmTasksApi = {
  getAll: () => apiClient.get<CrmTask[]>('/crm/tasks'),
  create: (data: {
    title: string;
    assigneeId: string;
    assigneeName: string;
    dueAt: string;
    priority: CrmTask['priority'];
    projectId?: string;
  }) => apiClient.post<CrmTask>('/crm/tasks', data),
  update: (id: string, data: Partial<CrmTask>) =>
    apiClient.put<CrmTask>(`/crm/tasks/${id}`, data),
  delete: (id: string) => apiClient.delete(`/crm/tasks/${id}`),
};

export const crmProductsApi = {
  getAll: () => apiClient.get<Product[]>('/crm/products'),
  getCategories: () => apiClient.get<ProductCategory[]>('/crm/products/categories'),
  create: (data: {
    name: string;
    categoryId: string;
    price: number;
    shortDescription?: string;
    photoUrl?: string;
    isActive?: boolean;
    isPersonalizable?: boolean;
  }) => apiClient.post<Product>('/crm/products', data),
  update: (
    id: string,
    data: {
      name?: string;
      categoryId?: string;
      price?: number;
      shortDescription?: string;
      photoUrl?: string;
      isActive?: boolean;
      isPersonalizable?: boolean;
    },
  ) => apiClient.put<Product>(`/crm/products/${id}`, data),
  setActive: (id: string, active: boolean) =>
    apiClient.put<{ id: string; isActive: boolean }>(`/crm/products/${id}/active`, {
      active,
    }),
  delete: (id: string) => apiClient.delete(`/crm/products/${id}`),
};

export const crmDeliveryApi = {
  createParcel: (orderId: string) =>
    apiClient.post<Order>(`/crm/delivery/yalidine/${orderId}`),
  syncParcel: (orderId: string) =>
    apiClient.post<Order>(`/crm/delivery/yalidine/${orderId}/sync`),
  health: () => apiClient.get<{ ok: boolean; provider: string; wilayas: number }>('/crm/delivery/yalidine/health'),
  getLabel: (orderId: string) =>
    apiClient.get<{ url: string; tracking: string | null }>(`/crm/delivery/yalidine/${orderId}/label`),
  downloadBordereau: (orderId: string, reference: string) =>
    apiClient.downloadBlob(
      `/crm/delivery/bordereau/${orderId}`,
      `bordereau-${reference}.pdf`,
    ),
};

export const crmUsersApi = {
  getAll: () => apiClient.get<Array<{
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string | null;
  }>>('/crm/users'),
  getPerformance: (id: string, params?: { period?: string; from?: string; to?: string }) =>
    apiClient.get<{
      user: { id: string; email: string; firstName?: string | null; lastName?: string | null; role: string };
      period: { label: string; from: string; to: string };
      kpis: {
        statusChanges: number;
        confirmations: number;
        deliveries: number;
        ordersTouched: number;
        activities: number;
        tasksDone: number;
        tasksOpen: number;
        dealsOwned: number;
        logins: number;
      };
      daily: Array<{ date: string; statusChanges: number; activities: number; tasks: number; logins: number }>;
      timeline: Array<{ at: string; type: string; label: string; detail?: string | null }>;
    }>(`/crm/users/${id}/performance`, params),
  create: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role: string;
  }) =>
    apiClient.post<{
      id: string;
      email: string;
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
      role: string;
      isActive: boolean;
      createdAt: string;
    }>('/crm/users', data),
  update: (
    id: string,
    data: {
      role?: string;
      isActive?: boolean;
      firstName?: string;
      lastName?: string;
      phone?: string;
    },
  ) =>
    apiClient.put<{
      id: string;
      email: string;
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
      role: string;
      isActive: boolean;
    }>(`/crm/users/${id}`, data),
};

export interface AuthMeProfile {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  isActive?: boolean;
}

export const authApi = {
  getProfile: () => apiClient.get<AuthMeProfile>('/auth/me'),
};

export function mapApiUserToCrmUser(user: {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
    phone?: string | null;
    role: string;
  isActive: boolean;
  createdAt?: string;
  lastLoginAt?: string | null;
}): CrmUser {
  const roleMapping: Record<string, CrmUser['roles']> = {
    admin: ['admin', 'commercial', 'confirmation', 'atelier_design', 'fabrication', 'preparation', 'livraison'],
    super_admin: ['admin', 'commercial', 'confirmation', 'atelier_design', 'fabrication', 'preparation', 'livraison'],
    commercial: ['commercial'],
    fabrication: ['fabrication'],
    preparation: ['preparation'],
    livraison: ['livraison'],
    confirmation: ['confirmation'],
  };

  return {
    id: user.id,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
    email: user.email,
    roles: roleMapping[user.role] || [],
    active: user.isActive,
    lastLoginAt: user.lastLoginAt || user.createdAt,
    businessRole: user.role,
    phone: user.phone ?? undefined,
  };
}
