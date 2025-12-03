// Route definitions and configurations
export const ROUTES = {
  // Authentication
  LOGIN: '/login',
  LOGOUT: '/logout',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Main routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',

  // User Management
  USERS: '/users',
  USER_DETAILS: '/users/:id',
  USER_CREATE: '/users/create',
  USER_EDIT: '/users/:id/edit',
  
  EMPLOYEES: '/users/employees',
  EMPLOYEE_DETAILS: '/users/employees/:id',
  
  COORDINATORS: '/users/coordinators',
  COORDINATOR_DETAILS: '/users/coordinators/:id',
  
  ENGINEERS: '/users/engineers',
  ENGINEER_DETAILS: '/users/engineers/:id',
  
  DEPARTMENT_HEADS: '/users/department-heads',
  DEPARTMENT_HEAD_DETAILS: '/users/department-heads/:id',
  
  ADMINS: '/users/admins',
  ADMIN_DETAILS: '/users/admins/:id',

  // Department Management
  DEPARTMENTS: '/departments',
  DEPARTMENT_DETAILS: '/departments/:id',
  DEPARTMENT_CREATE: '/departments/create',
  DEPARTMENT_EDIT: '/departments/:id/edit',

  // Master Data
  MASTERS: '/masters',
  
  // OEM Management
  OEM: '/masters/oem',
  OEM_CREATE: '/masters/oem/create',
  OEM_EDIT: '/masters/oem/:id/edit',
  OEM_DETAILS: '/masters/oem/:id',
  
  // Category Management
  CATEGORIES: '/masters/categories',
  CATEGORY_CREATE: '/masters/categories/create',
  CATEGORY_EDIT: '/masters/categories/:id/edit',
  CATEGORY_DETAILS: '/masters/categories/:id',
  
  // Product Management
  PRODUCTS: '/masters/products',
  PRODUCT_CREATE: '/masters/products/create',
  PRODUCT_EDIT: '/masters/products/:id/edit',
  PRODUCT_DETAILS: '/masters/products/:id',
  
  // Location Management
  LOCATIONS: '/masters/locations',
  LOCATION_CREATE: '/masters/locations/create',
  LOCATION_EDIT: '/masters/locations/:id/edit',
  LOCATION_DETAILS: '/masters/locations/:id',

  // Asset Management
  ASSETS: '/assets',
  ASSET_INVENTORY: '/assets/inventory',
  ASSET_LIFECYCLE: '/assets/lifecycle',
  ASSET_DETAILS: '/assets/:id',
  ASSET_CREATE: '/assets/create',
  ASSET_EDIT: '/assets/:id/edit',
  ASSET_ASSIGNMENT: '/assets/assignment',
  ASSET_REQUISITIONS: '/assets/requisitions',
  ASSET_MAINTENANCE: '/assets/maintenance',
  ASSET_TRANSFER: '/assets/transfer',

  // My Assets (Employee view)
  MY_ASSETS: '/my-assets',
  MY_ASSET_DETAILS: '/my-assets/:id',

  // Requisitions
  REQUISITIONS: '/requisitions',
  REQUISITION_DETAILS: '/requisitions/:id',
  REQUISITION_CREATE: '/requisitions/create',
  REQUISITION_EDIT: '/requisitions/:id/edit',
  MY_REQUISITIONS: '/my-requisitions',

  // Ticket Management
  TICKETS: '/tickets',
  TICKET_DETAILS: '/tickets/:id',
  TICKET_CREATE: '/create-ticket',
  TICKET_EDIT: '/tickets/:id/edit',
  TICKET_QUEUE: '/tickets/queue',
  MY_TICKETS: '/tickets/my-tickets',
  ASSIGNED_TICKETS: '/tickets/assigned',
  ENGINEER_TICKETS: '/engineer/tickets',

  // Reports
  REPORTS: '/reports',
  REPORTS_DASHBOARD: '/reports/dashboard',
  REPORTS_ASSETS: '/reports/assets',
  REPORTS_TICKETS: '/reports/tickets',
  REPORTS_USERS: '/reports/users',
  REPORTS_DEPARTMENTS: '/reports/departments',

  // Error pages
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',
  SERVER_ERROR: '/500',

  // Settings
  PERMISSION_CONTROL: '/admin/permission-control',
  SYSTEM_CONFIG: '/settings/system-config',

  // Admin Panel - Permission Control
  ADMIN_PERMISSION_CONTROL: '/admin/permission-control',
  ADMIN_ROLE_MANAGEMENT: '/admin/permission-control/roles',
  ADMIN_USER_PERMISSIONS: '/admin/permission-control/users',
  ADMIN_PERMISSION_ANALYTICS: '/admin/permission-control/analytics',
  ADMIN_PERMISSION_AUDIT: '/admin/permission-control/audit',
  ADMIN_PERMISSION_SETTINGS: '/admin/permission-control/settings',

  // Help and Support
  HELP: '/help',
  SUPPORT: '/support',
  DOCUMENTATION: '/documentation',

  // Software License Management
  LICENSES: '/licenses',
  LICENSE_DETAILS: '/licenses/:id',

  // Fault Analysis
  FAULT_ANALYSIS: '/fault-analysis',
  REPAIR_HISTORY: '/repair-history',
  FAULT_THRESHOLD_CONFIG: '/settings/fault-thresholds',
  FAULT_TYPE_MANAGEMENT: '/admin/fault-types'
}

