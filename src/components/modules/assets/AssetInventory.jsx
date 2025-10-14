import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Dropdown,
  Row,
  Col,
  Statistic,
  Typography,
  Badge,
  Tooltip,
  message,
  Progress,
  Divider,
  Avatar
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  UserOutlined,
  DownloadOutlined,
  MoreOutlined,
  FilterOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  TagOutlined,
  FileTextOutlined,
  EyeOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import {
  fetchAssets,
  fetchAssetStatistics,
  createAsset,
  updateAsset,
  deleteAsset,
  assignAsset,
  unassignAsset,
  fetchAssetsDropdown,
  clearAssetError,
  setAssetFilters,
  clearAssetFilters,
  setAssetPagination,
  selectAssets,
  selectAssetStatistics,
  selectAssetFilters,
  selectAssetAssignment,
  selectAssetsDropdown
} from '../../../store/slices/assetSlice'
import assetService from '../../../services/asset'
import {
  fetchOEMs,
  fetchProducts,
  fetchCategories,
  selectOEMs,
  selectProducts,
  selectCategories
} from '../../../store/slices/masterSlice'
import {
  fetchLocations,
  selectLocations
} from '../../../store/slices/masterSlice'
import {
  fetchUsers,
  selectUsers
} from '../../../store/slices/userSlice'
import BulkAddAssetsModal from './BulkAddAssetsModal'
import LegacyImportModal from './LegacyImportModal'

const { Title, Text } = Typography
const { Option } = Select
const { Search } = Input

