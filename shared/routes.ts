import { z } from 'zod';
import { 
  insertUserSchema, 
  insertPropertySchema, 
  insertTenantSchema, 
  insertLeaseSchema, 
  insertPaymentSchema,
  properties,
  tenants,
  leases,
  payments
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.object({ id: z.number(), username: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user' as const,
      responses: {
        200: z.object({ id: z.number(), username: z.string() }).nullable(),
      },
    },
  },
  stats: {
    get: {
      method: 'GET' as const,
      path: '/api/stats' as const,
      responses: {
        200: z.object({
          totalProperties: z.number(),
          totalTenants: z.number(),
          totalMonthlyIncome: z.number(),
          pendingPayments: z.number(),
        }),
      },
    },
  },
  properties: {
    list: {
      method: 'GET' as const,
      path: '/api/properties' as const,
      responses: {
        200: z.array(z.custom<typeof properties.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/properties' as const,
      input: insertPropertySchema,
      responses: {
        201: z.custom<typeof properties.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/properties/:id' as const,
      responses: {
        200: z.custom<typeof properties.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/properties/:id' as const,
      input: insertPropertySchema.partial(),
      responses: {
        200: z.custom<typeof properties.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/properties/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  tenants: {
    list: {
      method: 'GET' as const,
      path: '/api/tenants' as const,
      responses: {
        200: z.array(z.custom<typeof tenants.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tenants' as const,
      input: insertTenantSchema,
      responses: {
        201: z.custom<typeof tenants.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/tenants/:id' as const,
      responses: {
        200: z.custom<typeof tenants.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/tenants/:id' as const,
      input: insertTenantSchema.partial(),
      responses: {
        200: z.custom<typeof tenants.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tenants/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  leases: {
    list: {
      method: 'GET' as const,
      path: '/api/leases' as const,
      responses: {
        200: z.array(z.custom<typeof leases.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/leases' as const,
      input: insertLeaseSchema,
      responses: {
        201: z.custom<typeof leases.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/leases/:id' as const,
      input: insertLeaseSchema.partial(),
      responses: {
        200: z.custom<typeof leases.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  payments: {
    list: {
      method: 'GET' as const,
      path: '/api/payments' as const,
      responses: {
        200: z.array(z.custom<typeof payments.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/payments' as const,
      input: insertPaymentSchema,
      responses: {
        201: z.custom<typeof payments.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/payments/:id' as const,
      input: insertPaymentSchema.partial(),
      responses: {
        200: z.custom<typeof payments.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
