// Permission constants and role-based access control

export const PERMISSIONS = {
  // User Management
  USERS_CREATE: 'users.create',
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_ASSIGN_ROLES: 'users.assign_roles',
  USERS_RESET_PASSWORD: 'users.reset_password',

  // Asset Management
  ASSETS_CREATE: 'assets.create',
  ASSETS_READ: 'assets.read',
  ASSETS_UPDATE: 'assets.update',
  ASSETS_DELETE: 'assets.delete',
  ASSETS_ASSIGN: 'assets.assign',
  ASSETS_TRANSFER: 'assets.transfer',
  ASSETS_MAINTENANCE: 'assets.maintenance',
  ASSETS_RETIRE: 'assets.retire',

  // Master Data
  MASTERS_OEM_MANAGE: 'masters.oem.manage',
  MASTERS_CATEGORIES_MANAGE: 'masters.categories.manage',
  MASTERS_PRODUCTS_MANAGE: 'masters.products.manage',
  MASTERS_LOCATIONS_MANAGE: 'masters.locations.manage',

  // Department Management
  DEPARTMENTS_CREATE: 'departments.create',
  DEPARTMENTS_READ: 'departments.read',
  DEPARTMENTS_UPDATE: 'departments.update',
  DEPARTMENTS_DELETE: 'departments.delete',
  DEPARTMENTS_MANAGE_HIERARCHY: 'departments.manage_hierarchy',

  // Ticket Management
  TICKETS_CREATE: 'tickets.create',
  TICKETS_READ: 'tickets.read',
  TICKETS_UPDATE: 'tickets.update',
  TICKETS_DELETE: 'tickets.delete',
  TICKETS_ASSIGN: 'tickets.assign',
  TICKETS_CLOSE: 'tickets.close',

  // Reports & Analytics
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  REPORTS_DASHBOARD: 'reports.dashboard',
  REPORTS_ANALYTICS: 'reports.analytics',

  // System Administration
  SYSTEM_SETTINGS: 'system.settings',
  SYSTEM_LOGS: 'system.logs',
  SYSTEM_BACKUP: 'system.backup',
  SYSTEM_MAINTENANCE: 'system.maintenance',

  // Permission Control
  PERMISSION_CONTROL_READ: 'permission-control.read',
  PERMISSION_CONTROL_CREATE: 'permission-control.create',
  PERMISSION_CONTROL_UPDATE: 'permission-control.update',
  PERMISSION_CONTROL_DELETE: 'permission-control.delete',
  PERMISSION_CONTROL_AUDIT: 'permission-control.audit',
  PERMISSION_CONTROL_ANALYTICS: 'permission-control.analytics'
}

