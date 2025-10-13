import { useSelector } from 'react-redux'
import { useMemo } from 'react'
import permissionService, { ROLE_PERMISSIONS, ROLE_HIERARCHY, ROLES } from '../config/permissions'

export const usePermissions = () => {
  const { user } = useSelector(state => state.auth)
  
  const permissions = useMemo(() => {
    if (!user) return new Set()

    const rolePermissions = ROLE_PERMISSIONS[user.role] || []
    let customPermissions = []

    if (user.permissions) {
      try {
        // Try to parse as JSON first
        if (typeof user.permissions === 'string') {
          // Check if it looks like JSON (starts with [ or {)
          if (user.permissions.trim().startsWith('[') || user.permissions.trim().startsWith('{')) {
            customPermissions = JSON.parse(user.permissions)
          } else {
            // Treat as comma-separated string
            customPermissions = user.permissions.split(',').map(p => p.trim()).filter(p => p)
          }
        } else if (Array.isArray(user.permissions)) {
          // Already an array
          customPermissions = user.permissions
        }
      } catch (error) {
        console.warn('Failed to parse user permissions:', user.permissions, error)
        // Fallback to treating as comma-separated string
        if (typeof user.permissions === 'string') {
          customPermissions = user.permissions.split(',').map(p => p.trim()).filter(p => p)
        }
      }
    }

    return new Set([...rolePermissions, ...customPermissions])
  }, [user])

  const hasPermission = (permission) => {
    return permissions.has(permission)
  }

  const hasAnyPermission = (permissionList) => {
    if (!Array.isArray(permissionList)) return false
    return permissionList.some(permission => permissions.has(permission))
  }

  const hasAllPermissions = (permissionList) => {
    if (!Array.isArray(permissionList)) return false
    return permissionList.every(permission => permissions.has(permission))
  }

  const hasRole = (role) => {
    return user?.role === role
  }

  const hasAnyRole = (roleList) => {
    if (!Array.isArray(roleList)) return false
    if (roleList.includes('all')) return !!user
    return roleList.includes(user?.role)
  }

  const isHigherRole = (targetRole) => {
    if (!user?.role || !targetRole) return false
    const userLevel = ROLE_HIERARCHY[user.role] || 0
    const targetLevel = ROLE_HIERARCHY[targetRole] || 0
    return userLevel > targetLevel
  }

  const isEqualOrHigherRole = (targetRole) => {
    if (!user?.role || !targetRole) return false
    const userLevel = ROLE_HIERARCHY[user.role] || 0
    const targetLevel = ROLE_HIERARCHY[targetRole] || 0
    return userLevel >= targetLevel
  }

  const canManageUser = (targetUserRole) => {
    return isHigherRole(targetUserRole)
  }

  const canAccessRoute = (routeRoles) => {
    if (!routeRoles || routeRoles.length === 0 || routeRoles.includes('all')) {
      return !!user
    }
    return hasAnyRole(routeRoles)
  }

  const isSuperAdmin = () => hasRole(ROLES.SUPERADMIN)
  const isAdmin = () => hasRole(ROLES.ADMIN) || hasRole(ROLES.SUPERADMIN)
  const isDepartmentHead = () => hasRole(ROLES.DEPARTMENT_HEAD)
  const isCoordinator = () => hasRole(ROLES.COORDINATOR) || hasRole(ROLES.DEPARTMENT_COORDINATOR)
  const isEngineer = () => hasRole(ROLES.ENGINEER)
  const isEmployee = () => hasRole(ROLES.EMPLOYEE)

  const getUserRole = () => user?.role
  const getUserLevel = () => ROLE_HIERARCHY[user?.role] || 0

  const getAllPermissions = () => Array.from(permissions)

  const getPermissionsByCategory = () => {
    const categorizedPermissions = {}
    
    // This would be imported from permissions config
    const PERMISSION_CATEGORIES = {
      USER_MANAGEMENT: {
        name: 'User Management',
        permissions: [
          'users.create',
          'users.read', 
          'users.update',
          'users.delete',
          'users.assign_roles',
          'users.reset_password'
        ]
      },
      ASSET_MANAGEMENT: {
        name: 'Asset Management', 
        permissions: [
          'assets.create',
          'assets.read',
          'assets.update', 
          'assets.delete',
          'assets.assign',
          'assets.transfer',
          'assets.maintenance',
          'assets.retire'
        ]
      },
      MASTER_DATA: {
        name: 'Master Data',
        permissions: [
          'masters.oem.manage',
          'masters.categories.manage',
          'masters.products.manage', 
          'masters.locations.manage'
        ]
      },
      DEPARTMENT_MANAGEMENT: {
        name: 'Department Management',
        permissions: [
          'departments.create',
          'departments.read',
          'departments.update',
          'departments.delete',
          'departments.manage_hierarchy'
        ]
      },
      TICKET_MANAGEMENT: {
        name: 'Ticket Management',
        permissions: [
          'tickets.create',
          'tickets.read',
          'tickets.update',
          'tickets.delete', 
          'tickets.assign',
          'tickets.close'
        ]
      },
      REPORTS: {
        name: 'Reports & Analytics',
        permissions: [
          'reports.view',
          'reports.export',
          'reports.dashboard',
          'reports.analytics'
        ]
      },
      SYSTEM: {
        name: 'System Administration',
        permissions: [
          'system.settings',
          'system.logs',
          'system.backup',
          'system.maintenance'
        ]
      }
    }
    
    Object.entries(PERMISSION_CATEGORIES).forEach(([key, category]) => {
      categorizedPermissions[key] = {
        name: category.name,
        permissions: category.permissions.filter(permission => 
          permissions.has(permission)
        )
      }
    })
    
    return categorizedPermissions
  }

  return {
    // Permission checks
    hasPermission,
    hasAnyPermission, 
    hasAllPermissions,
    
    // Role checks
    hasRole,
    hasAnyRole,
    isHigherRole,
    isEqualOrHigherRole,
    canManageUser,
    canAccessRoute,
    
    // Convenience role checks
    isSuperAdmin,
    isAdmin,
    isDepartmentHead,
    isCoordinator,
    isEngineer,
    isEmployee,
    
    // Getters
    getUserRole,
    getUserLevel,
    getAllPermissions,
    getPermissionsByCategory,
    
    // Raw data
    permissions: Array.from(permissions),
    user
  }
}