// Route metadata and permissions
export const ROUTE_META = {
  [ROUTES.DASHBOARD]: {
    title: 'Dashboard',
    breadcrumb: ['Dashboard'],
    roles: ['all'],
    icon: 'dashboard'
  },
  
  // User Management Routes
  [ROUTES.USERS]: {
    title: 'User Management',
    breadcrumb: ['User Management'],
    roles: ['admin', 'superadmin'],
    icon: 'team'
  },
  [ROUTES.EMPLOYEES]: {
    title: 'Employees',
    breadcrumb: ['User Management', 'Employees'],
    roles: ['admin', 'superadmin', 'department_head', 'coordinator'],
    icon: 'user'
  },
  [ROUTES.COORDINATORS]: {
    title: 'Coordinators',
    breadcrumb: ['User Management', 'Coordinators'],
    roles: ['admin', 'superadmin', 'department_head'],
    icon: 'usergroup-add'
  },
  [ROUTES.ENGINEERS]: {
    title: 'Engineers',
    breadcrumb: ['User Management', 'Engineers'],
    roles: ['admin', 'superadmin', 'department_head', 'coordinator'],
    icon: 'tool'
  },
  [ROUTES.DEPARTMENT_HEADS]: {
    title: 'Department Heads',
    breadcrumb: ['User Management', 'Department Heads'],
    roles: ['admin', 'superadmin'],
    icon: 'crown'
  },
  [ROUTES.ADMINS]: {
    title: 'Administrators',
    breadcrumb: ['User Management', 'Administrators'],
    roles: ['superadmin'],
    icon: 'setting'
  },

  // Department Routes
  [ROUTES.DEPARTMENTS]: {
    title: 'Departments',
    breadcrumb: ['Departments'],
    roles: ['admin', 'superadmin', 'department_head'],
    icon: 'apartment'
  },

  // Master Data Routes
  [ROUTES.OEM]: {
    title: 'OEM Management',
    breadcrumb: ['Masters', 'OEM'],
    roles: ['admin', 'superadmin'],
    icon: 'building'
  },
  [ROUTES.CATEGORIES]: {
    title: 'Categories',
    breadcrumb: ['Masters', 'Categories'],
    roles: ['admin', 'superadmin'],
    icon: 'tags'
  },
  [ROUTES.PRODUCTS]: {
    title: 'Products',
    breadcrumb: ['Masters', 'Products'],
    roles: ['admin', 'superadmin'],
    icon: 'shopping'
  },
  [ROUTES.LOCATIONS]: {
    title: 'Locations',
    breadcrumb: ['Masters', 'Locations'],
    roles: ['admin', 'superadmin'],
    icon: 'environment'
  },

  // Asset Routes
  [ROUTES.ASSET_INVENTORY]: {
    title: 'Asset Inventory',
    breadcrumb: ['Assets', 'Inventory'],
    roles: ['coordinator', 'admin', 'superadmin', 'department_coordinator'],
    icon: 'database'
  },
  [ROUTES.ASSET_LIFECYCLE]: {
    title: 'Asset Lifecycle',
    breadcrumb: ['Assets', 'Lifecycle'],
    roles: ['coordinator', 'admin', 'superadmin'],
    icon: 'clock-circle'
  },
  [ROUTES.ASSET_ASSIGNMENT]: {
    title: 'Asset Assignment',
    breadcrumb: ['Assets', 'Assignment'],
    roles: ['coordinator', 'admin', 'superadmin', 'department_coordinator'],
    icon: 'swap'
  },
  [ROUTES.ASSET_REQUISITIONS]: {
    title: 'Asset Requisitions',
    breadcrumb: ['Assets', 'Requisitions'],
    roles: ['coordinator', 'admin', 'superadmin', 'department_coordinator'],
    icon: 'form'
  },
  [ROUTES.MY_ASSETS]: {
    title: 'My Assets',
    breadcrumb: ['My Assets'],
    roles: ['all'],
    icon: 'laptop'
  },

  // Ticket Routes
  [ROUTES.TICKET_CREATE]: {
    title: 'Create Ticket',
    breadcrumb: ['Create Ticket'],
    roles: ['all'],
    icon: 'plus-circle'
  },
  [ROUTES.MY_TICKETS]: {
    title: 'My Tickets',
    breadcrumb: ['Tickets', 'My Tickets'],
    roles: ['all'],
    icon: 'customer-service'
  },
  [ROUTES.TICKET_QUEUE]: {
    title: 'Ticket Queue',
    breadcrumb: ['Tickets', 'Queue'],
    roles: ['engineer', 'coordinator', 'admin', 'superadmin'],
    icon: 'unordered-list'
  },

  // Reports Routes
  [ROUTES.REPORTS_DASHBOARD]: {
    title: 'Reports Dashboard',
    breadcrumb: ['Reports', 'Dashboard'],
    roles: ['all'],
    icon: 'bar-chart'
  },
  [ROUTES.REPORTS_ASSETS]: {
    title: 'Asset Reports',
    breadcrumb: ['Reports', 'Assets'],
    roles: ['all'],
    icon: 'file-text'
  },
  [ROUTES.REPORTS_TICKETS]: {
    title: 'Ticket Reports',
    breadcrumb: ['Reports', 'Tickets'],
    roles: ['all'],
    icon: 'file-search'
  },

  // Settings Routes
  [ROUTES.PERMISSION_CONTROL]: {
    title: 'Permission Control',
    breadcrumb: ['Settings', 'Permission Control'],
    roles: ['superadmin'],
    icon: 'security-scan'
  },
  [ROUTES.SYSTEM_CONFIG]: {
    title: 'System Configuration',
    breadcrumb: ['Settings', 'System Configuration'],
    roles: ['superadmin'],
    icon: 'control'
  },

  // Admin Panel - Permission Control Routes
  [ROUTES.ADMIN_PERMISSION_CONTROL]: {
    title: 'Permission Control',
    breadcrumb: ['Admin', 'Permission Control'],
    roles: ['superadmin'],
    icon: 'security-scan'
  },
  [ROUTES.ADMIN_ROLE_MANAGEMENT]: {
    title: 'Role Management',
    breadcrumb: ['Admin', 'Permission Control', 'Roles'],
    roles: ['superadmin'],
    icon: 'team'
  },
  [ROUTES.ADMIN_USER_PERMISSIONS]: {
    title: 'User Permissions',
    breadcrumb: ['Admin', 'Permission Control', 'Users'],
    roles: ['superadmin'],
    icon: 'user'
  },
  [ROUTES.ADMIN_PERMISSION_ANALYTICS]: {
    title: 'Permission Analytics',
    breadcrumb: ['Admin', 'Permission Control', 'Analytics'],
    roles: ['superadmin'],
    icon: 'bar-chart'
  },
  [ROUTES.ADMIN_PERMISSION_AUDIT]: {
    title: 'Permission Audit',
    breadcrumb: ['Admin', 'Permission Control', 'Audit'],
    roles: ['superadmin'],
    icon: 'audit'
  },
  [ROUTES.ADMIN_PERMISSION_SETTINGS]: {
    title: 'Permission Settings',
    breadcrumb: ['Admin', 'Permission Control', 'Settings'],
    roles: ['superadmin'],
    icon: 'setting'
  },

  // Software License Management
  [ROUTES.LICENSES]: {
    title: 'Software Licenses',
    breadcrumb: ['Software Licenses'],
    roles: ['admin', 'superadmin', 'coordinator', 'it_head'],
    icon: 'safety-certificate'
  },
  [ROUTES.LICENSE_DETAILS]: {
    title: 'License Details',
    breadcrumb: ['Software Licenses', 'Details'],
    roles: ['admin', 'superadmin', 'coordinator', 'it_head'],
    icon: 'safety-certificate'
  },

  // Fault Analysis
  [ROUTES.FAULT_ANALYSIS]: {
    title: 'Fault Analysis',
    breadcrumb: ['Fault Analysis'],
    roles: ['admin', 'superadmin', 'coordinator', 'it_head', 'engineer'],
    icon: 'warning'
  },
  [ROUTES.REPAIR_HISTORY]: {
    title: 'Repair History',
    breadcrumb: ['Repair History'],
    roles: ['admin', 'superadmin', 'coordinator', 'it_head', 'engineer'],
    icon: 'tool'
  },
  [ROUTES.FAULT_THRESHOLD_CONFIG]: {
    title: 'Fault Threshold Configuration',
    breadcrumb: ['Settings', 'Fault Thresholds'],
    roles: ['admin', 'superadmin'],
    icon: 'setting'
  },
  [ROUTES.FAULT_TYPE_MANAGEMENT]: {
    title: 'Fault Type Management',
    breadcrumb: ['Admin', 'Fault Types'],
    roles: ['admin', 'superadmin'],
    icon: 'tool'
  }
}