// Permission categories for better organization
export const PERMISSION_CATEGORIES = {
  USER_MANAGEMENT: {
    name: 'User Management',
    permissions: [
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_READ,
      PERMISSIONS.USERS_UPDATE,
      PERMISSIONS.USERS_DELETE,
      PERMISSIONS.USERS_ASSIGN_ROLES,
      PERMISSIONS.USERS_RESET_PASSWORD
    ]
  },
  ASSET_MANAGEMENT: {
    name: 'Asset Management',
    permissions: [
      PERMISSIONS.ASSETS_CREATE,
      PERMISSIONS.ASSETS_READ,
      PERMISSIONS.ASSETS_UPDATE,
      PERMISSIONS.ASSETS_DELETE,
      PERMISSIONS.ASSETS_ASSIGN,
      PERMISSIONS.ASSETS_TRANSFER,
      PERMISSIONS.ASSETS_MAINTENANCE,
      PERMISSIONS.ASSETS_RETIRE
    ]
  },
  MASTER_DATA: {
    name: 'Master Data',
    permissions: [
      PERMISSIONS.MASTERS_OEM_MANAGE,
      PERMISSIONS.MASTERS_CATEGORIES_MANAGE,
      PERMISSIONS.MASTERS_PRODUCTS_MANAGE,
      PERMISSIONS.MASTERS_LOCATIONS_MANAGE
    ]
  },
  DEPARTMENT_MANAGEMENT: {
    name: 'Department Management',
    permissions: [
      PERMISSIONS.DEPARTMENTS_CREATE,
      PERMISSIONS.DEPARTMENTS_READ,
      PERMISSIONS.DEPARTMENTS_UPDATE,
      PERMISSIONS.DEPARTMENTS_DELETE,
      PERMISSIONS.DEPARTMENTS_MANAGE_HIERARCHY
    ]
  },
  TICKET_MANAGEMENT: {
    name: 'Ticket Management',
    permissions: [
      PERMISSIONS.TICKETS_CREATE,
      PERMISSIONS.TICKETS_READ,
      PERMISSIONS.TICKETS_UPDATE,
      PERMISSIONS.TICKETS_DELETE,
      PERMISSIONS.TICKETS_ASSIGN,
      PERMISSIONS.TICKETS_CLOSE
    ]
  },
  REPORTS: {
    name: 'Reports & Analytics',
    permissions: [
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_EXPORT,
      PERMISSIONS.REPORTS_DASHBOARD,
      PERMISSIONS.REPORTS_ANALYTICS
    ]
  },
  SYSTEM: {
    name: 'System Administration',
    permissions: [
      PERMISSIONS.SYSTEM_SETTINGS,
      PERMISSIONS.SYSTEM_LOGS,
      PERMISSIONS.SYSTEM_BACKUP,
      PERMISSIONS.SYSTEM_MAINTENANCE
    ]
  },
  PERMISSION_CONTROL: {
    name: 'Permission Control',
    permissions: [
      PERMISSIONS.PERMISSION_CONTROL_READ,
      PERMISSIONS.PERMISSION_CONTROL_CREATE,
      PERMISSIONS.PERMISSION_CONTROL_UPDATE,
      PERMISSIONS.PERMISSION_CONTROL_DELETE,
      PERMISSIONS.PERMISSION_CONTROL_AUDIT,
      PERMISSIONS.PERMISSION_CONTROL_ANALYTICS
    ]
  }
}

// Role definitions with default permissions
export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  DEPARTMENT_HEAD: 'department_head',
  COORDINATOR: 'coordinator',
  DEPARTMENT_COORDINATOR: 'department_coordinator',
  ENGINEER: 'engineer',
  EMPLOYEE: 'employee'
}

