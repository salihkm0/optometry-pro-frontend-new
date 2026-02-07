const endpoints = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  refreshToken: '/auth/refresh-token',
  me: '/auth/me',
  changePassword: '/auth/change-password',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  
  // Shops
  shops: '/shops',
  shopStats: (id) => `/shops/${id}/stats`,
  dashboardStats: '/shops/dashboard/stats',
  shopActivate: (id) => `/shops/${id}/activate`,
  shopDeactivate: (id) => `/shops/${id}/deactivate`,
  
  // Customers
  customers: '/customers',
  customer: (id) => `/customers/${id}`,
  customerStats: (id) => `/customers/${id}/stats`,
  searchCustomers: '/customers/search',
  shopCustomers: (shopId) => `/customers/shop/${shopId}`,
  
  // Records
  records: '/records',
  record: (id) => `/records/${id}`,
  exportRecords: '/records/export',
  customerRecords: (customerId) => `/records/customer/${customerId}`,
  shopRecordsStats: (shopId) => `/records/shop/${shopId}/stats`,
  
  // Users
  users: '/users',
  user: (id) => `/users/${id}`,
  resetUserPassword: (id) => `/users/${id}/reset-password`,
  shopUsers: (shopId) => `/users/shop/${shopId}`,
  
  // PRINT ENDPOINTS - Add these
  printRecord: (id) => `/print/records/${id}`,
  printPrescription: (id) => `/print/prescription/${id}`,
  printInvoice: (id) => `/print/invoice/${id}`,
  exportRecordPDF: (id) => `/print/export/pdf/${id}`,
  printMultipleRecords: '/print/records-batch',

  // Settings endpoints
  adminSettings: '/admin/settings',
  shopSettings: (shopId) => `/shops/${shopId}/settings`,
  updateShopSettings: (shopId) => `/shops/${shopId}/settings`,
  updateAdminSettings: '/admin/settings',
  
  // Billing endpoints
  billing: '/billing',
  billingById: (id) => `/billing/${id}`,
  billingByInvoice: (invoiceNumber) => `/billing/invoice/${invoiceNumber}`,
  customerBilling: (customerId) => `/billing/customer/${customerId}`,
  updatePayment: (id) => `/billing/${id}/payment`,
  billingStats: '/billing/stats',
  exportBilling: '/billing/export',
  
  // NEW PDF ENDPOINTS
  printBill: (id) => `/api/billing/${id}/print`,
  generateBillPDF: (id) => `/api/billing/${id}/generate-pdf`,
  downloadBillPDF: (id) => `/api/billing/${id}/download-pdf`,
  previewBill: (id) => `/api/billing/${id}/preview`,
  bulkGeneratePDF: '/api/billing/bulk-generate-pdf',
  getPrintOptions: '/api/billing/print-options'
};

export default endpoints;