import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  message, 
  Dropdown, 
  Tooltip,
  Row,
  Col,
  Statistic,
  Avatar,
  Drawer
} from 'antd'
import { 
  UserOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  LockOutlined, 
  UnlockOutlined,
  MoreOutlined,
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import userService from '../../../../services/user'
import dashboardService from '../../../../services/dashboard'
import { fetchBoards as fetchBoardsAction } from '../../../../store/slices/masterSlice'
import UserForm from './UserForm'

const { Search } = Input
const { Option } = Select
const { confirm } = Modal

const UserMaster = () => {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [boards, setBoards] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [filters, setFilters] = useState({
    search: '',
    status: 'active',
    role: '',
    board_id: '',
    department_id: ''
  })
  const [selectedUsers, setSelectedUsers] = useState([])
  const [userModalVisible, setUserModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userDetailsVisible, setUserDetailsVisible] = useState(false)
  const [selectedUserDetails, setSelectedUserDetails] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byRole: {},
    pendingApprovals: 0
  })
  const [approvalModalVisible, setApprovalModalVisible] = useState(false)
  const [pendingUsers, setPendingUsers] = useState([])
  const [approvalsLoading, setApprovalsLoading] = useState(false)

  const { user: currentUser } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    fetchUsers()
  }, [pagination.current, pagination.pageSize, filters])

  useEffect(() => {
    fetchDepartments()
  }, [filters.board_id])

  useEffect(() => {
    fetchBoards()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = userService.buildSearchParams(filters, {
        page: pagination.current,
        limit: pagination.pageSize
      })
      
      const response = await userService.getUsers(params)
      const userData = response.data.data
      
      setUsers(userData.users || [])
      setPagination(prev => ({
        ...prev,
        total: userData.pagination?.totalItems || 0
      }))

      // Update stats
      setStats({
        total: userData.pagination?.totalItems || 0,
        active: userData.users?.filter(u => u.isActive).length || 0,
        inactive: userData.users?.filter(u => !u.isActive).length || 0,
        byRole: userData.users?.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1
          return acc
        }, {}) || {},
        pendingApprovals: userData.users?.filter(u => !u.isActive).length || 0
      })
    } catch (error) {
      console.error('Failed to fetch users:', error)
      message.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      // If a board is selected, fetch only departments for that board
      const params = filters.board_id ? { board_id: filters.board_id, limit: 1000 } : { limit: 1000 }
      const response = await userService.getDepartments(params)
      setDepartments(response.data.data?.departments || [])
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    }
  }

  const fetchBoards = async () => {
    try {
      const result = await dispatch(fetchBoardsAction({ limit: 1000 })).unwrap()
      setBoards(result.boards || [])
    } catch (error) {
      console.error('Failed to fetch boards:', error)
    }
  }

  const handleTableChange = (paginationInfo, tableFilters, sorter) => {
    setPagination(prev => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize
    }))
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }

      // Cascading filter logic: when board changes, reset department
      if (key === 'board_id') {
        newFilters.department_id = ''
      }

      return newFilters
    })
    setPagination(prev => ({
      ...prev,
      current: 1
    }))
  }

  const handleCreateUser = () => {
    setEditingUser(null)
    setUserModalVisible(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setUserModalVisible(true)
  }

  const handleViewUser = (user) => {
    setSelectedUserDetails(user)
    setUserDetailsVisible(true)
  }

  const handleModalClose = () => {
    setUserModalVisible(false)
    setEditingUser(null)
  }

  const handleModalSuccess = () => {
    setUserModalVisible(false)
    setEditingUser(null)
    fetchUsers()
  }

  const handleDeleteUser = (user) => {
    confirm({
      title: `Delete user ${user.firstName} ${user.lastName}?`,
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await userService.deleteUser(user.id)
          message.success('User deleted successfully')
          fetchUsers()
        } catch (error) {
          console.error('Failed to delete user:', error)
          message.error('Failed to delete user')
        }
      }
    })
  }

  const handleToggleUserStatus = async (user) => {
    try {
      const newStatus = !user.isActive
      await userService.updateUser(user.id, { is_active: newStatus })
      message.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`)
      fetchUsers()
    } catch (error) {
      console.error('Failed to toggle user status:', error)
      message.error('Failed to update user status')
    }
  }

  const handleResetPassword = (user) => {
    confirm({
      title: `Reset password for ${user.firstName} ${user.lastName}?`,
      content: 'A new temporary password will be generated and sent to the user.',
      onOk: async () => {
        try {
          await userService.resetUserPassword(user.id)
          message.success('Password reset successfully')
        } catch (error) {
          console.error('Failed to reset password:', error)
          message.error('Failed to reset password')
        }
      }
    })
  }

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) {
      message.warning('Please select users to delete')
      return
    }

    confirm({
      title: `Delete ${selectedUsers.length} selected users?`,
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await userService.bulkDeleteUsers(selectedUsers)
          message.success(`${selectedUsers.length} users deleted successfully`)
          setSelectedUsers([])
          fetchUsers()
        } catch (error) {
          console.error('Failed to delete users:', error)
          message.error('Failed to delete users')
        }
      }
    })
  }

  const handleExport = async () => {
    try {
      await userService.exportUsers(filters)
      message.success('Export completed successfully')
    } catch (error) {
      console.error('Failed to export users:', error)
      message.error('Failed to export users')
    }
  }

  const fetchPendingApprovals = async () => {
    setApprovalsLoading(true)
    try {
      const response = await dashboardService.getPendingApprovals({ limit: 50 })
      const approvals = response.data.data || []
      
      // Filter for user registration approvals only
      const userApprovals = approvals.filter(approval => approval.type === 'User Registration')
      setPendingUsers(userApprovals)
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error)
      message.error('Failed to load pending approvals')
    } finally {
      setApprovalsLoading(false)
    }
  }

  const handleShowApprovals = () => {
    fetchPendingApprovals()
    setApprovalModalVisible(true)
  }

  const handleApproveUser = async (userId, type = 'User Registration') => {
    try {
      await dashboardService.approveItem(userId, type)
      message.success('User approved successfully')
      fetchPendingApprovals() // Refresh pending list
      fetchUsers() // Refresh main users list
    } catch (error) {
      console.error('Failed to approve user:', error)
      message.error('Failed to approve user')
    }
  }

  const handleRejectUser = async (userId, type = 'User Registration') => {
    confirm({
      title: 'Reject User Registration?',
      content: 'This will permanently delete the user registration. This action cannot be undone.',
      okText: 'Reject',
      okType: 'danger',
      onOk: async () => {
        try {
          await dashboardService.rejectItem(userId, type, 'Rejected by admin')
          message.success('User registration rejected')
          fetchPendingApprovals() // Refresh pending list
          fetchUsers() // Refresh main users list
        } catch (error) {
          console.error('Failed to reject user:', error)
          message.error('Failed to reject user')
        }
      }
    })
  }

  const getActionMenu = (user) => ({
    items: [
      {
        key: 'view',
        label: 'View Details',
        icon: <UserOutlined />,
        onClick: () => handleViewUser(user)
      },
      {
        key: 'edit',
        label: 'Edit User',
        icon: <EditOutlined />,
        onClick: () => handleEditUser(user),
        disabled: !userService.canUserManageUser(currentUser?.role, user.role)
      },
      {
        key: 'toggle-status',
        label: user.isActive ? 'Deactivate' : 'Activate',
        icon: user.isActive ? <LockOutlined /> : <UnlockOutlined />,
        onClick: () => handleToggleUserStatus(user),
        disabled: !userService.canUserManageUser(currentUser?.role, user.role)
      },
      {
        key: 'reset-password',
        label: 'Reset Password',
        icon: <LockOutlined />,
        onClick: () => handleResetPassword(user),
        disabled: !userService.canUserManageUser(currentUser?.role, user.role)
      },
      {
        type: 'divider'
      },
      {
        key: 'delete',
        label: 'Delete User',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDeleteUser(user),
        disabled: !userService.canUserManageUser(currentUser?.role, user.role)
      }
    ]
  })

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_, user) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            size={40} 
            src={user.profilePicture} 
            icon={<UserOutlined />}
            style={{ backgroundColor: userService.getRoleColor(user.role), marginRight: 12 }}
          >
            {user.firstName?.[0]}{user.lastName?.[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>
              {user.firstName} {user.lastName}
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              {user.email}
            </div>
          </div>
        </div>
      ),
      sorter: true
    },
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 120
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (role) => (
        <Tag color={userService.getRoleColor(role)}>
          {userService.getRoleDisplayName(role)}
        </Tag>
      ),
      filters: userService.getAvailableRoles(currentUser?.role).map(role => ({
        text: role.label,
        value: role.value
      }))
    },
    {
      title: 'Department',
      key: 'department',
      width: 200,
      render: (_, user) => user.department?.name || 'No Department',
      filters: departments.map(dept => ({
        text: dept.name,
        value: dept.id
      }))
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false }
      ]
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 150,
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Never',
      sorter: true
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, user) => (
        <Dropdown menu={getActionMenu(user)} trigger={['click']} placement="bottomRight">
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ]

  const availableRoles = userService.getAvailableRoles(currentUser?.role)

  return (
    <div>
      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Total Users"
              value={stats.total}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Active Users"
              value={stats.active}
              valueStyle={{ color: '#3f8600' }}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Inactive Users"
              value={stats.inactive}
              valueStyle={{ color: '#cf1322' }}
              prefix={<UserOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Pending Approvals"
              value={stats.pendingApprovals}
              valueStyle={{ color: '#faad14' }}
              prefix={<UserOutlined style={{ color: '#fa8c16' }} />}
              suffix={
                stats.pendingApprovals > 0 && (
                  <Button 
                    size="small" 
                    type="primary" 
                    ghost
                    onClick={handleShowApprovals}
                    style={{ marginLeft: 8 }}
                  >
                    Review
                  </Button>
                )
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <span>User Management</span>
          </div>
        }
        extra={
          <Space>
            <Search
              placeholder="Search users..."
              allowClear
              style={{ width: 250 }}
              onSearch={(value) => handleFilterChange('search', value)}
              prefix={<SearchOutlined />}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateUser}
            >
              Add User
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Select
              placeholder="Filter by Board"
              allowClear
              style={{ width: 200 }}
              onChange={(value) => handleFilterChange('board_id', value)}
              value={filters.board_id || undefined}
            >
              {boards.map(board => (
                <Option key={board.id} value={board.id}>
                  {board.name}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Filter by Department"
              allowClear
              style={{ width: 200 }}
              onChange={(value) => handleFilterChange('department_id', value)}
              value={filters.department_id || undefined}
              disabled={filters.board_id && departments.length === 0}
            >
              {departments.map(dept => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Filter by Role"
              allowClear
              style={{ width: 200 }}
              onChange={(value) => handleFilterChange('role', value)}
              value={filters.role || undefined}
            >
              {availableRoles.map(role => (
                <Option key={role.value} value={role.value}>
                  {role.label}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Filter by Status"
              style={{ width: 150 }}
              onChange={(value) => handleFilterChange('status', value)}
              value={filters.status}
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="">All</Option>
            </Select>

            <Button
              icon={<ReloadOutlined />}
              onClick={fetchUsers}
              disabled={loading}
            >
              Refresh
            </Button>
            
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              Export
            </Button>
            
            {selectedUsers.length > 0 && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleBulkDelete}
              >
                Delete Selected ({selectedUsers.length})
              </Button>
            )}
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          rowSelection={{
            selectedRowKeys: selectedUsers,
            onChange: setSelectedUsers,
            getCheckboxProps: (record) => ({
              disabled: !userService.canUserManageUser(currentUser?.role, record.role)
            })
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* User Form Modal */}
      <UserForm
        open={userModalVisible}
        mode={editingUser ? 'edit' : 'create'}
        user={editingUser}
        departments={departments}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />

      {/* User Details Drawer */}
      <Drawer
        title="User Details"
        placement="right"
        onClose={() => setUserDetailsVisible(false)}
        open={userDetailsVisible}
        width={400}
      >
        {selectedUserDetails && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar 
                size={80} 
                src={selectedUserDetails.profilePicture} 
                icon={<UserOutlined />}
                style={{ backgroundColor: userService.getRoleColor(selectedUserDetails.role) }}
              >
                {selectedUserDetails.firstName?.[0]}{selectedUserDetails.lastName?.[0]}
              </Avatar>
              <h3 style={{ marginTop: 12, marginBottom: 8 }}>
                {selectedUserDetails.firstName} {selectedUserDetails.lastName}
              </h3>
              <Tag color={userService.getRoleColor(selectedUserDetails.role)}>
                {userService.getRoleDisplayName(selectedUserDetails.role)}
              </Tag>
            </div>

            <div>
              <p><strong>Email:</strong> {selectedUserDetails.email}</p>
              <p><strong>Employee ID:</strong> {selectedUserDetails.employeeId || 'N/A'}</p>
              <p><strong>Department:</strong> {selectedUserDetails.department?.name || 'No Department'}</p>
              <p>
                <strong>Status:</strong> 
                <Tag color={selectedUserDetails.isActive ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                  {selectedUserDetails.isActive ? 'ACTIVE' : 'INACTIVE'}
                </Tag>
              </p>
              <p><strong>Last Login:</strong> {selectedUserDetails.lastLogin ? new Date(selectedUserDetails.lastLogin).toLocaleString() : 'Never'}</p>
              <p><strong>Created:</strong> {selectedUserDetails.createdAt ? new Date(selectedUserDetails.createdAt).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        )}
      </Drawer>

      {/* Pending Approvals Modal */}
      <Modal
        title="Pending User Approvals"
        open={approvalModalVisible}
        onCancel={() => setApprovalModalVisible(false)}
        footer={null}
        width={800}
      >
        <div>
          {approvalsLoading ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ 
                width: 32, 
                height: 32, 
                border: '2px solid #f3f3f3',
                borderTop: '2px solid #1890ff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p>Loading pending approvals...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ color: '#666' }}>No pending user approvals</p>
            </div>
          ) : (
            <div>
              {pendingUsers.map((pendingUser) => (
                <Card key={pendingUser.id} size="small" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, marginBottom: 4 }}>{pendingUser.item}</h4>
                      <p style={{ margin: 0, marginBottom: 8, color: '#666', fontSize: '12px' }}>
                        Requested on: {pendingUser.date}
                      </p>
                      <Tag color={
                        pendingUser.priority === 'high' ? 'red' :
                        pendingUser.priority === 'medium' ? 'orange' : 'green'
                      }>
                        {pendingUser.priority?.toUpperCase()} PRIORITY
                      </Tag>
                    </div>
                    <Space>
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handleApproveUser(pendingUser.id, pendingUser.type)}
                      >
                        Approve
                      </Button>
                      <Button
                        danger
                        size="small"
                        onClick={() => handleRejectUser(pendingUser.id, pendingUser.type)}
                      >
                        Reject
                      </Button>
                    </Space>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default UserMaster