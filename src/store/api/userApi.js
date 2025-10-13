import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/users',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token || localStorage.getItem('token')
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery,
  tagTypes: ['User', 'Employee', 'Coordinator', 'Engineer', 'DepartmentHead', 'Admin'],
  endpoints: (builder) => ({
    // General Users
    getUsers: builder.query({
      query: (params = {}) => ({
        url: '/',
        params
      }),
      providesTags: ['User']
    }),

    getUserById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }]
    }),

    createUser: builder.mutation({
      query: (userData) => ({
        url: '/',
        method: 'POST',
        body: userData
      }),
      invalidatesTags: ['User']
    }),

    updateUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: userData
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User']
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['User']
    }),

    // Employees
    getEmployees: builder.query({
      query: (params = {}) => ({
        url: '/employees',
        params
      }),
      providesTags: ['Employee']
    }),

    getEmployeeById: builder.query({
      query: (id) => `/employees/${id}`,
      providesTags: (result, error, id) => [{ type: 'Employee', id }]
    }),

    updateEmployee: builder.mutation({
      query: ({ id, ...employeeData }) => ({
        url: `/employees/${id}`,
        method: 'PUT',
        body: employeeData
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Employee', id }, 
        'Employee', 
        'User'
      ]
    }),

    terminateEmployee: builder.mutation({
      query: (id) => ({
        url: `/employees/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Employee', 'User']
    }),

    // Coordinators
    getCoordinators: builder.query({
      query: (params = {}) => ({
        url: '/coordinators',
        params
      }),
      providesTags: ['Coordinator']
    }),

    getCoordinatorById: builder.query({
      query: (id) => `/coordinators/${id}`,
      providesTags: (result, error, id) => [{ type: 'Coordinator', id }]
    }),

    updateCoordinator: builder.mutation({
      query: ({ id, ...coordinatorData }) => ({
        url: `/coordinators/${id}`,
        method: 'PUT',
        body: coordinatorData
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Coordinator', id }, 
        'Coordinator', 
        'User'
      ]
    }),

    getCoordinatorAssets: builder.query({
      query: ({ id, ...params }) => ({
        url: `/coordinators/${id}/assigned-assets`,
        params
      }),
      providesTags: (result, error, { id }) => [{ type: 'Coordinator', id: `${id}-assets` }]
    }),

    // Engineers
    getEngineers: builder.query({
      query: (params = {}) => ({
        url: '/engineers',
        params
      }),
      providesTags: ['Engineer']
    }),

    getEngineerById: builder.query({
      query: (id) => `/engineers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Engineer', id }]
    }),

    updateEngineer: builder.mutation({
      query: ({ id, ...engineerData }) => ({
        url: `/engineers/${id}`,
        method: 'PUT',
        body: engineerData
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Engineer', id }, 
        'Engineer', 
        'User'
      ]
    }),

    getEngineerTickets: builder.query({
      query: ({ id, ...params }) => ({
        url: `/engineers/${id}/tickets`,
        params
      }),
      providesTags: (result, error, { id }) => [{ type: 'Engineer', id: `${id}-tickets` }]
    }),

    getAvailableEngineers: builder.query({
      query: (params = {}) => ({
        url: '/engineers/available',
        params
      }),
      providesTags: ['Engineer']
    }),

    // Department Heads
    getDepartmentHeads: builder.query({
      query: (params = {}) => ({
        url: '/department-heads',
        params
      }),
      providesTags: ['DepartmentHead']
    }),

    getDepartmentHeadById: builder.query({
      query: (id) => `/department-heads/${id}`,
      providesTags: (result, error, id) => [{ type: 'DepartmentHead', id }]
    }),

    updateDepartmentHead: builder.mutation({
      query: ({ id, ...departmentHeadData }) => ({
        url: `/department-heads/${id}`,
        method: 'PUT',
        body: departmentHeadData
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'DepartmentHead', id }, 
        'DepartmentHead', 
        'User'
      ]
    }),

    getDepartmentOverview: builder.query({
      query: (id) => `/department-heads/${id}/department-overview`,
      providesTags: (result, error, id) => [{ type: 'DepartmentHead', id: `${id}-overview` }]
    }),

    getTeamPerformance: builder.query({
      query: ({ id, ...params }) => ({
        url: `/department-heads/${id}/team-performance`,
        params
      }),
      providesTags: (result, error, { id }) => [{ type: 'DepartmentHead', id: `${id}-performance` }]
    }),

    // Admins
    getAdmins: builder.query({
      query: (params = {}) => ({
        url: '/admins',
        params
      }),
      providesTags: ['Admin']
    }),

    createAdmin: builder.mutation({
      query: (adminData) => ({
        url: '/admins',
        method: 'POST',
        body: adminData
      }),
      invalidatesTags: ['Admin', 'User']
    }),

    getAdminById: builder.query({
      query: (id) => `/admins/${id}`,
      providesTags: (result, error, id) => [{ type: 'Admin', id }]
    }),

    updateAdmin: builder.mutation({
      query: ({ id, ...adminData }) => ({
        url: `/admins/${id}`,
        method: 'PUT',
        body: adminData
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Admin', id }, 
        'Admin', 
        'User'
      ]
    }),

    resetAdminPassword: builder.mutation({
      query: ({ id, newPassword }) => ({
        url: `/admins/${id}/reset-password`,
        method: 'POST',
        body: { newPassword }
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Admin', id }]
    }),

    getAdminActivityLogs: builder.query({
      query: ({ id, ...params }) => ({
        url: `/admins/${id}/activity-logs`,
        params
      }),
      providesTags: (result, error, { id }) => [{ type: 'Admin', id: `${id}-logs` }]
    }),

    deactivateAdmin: builder.mutation({
      query: (id) => ({
        url: `/admins/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Admin', 'User']
    }),

    // User Permissions
    getUserPermissions: builder.query({
      query: (userId) => `/permissions/user/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'User', id: `${userId}-permissions` }]
    }),

    updateUserPermissions: builder.mutation({
      query: ({ userId, permissions }) => ({
        url: `/permissions/user/${userId}`,
        method: 'PUT',
        body: { permissions }
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: `${userId}-permissions` },
        { type: 'User', id: userId }
      ]
    }),

    checkPermissions: builder.mutation({
      query: ({ userId, permissions }) => ({
        url: '/permissions/check',
        method: 'POST',
        body: { userId, permissions }
      })
    }),

    getPermissionCategories: builder.query({
      query: () => '/permissions/categories',
      providesTags: ['User']
    }),

    getRoleDefaultPermissions: builder.query({
      query: () => '/permissions/roles/default',
      providesTags: ['User']
    }),

    getRolePermissions: builder.query({
      query: (role) => `/permissions/role/${role}/permissions`,
      providesTags: (result, error, role) => [{ type: 'User', id: `role-${role}` }]
    }),

    getPermissionAuditLogs: builder.query({
      query: ({ userId, ...params }) => ({
        url: `/permissions/audit/${userId}`,
        params
      }),
      providesTags: (result, error, { userId }) => [{ type: 'User', id: `${userId}-audit` }]
    })
  })
})

export const {
  // General Users
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,

  // Employees
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useUpdateEmployeeMutation,
  useTerminateEmployeeMutation,

  // Coordinators
  useGetCoordinatorsQuery,
  useGetCoordinatorByIdQuery,
  useUpdateCoordinatorMutation,
  useGetCoordinatorAssetsQuery,

  // Engineers
  useGetEngineersQuery,
  useGetEngineerByIdQuery,
  useUpdateEngineerMutation,
  useGetEngineerTicketsQuery,
  useGetAvailableEngineersQuery,

  // Department Heads
  useGetDepartmentHeadsQuery,
  useGetDepartmentHeadByIdQuery,
  useUpdateDepartmentHeadMutation,
  useGetDepartmentOverviewQuery,
  useGetTeamPerformanceQuery,

  // Admins
  useGetAdminsQuery,
  useCreateAdminMutation,
  useGetAdminByIdQuery,
  useUpdateAdminMutation,
  useResetAdminPasswordMutation,
  useGetAdminActivityLogsQuery,
  useDeactivateAdminMutation,

  // Permissions
  useGetUserPermissionsQuery,
  useUpdateUserPermissionsMutation,
  useCheckPermissionsMutation,
  useGetPermissionCategoriesQuery,
  useGetRoleDefaultPermissionsQuery,
  useGetRolePermissionsQuery,
  useGetPermissionAuditLogsQuery
} = userApi