const AssetInventory = () => {
  const dispatch = useDispatch()
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [isDeletedModalVisible, setIsDeletedModalVisible] = useState(false)
  const [deletedAssets, setDeletedAssets] = useState([])
  const [deletedAssetsLoading, setDeletedAssetsLoading] = useState(false)
  const [form] = Form.useForm()
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [editingAsset, setEditingAsset] = useState(null)
  const [mapModalVisible, setMapModalVisible] = useState(false)
  const [assignModalVisible, setAssignModalVisible] = useState(false)
  const [assigningAsset, setAssigningAsset] = useState(null)
  const [assignForm] = Form.useForm()
  const [viewDetailsModalVisible, setViewDetailsModalVisible] = useState(false)
  const [viewingAsset, setViewingAsset] = useState(null)
  const [bulkAddModalVisible, setBulkAddModalVisible] = useState(false)
  const [legacyImportModalVisible, setLegacyImportModalVisible] = useState(false)

  // Redux selectors
  const assets = useSelector(selectAssets)
  const statistics = useSelector(selectAssetStatistics)
  const filters = useSelector(selectAssetFilters)
  const assignment = useSelector(selectAssetAssignment)
  const dropdown = useSelector(selectAssetsDropdown)

  // Master data selectors
  const oems = useSelector(selectOEMs)
  const products = useSelector(selectProducts)
  const categories = useSelector(selectCategories)
  const locations = useSelector(selectLocations)
  const users = useSelector(selectUsers)

  // Load initial data
  useEffect(() => {
    // Fetch assets and statistics
    dispatch(fetchAssets({ page: 1, limit: 10 }))
    dispatch(fetchAssetStatistics())

    // Fetch master data for dropdowns
    dispatch(fetchOEMs())
    dispatch(fetchProducts())
    dispatch(fetchCategories())
    dispatch(fetchLocations())
    dispatch(fetchUsers())
  }, [dispatch])

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearAssetError())
    }
  }, [])

  // Helper function to get status colors
  const getStatusColor = (status) => {
    const colors = {
      'Free': '#52c41a',
      'Assigned': '#1890ff',
      'Under Repair': '#faad14',
      'Discarded': '#f5222d'
    }
    return colors[status] || '#d9d9d9'
  }

  // Generate location distribution from statistics
  const locationDistribution = statistics.data?.locationDistribution ?
    statistics.data.locationDistribution.map((item, index) => ({
      location: item.location_name,
      count: item.asset_count || 0,
      color: `hsl(${index * 60}, 70%, 50%)`
    })) : []

  // Generate status distribution from statistics
  const statusDistribution = statistics.data?.statusDistribution ?
    statistics.data.statusDistribution.map(item => ({
      status: item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' '),
      count: item.count,
      color: getStatusColor(item.status)
    })) : []

  // Critical alerts from statistics
  const criticalAlerts = statistics.data?.criticalAlerts || []

  const showAddModal = () => {
    setEditingAsset(null)
    setIsAddModalVisible(true)
    form.resetFields()
  }

  const showEditModal = (asset) => {
    setEditingAsset(asset)
    setIsAddModalVisible(true)
    form.setFieldsValue({
      asset_tag: asset.asset_tag,
      product_id: asset.product_id,
      assigned_to: asset.assigned_to,
      status: asset.status,
      condition_status: asset.condition_status,
      purchase_date: asset.purchase_date,
      warranty_end_date: asset.warranty_end_date,
      purchase_cost: asset.purchase_cost,
      notes: asset.notes
    })
  }

  const handleSubmit = async (values) => {
    try {
      if (editingAsset) {
        await dispatch(updateAsset({ id: editingAsset.id, data: values })).unwrap()
        message.success('Asset updated successfully')
      } else {
        await dispatch(createAsset(values)).unwrap()
        message.success('Asset created successfully')
      }
      setIsAddModalVisible(false)
      form.resetFields()
      setEditingAsset(null)
    } catch (error) {
      message.error(error.message || 'Operation failed')
    }
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this asset?',
      content: (
        <div>
          <p>Asset: <strong>{record.asset_tag}</strong></p>
          <p>Product: <strong>{record.product_name}</strong></p>
          <p className="text-red-500 mt-2">⚠️ This action will soft delete the asset. You can restore it later if needed.</p>
        </div>
      ),
      icon: <DeleteOutlined className="text-red-500" />,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(deleteAsset(record.id)).unwrap()
          message.success('Asset deleted successfully')
        } catch (error) {
          message.error(error.message || 'Failed to delete asset')
        }
      }
    })
  }

  const showViewDetailsModal = (asset) => {
    setViewingAsset(asset)
    setViewDetailsModalVisible(true)
  }

  const showAssignModal = (asset) => {
    setAssigningAsset(asset)
    setAssignModalVisible(true)
    assignForm.setFieldsValue({
      user_id: asset.assigned_to || undefined,
      location_id: asset.location_id || undefined
    })
  }

  const handleTagAsset = (asset) => {
    message.info(`Tag functionality for ${asset.asset_tag} - Coming soon!`)
  }

  const handleAssetSettings = (asset) => {
    message.info(`Settings for ${asset.asset_tag} - Coming soon!`)
  }

  const handleAssignAsset = async (values) => {
    try {
      await dispatch(assignAsset({ id: assigningAsset.id, data: values })).unwrap()
      message.success('Asset assigned successfully')
      setAssignModalVisible(false)
      assignForm.resetFields()
      setAssigningAsset(null)
      // Refresh assets and statistics
      dispatch(fetchAssets({ page: assets.pagination?.page || 1, limit: assets.pagination?.pageSize || 10 }))
      dispatch(fetchAssetStatistics())
    } catch (error) {
      message.error(error.message || 'Failed to assign asset')
    }
  }

  const handleUnassignAsset = (asset) => {
    Modal.confirm({
      title: 'Unassign Asset',
      content: (
        <div>
          <p>Are you sure you want to unassign this asset?</p>
          <p>Asset: <strong>{asset.asset_tag}</strong></p>
          {asset.assigned_user_name && (
            <p>Currently assigned to: <strong>{asset.assigned_user_name}</strong></p>
          )}
          <p className="text-gray-500 mt-2">The asset will be marked as available.</p>
        </div>
      ),
      icon: <UserOutlined className="text-blue-500" />,
      okText: 'Yes, Unassign',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(unassignAsset(asset.id)).unwrap()
          message.success('Asset unassigned successfully')
          // Refresh assets and statistics
          dispatch(fetchAssets({ page: assets.pagination?.page || 1, limit: assets.pagination?.pageSize || 10 }))
          dispatch(fetchAssetStatistics())
        } catch (error) {
          message.error(error.message || 'Failed to unassign asset')
        }
      }
    })
  }

  const handleSearch = (value) => {
    dispatch(setAssetFilters({ ...filters, search: value }))
    dispatch(fetchAssets({ ...filters, search: value, page: 1 }))
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    dispatch(setAssetFilters(newFilters))
    dispatch(fetchAssets({ ...newFilters, page: 1 }))
  }

  const handleTableChange = (pagination) => {
    const { current: page, pageSize } = pagination
    dispatch(setAssetPagination({ page, pageSize }))

    // Refetch with new pagination
    dispatch(fetchAssets({
      page,
      limit: pageSize,
      ...filters
    }))
  }

  const handleExport = async () => {
    try {
      // Call service directly to avoid storing blob in Redux state
      const response = await assetService.exportAssets(filters)

      // Create blob and trigger download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `assets_export_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      message.success('Export completed successfully')
    } catch (error) {
      message.error(error.message || 'Failed to export assets')
    }
  }

  const handleCancel = () => {
    setIsAddModalVisible(false)
    form.resetFields()
    setEditingAsset(null)
  }

  // Fetch deleted assets
  const fetchDeletedAssets = async () => {
    setDeletedAssetsLoading(true)
    try {
      const response = await assetService.getDeletedAssets({ page: 1, limit: 100 })

      // API returns: { success, data: { assets, pagination }, message }
      const assets = response.data?.data?.assets || []
      setDeletedAssets(assets)

      if (assets.length === 0) {
        message.info('No deleted assets found')
      } else {
        message.success(`Found ${assets.length} deleted assets`)
      }
    } catch (error) {
      console.error('Error fetching deleted assets:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch deleted assets'
      message.error(errorMessage)
    } finally {
      setDeletedAssetsLoading(false)
    }
  }

  // Show deleted assets modal
  const showDeletedAssetsModal = () => {
    setIsDeletedModalVisible(true)
    fetchDeletedAssets()
  }

  // Restore asset
  const handleRestoreAsset = (asset) => {
    Modal.confirm({
      title: 'Restore Asset',
      content: (
        <div>
          <p>Are you sure you want to restore this asset?</p>
          <p>Asset: <strong>{asset.asset_tag}</strong></p>
          <p>Product: <strong>{asset.product_name}</strong></p>
        </div>
      ),
      icon: <CheckCircleOutlined className="text-green-500" />,
      okText: 'Yes, Restore',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await assetService.restoreAsset(asset.id)
          message.success('Asset restored successfully')
          fetchDeletedAssets() // Refresh deleted assets list
          dispatch(fetchAssets({ page: 1, limit: 10 })) // Refresh main assets list
          dispatch(fetchAssetStatistics()) // Refresh statistics
        } catch (error) {
          message.error(error.message || 'Failed to restore asset')
        }
      }
    })
  }

  // Status Pie Chart Component
  const StatusPieChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0)
    if (total === 0) {
      return (
        <div className="w-40 h-40 mx-auto flex items-center justify-center">
          <div className="text-center text-gray-500">No data</div>
        </div>
      )
    }

    let cumulativePercentage = 0
    const radius = 60
    const strokeWidth = 20

    return (
      <div className="relative w-40 h-40 mx-auto">
        <svg width="160" height="160" className="transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />
          {data.map((item, index) => {
            const percentage = (item.count / total) * 100
            const circumference = 2 * Math.PI * radius
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
            const strokeDashoffset = -((cumulativePercentage / 100) * circumference)

            const result = (
              <circle
                key={index}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
              />
            )

            cumulativePercentage += percentage
            return result
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </div>
    )
  }

  // Location Progress Chart Component
  const LocationProgressChart = ({ data }) => {
    const [showAll, setShowAll] = useState(false)
    const total = data.reduce((sum, item) => sum + item.count, 0)
    const maxItemsToShow = 5
    const displayData = showAll ? data : data.slice(0, maxItemsToShow)
    const hasMore = data.length > maxItemsToShow

    return (
      <div>
        <div className="space-y-3" style={{ maxHeight: showAll ? 'none' : '300px', overflowY: showAll ? 'visible' : 'auto' }}>
          {displayData.map((item, index) => {
            const percentage = total > 0 ? ((item.count / total) * 100) : 0
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <div className="flex justify-between items-center mb-1">
                    <Text className="text-sm font-medium">{item.location}</Text>
                    <Text className="text-xs text-gray-500">{item.count}</Text>
                  </div>
                  <Progress
                    percent={percentage}
                    showInfo={false}
                    strokeColor={item.color}
                    size="small"
                  />
                </div>
              </div>
            )
          })}
          {data.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <InfoCircleOutlined className="text-2xl mb-2" />
              <div>No location data available</div>
            </div>
          )}
        </div>
        {hasMore && (
          <div className="text-center mt-3">
            <Button
              type="link"
              size="small"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `Show ${data.length - maxItemsToShow} More`}
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Status Overview Pie Chart Configuration
  const statusChartData = statusDistribution.map(item => ({
    type: item.status,
    value: item.count
  }))

  const statusChartConfig = {
    data: statusChartData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.5,
    legend: {
      position: 'bottom',
      itemName: {
        style: {
          fontSize: 12,
        },
      },
    },
    statistic: {
      title: false,
      content: {
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
        },
        content: statusDistribution.reduce((sum, item) => sum + item.count, 0).toString(),
      },
    },
    color: statusDistribution.map(item => item.color),
  }

  // Table columns matching the design
  const columns = [
    {
      title: 'Sr.no',
      key: 'srno',
      width: 70,
      render: (_, __, index) => (assets.pagination?.page - 1) * assets.pagination?.limit + index + 1
    },
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.product_name || 'N/A'}</div>
          <div className="text-xs text-gray-500">{record.product_model || 'N/A'}</div>
        </div>
      )
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (department) => department || <span style={{color: '#999'}}>Unassigned</span>
    },
    {
      title: 'Location',
      dataIndex: 'location_name',
      key: 'location'
    },
    {
      title: 'Floor',
      key: 'floor',
      render: () => Math.floor(Math.random() * 5) + 1 // Mock data
    },
    {
      title: 'Room No./Address',
      dataIndex: 'location_address',
      key: 'address',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Asset Category',
      dataIndex: 'category_name',
      key: 'category'
    },
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number',
      render: (serial) => serial || <span style={{color: '#999'}}>—</span>
    },
    {
      title: 'Model No',
      dataIndex: 'product_model',
      key: 'model'
    },
    {
      title: 'Asset ID',
      dataIndex: 'asset_tag',
      key: 'asset_id'
    },
    {
      title: 'Tag No',
      dataIndex: 'tag_no',
      key: 'tag_no',
      render: (tagNo) => tagNo || <span style={{color: '#999'}}>—</span>
    },
    {
      title: 'Assigned To',
      key: 'assigned_to',
      render: (_, record) => {
        if (record.assigned_user_name) {
          return (
            <div>
              <div className="font-medium">{record.assigned_user_name}</div>
              <div className="text-xs text-gray-500">{record.assigned_user_email || ''}</div>
            </div>
          )
        }
        return <span style={{color: '#999'}}>Unassigned</span>
      }
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const isAssigned = record.assigned_to
        return (
          <Tag color={isAssigned ? 'blue' : 'green'} className="w-full text-center">
            {isAssigned ? 'Assigned' : 'Available'}
          </Tag>
        )
      }
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => {
        const isAssigned = record.assigned_to

        return (
          <div className="flex items-center justify-center">
            <Dropdown
              trigger={['click']}
              menu={{
                items: [
                  {
                    key: 'view',
                    label: 'View Details',
                    icon: <EyeOutlined />,
                    onClick: () => showViewDetailsModal(record)
                  },
                  {
                    key: 'edit',
                    label: 'Edit Asset',
                    icon: <EditOutlined />,
                    onClick: () => showEditModal(record)
                  },
                  {
                    key: 'settings',
                    label: 'Settings',
                    icon: <SettingOutlined />,
                    onClick: () => handleAssetSettings(record)
                  },
                  {
                    key: 'tag',
                    label: 'Tag Asset',
                    icon: <TagOutlined />,
                    onClick: () => handleTagAsset(record)
                  },
                  {
                    type: 'divider'
                  },
                  {
                    key: 'assign',
                    label: isAssigned ? 'Reassign' : 'Assign',
                    icon: <UserOutlined />,
                    onClick: () => showAssignModal(record)
                  },
                  ...(isAssigned ? [{
                    key: 'unassign',
                    label: 'Unassign / Release',
                    icon: <UserOutlined />,
                    onClick: () => handleUnassignAsset(record)
                  }] : []),
                  {
                    type: 'divider'
                  },
                  {
                    key: 'delete',
                    label: 'Delete Asset',
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: () => handleDelete(record)
                  }
                ]
              }}
            >
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
                className="flex items-center justify-center w-8 h-8"
              />
            </Dropdown>
          </div>
        )
      }
    }
  ]

  // Asset Location Map Component
  const AssetLocationMap = ({ data }) => {
    // Create sample floor plan with asset locations
    const floorPlan = {
      width: 800,
      height: 500,
      rooms: [
        { id: 1, name: 'Server Room', x: 50, y: 50, width: 150, height: 100, assets: 0 },
        { id: 2, name: 'IT Asset Warehouse', x: 250, y: 50, width: 200, height: 150, assets: 0 },
        { id: 3, name: 'Office Area 1', x: 500, y: 50, width: 250, height: 100, assets: 0 },
        { id: 4, name: 'Office Area 2', x: 50, y: 200, width: 200, height: 120, assets: 0 },
        { id: 5, name: 'Conference Room', x: 300, y: 250, width: 150, height: 100, assets: 0 },
        { id: 6, name: 'Storage', x: 500, y: 200, width: 100, height: 80, assets: 0 },
        { id: 7, name: 'Reception', x: 650, y: 200, width: 100, height: 150, assets: 0 }
      ]
    }

    // Map asset counts to rooms based on location names
    floorPlan.rooms = floorPlan.rooms.map(room => {
      const locationData = data.find(loc =>
        loc.location.toLowerCase().includes(room.name.toLowerCase()) ||
        loc.location.toLowerCase().includes('warehouse')
      )
      return {
        ...room,
        assets: locationData ? locationData.count : Math.floor(Math.random() * 3) // Random for demo
      }
    })

    const getAssetDensityColor = (assetCount) => {
      if (assetCount === 0) return '#f3f4f6'
      if (assetCount <= 2) return '#dbeafe'
      if (assetCount <= 5) return '#93c5fd'
      if (assetCount <= 10) return '#3b82f6'
      return '#1d4ed8'
    }

    return (
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Asset Distribution Floor Plan - 3rd Floor</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Floor: 3rd</span>
            <span>Building: Pune IT Asset Warehouse</span>
            <span>Total Assets: {data.reduce((sum, item) => sum + item.count, 0)}</span>
          </div>
        </div>

        {/* Floor Plan SVG */}
        <div className="bg-gray-50 border rounded-lg p-4 mb-4">
          <svg width={floorPlan.width} height={floorPlan.height} className="border bg-white">
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Rooms */}
            {floorPlan.rooms.map(room => (
              <g key={room.id}>
                <rect
                  x={room.x}
                  y={room.y}
                  width={room.width}
                  height={room.height}
                  fill={getAssetDensityColor(room.assets)}
                  stroke="#374151"
                  strokeWidth="2"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />

                {/* Room label */}
                <text
                  x={room.x + room.width / 2}
                  y={room.y + room.height / 2 - 10}
                  textAnchor="middle"
                  className="fill-gray-800 text-sm font-medium"
                  style={{ fontSize: '12px' }}
                >
                  {room.name}
                </text>

                {/* Asset count */}
                <text
                  x={room.x + room.width / 2}
                  y={room.y + room.height / 2 + 10}
                  textAnchor="middle"
                  className="fill-gray-600 text-xs"
                  style={{ fontSize: '11px' }}
                >
                  {room.assets} assets
                </text>
              </g>
            ))}

            {/* Legend */}
            <g transform="translate(20, 420)">
              <text x="0" y="0" className="fill-gray-800 text-sm font-medium">Asset Density:</text>
              {[
                { count: '0', color: '#f3f4f6', label: 'Empty' },
                { count: '1-2', color: '#dbeafe', label: 'Low' },
                { count: '3-5', color: '#93c5fd', label: 'Medium' },
                { count: '6-10', color: '#3b82f6', label: 'High' },
                { count: '10+', color: '#1d4ed8', label: 'Very High' }
              ].map((item, index) => (
                <g key={index} transform={`translate(${index * 120}, 20)`}>
                  <rect x="0" y="0" width="15" height="15" fill={item.color} stroke="#374151" />
                  <text x="20" y="12" className="fill-gray-700 text-xs">{item.count}</text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* Location Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Location Statistics</h4>
            <div className="space-y-2">
              {data.map((location, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm">{location.location}</span>
                  <span className="font-medium text-blue-600">{location.count} assets</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <Button type="primary" block icon={<PlusOutlined />}>
                Add New Location
              </Button>
              <Button block icon={<ExportOutlined />}>
                Export Location Report
              </Button>
              <Button block icon={<SettingOutlined />}>
                Configure Floor Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Title level={3} className="mb-0">Asset Inventory</Title>
      </div>

      {/* Statistics Cards - Exact match to design */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center border-0 shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <CheckCircleOutlined className="text-blue-500 text-lg" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-800">{(statistics.data?.totalAssets || 0).toLocaleString()}</div>
                <div className="text-sm text-gray-500">Total Assets</div>
              </div>
            </div>
            <div className="flex items-center justify-center text-green-500 text-xs">
              <ArrowUpOutlined className="mr-1" />
              2.3% from last month
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center border-0 shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <CheckCircleOutlined className="text-green-500 text-lg" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-800">{(statistics.data?.activeAssets || 0).toLocaleString()}</div>
                <div className="text-sm text-gray-500">Active Assets</div>
              </div>
            </div>
            <div className="flex items-center justify-center text-blue-500 text-xs">
              87.2% of total inventory
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center border-0 shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <WarningOutlined className="text-yellow-500 text-lg" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-800">{(statistics.data?.assetsAtRisk || 0).toLocaleString()}</div>
                <div className="text-sm text-gray-500">Assets at Risk</div>
              </div>
            </div>
            <div className="flex items-center justify-center text-yellow-500 text-xs">
              Warranty EOL alerts
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center border-0 shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <PlusOutlined className="text-purple-500 text-lg" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-800">{(statistics.data?.addedThisMonth || 0).toLocaleString()}</div>
                <div className="text-sm text-gray-500">Added This Month</div>
              </div>
            </div>
            <div className="flex items-center justify-center text-green-500 text-xs">
              <ArrowUpOutlined className="mr-1" />
              5.15% Increase
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row - Exact match to design */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} lg={8}>
          <Card
            title={
              <div className="flex items-center justify-between">
                <span className="font-medium">Asset Distribution by Location</span>
                <InfoCircleOutlined className="text-gray-400" />
              </div>
            }
            loading={statistics.loading}
            className="h-full"
            extra={
              <Button
                type="link"
                className="text-blue-500"
                onClick={() => setMapModalVisible(true)}
                icon={<EnvironmentOutlined />}
              >
                View Map
              </Button>
            }
          >
            <LocationProgressChart data={locationDistribution} />
            <div className="mt-4 text-xs text-gray-500 flex items-center">
              <WarningOutlined className="mr-1" />
              Tip: Longer bars indicate locations with more assets - consider load balancing
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <div className="flex items-center justify-between">
                <span className="font-medium">Asset Status Overview</span>
                <InfoCircleOutlined className="text-gray-400" />
              </div>
            }
            loading={statistics.loading}
            className="h-full"
          >
            {statusDistribution.length > 0 ? (
              <div>
                <div className="text-center mb-4">
                  <StatusPieChart data={statusDistribution} />
                </div>
                <div className="space-y-2">
                  {statusDistribution.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded mr-2"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-xs">{item.status}</span>
                      </div>
                      <span className="text-xs font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center text-blue-500 text-sm">
                    <InfoCircleOutlined className="mr-1" />
                    Status Check - {statistics.data?.availableAssets || 0} assets available for immediate deployment
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <InfoCircleOutlined className="text-2xl mb-2" />
                <div>No status data available</div>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <div className="flex items-center justify-between">
                <span className="font-medium">Critical Alerts</span>
                <WarningOutlined className="text-red-500" />
              </div>
            }
            loading={statistics.loading}
            className="h-full"
            extra={<Button type="link" className="text-blue-500">View All</Button>}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                <div>
                  <div className="font-medium text-sm">Warranty Expiring Soon</div>
                  <div className="text-xs text-gray-500">Assets warranty expires within 30 days</div>
                </div>
                <Badge count={47} className="bg-orange-400" />
              </div>

              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                <div>
                  <div className="font-medium text-sm">End of Life Approaching</div>
                  <div className="text-xs text-gray-500">Assets due for replacement within 30 days</div>
                </div>
                <Badge count={128} className="bg-yellow-400" />
              </div>

              <div className="flex justify-between items-center p-3 bg-red-50 rounded border-l-4 border-red-400">
                <div>
                  <div className="font-medium text-sm">End of Support Due</div>
                  <div className="text-xs text-gray-500">Support contracts expiring soon</div>
                </div>
                <Badge count={23} className="bg-red-400" />
              </div>

              <div className="flex justify-between items-center p-3 bg-purple-50 rounded border-l-4 border-purple-400">
                <div>
                  <div className="font-medium text-sm">Critical Security Updates Required</div>
                  <div className="text-xs text-gray-500">Urgent recommended action within 30 days</div>
                </div>
                <Badge count={56} className="bg-purple-400" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Asset Inventory Table Section - Exact match to design */}
      <Card className="border-0 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="mb-0">Asset Inventory</Title>
          <Space>
            <Tag color="blue" className="px-3 py-1">Assigned - 4075</Tag>
            <Tag color="green" className="px-3 py-1">Free - 626</Tag>
          </Space>
        </div>

        <div className="flex justify-between items-center mb-4">
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal} className="bg-blue-500">
              Add Single Asset
            </Button>
            <Button type="default" icon={<PlusOutlined />} onClick={() => setBulkAddModalVisible(true)}>
              Bulk Add Assets
            </Button>
            <Button type="default" icon={<DownloadOutlined />} onClick={() => setLegacyImportModalVisible(true)}>
              Import Legacy Data
            </Button>
            <Dropdown
              menu={{
                items: [
                  { key: 'excel', label: 'Export to Excel', icon: <DownloadOutlined />, onClick: handleExport }
                ]
              }}
            >
              <Button icon={<ExportOutlined />}>Export</Button>
            </Dropdown>
            <Button icon={<FilterOutlined />}>Filters</Button>
            <Button
              icon={<DeleteOutlined />}
              onClick={showDeletedAssetsModal}
              className="text-red-500 border-red-500 hover:bg-red-50"
            >
              View Deleted Assets
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={assets.data}
          rowKey="id"
          loading={assets.loading}
          pagination={{
            current: assets.pagination?.page || 1,
            pageSize: assets.pagination?.pageSize || 10,
            total: assets.pagination?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
            className: 'mt-4'
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
          size="small"
          className="border rounded-lg shadow-sm bg-white"
          bordered={false}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingAsset ? 'Edit Asset' : 'Add New Asset'}
        open={isAddModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="asset_tag"
                label="Asset Tag"
                rules={[{ required: true, message: 'Please input asset tag!' }]}
              >
                <Input placeholder="Enter asset tag" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="serial_number"
                label="Serial Number"
                rules={[{ required: true, message: 'Please input serial number!' }]}
              >
                <Input placeholder="Enter serial number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="product_id"
                label="Product"
                rules={[{ required: true, message: 'Please select product!' }]}
              >
                <Select placeholder="Select product">
                  {products.data?.map(product => (
                    <Option key={product.id} value={product.id}>
                      {product.name} - {product.model}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status!' }]}
              >
                <Select placeholder="Select status">
                  <Option value="available">Available</Option>
                  <Option value="assigned">Assigned</Option>
                  <Option value="in_use">In Use</Option>
                  <Option value="under_repair">Under Repair</Option>
                  <Option value="disposed">Disposed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="condition_status"
                label="Condition"
              >
                <Select placeholder="Select condition">
                  <Option value="excellent">Excellent</Option>
                  <Option value="good">Good</Option>
                  <Option value="fair">Fair</Option>
                  <Option value="poor">Poor</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="assigned_to"
                label="Assigned To (Optional)"
              >
                <Select
                  placeholder="Select user (asset will inherit location from user)"
                  showSearch
                  allowClear
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={users.data?.map(user => ({
                    value: user.id,
                    label: `${user.firstName} ${user.lastName} (${user.email})`
                  }))}
                  loading={users.loading}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="purchase_cost"
                label="Purchase Cost"
              >
                <Input type="number" placeholder="Enter cost" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={3} placeholder="Enter any additional notes" />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={assets.loading}>
              {editingAsset ? 'Update' : 'Create'} Asset
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Deleted Assets Modal */}
      <Modal
        title="Deleted Assets"
        open={isDeletedModalVisible}
        onCancel={() => setIsDeletedModalVisible(false)}
        footer={null}
        width={1200}
      >
        <div className="mb-4">
          <Text className="text-gray-600">
            Assets that have been soft deleted. You can restore them to make them active again.
          </Text>
        </div>

        <div className="mb-4">
          <Text>Total deleted assets: <strong>{deletedAssets.length}</strong></Text>
          {deletedAssetsLoading && <Text className="ml-4 text-blue-500">Loading...</Text>}
        </div>

        <Table
          columns={[
            {
              title: 'Asset Tag',
              dataIndex: 'asset_tag',
              key: 'asset_tag'
            },
            {
              title: 'Product',
              render: (_, record) => (
                <div>
                  <div className="font-medium">{record.product_name}</div>
                  <div className="text-xs text-gray-500">{record.product_model}</div>
                </div>
              )
            },
            {
              title: 'Category',
              dataIndex: 'category_name',
              key: 'category'
            },
            {
              title: 'Location',
              dataIndex: 'location_name',
              key: 'location'
            },
            {
              title: 'Deleted At',
              dataIndex: 'updated_at',
              key: 'deleted_at',
              render: (date) => new Date(date).toLocaleDateString()
            },
            {
              title: 'Action',
              key: 'action',
              render: (_, record) => (
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleRestoreAsset(record)}
                  className="bg-green-500 border-green-500 hover:bg-green-600"
                >
                  Restore
                </Button>
              )
            }
          ]}
          dataSource={deletedAssets}
          rowKey="id"
          loading={deletedAssetsLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} deleted assets`
          }}
          size="small"
          locale={{
            emptyText: deletedAssetsLoading ? 'Loading...' : 'No deleted assets found'
          }}
        />
      </Modal>

      {/* Asset Location Map Modal */}
      <Modal
        title="Asset Distribution Map"
        open={mapModalVisible}
        onCancel={() => setMapModalVisible(false)}
        footer={null}
        width={1000}
        className="asset-map-modal"
      >
        <AssetLocationMap data={locationDistribution} />
      </Modal>

      {/* View Details Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Asset Details</span>
            {viewingAsset && <Tag color="blue">{viewingAsset.asset_tag}</Tag>}
          </Space>
        }
        open={viewDetailsModalVisible}
        onCancel={() => {
          setViewDetailsModalVisible(false)
          setViewingAsset(null)
        }}
        footer={[
          <Button key="edit" icon={<EditOutlined />} onClick={() => {
            setViewDetailsModalVisible(false)
            showEditModal(viewingAsset)
          }}>
            Edit Asset
          </Button>,
          <Button key="assign" type="primary" icon={<UserOutlined />} onClick={() => {
            setViewDetailsModalVisible(false)
            showAssignModal(viewingAsset)
          }}>
            Assign Asset
          </Button>,
          <Button key="close" onClick={() => {
            setViewDetailsModalVisible(false)
            setViewingAsset(null)
          }}>
            Close
          </Button>
        ]}
        width={700}
      >
        {viewingAsset && (
          <div className="space-y-4">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="bg-gray-50 p-3 rounded">
                  <Text type="secondary" className="text-xs">Asset Tag</Text>
                  <div className="font-medium text-lg">{viewingAsset.asset_tag}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="bg-gray-50 p-3 rounded">
                  <Text type="secondary" className="text-xs">Status</Text>
                  <div className="mt-1">
                    <Tag color={viewingAsset.assigned_to ? 'blue' : 'green'} className="text-sm">
                      {viewingAsset.assigned_to ? 'Assigned' : 'Available'}
                    </Tag>
                  </div>
                </div>
              </Col>
            </Row>

            <Divider orientation="left">Product Information</Divider>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">Product Name:</Text>
                <div className="font-medium">{viewingAsset.product_name || 'N/A'}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Model:</Text>
                <div className="font-medium">{viewingAsset.product_model || 'N/A'}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Category:</Text>
                <div className="font-medium">{viewingAsset.category_name || 'N/A'}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary">OEM:</Text>
                <div className="font-medium">{viewingAsset.oem_name || 'N/A'}</div>
              </Col>
            </Row>

            <Divider orientation="left">Location & Assignment</Divider>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">Location:</Text>
                <div className="font-medium flex items-center">
                  <EnvironmentOutlined className="mr-2" />
                  {viewingAsset.location_name || 'N/A'}
                </div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Assigned To:</Text>
                <div className="font-medium flex items-center">
                  <UserOutlined className="mr-2" />
                  <div>
                    <div>{viewingAsset.assigned_user_name || 'Unassigned'}</div>
                    {viewingAsset.assigned_user_email && (
                      <div className="text-xs text-gray-500">{viewingAsset.assigned_user_email}</div>
                    )}
                  </div>
                </div>
              </Col>
            </Row>

            <Divider orientation="left">Purchase Information</Divider>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">Purchase Date:</Text>
                <div className="font-medium">{viewingAsset.purchase_date || 'N/A'}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Purchase Cost:</Text>
                <div className="font-medium">{viewingAsset.purchase_cost ? `₹${viewingAsset.purchase_cost}` : 'N/A'}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Warranty End:</Text>
                <div className="font-medium">{viewingAsset.warranty_end_date || 'N/A'}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Condition:</Text>
                <div className="font-medium capitalize">{viewingAsset.condition_status || 'N/A'}</div>
              </Col>
            </Row>

            {viewingAsset.notes && (
              <>
                <Divider orientation="left">Notes</Divider>
                <div className="bg-gray-50 p-3 rounded">
                  <Text>{viewingAsset.notes}</Text>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Assign Asset Modal */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            <span>Assign Asset</span>
            {assigningAsset && <Tag color="blue">{assigningAsset.asset_tag}</Tag>}
          </Space>
        }
        open={assignModalVisible}
        onCancel={() => {
          setAssignModalVisible(false)
          assignForm.resetFields()
          setAssigningAsset(null)
        }}
        footer={null}
        width={600}
      >
        <div className="mb-4">
          {assigningAsset && (
            <div className="bg-gray-50 p-4 rounded">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <Text type="secondary">Product:</Text>
                  <div className="font-medium">{assigningAsset.product_name}</div>
                </div>
                <div>
                  <Text type="secondary">Model:</Text>
                  <div className="font-medium">{assigningAsset.product_model || 'N/A'}</div>
                </div>
                <div>
                  <Text type="secondary">Current Status:</Text>
                  <div>
                    <Tag color={assigningAsset.assigned_to ? 'blue' : 'green'}>
                      {assigningAsset.assigned_to ? 'Assigned' : 'Available'}
                    </Tag>
                  </div>
                </div>
                {assigningAsset.assigned_user_name && (
                  <div>
                    <Text type="secondary">Currently Assigned To:</Text>
                    <div className="font-medium">{assigningAsset.assigned_user_name}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <Form
          form={assignForm}
          layout="vertical"
          onFinish={handleAssignAsset}
        >
          <Form.Item
            name="user_id"
            label="Assign To User"
            rules={[{ required: true, message: 'Please select a user!' }]}
          >
            <Select
              placeholder="Select user to assign"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={users.data?.map(user => ({
                value: user.id,
                label: `${user.firstName} ${user.lastName} (${user.email})`
              }))}
              loading={users.loading}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Assignment Notes (Optional)"
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter any notes about this assignment..."
            />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => {
              setAssignModalVisible(false)
              assignForm.resetFields()
              setAssigningAsset(null)
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={assignment.loading}>
              Assign Asset
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Bulk Add Assets Modal */}
      <BulkAddAssetsModal
        visible={bulkAddModalVisible}
        onClose={() => setBulkAddModalVisible(false)}
        onSuccess={() => {
          dispatch(fetchAssets({ page: 1, limit: 10 }))
          dispatch(fetchAssetStatistics())
        }}
        products={products.data || []}
        locations={locations.data || []}
        oems={oems.data || []}
        categories={categories.data || []}
      />

      {/* Legacy Import Modal */}
      <LegacyImportModal
        visible={legacyImportModalVisible}
        onClose={() => setLegacyImportModalVisible(false)}
        onSuccess={() => {
          dispatch(fetchAssets({ page: 1, limit: 10 }))
          dispatch(fetchAssetStatistics())
        }}
      />
    </div>
  )
}

export default AssetInventory