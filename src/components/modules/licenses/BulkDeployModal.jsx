import React, { useState, useEffect, useCallback } from 'react'
import {
  Modal,
  Table,
  Input,
  Select,
  Space,
  Button,
  Tag,
  message,
  Alert,
  Row,
  Col,
  Typography,
  Progress,
  Result,
  Statistic
} from 'antd'
import {
  SearchOutlined,
  DeploymentUnitOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ForwardOutlined
} from '@ant-design/icons'
import licenseService from '../../../services/license'
import masterService from '../../../services/master'

const { Text, Title } = Typography

const BulkDeployModal = ({ open, onClose, license, onSuccess }) => {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50, total: 0 })
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [filters, setFilters] = useState({ search: '', category_id: '', location_id: '', status: '' })
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [deploying, setDeploying] = useState(false)
  const [deployResult, setDeployResult] = useState(null)
  const [licenseInfo, setLicenseInfo] = useState(null)

  const loadAssets = useCallback(async (page = 1, pageSize = 50) => {
    if (!license?.id) return
    setLoading(true)
    try {
      const params = { page, limit: pageSize }
      if (filters.search) params.search = filters.search
      if (filters.category_id) params.category_id = filters.category_id
      if (filters.location_id) params.location_id = filters.location_id
      if (filters.status) params.status = filters.status

      const response = await licenseService.getDeployableAssets(license.id, params)
      const data = response.data?.data || response.data
      setAssets(data.assets || [])
      setLicenseInfo(data.license || null)
      setPagination({
        current: data.pagination?.page || page,
        pageSize: data.pagination?.limit || pageSize,
        total: data.pagination?.total || 0
      })
    } catch (error) {
      message.error('Failed to load assets')
    } finally {
      setLoading(false)
    }
  }, [license?.id, filters])

  const loadDropdowns = useCallback(async () => {
    try {
      const [catRes, parentCatRes, locRes] = await Promise.all([
        masterService.getProductSubCategories({ limit: 500 }),
        masterService.getCategories({ limit: 500 }),
        masterService.getLocations({ limit: 500 })
      ])
      // Exclude subcategories whose parent is "Software"
      const parentCats = parentCatRes.data?.data?.categories || parentCatRes.data?.data || []
      const softwareParentIds = new Set(parentCats.filter(c => c.name?.toLowerCase() === 'software').map(c => c.id))
      const allSubCats = catRes.data?.data?.subcategories || catRes.data?.data?.categories || catRes.data?.data || []
      setCategories(allSubCats.filter(c => !softwareParentIds.has(c.parent_category_id)))
      setLocations(locRes.data?.data?.locations || locRes.data?.data || [])
    } catch (error) {
      console.error('Error loading dropdowns:', error)
    }
  }, [])

  useEffect(() => {
    if (open && license?.id) {
      setSelectedRowKeys([])
      setDeployResult(null)
      setFilters({ search: '', category_id: '', location_id: '', status: '' })
      loadAssets()
      loadDropdowns()
    }
  }, [open, license?.id])

  useEffect(() => {
    if (open && license?.id) {
      loadAssets()
    }
  }, [filters, open, license?.id, loadAssets])

  const handleTableChange = (pag) => {
    loadAssets(pag.current, pag.pageSize)
  }

  const handleDeploy = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one asset')
      return
    }

    if (licenseInfo && selectedRowKeys.length > licenseInfo.available) {
      message.error(`Only ${licenseInfo.available} licenses available, but ${selectedRowKeys.length} selected`)
      return
    }

    setDeploying(true)
    try {
      const response = await licenseService.bulkAssignLicense(license.id, selectedRowKeys)
      const result = response.data?.data || response.data
      setDeployResult(result)
      if (result.success > 0) {
        message.success(`Successfully deployed to ${result.success} assets`)
        onSuccess?.()
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Deployment failed')
    } finally {
      setDeploying(false)
    }
  }

  const handleClose = () => {
    setDeployResult(null)
    setSelectedRowKeys([])
    onClose()
  }

  const columns = [
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      width: 140,
      ellipsis: true,
      render: (text) => text || '-'
    },
    {
      title: 'Product',
      key: 'product',
      width: 180,
      ellipsis: true,
      render: (_, record) => (
        <span>{record.product_name}{record.product_model ? ` (${record.product_model})` : ''}</span>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      width: 110,
      ellipsis: true,
      render: (text) => text || '-'
    },
    {
      title: 'Assigned To',
      key: 'assigned_to',
      width: 160,
      ellipsis: true,
      render: (_, record) => record.assigned_user_name ? (
        <span>
          {record.assigned_user_name}
          {record.assigned_employee_code ? <Text type="secondary" style={{ fontSize: 11 }}> ({record.assigned_employee_code})</Text> : ''}
        </span>
      ) : <Text type="secondary">Unassigned</Text>
    },
    {
      title: 'Location',
      dataIndex: 'location_name',
      width: 110,
      ellipsis: true,
      render: (text) => text || '-'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 90,
      render: (status) => {
        const colors = { available: 'green', assigned: 'blue', in_use: 'cyan', under_repair: 'orange' }
        return <Tag color={colors[status] || 'default'}>{status?.replace('_', ' ')}</Tag>
      }
    }
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    getCheckboxProps: () => ({ disabled: deploying })
  }

  const available = licenseInfo?.available ?? (license?.total_licenses || 0)

  // Result view after deployment
  if (deployResult) {
    return (
      <Modal
        title="Deployment Result"
        open={open}
        onCancel={handleClose}
        footer={<Button type="primary" onClick={handleClose}>Close</Button>}
        width={500}
      >
        <Result
          status={deployResult.failed === 0 ? 'success' : 'warning'}
          title={`Deployment Complete`}
          subTitle={`${license?.license_name || 'License'} deployed to assets`}
        />
        <Row gutter={16} style={{ textAlign: 'center', marginTop: -20 }}>
          <Col span={8}>
            <Statistic title="Installed" value={deployResult.success} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
          </Col>
          <Col span={8}>
            <Statistic title="Skipped" value={deployResult.skipped} valueStyle={{ color: '#faad14' }} prefix={<ForwardOutlined />} />
          </Col>
          <Col span={8}>
            <Statistic title="Failed" value={deployResult.failed} valueStyle={{ color: '#ff4d4f' }} prefix={<CloseCircleOutlined />} />
          </Col>
        </Row>
      </Modal>
    )
  }

  return (
    <Modal
      title={
        <Space>
          <DeploymentUnitOutlined />
          <span>Deploy License: {license?.license_name}</span>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      width={1100}
      footer={
        <Space>
          <Text type="secondary">
            {selectedRowKeys.length} selected / {available} available
          </Text>
          {selectedRowKeys.length > available && (
            <Text type="danger">Exceeds available licenses!</Text>
          )}
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="primary"
            icon={<DeploymentUnitOutlined />}
            onClick={handleDeploy}
            loading={deploying}
            disabled={selectedRowKeys.length === 0 || selectedRowKeys.length > available}
          >
            Deploy to {selectedRowKeys.length} Asset{selectedRowKeys.length !== 1 ? 's' : ''}
          </Button>
        </Space>
      }
    >
      {/* License info bar */}
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={
          <Row gutter={24}>
            <Col><Text strong>Product:</Text> {license?.product_name}</Col>
            <Col><Text strong>Type:</Text> {license?.license_type}</Col>
            <Col><Text strong>Total:</Text> {license?.total_licenses || licenseInfo?.total_licenses}</Col>
            <Col><Text strong>Used:</Text> {licenseInfo?.current_allocated ?? license?.allocated}</Col>
            <Col>
              <Text strong>Available: </Text>
              <Text style={{ color: available > 0 ? '#52c41a' : '#ff4d4f' }}>{available}</Text>
            </Col>
          </Row>
        }
      />

      {/* Filters */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder="Search asset tag, serial, product, user..."
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            allowClear
          />
        </Col>
        <Col span={5}>
          <Select
            placeholder="Category"
            value={filters.category_id || undefined}
            onChange={(val) => setFilters(f => ({ ...f, category_id: val || '' }))}
            allowClear
            style={{ width: '100%' }}
            showSearch
            optionFilterProp="children"
          >
            {categories.map(cat => (
              <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
            ))}
          </Select>
        </Col>
        <Col span={5}>
          <Select
            placeholder="Location"
            value={filters.location_id || undefined}
            onChange={(val) => setFilters(f => ({ ...f, location_id: val || '' }))}
            allowClear
            style={{ width: '100%' }}
            showSearch
            optionFilterProp="children"
          >
            {locations.map(loc => (
              <Select.Option key={loc.id} value={loc.id}>{loc.name}</Select.Option>
            ))}
          </Select>
        </Col>
        <Col span={4}>
          <Select
            placeholder="Status"
            value={filters.status || undefined}
            onChange={(val) => setFilters(f => ({ ...f, status: val || '' }))}
            allowClear
            style={{ width: '100%' }}
          >
            <Select.Option value="available">Available</Select.Option>
            <Select.Option value="assigned">Assigned</Select.Option>
            <Select.Option value="in_use">In Use</Select.Option>
            <Select.Option value="under_repair">Under Repair</Select.Option>
          </Select>
        </Col>
        <Col span={2}>
          <Button
            onClick={() => {
              const allKeys = assets.map(a => a.id)
              if (selectedRowKeys.length === allKeys.length) {
                setSelectedRowKeys([])
              } else {
                setSelectedRowKeys(allKeys)
              }
            }}
            size="middle"
            block
          >
            {selectedRowKeys.length === assets.length && assets.length > 0 ? 'Deselect' : 'Select All'}
          </Button>
        </Col>
      </Row>

      {/* Asset table */}
      <Table
        columns={columns}
        dataSource={assets}
        rowKey="id"
        rowSelection={rowSelection}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ['50', '100', '200'],
          showTotal: (total) => `${total} assets available for deployment`
        }}
        onChange={handleTableChange}
        size="small"
        scroll={{ y: 400 }}
      />
    </Modal>
  )
}

export default BulkDeployModal