// Navigation menu structure
export const NAVIGATION_MENU = [
  {
    key: 'dashboard',
    path: ROUTES.DASHBOARD,
    title: 'Dashboard',
    icon: 'dashboard',
    roles: ['all']
  },
  {
    key: 'users',
    title: 'User Management',
    icon: 'team',
    roles: ['admin', 'superadmin', 'department_head', 'coordinator'],
    children: [
      {
        key: 'all-users',
        path: ROUTES.USERS,
        title: 'All Users',
        roles: ['admin', 'superadmin']
      },
      {
        key: 'employees',
        path: ROUTES.EMPLOYEES,
        title: 'Employees',
        roles: ['admin', 'superadmin', 'department_head', 'coordinator']
      },
      {
        key: 'coordinators',
        path: ROUTES.COORDINATORS,
        title: 'Coordinators',
        roles: ['admin', 'superadmin', 'department_head']
      },
      {
        key: 'engineers',
        path: ROUTES.ENGINEERS,
        title: 'Engineers',
        roles: ['admin', 'superadmin', 'department_head', 'coordinator']
      },
      {
        key: 'department-heads',
        path: ROUTES.DEPARTMENT_HEADS,
        title: 'Department Heads',
        roles: ['admin', 'superadmin']
      },
      {
        key: 'admins',
        path: ROUTES.ADMINS,
        title: 'Administrators',
        roles: ['superadmin']
      }
    ]
  },
  {
    key: 'departments',
    path: ROUTES.DEPARTMENTS,
    title: 'Departments',
    icon: 'apartment',
    roles: ['admin', 'superadmin', 'department_head']
  },
  {
    key: 'masters',
    title: 'Master Data',
    icon: 'setting',
    roles: ['admin', 'superadmin'],
    children: [
      {
        key: 'oem',
        path: ROUTES.OEM,
        title: 'OEM',
        roles: ['admin', 'superadmin']
      },
      {
        key: 'categories',
        path: ROUTES.CATEGORIES,
        title: 'Categories',
        roles: ['admin', 'superadmin']
      },
      {
        key: 'products',
        path: ROUTES.PRODUCTS,
        title: 'Products',
        roles: ['admin', 'superadmin']
      },
      {
        key: 'locations',
        path: ROUTES.LOCATIONS,
        title: 'Locations',
        roles: ['admin', 'superadmin']
      }
    ]
  },
  {
    key: 'assets',
    title: 'Asset Management',
    icon: 'database',
    roles: ['coordinator', 'admin', 'superadmin', 'department_coordinator'],
    children: [
      {
        key: 'inventory',
        path: ROUTES.ASSET_INVENTORY,
        title: 'Inventory',
        roles: ['coordinator', 'admin', 'superadmin', 'department_coordinator']
      },
      {
        key: 'lifecycle',
        path: ROUTES.ASSET_LIFECYCLE,
        title: 'Lifecycle',
        roles: ['coordinator', 'admin', 'superadmin']
      },
      {
        key: 'assignment',
        path: ROUTES.ASSET_ASSIGNMENT,
        title: 'Assignment',
        roles: ['coordinator', 'admin', 'superadmin', 'department_coordinator']
      },
      {
        key: 'requisitions',
        path: ROUTES.ASSET_REQUISITIONS,
        title: 'Requisitions',
        roles: ['coordinator', 'admin', 'superadmin', 'department_coordinator']
      }
    ]
  },
  {
    key: 'my-assets',
    path: ROUTES.MY_ASSETS,
    title: 'My Assets',
    icon: 'laptop',
    roles: ['all']
  },
  {
    key: 'requisitions',
    path: ROUTES.REQUISITIONS,
    title: 'My Requisitions',
    icon: 'form',
    roles: ['all']
  },
  {
    key: 'tickets',
    title: 'Tickets',
    icon: 'customer-service',
    roles: ['all'],
    children: [
      {
        key: 'create-ticket',
        path: ROUTES.TICKET_CREATE,
        title: 'Create Ticket',
        roles: ['all']
      },
      {
        key: 'my-tickets',
        path: ROUTES.MY_TICKETS,
        title: 'My Tickets',
        roles: ['all']
      },
      {
        key: 'ticket-queue',
        path: ROUTES.TICKET_QUEUE,
        title: 'Ticket Queue',
        roles: ['engineer', 'coordinator', 'admin', 'superadmin']
      }
    ]
  },
  {
    key: 'reports',
    title: 'Reports',
    icon: 'bar-chart',
    roles: ['all'],
    children: [
      {
        key: 'reports-dashboard',
        path: ROUTES.REPORTS_DASHBOARD,
        title: 'Dashboard',
        roles: ['all']
      },
      {
        key: 'asset-reports',
        path: ROUTES.REPORTS_ASSETS,
        title: 'Asset Reports',
        roles: ['all']
      },
      {
        key: 'ticket-reports',
        path: ROUTES.REPORTS_TICKETS,
        title: 'Ticket Reports',
        roles: ['all']
      }
    ]
  },
  {
    key: 'admin',
    title: 'Admin Panel',
    icon: 'control',
    roles: ['superadmin'],
    children: [
      {
        key: 'permission-control',
        path: ROUTES.ADMIN_PERMISSION_CONTROL,
        title: 'Permission Control',
        roles: ['superadmin']
      },
      {
        key: 'role-management',
        path: ROUTES.ADMIN_ROLE_MANAGEMENT,
        title: 'Role Management',
        roles: ['superadmin']
      },
      {
        key: 'user-permissions',
        path: ROUTES.ADMIN_USER_PERMISSIONS,
        title: 'User Permissions',
        roles: ['superadmin']
      },
      {
        key: 'permission-analytics',
        path: ROUTES.ADMIN_PERMISSION_ANALYTICS,
        title: 'Analytics',
        roles: ['superadmin']
      },
      {
        key: 'permission-audit',
        path: ROUTES.ADMIN_PERMISSION_AUDIT,
        title: 'Audit Log',
        roles: ['superadmin']
      },
      {
        key: 'permission-settings',
        path: ROUTES.ADMIN_PERMISSION_SETTINGS,
        title: 'Settings',
        roles: ['superadmin']
      }
    ]
  },
  {
    key: 'licenses',
    path: ROUTES.LICENSES,
    title: 'Software Licenses',
    icon: 'safety-certificate',
    roles: ['admin', 'superadmin', 'coordinator', 'it_head']
  },
  {
    key: 'fault-analysis',
    path: ROUTES.FAULT_ANALYSIS,
    title: 'Fault Analysis',
    icon: 'warning',
    roles: ['admin', 'superadmin', 'coordinator', 'it_head', 'engineer']
  }
]

