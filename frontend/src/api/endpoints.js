export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  DASHBOARD: {
    SUMMARY: '/dashboard/summary',
    REVENUE: '/dashboard/revenue',
    TOP_PRODUCTS: '/dashboard/top-products',
  },
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  ORDERS: '/orders',
  INVENTORY: {
    STATUS: '/inventory',
    RESTOCK: (id) => `/inventory/restock/${id}`,
    LOGS: '/inventory/logs',
  },
  CUSTOMERS: '/customers',
  EMPLOYEES: '/employees',
  OFFERS: '/offers',
  SETTINGS: '/settings',
  UPLOAD: '/upload',
  NOTIFICATIONS: {
    GET: '/notifications',
    READ_ALL: '/notifications/read-all',
  },
  REPORTS: {
    SALES: '/reports/daily-sales', // now accepts start and end date
    INVENTORY: '/inventory/logs'
  }
};