// Default permissions for each role
export const ROLE_PERMISSIONS = {
  [ROLES.SUPERADMIN]: Object.values(PERMISSIONS), // All permissions
  
  [ROLES.ADMIN]: [
    // User Management
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_ASSIGN_ROLES,
    PERMISSIONS.USERS_RESET_PASSWORD,
    
    // Asset Management
    PERMISSIONS.ASSETS_CREATE,
    PERMISSIONS.ASSETS_READ,
    PERMISSIONS.ASSETS_UPDATE,
    PERMISSIONS.ASSETS_ASSIGN,
    PERMISSIONS.ASSETS_TRANSFER,
    PERMISSIONS.ASSETS_MAINTENANCE,
    PERMISSIONS.ASSETS_RETIRE,
    
    // Master Data
    PERMISSIONS.MASTERS_OEM_MANAGE,
    PERMISSIONS.MASTERS_CATEGORIES_MANAGE,
    PERMISSIONS.MASTERS_PRODUCTS_MANAGE,
    PERMISSIONS.MASTERS_LOCATIONS_MANAGE,
    
    // Department Management
    PERMISSIONS.DEPARTMENTS_CREATE,
    PERMISSIONS.DEPARTMENTS_READ,
    PERMISSIONS.DEPARTMENTS_UPDATE,
    PERMISSIONS.DEPARTMENTS_DELETE,
    PERMISSIONS.DEPARTMENTS_MANAGE_HIERARCHY,
    
    // Ticket Management
    PERMISSIONS.TICKETS_CREATE,
    PERMISSIONS.TICKETS_READ,
    PERMISSIONS.TICKETS_UPDATE,
    PERMISSIONS.TICKETS_ASSIGN,
    PERMISSIONS.TICKETS_CLOSE,
    
    // Reports
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.REPORTS_DASHBOARD,
    PERMISSIONS.REPORTS_ANALYTICS
  ],
  
  [ROLES.DEPARTMENT_HEAD]: [
    // Limited User Management
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_UPDATE,
    
    // Asset Management
    PERMISSIONS.ASSETS_READ,
    PERMISSIONS.ASSETS_ASSIGN,
    PERMISSIONS.ASSETS_TRANSFER,
    
    // Department Management
    PERMISSIONS.DEPARTMENTS_READ,
    PERMISSIONS.DEPARTMENTS_UPDATE,
    
    // Ticket Management
    PERMISSIONS.TICKETS_CREATE,
    PERMISSIONS.TICKETS_READ,
    PERMISSIONS.TICKETS_UPDATE,
    PERMISSIONS.TICKETS_ASSIGN,
    
    // Reports
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_DASHBOARD
  ],
  
  [ROLES.COORDINATOR]: [
    // Limited User Management
    PERMISSIONS.USERS_READ,
    
    // Asset Management
    PERMISSIONS.ASSETS_CREATE,
    PERMISSIONS.ASSETS_READ,
    PERMISSIONS.ASSETS_UPDATE,
    PERMISSIONS.ASSETS_ASSIGN,
    PERMISSIONS.ASSETS_MAINTENANCE,
    
    // Ticket Management
    PERMISSIONS.TICKETS_CREATE,
    PERMISSIONS.TICKETS_READ,
    PERMISSIONS.TICKETS_UPDATE,
    
    // Reports
    PERMISSIONS.REPORTS_VIEW
  ],
  
  [ROLES.DEPARTMENT_COORDINATOR]: [
    // Limited User Management
    PERMISSIONS.USERS_READ,
    
    // Asset Management (limited to department)
    PERMISSIONS.ASSETS_READ,
    PERMISSIONS.ASSETS_ASSIGN,
    PERMISSIONS.ASSETS_MAINTENANCE,
    
    // Ticket Management
    PERMISSIONS.TICKETS_CREATE,
    PERMISSIONS.TICKETS_READ,
    PERMISSIONS.TICKETS_UPDATE,
    
    // Reports
    PERMISSIONS.REPORTS_VIEW
  ],
  
  [ROLES.ENGINEER]: [
    // Ticket Management
    PERMISSIONS.TICKETS_READ,
    PERMISSIONS.TICKETS_UPDATE,
    
    // Asset Management (limited)
    PERMISSIONS.ASSETS_READ,
    PERMISSIONS.ASSETS_MAINTENANCE,
    
    // Reports
    PERMISSIONS.REPORTS_VIEW
  ],
  
  [ROLES.EMPLOYEE]: [
    // Basic permissions
    PERMISSIONS.ASSETS_READ,
    PERMISSIONS.TICKETS_CREATE,
    PERMISSIONS.TICKETS_READ,
    PERMISSIONS.REPORTS_VIEW
  ]
}

// Role hierarchy (higher roles inherit permissions from lower roles)
export const ROLE_HIERARCHY = {
  [ROLES.SUPERADMIN]: 7,
  [ROLES.ADMIN]: 6,
  [ROLES.DEPARTMENT_HEAD]: 5,
  [ROLES.COORDINATOR]: 4,
  [ROLES.DEPARTMENT_COORDINATOR]: 3,
  [ROLES.ENGINEER]: 2,
  [ROLES.EMPLOYEE]: 1
}

// Permission check utilities
class PermissionService {
  constructor() {
    this.userPermissions = new Set()
    this.userRole = null
  }

  setUserPermissions(role, customPermissions = []) {
    this.userRole = role
    const rolePermissions = ROLE_PERMISSIONS[role] || []
    this.userPermissions = new Set([...rolePermissions, ...customPermissions])
  }

  hasPermission(permission) {
    return this.userPermissions.has(permission)
  }

  hasAnyPermission(permissions) {
    return permissions.some(permission => this.userPermissions.has(permission))
  }

  hasAllPermissions(permissions) {
    return permissions.every(permission => this.userPermissions.has(permission))
  }

  hasRole(role) {
    return this.userRole === role
  }

  hasAnyRole(roles) {
    return roles.includes(this.userRole)
  }