// Utility functions
export const getRouteByPath = (path) => {
  return Object.entries(ROUTES).find(([, value]) => value === path)?.[0]
}

export const getRouteMeta = (path) => {
  return ROUTE_META[path] || {}
}

export const hasAccess = (userRole, allowedRoles) => {
  if (!allowedRoles || allowedRoles.includes('all')) {
    return true
  }
  return allowedRoles.includes(userRole)
}

export const filterMenuByRole = (menu, userRole) => {
  return menu.filter(item => {
    if (!hasAccess(userRole, item.roles)) {
      return false
    }
    
    if (item.children) {
      item.children = filterMenuByRole(item.children, userRole)
      return item.children.length > 0
    }
    
    return true
  })
}

export const generateBreadcrumbs = (path, params = {}) => {
  const meta = getRouteMeta(path)
  if (!meta.breadcrumb) {
    return []
  }
  
  return meta.breadcrumb.map(crumb => {
    // Replace parameters in breadcrumb if needed
    return Object.keys(params).reduce((acc, key) => {
      return acc.replace(`:${key}`, params[key])
    }, crumb)
  })
}

export const buildPath = (route, params = {}) => {
  return Object.keys(params).reduce((path, key) => {
    return path.replace(`:${key}`, params[key])
  }, route)
}