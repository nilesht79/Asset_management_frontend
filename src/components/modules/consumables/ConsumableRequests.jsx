import React, { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Modal,
  Form,
  InputNumber,
  Tag,
  message,
  Tooltip,
  Typography,
  Tabs,
  Descriptions,
  Timeline,
  Badge,
  Statistic,
  Row,
  Col,
  Steps,
  Divider,
  Avatar,
  Empty
} from 'antd'
import {
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  GiftOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  WarningOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  LaptopOutlined,
  InboxOutlined,
  ApiOutlined,
  DesktopOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import consumableService from '../../../services/consumable'
import assetService from '../../../services/asset'
import userService from '../../../services/user'
import useResponsive from '../../../hooks/useResponsive'

const { Search } = Input
const { Option } = Select
const { confirm } = Modal
const { Title, Text } = Typography

const statusConfig = {
  pending: { color: 'gold', icon: <ClockCircleOutlined />, text: 'Pending' },
  approved: { color: 'blue', icon: <CheckCircleOutlined />, text: 'Approved' },
  rejected: { color: 'red', icon: <CloseCircleOutlined />, text: 'Rejected' },
  delivered: { color: 'green', icon: <GiftOutlined />, text: 'Delivered' },
  cancelled: { color: 'default', icon: <CloseCircleOutlined />, text: 'Cancelled' }
}

const ConsumableRequests = () => {
  const { user } = useSelector(state => state.auth)
  const { isMobile, isTablet } = useResponsive()
  const isCoordinator = ['coordinator', 'admin', 'superadmin'].includes(user?.role)
  const canRequestOnBehalf = ['coordinator', 'admin', 'superadmin', 'engineer'].includes(user?.role)

  const [activeTab, setActiveTab] = useState(isCoordinator ? 'all' : 'my')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' })

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [actionType, setActionType] = useState('')

  // Form
  const [form] = Form.useForm()
  const [actionForm] = Form.useForm()

  // User assets and consumables for request
  const [userAssets, setUserAssets] = useState([])
  const [consumablesForAsset, setConsumablesForAsset] = useState([])
  const [selectedAssetId, setSelectedAssetId] = useState(null)

  // For coordinators: list of eligible users and selected user
  const [eligibleUsers, setEligibleUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [departments, setDepartments] = useState([])
  const [departmentFilter, setDepartmentFilter] = useState(null)
  const [wizardStep, setWizardStep] = useState(0)
  const [assetsLoading, setAssetsLoading] = useState(false)

  // Statistics
  const [stats, setStats] = useState({})

  // For approval modal: engineers and stock info
  const [engineers, setEngineers] = useState([])
  const [stockInfo, setStockInfo] = useState(null)
  const [stockLoading, setStockLoading] = useState(false)

  // Loading states for buttons to prevent multiple clicks
  const [submitLoading, setSubmitLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadRequests()
    if (isCoordinator) {
      loadStats()
      loadEngineers()
    }
    if (canRequestOnBehalf) {
      loadEligibleUsers()
      loadDepartments()
    }
  }, [pagination.current, pagination.pageSize, filters])

  useEffect(() => {
    // Only load own assets for users who cannot request on behalf (employees)
    if (!canRequestOnBehalf) {
      loadUserAssets()
    }
  }, [])

  const loadRequests = async () => {
    setLoading(true)
    try {
      // Coordinators and engineers use getRequests (backend handles filtering)
      // Regular employees use getMyRequests
      const service = (isCoordinator || user?.role === 'engineer')
        ? consumableService.getRequests
        : consumableService.getMyRequests
      const response = await service({
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      })
      if (response.data.success) {
        setRequests(response.data.data.requests || [])
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination?.total || 0
        }))
      }
    } catch (error) {
      message.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await consumableService.getRequestStats()
      if (response.data.success) {
        setStats(response.data.data || {})
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadUserAssets = async () => {
    try {
      const response = await assetService.getMyAssets()
      if (response.data.success) {
        setUserAssets(response.data.data.assets || response.data.data || [])
      }
    } catch (error) {
      console.error('Failed to load user assets:', error)
    }
  }

  const loadEligibleUsers = async () => {
    try {
      // Get users who are eligible to request consumables (employee, dept_head, it_head, engineer)
      const response = await userService.getUsers({ role: 'employee,dept_head,it_head,engineer', limit: 500 })
      if (response.data.success) {
        setEligibleUsers(response.data.data.users || response.data.data || [])
      }
    } catch (error) {
      console.error('Failed to load eligible users:', error)
    }
  }

  const loadDepartments = async () => {
    try {
      const response = await userService.getDepartments({ limit: 200 })
      if (response.data.success) {
        setDepartments(response.data.data.departments || response.data.data || [])
      }
    } catch (error) {
      console.error('Failed to load departments:', error)
    }
  }

  const loadEngineers = async () => {
    try {
      const response = await consumableService.getEngineers()
      if (response.data.success) {
        setEngineers(response.data.data || [])
      }
    } catch (error) {
      console.error('Failed to load engineers:', error)
    }
  }

  const loadStockInfo = async (requestId) => {
    setStockLoading(true)
    try {
      const response = await consumableService.getRequestStockInfo(requestId)
      if (response.data.success) {
        setStockInfo(response.data.data)
      }
    } catch (error) {
      console.error('Failed to load stock info:', error)
      setStockInfo(null)
    } finally {
      setStockLoading(false)
    }
  }

  const loadAssetsForUser = async (userId) => {
    setAssetsLoading(true)
    try {
      const response = await assetService.getUserAssets(userId)
      if (response.data.success) {
        setUserAssets(response.data.data.assets || response.data.data || [])
      }
    } catch (error) {
      setUserAssets([])
      console.error('Failed to load user assets:', error)
    } finally {
      setAssetsLoading(false)
    }
  }

  const loadConsumablesForAsset = async (assetId) => {
    try {
      const response = await consumableService.getConsumablesForAsset(assetId)
      if (response.data.success) {
        setConsumablesForAsset(response.data.data || [])
      }
    } catch (error) {
      setConsumablesForAsset([])
      console.error('Failed to load consumables for asset:', error)
    }
  }

  const handleUserChange = (userId) => {
    setSelectedUserId(userId)
    setSelectedAssetId(null)
    setUserAssets([])
    setConsumablesForAsset([])
    form.setFieldsValue({ for_asset_id: undefined, consumable_id: undefined })
    if (userId) {
      loadAssetsForUser(userId)
      setWizardStep(1) // Move to step 2
    } else {
      setWizardStep(0)
    }
  }

  // Get selected user details for display
  const getSelectedUserDetails = () => {
    if (!selectedUserId) return null
    return eligibleUsers.find(u => u.id === selectedUserId)
  }

  // Filter users by department
  const filteredUsers = useMemo(() => {
    if (!departmentFilter) return eligibleUsers
    return eligibleUsers.filter(u => u.department?.id === departmentFilter)
  }, [eligibleUsers, departmentFilter])

  // Get role display name
  const getRoleLabel = (role) => {
    const roleMap = {
      employee: 'Employee',
      dept_head: 'Dept Head',
      it_head: 'IT Head'
    }
    return roleMap[role] || role
  }

  const handleAssetChange = (assetId) => {
    setSelectedAssetId(assetId)
    form.setFieldsValue({ consumable_id: undefined })
    if (assetId) {
      loadConsumablesForAsset(assetId)
    } else {
      setConsumablesForAsset([])
    }
  }

  const handleCreateRequest = () => {
    form.resetFields()
    form.setFieldsValue({ quantity_requested: 1, priority: 'normal' })
    setSelectedAssetId(null)
    setSelectedUserId(null)
    setUserAssets([])
    setConsumablesForAsset([])
    setWizardStep(0)
    setDepartmentFilter(null)
    setCreateModalOpen(true)
    // For employees, reload their assets when modal opens
    if (!canRequestOnBehalf) {
      loadUserAssets()
    }
  }

  const handleSubmitRequest = async () => {
    try {
      // For coordinators/engineers, validate that a user is selected
      if (canRequestOnBehalf && !selectedUserId) {
        message.error('Please select a user to create the request for')
        return
      }

      const values = await form.validateFields()
      // For coordinators/engineers, add requested_for
      if (canRequestOnBehalf && selectedUserId) {
        values.requested_for = selectedUserId
      }

      setSubmitLoading(true)
      await consumableService.createRequest(values)
      message.success('Request submitted successfully')
      setCreateModalOpen(false)
      form.resetFields()
      setSelectedUserId(null)
      setUserAssets([])
      loadRequests()
    } catch (error) {
      if (error.errorFields) return
      message.error(error.response?.data?.message || 'Failed to submit request')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleViewDetails = async (record) => {
    try {
      const response = await consumableService.getRequest(record.id)
      if (response.data.success) {
        setSelectedRequest(response.data.data)
        setDetailModalOpen(true)
      }
    } catch (error) {
      message.error('Failed to load request details')
    }
  }

  const handleAction = (record, action) => {
    setSelectedRequest(record)
    setActionType(action)
    actionForm.resetFields()
    setStockInfo(null)

    // Load stock info when approving
    if (action === 'approve') {
      loadStockInfo(record.id)
    }

    setActionModalOpen(true)
  }

  const handleActionSubmit = async () => {
    try {
      const values = await actionForm.validateFields()
      const id = selectedRequest.id

      setActionLoading(true)

      switch (actionType) {
        case 'approve':
          await consumableService.approveRequest(id, values)
          message.success('Request approved and stock deducted')
          break
        case 'reject':
          await consumableService.rejectRequest(id, values)
          message.success('Request rejected')
          break
        case 'deliver':
          await consumableService.deliverRequest(id, values)
          message.success('Delivery confirmed')
          break
        case 'cancel':
          await consumableService.cancelRequest(id, values)
          message.success('Request cancelled')
          break
        default:
          break
      }

      setActionModalOpen(false)
      actionForm.resetFields()
      setStockInfo(null)
      loadRequests()
      if (isCoordinator) loadStats()
    } catch (error) {
      if (error.errorFields) return
      message.error(error.response?.data?.message || 'Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  // Responsive columns - hide some on mobile
  const columns = [
    {
      title: 'Request #',
      dataIndex: 'request_number',
      key: 'request_number',
      width: isMobile ? 120 : 150,
      fixed: isMobile ? false : 'left',
      render: (text, record) => isMobile ? (
        <Space direction="vertical" size={0}>
          <Text code strong style={{ fontSize: 12 }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.consumable_name}</Text>
          <Tag size="small" icon={statusConfig[record.status]?.icon} color={statusConfig[record.status]?.color}>
            {statusConfig[record.status]?.text || record.status}
          </Tag>
        </Space>
      ) : (
        <Text code strong>{text}</Text>
      ),
      sorter: (a, b) => (a.request_number || '').localeCompare(b.request_number || '')
    },
    // Hide Consumable column on mobile (shown in Request # column)
    ...(!isMobile ? [{
      title: 'Consumable',
      dataIndex: 'consumable_name',
      key: 'consumable_name',
      width: 220,
      ellipsis: true,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.consumable_sku}</Text>
        </Space>
      )
    }] : []),
    // Hide Asset column on mobile
    ...(!isMobile ? [{
      title: 'Asset',
      dataIndex: 'asset_tag',
      key: 'asset_tag',
      width: 180,
      render: (text) => text || '-'
    }] : []),
    {
      title: isMobile ? 'Qty' : 'Quantity',
      dataIndex: 'quantity_requested',
      key: 'quantity_requested',
      width: isMobile ? 50 : 80,
      align: 'center'
    },
    // Show additional columns for coordinators (all tab) OR engineers - hide on mobile
    ...((activeTab === 'all' || user?.role === 'engineer') && !isMobile ? [
      {
        title: 'Requested For',
        dataIndex: 'requested_by_name',
        key: 'requested_by_name',
        width: 150,
        render: (text, record) => (
          <Space direction="vertical" size={0}>
            <Text>{text}</Text>
            {record.requester_location_name && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                <EnvironmentOutlined style={{ marginRight: 4 }} />
                {record.requester_location_name}
              </Text>
            )}
          </Space>
        )
      },
      ...(activeTab === 'all' ? [
        {
          title: 'Created By',
          dataIndex: 'created_by_name',
          key: 'created_by_name',
          width: 140,
          render: (text, record) => {
            // Show created_by only if different from requested_by (on-behalf request)
            if (text && text !== record.requested_by_name) {
              return (
                <Tooltip title="Request created on behalf">
                  <Space size={4}>
                    <UserOutlined style={{ color: '#722ed1' }} />
                    <span>{text}</span>
                  </Space>
                </Tooltip>
              )
            }
            return '-'
          }
        }
      ] : []),
      ...(activeTab === 'all' ? [
        {
          title: 'Engineer',
          dataIndex: 'assigned_engineer_name',
          key: 'assigned_engineer_name',
          width: 130,
          render: (text) => text || '-'
        }
      ] : [])
    ] : []),
    // Hide Status column on mobile (shown in Request # column)
    ...(!isMobile ? [{
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const config = statusConfig[status] || { color: 'default', text: status }
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.text}
          </Tag>
        )
      }
    }] : []),
    // Hide Created column on mobile
    ...(!isMobile ? [{
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      defaultSortOrder: 'descend'
    }] : []),
    {
      title: 'Actions',
      key: 'actions',
      width: isMobile ? 100 : 200,
      fixed: isMobile ? 'right' : false,
      render: (_, record) => {
        const actions = []

        actions.push(
          <Tooltip title="View Details" key="view">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          </Tooltip>
        )

        if (isCoordinator) {
          if (record.status === 'pending') {
            actions.push(
              <Tooltip title="Approve" key="approve">
                <Button type="text" size="small" icon={<CheckOutlined style={{ color: '#52c41a' }} />} onClick={() => handleAction(record, 'approve')} />
              </Tooltip>,
              <Tooltip title="Reject" key="reject">
                <Button type="text" size="small" icon={<CloseOutlined style={{ color: '#ff4d4f' }} />} onClick={() => handleAction(record, 'reject')} />
              </Tooltip>
            )
          }
          if (record.status === 'approved') {
            actions.push(
              <Tooltip title="Mark Delivered" key="deliver">
                <Button type="text" size="small" icon={<GiftOutlined style={{ color: '#52c41a' }} />} onClick={() => handleAction(record, 'deliver')} />
              </Tooltip>
            )
          }
        }

        // Engineers can also mark as delivered if assigned to them
        if (user?.role === 'engineer' && record.status === 'approved' && record.assigned_engineer === user?.id) {
          actions.push(
            <Tooltip title="Mark Delivered" key="deliver">
              <Button type="text" size="small" icon={<GiftOutlined style={{ color: '#52c41a' }} />} onClick={() => handleAction(record, 'deliver')} />
            </Tooltip>
          )
        }

        if (record.status === 'pending' && record.requested_by === user?.id) {
          actions.push(
            <Tooltip title="Cancel" key="cancel">
              <Button type="text" size="small" danger icon={<CloseCircleOutlined />} onClick={() => handleAction(record, 'cancel')} />
            </Tooltip>
          )
        }

        return <Space size={isMobile ? 0 : 'small'} wrap={isMobile}>{actions}</Space>
      }
    }
  ]

  // Coordinators/admins only see All Requests tab, regular users only see My Requests tab
  const tabItems = isCoordinator
    ? [{
        key: 'all',
        label: (
          <span>
            All Requests
            {stats.pending > 0 && <Badge count={stats.pending} style={{ marginLeft: 8 }} />}
          </span>
        )
      }]
    : [{
        key: 'my',
        label: user?.role === 'engineer' ? 'Requests Created' : 'My Requests'
      }]

  return (
    <div style={{ padding: isMobile ? 12 : 24 }}>
      {isCoordinator && (
        <Row gutter={[12, 12]} style={{ marginBottom: isMobile ? 16 : 24 }}>
          <Col xs={12} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Pending"
                value={stats.pending || 0}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ fontSize: isMobile ? 20 : 24 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title={isMobile ? "Approved" : "Approved (Awaiting Delivery)"}
                value={stats.approved || 0}
                prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ fontSize: isMobile ? 20 : 24 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Delivered"
                value={stats.delivered || 0}
                prefix={<GiftOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ fontSize: isMobile ? 20 : 24 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title={isMobile ? "Urgent" : "Urgent Pending"}
                value={stats.urgent_pending || 0}
                valueStyle={{ color: stats.urgent_pending > 0 ? '#ff4d4f' : undefined, fontSize: isMobile ? 20 : 24 }}
                prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          marginBottom: 16,
          gap: isMobile ? 12 : 0
        }}>
          <div>
            <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>
              <GiftOutlined style={{ marginRight: 8 }} />
              Consumable Requests
            </Title>
            {!isMobile && <Text type="secondary">Request and manage consumables for your assets</Text>}
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateRequest}
            block={isMobile}
          >
            New Request
          </Button>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

        {/* Filters */}
        <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder={isMobile ? "Search..." : "Search request #, consumable, asset..."}
              allowClear
              style={{ width: '100%' }}
              onSearch={(value) => {
                setPagination(prev => ({ ...prev, current: 1 }))
                setFilters(prev => ({ ...prev, search: value }))
              }}
              onChange={(e) => {
                if (!e.target.value) {
                  setPagination(prev => ({ ...prev, current: 1 }))
                  setFilters(prev => ({ ...prev, search: '' }))
                }
              }}
            />
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="Status"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => {
                setPagination(prev => ({ ...prev, current: 1 }))
                setFilters(prev => ({ ...prev, status: value || '' }))
              }}
            >
              {Object.entries(statusConfig).map(([key, config]) => (
                <Option key={key} value={key}>{config.text}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="Priority"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => {
                setPagination(prev => ({ ...prev, current: 1 }))
                setFilters(prev => ({ ...prev, priority: value || '' }))
              }}
            >
              <Option value="urgent">Urgent</Option>
              <Option value="high">High</Option>
              <Option value="normal">Normal</Option>
              <Option value="low">Low</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4} lg={2}>
            <Button
              icon={<SyncOutlined />}
              onClick={() => {
                setPagination(prev => ({ ...prev, current: 1 }))
                setFilters({ search: '', status: '', priority: '' })
              }}
              block={isMobile}
            >
              {isMobile ? 'Reset' : 'Reset'}
            </Button>
          </Col>
          <Col xs={12} sm={6} md={4} lg={2}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                loadRequests()
                if (isCoordinator) loadStats()
              }}
              loading={loading}
              block={isMobile}
            >
              {isMobile ? '' : 'Refresh'}
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={requests}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: !isMobile,
            showQuickJumper: !isMobile,
            showTotal: isMobile ? undefined : (total, range) => `${range[0]}-${range[1]} of ${total} requests`,
            pageSizeOptions: ['10', '20', '50', '100'],
            size: isMobile ? 'small' : 'default'
          }}
          onChange={(pag, _filters, sorter) => {
            setPagination(prev => ({ ...prev, current: pag.current, pageSize: pag.pageSize }))
          }}
          scroll={{ x: isMobile ? 400 : 1200 }}
          size={isMobile ? 'small' : 'middle'}
        />
      </Card>

      {/* Create Request Modal */}
      <Modal
        title={
          <Space>
            <InboxOutlined />
            {canRequestOnBehalf
              ? (isMobile ? "New Request (On Behalf)" : "New Consumable Request (On Behalf)")
              : (isMobile ? "New Request" : "New Consumable Request")}
          </Space>
        }
        open={createModalOpen}
        onCancel={() => {
          if (submitLoading) return
          setCreateModalOpen(false)
          form.resetFields()
          setSelectedUserId(null)
          setUserAssets([])
          setConsumablesForAsset([])
          setWizardStep(0)
          setDepartmentFilter(null)
        }}
        closable={!submitLoading}
        maskClosable={!submitLoading}
        onOk={handleSubmitRequest}
        okText="Submit Request"
        okButtonProps={{ disabled: canRequestOnBehalf && !selectedUserId, loading: submitLoading }}
        cancelButtonProps={{ disabled: submitLoading }}
        width={isMobile ? '100%' : 650}
        style={isMobile ? { top: 20, maxWidth: '100%', margin: '0 auto' } : undefined}
        bodyStyle={isMobile ? { padding: '12px 16px' } : undefined}
      >
        {/* Wizard Steps for Coordinators/Engineers */}
        {canRequestOnBehalf && (
          <Steps
            current={wizardStep}
            size="small"
            style={{ marginBottom: 24, marginTop: 8 }}
            items={[
              { title: 'Select Employee', icon: <UserOutlined /> },
              { title: 'Request Details', icon: <InboxOutlined /> }
            ]}
          />
        )}

        <Form form={form} layout="vertical">
          {/* For coordinators/engineers: Select which user to create request for */}
          {canRequestOnBehalf && (
            <>
              {/* Department Filter */}
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                  Filter by Department
                </Text>
                <Select
                  placeholder="All Departments"
                  allowClear
                  style={{ width: '100%' }}
                  value={departmentFilter}
                  onChange={(val) => setDepartmentFilter(val)}
                  suffixIcon={<TeamOutlined />}
                >
                  {departments.map(d => (
                    <Option key={d.department_id || d.id} value={d.department_id || d.id}>
                      {d.department_name || d.name}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* User Selection with enhanced info */}
              <Form.Item
                label={<Space><UserOutlined /> Request For</Space>}
                required
                style={{ marginBottom: 16 }}
              >
                <Select
                  placeholder="Search and select employee..."
                  showSearch
                  value={selectedUserId}
                  filterOption={(input, option) => {
                    const user = eligibleUsers.find(u => u.id === option.value)
                    if (!user) return false
                    const searchStr = `${user.firstName} ${user.lastName} ${user.email} ${user.employeeId || ''} ${user.department?.name || ''}`.toLowerCase()
                    return searchStr.includes(input.toLowerCase())
                  }}
                  onChange={handleUserChange}
                  optionLabelProp="label"
                  size="large"
                >
                  {filteredUsers.map(u => (
                    <Option
                      key={u.id}
                      value={u.id}
                      label={`${u.firstName} ${u.lastName}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', padding: '4px 0' }}>
                        <Avatar
                          size="small"
                          icon={<UserOutlined />}
                          style={{ marginRight: 10, backgroundColor: '#1890ff' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div>
                            <Text strong>{u.firstName} {u.lastName}</Text>
                            <Tag size="small" style={{ marginLeft: 8 }}>{getRoleLabel(u.role)}</Tag>
                          </div>
                          <div style={{ fontSize: 12 }}>
                            <Text type="secondary">
                              {u.email}
                              {u.department?.name && (
                                <span style={{ marginLeft: 8 }}>
                                  <TeamOutlined style={{ marginRight: 4 }} />
                                  {u.department.name}
                                </span>
                              )}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Selected User Info Card */}
              {selectedUserId && getSelectedUserDetails() && (
                <Card
                  size="small"
                  style={{ marginBottom: 16, backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}
                >
                  <Row align="middle" gutter={16}>
                    <Col>
                      <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#52c41a' }} />
                    </Col>
                    <Col flex={1}>
                      <Text strong style={{ fontSize: 14 }}>
                        {getSelectedUserDetails().firstName} {getSelectedUserDetails().lastName}
                      </Text>
                      <div style={{ fontSize: 12 }}>
                        <Space split={<Divider type="vertical" style={{ margin: '0 4px' }} />}>
                          <span><Tag size="small" color="green">{getRoleLabel(getSelectedUserDetails().role)}</Tag></span>
                          {getSelectedUserDetails().department?.name && (
                            <span><TeamOutlined /> {getSelectedUserDetails().department.name}</span>
                          )}
                          {getSelectedUserDetails().location?.name && (
                            <span><EnvironmentOutlined /> {getSelectedUserDetails().location.name}</span>
                          )}
                        </Space>
                      </div>
                    </Col>
                    <Col>
                      <Badge count={userAssets.length} style={{ backgroundColor: '#52c41a' }}>
                        <Tag icon={<LaptopOutlined />}>Assets</Tag>
                      </Badge>
                    </Col>
                  </Row>
                </Card>
              )}

              <Divider style={{ margin: '16px 0' }} />
            </>
          )}

          {/* Asset Selection */}
          <Form.Item
            name="for_asset_id"
            label={<Space><LaptopOutlined /> Asset</Space>}
            extra={
              canRequestOnBehalf && !selectedUserId
                ? "Select an employee first to see their assets"
                : userAssets.length === 0 && selectedUserId
                  ? "This employee has no assigned assets"
                  : "Select the asset this consumable is for"
            }
          >
            <Select
              placeholder={assetsLoading ? "Loading assets..." : "Select asset"}
              allowClear
              showSearch
              loading={assetsLoading}
              disabled={(canRequestOnBehalf && !selectedUserId) || assetsLoading}
              filterOption={(input, option) => {
                // Search in option label text
                const label = option?.label || option?.children
                if (typeof label === 'string') {
                  return label.toLowerCase().includes(input.toLowerCase())
                }
                // For complex labels, search in asset tag and product name
                const asset = userAssets.find(a => a.id === option?.value)
                if (asset) {
                  const searchText = `${asset.asset_tag} ${asset.product_name || asset.asset_product_name} ${asset.serial_number || ''}`.toLowerCase()
                  return searchText.includes(input.toLowerCase())
                }
                return false
              }}
              onChange={handleAssetChange}
              notFoundContent={
                assetsLoading ? (
                  <span><SyncOutlined spin /> Loading...</span>
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No assets found" />
                )
              }
            >
              {(() => {
                // Separate parent/standalone assets from components
                const parentAssets = userAssets.filter(a => !a.is_component && a.asset_type !== 'component')
                const components = userAssets.filter(a => a.is_component || a.asset_type === 'component')

                // Create a map of parent_asset_id to components
                const componentMap = {}
                components.forEach(comp => {
                  const parentId = comp.parent_asset_id
                  if (parentId) {
                    if (!componentMap[parentId]) {
                      componentMap[parentId] = []
                    }
                    componentMap[parentId].push(comp)
                  }
                })

                // Build options with parent assets and their components
                const options = []
                parentAssets.forEach(asset => {
                  const hasComponents = componentMap[asset.id] && componentMap[asset.id].length > 0

                  // Add parent/standalone asset
                  options.push(
                    <Option key={asset.id} value={asset.id}>
                      <Space>
                        {hasComponents ? (
                          <DesktopOutlined style={{ color: '#1890ff' }} />
                        ) : (
                          <LaptopOutlined style={{ color: '#595959' }} />
                        )}
                        <span>{asset.asset_tag} - {asset.product_name || asset.asset_product_name}</span>
                        {asset.serial_number && <Text type="secondary" style={{ fontSize: 11 }}>({asset.serial_number})</Text>}
                        {hasComponents && (
                          <Tag color="blue" style={{ fontSize: 10, marginLeft: 4 }}>
                            {componentMap[asset.id].length} comp
                          </Tag>
                        )}
                      </Space>
                    </Option>
                  )

                  // Add components under parent
                  if (hasComponents) {
                    componentMap[asset.id].forEach(comp => {
                      options.push(
                        <Option key={comp.id} value={comp.id}>
                          <Space style={{ paddingLeft: 20 }}>
                            <ApiOutlined style={{ color: '#52c41a' }} />
                            <span>{comp.asset_tag} - {comp.product_name || comp.asset_product_name}</span>
                            {comp.serial_number && <Text type="secondary" style={{ fontSize: 11 }}>({comp.serial_number})</Text>}
                            <Tag color="green" style={{ fontSize: 10 }}>Component</Tag>
                          </Space>
                        </Option>
                      )
                    })
                  }
                })

                // Add orphan components (components without a parent in the list)
                components.forEach(comp => {
                  if (!comp.parent_asset_id || !parentAssets.find(p => p.id === comp.parent_asset_id)) {
                    options.push(
                      <Option key={comp.id} value={comp.id}>
                        <Space>
                          <ApiOutlined style={{ color: '#52c41a' }} />
                          <span>{comp.asset_tag} - {comp.product_name || comp.asset_product_name}</span>
                          {comp.serial_number && <Text type="secondary" style={{ fontSize: 11 }}>({comp.serial_number})</Text>}
                          <Tag color="green" style={{ fontSize: 10 }}>Component</Tag>
                          {comp.parent_asset_tag && (
                            <Text type="secondary" style={{ fontSize: 10 }}>
                              (of {comp.parent_asset_tag})
                            </Text>
                          )}
                        </Space>
                      </Option>
                    )
                  }
                })

                return options
              })()}
            </Select>
          </Form.Item>

          {/* Consumable Selection with Stock Info */}
          <Form.Item
            name="consumable_id"
            label={<Space><InboxOutlined /> Consumable</Space>}
            rules={[{ required: true, message: 'Please select a consumable' }]}
            extra={!selectedAssetId && "Select an asset to see compatible consumables"}
          >
            <Select
              placeholder={selectedAssetId ? "Select compatible consumable" : "Select an asset first"}
              showSearch
              disabled={(canRequestOnBehalf && !selectedUserId) || !selectedAssetId}
              filterOption={(input, option) => {
                const consumable = consumablesForAsset.find(c => c.id === option.value)
                if (!consumable) return false
                return `${consumable.name} ${consumable.sku}`.toLowerCase().includes(input.toLowerCase())
              }}
              optionLabelProp="label"
              notFoundContent={
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No compatible consumables" />
              }
            >
              {consumablesForAsset.map(c => {
                const isLowStock = c.total_stock <= (c.reorder_level || 5)
                const isOutOfStock = c.total_stock === 0
                return (
                  <Option key={c.id} value={c.id} label={`${c.name} (${c.sku})`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>{c.name}</Text>
                        <Text type="secondary" style={{ marginLeft: 8 }}>({c.sku})</Text>
                      </div>
                      <div>
                        {isOutOfStock ? (
                          <Tag color="error" icon={<CloseCircleOutlined />}>Out of Stock</Tag>
                        ) : isLowStock ? (
                          <Tag color="warning" icon={<WarningOutlined />}>
                            Low: {c.total_stock} {c.unit_of_measure || 'units'}
                          </Tag>
                        ) : (
                          <Tag color="success" icon={<CheckCircleOutlined />}>
                            {c.total_stock} {c.unit_of_measure || 'units'}
                          </Tag>
                        )}
                      </div>
                    </div>
                  </Option>
                )
              })}
            </Select>
          </Form.Item>

          {/* Quantity and Priority in a Row */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity_requested"
                label="Quantity"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Priority">
                <Select>
                  <Option value="low">
                    <Tag color="default">Low</Tag>
                  </Option>
                  <Option value="normal">
                    <Tag color="blue">Normal</Tag>
                  </Option>
                  <Option value="high">
                    <Tag color="orange">High</Tag>
                  </Option>
                  <Option value="urgent">
                    <Tag color="red">Urgent</Tag>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Purpose/Notes */}
          <Form.Item name="purpose" label="Purpose/Notes">
            <Input.TextArea
              rows={2}
              placeholder="Reason for request (optional)"
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Details Modal */}
      <Modal
        title="Request Details"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={isMobile ? '100%' : 600}
        style={isMobile ? { top: 20, maxWidth: '100%', margin: '0 auto' } : undefined}
        bodyStyle={isMobile ? { padding: '12px 16px' } : undefined}
      >
        {selectedRequest && (
          <div style={{ marginTop: 16 }}>
            <Descriptions bordered column={isMobile ? 1 : 2} size="small">
              <Descriptions.Item label="Request #" span={2}>
                <Text code>{selectedRequest.request_number}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Consumable">{selectedRequest.consumable_name}</Descriptions.Item>
              <Descriptions.Item label="Quantity">{selectedRequest.quantity_requested}</Descriptions.Item>
              <Descriptions.Item label="Asset" span={2}>{selectedRequest.asset_tag || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Requested By">{selectedRequest.requested_by_name}</Descriptions.Item>
              <Descriptions.Item label="Location">
                {selectedRequest.requester_location_name ? (
                  <Space size={4}>
                    <EnvironmentOutlined style={{ color: '#1890ff' }} />
                    {selectedRequest.requester_location_name}
                  </Space>
                ) : '-'}
              </Descriptions.Item>
              {selectedRequest.created_by_name && selectedRequest.created_by_name !== selectedRequest.requested_by_name && (
                <Descriptions.Item label="Created By" span={2}>
                  <Space size={4}>
                    <UserOutlined style={{ color: '#722ed1' }} />
                    {selectedRequest.created_by_name}
                    <Tag color="purple" size="small">On Behalf</Tag>
                  </Space>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Status">
                <Tag color={statusConfig[selectedRequest.status]?.color}>
                  {statusConfig[selectedRequest.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Priority">
                <Tag color={
                  selectedRequest.priority === 'urgent' ? 'red' :
                  selectedRequest.priority === 'high' ? 'orange' :
                  selectedRequest.priority === 'normal' ? 'blue' : 'default'
                }>
                  {selectedRequest.priority?.charAt(0).toUpperCase() + selectedRequest.priority?.slice(1)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Purpose" span={2}>{selectedRequest.purpose || '-'}</Descriptions.Item>
              {selectedRequest.approved_by_name && (
                <Descriptions.Item label="Approved By">{selectedRequest.approved_by_name}</Descriptions.Item>
              )}
              {selectedRequest.assigned_engineer_name && (
                <Descriptions.Item label="Assigned Engineer">
                  <Space size={4}>
                    <UserOutlined style={{ color: '#722ed1' }} />
                    {selectedRequest.assigned_engineer_name}
                  </Space>
                </Descriptions.Item>
              )}
              {selectedRequest.rejection_reason && (
                <Descriptions.Item label="Rejection Reason" span={2}>{selectedRequest.rejection_reason}</Descriptions.Item>
              )}
            </Descriptions>

            <div style={{ marginTop: 16 }}>
              <Text strong>Timeline</Text>
              <Timeline style={{ marginTop: 8 }}>
                <Timeline.Item color="blue">
                  Created on {new Date(selectedRequest.created_at).toLocaleString()}
                  {selectedRequest.created_by_name && selectedRequest.created_by_name !== selectedRequest.requested_by_name && (
                    <div style={{ fontSize: 12, color: '#722ed1' }}>
                      Created by {selectedRequest.created_by_name} on behalf of {selectedRequest.requested_by_name}
                    </div>
                  )}
                </Timeline.Item>
                {selectedRequest.approved_at && (
                  <Timeline.Item color="green">
                    Approved on {new Date(selectedRequest.approved_at).toLocaleString()}
                    {selectedRequest.assigned_engineer_name && (
                      <div style={{ fontSize: 12, color: '#722ed1' }}>
                        Assigned to {selectedRequest.assigned_engineer_name}
                      </div>
                    )}
                  </Timeline.Item>
                )}
                {selectedRequest.status === 'rejected' && (
                  <Timeline.Item color="red">
                    Rejected on {new Date(selectedRequest.approved_at).toLocaleString()}
                  </Timeline.Item>
                )}
                {selectedRequest.delivered_at && (
                  <Timeline.Item color="green">
                    Delivered on {new Date(selectedRequest.delivered_at).toLocaleString()}
                  </Timeline.Item>
                )}
              </Timeline>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Request`}
        open={actionModalOpen}
        onCancel={() => {
          if (actionLoading) return
          setActionModalOpen(false)
          actionForm.resetFields()
          setStockInfo(null)
        }}
        closable={!actionLoading}
        maskClosable={!actionLoading}
        onOk={handleActionSubmit}
        okText={actionType.charAt(0).toUpperCase() + actionType.slice(1)}
        okButtonProps={{
          danger: ['reject', 'cancel'].includes(actionType),
          disabled: actionType === 'approve' && (!stockInfo?.has_sufficient_anywhere || stockLoading),
          loading: actionLoading
        }}
        cancelButtonProps={{ disabled: actionLoading }}
        width={isMobile ? '100%' : (actionType === 'approve' ? 600 : 500)}
        style={isMobile ? { top: 20, maxWidth: '100%', margin: '0 auto' } : undefined}
        bodyStyle={isMobile ? { padding: '12px 16px' } : undefined}
      >
        <Form form={actionForm} layout="vertical" style={{ marginTop: 16 }}>
          {actionType === 'reject' && (
            <Form.Item
              name="rejection_reason"
              label="Rejection Reason"
              rules={[{ required: true, message: 'Please provide a reason' }]}
            >
              <Input.TextArea rows={3} placeholder="Why is this request being rejected?" />
            </Form.Item>
          )}
          {actionType === 'cancel' && (
            <Form.Item name="cancellation_reason" label="Cancellation Reason">
              <Input.TextArea rows={3} placeholder="Reason for cancellation (optional)" />
            </Form.Item>
          )}
          {actionType === 'deliver' && (
            <Form.Item name="delivery_notes" label="Delivery Notes">
              <Input.TextArea rows={2} placeholder="Any notes about the delivery (optional)" />
            </Form.Item>
          )}
          {actionType === 'approve' && (
            <>
              {/* Stock Info Display */}
              {stockLoading ? (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <SyncOutlined spin /> Loading stock information...
                </div>
              ) : stockInfo ? (
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={[16, 12]}>
                    <Col xs={24} sm={12}>
                      <Text type="secondary">Consumable</Text>
                      <div><Text strong>{stockInfo.consumable?.name}</Text></div>
                      <Text type="secondary" style={{ fontSize: 12 }}>{stockInfo.consumable?.sku}</Text>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Text type="secondary">Quantity Requested</Text>
                      <div><Text strong style={{ fontSize: 18 }}>{stockInfo.quantity_requested}</Text> {stockInfo.consumable?.unit_of_measure || 'units'}</div>
                    </Col>
                  </Row>
                  <Divider style={{ margin: '12px 0' }} />
                  <Row gutter={[16, 12]}>
                    <Col xs={24} sm={12}>
                      <Text type="secondary">Requester Location</Text>
                      <div>
                        <Space>
                          <EnvironmentOutlined style={{ color: '#1890ff' }} />
                          <Text strong>{stockInfo.requester_location?.name || 'Not Set'}</Text>
                        </Space>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Text type="secondary">Total Available Stock</Text>
                      <div>
                        <Text
                          strong
                          style={{
                            fontSize: 18,
                            color: stockInfo.has_sufficient_anywhere ? '#52c41a' : '#ff4d4f'
                          }}
                        >
                          {stockInfo.total_available}
                        </Text>
                        {' '}
                        {stockInfo.has_sufficient_anywhere ? (
                          <Tag color="success" icon={<CheckCircleOutlined />}>Sufficient</Tag>
                        ) : (
                          <Tag color="error" icon={<CloseCircleOutlined />}>Insufficient</Tag>
                        )}
                      </div>
                    </Col>
                  </Row>
                  {stockInfo.stock_by_location?.length > 0 && (
                    <>
                      <Divider style={{ margin: '12px 0' }} />
                      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Stock by Location</Text>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {stockInfo.stock_by_location.map((loc, idx) => (
                          <Tag
                            key={idx}
                            color={loc.available_stock >= stockInfo.quantity_requested ? 'green' : 'default'}
                          >
                            <EnvironmentOutlined /> {loc.location_name || 'Main Store'}: {loc.available_stock}
                          </Tag>
                        ))}
                      </div>
                    </>
                  )}
                </Card>
              ) : (
                <div style={{ textAlign: 'center', color: '#ff4d4f', padding: 20 }}>
                  <WarningOutlined /> Failed to load stock information
                </div>
              )}

              {/* Engineer Selection */}
              <Form.Item
                name="assigned_engineer"
                label={<Space><UserOutlined /> Assign Engineer for Delivery</Space>}
                rules={[{ required: true, message: 'Please select an engineer for delivery' }]}
              >
                <Select
                  placeholder="Select engineer..."
                  showSearch
                  filterOption={(input, option) => {
                    const eng = engineers.find(e => e.id === option.value)
                    if (!eng) return false
                    return `${eng.firstName} ${eng.lastName} ${eng.email}`.toLowerCase().includes(input.toLowerCase())
                  }}
                  optionLabelProp="label"
                  disabled={!stockInfo?.has_sufficient_anywhere}
                >
                  {engineers.map(eng => (
                    <Option key={eng.id} value={eng.id} label={`${eng.firstName} ${eng.lastName}`}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8, backgroundColor: '#722ed1' }} />
                        <div>
                          <div><Text strong>{eng.firstName} {eng.lastName}</Text></div>
                          <div style={{ fontSize: 11 }}>
                            <Text type="secondary">{eng.email}</Text>
                            {eng.location_name && (
                              <span style={{ marginLeft: 8 }}>
                                <EnvironmentOutlined /> {eng.location_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="notes" label="Approval Notes">
                <Input.TextArea rows={2} placeholder="Any notes (optional)" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  )
}

export default ConsumableRequests