  isHigherRole(targetRole) {
    const userLevel = ROLE_HIERARCHY[this.userRole] || 0
    const targetLevel = ROLE_HIERARCHY[targetRole] || 0
    return userLevel > targetLevel
  }

  isEqualOrHigherRole(targetRole) {
    const userLevel = ROLE_HIERARCHY[this.userRole] || 0
    const targetLevel = ROLE_HIERARCHY[targetRole] || 0
    return userLevel >= targetLevel
  }

  canManageUser(targetUserRole) {
    // Users can only manage users of lower hierarchy level
    return this.isHigherRole(targetUserRole)
  }

  getPermissionsByCategory() {
    const categorizedPermissions = {}
    
    Object.entries(PERMISSION_CATEGORIES).forEach(([key, category]) => {
      categorizedPermissions[key] = {
        name: category.name,
        permissions: category.permissions.filter(permission => 
          this.hasPermission(permission)
        )
      }
    })
    
    return categorizedPermissions
  }

  getAllPermissions() {
    return Array.from(this.userPermissions)
  }

  getUserRole() {
    return this.userRole
  }

  clearPermissions() {
    this.userPermissions.clear()
    this.userRole = null
  }
}

// Create singleton instance
const permissionService = new PermissionService()

// Higher Order Component for permission checking
export const withPermissions = (requiredPermissions, fallback = null) => {
  return (WrappedComponent) => {
    return (props) => {
      const hasAccess = Array.isArray(requiredPermissions)
        ? permissionService.hasAllPermissions(requiredPermissions)
        : permissionService.hasPermission(requiredPermissions)

      if (!hasAccess) {
        return fallback || null
      }

      return WrappedComponent(props)
    }
  }
}

// Note: usePermissions hook is implemented in /src/hooks/usePermissions.js

// Utility functions
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.SUPERADMIN]: 'Super Administrator',
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.DEPARTMENT_HEAD]: 'Department Head',
    [ROLES.COORDINATOR]: 'Coordinator',
    [ROLES.DEPARTMENT_COORDINATOR]: 'Department Coordinator',
    [ROLES.ENGINEER]: 'Engineer',
    [ROLES.EMPLOYEE]: 'Employee'
  }
  return roleNames[role] || role
}

export const getPermissionDisplayName = (permission) => {
  const permissionNames = {
    [PERMISSIONS.USERS_CREATE]: 'Create Users',
    [PERMISSIONS.USERS_READ]: 'View Users',
    [PERMISSIONS.USERS_UPDATE]: 'Edit Users',
    [PERMISSIONS.USERS_DELETE]: 'Delete Users',
    [PERMISSIONS.USERS_ASSIGN_ROLES]: 'Assign User Roles',
    [PERMISSIONS.USERS_RESET_PASSWORD]: 'Reset User Passwords',
    
    [PERMISSIONS.ASSETS_CREATE]: 'Create Assets',
    [PERMISSIONS.ASSETS_READ]: 'View Assets',
    [PERMISSIONS.ASSETS_UPDATE]: 'Edit Assets',
    [PERMISSIONS.ASSETS_DELETE]: 'Delete Assets',
    [PERMISSIONS.ASSETS_ASSIGN]: 'Assign Assets',
    [PERMISSIONS.ASSETS_TRANSFER]: 'Transfer Assets',
    [PERMISSIONS.ASSETS_MAINTENANCE]: 'Manage Asset Maintenance',
    [PERMISSIONS.ASSETS_RETIRE]: 'Retire Assets',
    
    // Add more as needed...
  }
  return permissionNames[permission] || permission
}

export const validateRoleTransition = (fromRole, toRole, currentUserRole) => {
  // Only users with higher hierarchy can change roles
  if (!permissionService.isHigherRole(fromRole) || !permissionService.isHigherRole(toRole)) {
    return { valid: false, reason: 'Insufficient privileges to change this role' }
  }
  
  // Superadmin can only be changed by another superadmin
  if (toRole === ROLES.SUPERADMIN && currentUserRole !== ROLES.SUPERADMIN) {
    return { valid: false, reason: 'Only superadmins can assign superadmin role' }
  }
  
  return { valid: true }
}

export default permissionService