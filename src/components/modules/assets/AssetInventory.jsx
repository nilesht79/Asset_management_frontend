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
  Avatar,
  Collapse,
  Drawer
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
  SettingOutlined,
  BankOutlined,
  ApiOutlined
} from '@ant-design/icons'
import { Pie } from '@ant-design/plots'
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
  fetchBoards,
  selectOEMs,
  selectProducts,
  selectCategories,
  selectBoards
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
import ComponentManager from './components/ComponentManager'

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
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false)
  const [componentDrawerVisible, setComponentDrawerVisible] = useState(false)
  const [managingComponentsAsset, setManagingComponentsAsset] = useState(null)
  const [tempFilters, setTempFilters] = useState({
    search: '',
    status: '',
    condition_status: '',
    location_id: '',
    assigned_to: '',
    product_id: '',
    category_id: '',
    oem_id: '',
    board_id: ''
  })

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
  const boards = useSelector(selectBoards)

  // Load initial data
  useEffect(() => {
    // Fetch assets and statistics
    dispatch(fetchAssets({ page: 1, limit: 10 }))
    dispatch(fetchAssetStatistics())

    // Fetch master data for dropdowns with high limit to get all items
    dispatch(fetchBoards({ limit: 1000 }))
    dispatch(fetchOEMs({ limit: 1000 }))
    dispatch(fetchProducts({ limit: 1000 }))
    dispatch(fetchCategories({ limit: 1000, include_subcategories: 'true' }))
    dispatch(fetchLocations({ limit: 1000 }))
    dispatch(fetchUsers({ limit: 1000 }))
  }, [dispatch])

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearAssetError())
    }
  }, [])

  // Helper function to get status colors
  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase()
    const colors = {
      'free': '#52c41a',
      'assigned': '#1890ff',
      'under_repair': '#faad14',
      'under repair': '#faad14',
      'discarded': '#f5222d',
      'in_use': '#1890ff',
      'available': '#52c41a',
      'maintenance': '#faad14'
    }
    return colors[statusLower] || '#8c8c8c'
  }

  // Generate location distribution from statistics
  const locationDistribution = statistics.data?.locationDistribution ?
    statistics.data.locationDistribution.map((item, index) => ({
      location: item.location_name,
      building: item.building,
      floor: item.floor,
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
    // Fetch assets dropdown for parent asset selection
    dispatch(fetchAssetsDropdown())
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
      // Validate: Components cannot be assigned to users
      if (values.asset_type === 'component' && values.assigned_to) {
        message.error('Components cannot be assigned to users. Please remove the assignment or change asset type.')
        return
      }

      // Validate: Components must have parent_asset_id
      if (values.asset_type === 'component' && !values.parent_asset_id) {
        message.error('Components must have a parent asset selected.')
        return
      }

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

  const handleManageComponents = (asset) => {
    setManagingComponentsAsset(asset)
    setComponentDrawerVisible(true)
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

  // Filter drawer handlers
  const showFilterDrawer = () => {
    setTempFilters({
      search: filters?.search || '',
      status: filters?.status || '',
      condition_status: filters?.condition_status || '',
      location_id: filters?.location_id || '',
      assigned_to: filters?.assigned_to || '',
      product_id: filters?.product_id || '',
      category_id: filters?.category_id || '',
      oem_id: filters?.oem_id || '',
      board_id: filters?.board_id || ''
    })
    setFilterDrawerVisible(true)
  }

  const handleApplyFilters = () => {
    dispatch(setAssetFilters(tempFilters))
    dispatch(fetchAssets({ ...tempFilters, page: 1 }))
    setFilterDrawerVisible(false)
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      status: '',
      condition_status: '',
      location_id: '',
      assigned_to: '',
      product_id: '',
      category_id: '',
      oem_id: '',
      board_id: ''
    }
    setTempFilters(clearedFilters)
    dispatch(setAssetFilters(clearedFilters))
    dispatch(fetchAssets({ page: 1, limit: assets.pagination?.limit || 10 }))
    setFilterDrawerVisible(false)
  }

  const handleTempFilterChange = (key, value) => {
    setTempFilters({ ...tempFilters, [key]: value })
  }

  const handleFilterDrawerClose = () => {
    setFilterDrawerVisible(false)
    // Reset tempFilters to current applied filters when closing without applying
    setTempFilters({
      search: filters?.search || '',
      status: filters?.status || '',
      condition_status: filters?.condition_status || '',
      location_id: filters?.location_id || '',
      assigned_to: filters?.assigned_to || '',
      product_id: filters?.product_id || '',
      category_id: filters?.category_id || '',
      oem_id: filters?.oem_id || ''
    })
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

  // Location Pie Chart Component
  const LocationPieChart = ({ data }) => {
    if (data.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8">
          <InfoCircleOutlined className="text-2xl mb-2" />
          <div>No location data available</div>
        </div>
      )
    }

    const total = data.reduce((sum, item) => sum + item.count, 0)

    const chartData = data.map(item => ({
      location: item.location || 'Unknown',
      building: item.building || null,
      floor: item.floor || null,
      value: item.count || 0,
      color: item.color || '#d9d9d9'
    })).filter(item => item.value > 0)

    const config = {
      data: chartData,
      angleField: 'value',
      colorField: 'location',
      radius: 1.1,
      innerRadius: 0.75,
      height: 320,
      label: false,
      appendPadding: [0, 0, 10, 0],
      meta: {
        location: {
          alias: 'Location',
        },
        value: {
          alias: 'Assets',
          formatter: (val) => `${val}`,
        },
      },
      interactions: [{ type: 'element-active' }],
      legend: {
        position: 'bottom',
        layout: 'horizontal',
        itemName: {
          style: {
            fontSize: 11,
          },
        },
        maxRow: 3,
      },
      statistic: {
        title: {
          style: {
            fontSize: '14px',
            color: '#999',
          },
          content: 'Total Assets',
        },
        content: {
          style: {
            fontSize: '20px',
            fontWeight: 'bold',
          },
          content: total.toString(),
        },
      },
      color: data.map(item => item.color),
    }

    return (
      <div style={{ height: '340px' }}>
        <Pie {...config} />
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
      title: <span className="font-semibold text-gray-700">#</span>,
      key: 'srno',
      width: 60,
      fixed: 'left',
      align: 'center',
      render: (_, __, index) => (
        <span className="text-gray-600 font-medium">
          {(assets.pagination?.page - 1) * assets.pagination?.limit + index + 1}
        </span>
      )
    },
    {
      title: <span className="font-semibold text-gray-700">Product</span>,
      key: 'name',
      width: 200,
      render: (_, record) => (
        <div className="py-1">
          <div className="flex items-center gap-2">
            <div>
              <div className="font-semibold text-gray-800 text-sm">{record.product_name || 'N/A'}</div>
              <div className="text-xs text-gray-500 mt-0.5">{record.product_model || 'No model'}</div>
            </div>
            {record.installed_component_count > 0 && (
              <Tooltip title={`${record.installed_component_count} component${record.installed_component_count !== 1 ? 's' : ''} installed`}>
                <Badge
                  count={record.installed_component_count}
                  style={{ backgroundColor: '#52c41a' }}
                  size="small"
                />
              </Tooltip>
            )}
          </div>
        </div>
      )
    },
    {
      title: <span className="font-semibold text-gray-700">Asset ID</span>,
      dataIndex: 'asset_tag',
      key: 'asset_id',
      width: 120,
      render: (text) => <span className="font-mono text-xs bg-blue-50 px-2 py-1 rounded text-blue-700">{text}</span>
    },
    {
      title: <span className="font-semibold text-gray-700">Assigned To</span>,
      key: 'assigned_to',
      width: 180,
      render: (_, record) => {
        if (record.assigned_user_name) {
          return (
            <div className="py-1">
              <div className="font-medium text-gray-800 text-sm flex items-center">
                <UserOutlined className="mr-1.5 text-blue-500" />
                {record.assigned_user_name}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 ml-5">{record.assigned_user_email || ''}</div>
            </div>
          )
        }
        return (
          <span className="text-gray-400 italic flex items-center">
            <UserOutlined className="mr-1.5" />
            Unassigned
          </span>
        )
      }
    },
    {
      title: <span className="font-semibold text-gray-700">Serial No</span>,
      dataIndex: 'serial_number',
      key: 'serial_number',
      width: 130,
      render: (serial) => serial ? <span className="font-mono text-xs text-gray-700">{serial}</span> : <span className="text-gray-400">—</span>
    },
    {
      title: <span className="font-semibold text-gray-700">Category</span>,
      dataIndex: 'category_name',
      key: 'category',
      width: 120,
      render: (text) => text ? <Tag color="purple" className="text-xs">{text}</Tag> : <span className="text-gray-400">—</span>
    },
    {
      title: <span className="font-semibold text-gray-700">Department</span>,
      dataIndex: 'department',
      key: 'department',
      width: 130,
      render: (department) => department || <span className="text-gray-400 italic">Unassigned</span>
    },
    {
      title: <span className="font-semibold text-gray-700">Location</span>,
      dataIndex: 'location_name',
      key: 'location',
      width: 150,
      render: (text) => <span className="text-gray-700">{text}</span>
    },
    {
      title: <span className="font-semibold text-gray-700">Building</span>,
      dataIndex: 'location_building',
      key: 'building',
      width: 100,
      render: (text) => text || <span className="text-gray-400">—</span>
    },
    {
      title: <span className="font-semibold text-gray-700">Floor</span>,
      dataIndex: 'location_floor',
      key: 'floor',
      width: 80,
      render: (text) => text || <span className="text-gray-400">—</span>
    },
    {
      title: <span className="font-semibold text-gray-700">Address</span>,
      dataIndex: 'location_address',
      key: 'address',
      width: 150,
      ellipsis: true,
      render: (text) => text ? <Tooltip title={text}><span className="text-gray-600 text-xs">{text}</span></Tooltip> : <span className="text-gray-400">—</span>
    },
    {
      title: <span className="font-semibold text-gray-700">Tag No</span>,
      dataIndex: 'tag_no',
      key: 'tag_no',
      width: 100,
      render: (tagNo) => tagNo ? <span className="font-mono text-xs">{tagNo}</span> : <span className="text-gray-400">—</span>
    },
    {
      title: <span className="font-semibold text-gray-700">Status</span>,
      key: 'status',
      width: 110,
      align: 'center',
      render: (_, record) => {
        const statusConfig = {
          available: { color: 'green', label: 'Available' },
          assigned: { color: 'blue', label: 'Assigned' },
          in_transit: { color: 'orange', label: 'In Transit' },
          in_use: { color: 'cyan', label: 'In Use' },
          under_repair: { color: 'red', label: 'Under Repair' },
          retired: { color: 'default', label: 'Retired' },
          lost: { color: 'volcano', label: 'Lost' },
          damaged: { color: 'magenta', label: 'Damaged' }
        };

        const config = statusConfig[record.status] || { color: 'default', label: record.status };

        return (
          <Tag
            color={config.color}
            className="font-medium"
            style={{ minWidth: '80px', textAlign: 'center' }}
          >
            {config.label}
          </Tag>
        )
      }
    },
    {
      title: <span className="font-semibold text-gray-700">Actions</span>,
      key: 'action',
      fixed: 'right',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const isAssigned = record.assigned_to

        return (
          <div className="flex items-center justify-center">
            <Dropdown
              trigger={['click']}
              placement="bottomRight"
              menu={{
                items: [
                  {
                    key: 'view',
                    label: 'View Details',
                    icon: <EyeOutlined />,
                    onClick: () => showViewDetailsModal(record)
                  },
                  ...(record.asset_type !== 'component' ? [{
                    key: 'components',
                    label: 'Manage Components',
                    icon: <ApiOutlined />,
                    onClick: () => handleManageComponents(record)
                  }] : []),
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
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedLocations, setExpandedLocations] = useState([])
    const [expandedBuildings, setExpandedBuildings] = useState([])

    // Group by Location → Building → Floor hierarchy
    const locationGroups = data.reduce((acc, item) => {
      const location = item.location || 'Unspecified Location'
      const building = item.building || 'Unspecified Building'
      const floor = item.floor || 'No Floor Info'

      if (!acc[location]) {
        acc[location] = {}
      }
      if (!acc[location][building]) {
        acc[location][building] = []
      }
      acc[location][building].push(item)
      return acc
    }, {})

    // Filter locations, buildings, and floors based on search
    const filteredLocationGroups = Object.entries(locationGroups).reduce((acc, [location, buildings]) => {
      if (searchTerm) {
        const filteredBuildings = Object.entries(buildings).reduce((buildingAcc, [building, items]) => {
          const filteredItems = items.filter(item =>
            item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.building && item.building.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.floor && item.floor.toLowerCase().includes(searchTerm.toLowerCase()))
          )
          if (filteredItems.length > 0) {
            buildingAcc[building] = filteredItems
          }
          return buildingAcc
        }, {})

        if (Object.keys(filteredBuildings).length > 0) {
          acc[location] = filteredBuildings
        }
      } else {
        acc[location] = buildings
      }
      return acc
    }, {})

    const totalAssets = data.reduce((sum, item) => sum + item.count, 0)
    const filteredTotalAssets = Object.values(filteredLocationGroups)
      .flatMap(buildings => Object.values(buildings))
      .flat()
      .reduce((sum, item) => sum + item.count, 0)

    // Auto-expand first 2 locations and first 2 buildings or all if search active
    useEffect(() => {
      if (searchTerm) {
        setExpandedLocations(Object.keys(filteredLocationGroups))
        const allBuildingKeys = Object.entries(filteredLocationGroups)
          .flatMap(([loc, buildings]) => Object.keys(buildings).map(b => `${loc}|${b}`))
        setExpandedBuildings(allBuildingKeys)
      } else {
        setExpandedLocations(Object.keys(locationGroups).slice(0, 2))
        const firstTwoBuildings = Object.entries(locationGroups)
          .slice(0, 2)
          .flatMap(([loc, buildings]) => Object.keys(buildings).slice(0, 2).map(b => `${loc}|${b}`))
        setExpandedBuildings(firstTwoBuildings)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm])

    const toggleLocation = (location) => {
      setExpandedLocations(prev =>
        prev.includes(location)
          ? prev.filter(l => l !== location)
          : [...prev, location]
      )
    }

    const toggleBuilding = (location, building) => {
      const key = `${location}|${building}`
      setExpandedBuildings(prev =>
        prev.includes(key)
          ? prev.filter(b => b !== key)
          : [...prev, key]
      )
    }

    const expandAll = () => {
      setExpandedLocations(Object.keys(filteredLocationGroups))
      const allBuildingKeys = Object.entries(filteredLocationGroups)
        .flatMap(([loc, buildings]) => Object.keys(buildings).map(b => `${loc}|${b}`))
      setExpandedBuildings(allBuildingKeys)
    }

    const collapseAll = () => {
      setExpandedLocations([])
      setExpandedBuildings([])
    }

    return (
      <div className="p-4">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Asset Distribution by Location, Building & Floor</h3>

          {/* Search and Controls */}
          <div className="mb-4 space-y-3">
            <Input.Search
              placeholder="Search locations, buildings, or floors..."
              allowClear
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: 400 }}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <EnvironmentOutlined className="mr-1" />
                  {Object.keys(filteredLocationGroups).length} Location{Object.keys(filteredLocationGroups).length !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center">
                  <TagOutlined className="mr-1" />
                  {Object.values(filteredLocationGroups).flatMap(b => Object.keys(b)).length} Building{Object.values(filteredLocationGroups).flatMap(b => Object.keys(b)).length !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center font-medium text-blue-600">
                  {searchTerm ? `${filteredTotalAssets} / ` : ''}{totalAssets} Assets
                </span>
              </div>
              <Space size="small">
                <Button size="small" type="link" onClick={expandAll}>
                  Expand All
                </Button>
                <Button size="small" type="link" onClick={collapseAll}>
                  Collapse All
                </Button>
              </Space>
            </div>
          </div>
        </div>

        {/* Location → Building → Floor Hierarchy with Collapse */}
        {Object.keys(filteredLocationGroups).length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <EnvironmentOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <div>No locations found matching "{searchTerm}"</div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(filteredLocationGroups).map(([location, buildings]) => {
              const locationTotal = Object.values(buildings)
                .flat()
                .reduce((sum, item) => sum + item.count, 0)
              const isLocationExpanded = expandedLocations.includes(location)
              const buildingCount = Object.keys(buildings).length

              return (
                <div key={location} className="border-2 border-indigo-200 rounded-lg overflow-hidden shadow-md">
                  {/* Location Header - Top Level */}
                  <div
                    className="bg-gradient-to-r from-indigo-100 to-indigo-200 p-4 cursor-pointer hover:from-indigo-200 hover:to-indigo-300 transition-colors"
                    onClick={() => toggleLocation(location)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                          <EnvironmentOutlined className="mr-3 text-indigo-700 text-xl" />
                          {location}
                          <span className="ml-3 text-sm font-normal text-gray-600">
                            ({buildingCount} building{buildingCount !== 1 ? 's' : ''})
                          </span>
                        </h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-700">{locationTotal}</div>
                          <div className="text-xs text-gray-700">total assets</div>
                        </div>
                        <div className="text-gray-600 text-lg">
                          {isLocationExpanded ? '▼' : '▶'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Buildings under this Location */}
                  {isLocationExpanded && (
                    <div className="bg-white p-3 space-y-3">
                      {Object.entries(buildings).map(([building, items]) => {
                        const buildingTotal = items.reduce((sum, item) => sum + item.count, 0)
                        const buildingKey = `${location}|${building}`
                        const isBuildingExpanded = expandedBuildings.includes(buildingKey)

                        // Group items by floor
                        const floorGroups = items.reduce((acc, item) => {
                          const floor = item.floor || 'No Floor Info'
                          if (!acc[floor]) acc[floor] = []
                          acc[floor].push(item)
                          return acc
                        }, {})

                        return (
                          <div key={buildingKey} className="border border-blue-200 rounded-lg overflow-hidden">
                            {/* Building Header - Second Level */}
                            <div
                              className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 cursor-pointer hover:from-blue-100 hover:to-blue-150 transition-colors"
                              onClick={() => toggleBuilding(location, building)}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 flex items-center">
                                    <BankOutlined className="mr-2 text-blue-600" />
                                    {building}
                                    <span className="ml-2 text-xs font-normal text-gray-500">
                                      ({Object.keys(floorGroups).length} floor{Object.keys(floorGroups).length !== 1 ? 's' : ''})
                                    </span>
                                  </h4>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-blue-600">{buildingTotal}</div>
                                    <div className="text-xs text-gray-600">assets</div>
                                  </div>
                                  <div className="text-gray-400">
                                    {isBuildingExpanded ? '▼' : '▶'}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Floors under this Building */}
                            {isBuildingExpanded && (
                              <div className="p-3 bg-gray-50">
                                <Collapse
                                  ghost
                                  defaultActiveKey={Object.keys(floorGroups).slice(0, 2)}
                                  items={Object.entries(floorGroups).map(([floor, floorItems]) => {
                                    const floorTotal = floorItems.reduce((sum, item) => sum + item.count, 0)
                                    return {
                                      key: floor,
                                      label: (
                                        <div className="flex justify-between items-center">
                                          <span className="font-medium text-gray-700">
                                            <TagOutlined className="mr-2" />
                                            Floor: {floor}
                                          </span>
                                          <span className="text-sm font-semibold text-blue-600 mr-2">
                                            {floorTotal} asset{floorTotal !== 1 ? 's' : ''}
                                          </span>
                                        </div>
                                      ),
                                      children: (
                                        <div className="space-y-1 pl-4">
                                          {floorItems.map((item, idx) => (
                                            <div
                                              key={idx}
                                              className="flex justify-between items-center text-sm p-2 bg-white rounded border hover:bg-blue-50 transition-colors"
                                            >
                                              <span className="text-gray-700 font-medium">
                                                {item.location} - {item.building} - {item.floor}
                                              </span>
                                              <Badge
                                                count={item.count}
                                                showZero
                                                style={{ backgroundColor: item.count > 0 ? '#1890ff' : '#d9d9d9' }}
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      )
                                    }
                                  })}
                                />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Summary Statistics */}
        {Object.keys(filteredLocationGroups).length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold mb-4 text-gray-800 text-lg">📊 Distribution Summary</h4>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Total Locations"
                  value={Object.keys(locationGroups).length}
                  prefix={<EnvironmentOutlined style={{ color: '#6366f1' }} />}
                  valueStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Total Buildings"
                  value={Object.values(locationGroups).flatMap(b => Object.keys(b)).length}
                  prefix={<BankOutlined style={{ color: '#3b82f6' }} />}
                  valueStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Total Floors"
                  value={data.length}
                  prefix={<TagOutlined style={{ color: '#10b981' }} />}
                  valueStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Total Assets"
                  value={totalAssets}
                  valueStyle={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '24px' }}
                />
              </Col>
            </Row>
          </div>
        )}
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
            <LocationPieChart data={locationDistribution} />
            <div className="mt-4 text-xs text-gray-500 flex items-center">
              <InfoCircleOutlined className="mr-1" />
              Click on a slice to view details for that location
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
            <Badge count={Object.values(filters || {}).filter(v => v && v !== '').length} offset={[-5, 5]}>
              <Button icon={<FilterOutlined />} onClick={showFilterDrawer}>Filters</Button>
            </Badge>
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
            pageSize: assets.pagination?.limit || 10,
            total: assets.pagination?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
            className: 'mt-4',
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          onChange={handleTableChange}
          scroll={{ x: 2000, y: 'calc(100vh - 320px)' }}
          size="middle"
          className="custom-table"
          style={{
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
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
          onValuesChange={(changedValues, allValues) => {
            // Auto-clear assigned_to when changing to component type
            if (changedValues.asset_type === 'component' && allValues.assigned_to) {
              form.setFieldsValue({ assigned_to: undefined })
            }
            // Auto-clear parent_asset_id and installation_notes when changing away from component
            if (changedValues.asset_type && changedValues.asset_type !== 'component') {
              form.setFieldsValue({
                parent_asset_id: undefined,
                installation_notes: undefined
              })
            }
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="serial_number"
                label="Serial Number"
                rules={[{ required: true, message: 'Please input serial number!' }]}
                extra="Asset Tag will be auto-generated from product name"
              >
                <Input placeholder="Enter serial number (e.g., SN123456)" />
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
                <Select
                  placeholder="Select product"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const searchText = `${option.label || ''}`.toLowerCase()
                    return searchText.includes(input.toLowerCase())
                  }}
                  options={products.data?.map(product => ({
                    value: product.id,
                    label: `${product.name}${product.model ? ` - ${product.model}` : ''}`
                  }))}
                  loading={products.loading}
                />
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
                name="asset_type"
                label="Asset Type"
                initialValue="standalone"
                extra="Standalone: Regular assets. Component: Parts that can be installed in other assets (can be spare stock or installed)"
              >
                <Select placeholder="Select asset type">
                  <Option value="standalone">Standalone (Laptops, Printers, etc.)</Option>
                  <Option value="component">Component (RAM, HDD, Monitor, etc.)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.asset_type !== currentValues.asset_type}
              >
                {({ getFieldValue }) => {
                  const assetType = getFieldValue('asset_type')
                  const isComponent = assetType === 'component'
                  return (
                    <Form.Item
                      name="assigned_to"
                      label="Assigned To (Optional)"
                      extra={isComponent ? "Components cannot be assigned to users" : "Asset will inherit location from assigned user"}
                    >
                      <Select
                        placeholder={isComponent ? "N/A - Components cannot be assigned" : "Select user (asset will inherit location from user)"}
                        showSearch
                        allowClear
                        disabled={isComponent}
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
                  )
                }}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.asset_type !== currentValues.asset_type}
              >
                {({ getFieldValue }) => {
                  const assetType = getFieldValue('asset_type')
                  return assetType === 'component' ? (
                    <Form.Item
                      name="parent_asset_id"
                      label="Parent Asset (Optional)"
                      extra="Leave empty for spare/stock components. Select parent when installing the component."
                    >
                      <Select
                        placeholder="Leave empty for spare stock, or select parent asset..."
                        showSearch
                        allowClear
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={dropdown.data?.filter(asset => asset.asset_type !== 'component').map(asset => ({
                          value: asset.id,
                          label: `${asset.asset_tag} - ${asset.product_name}`
                        }))}
                        loading={dropdown.loading}
                      />
                    </Form.Item>
                  ) : null
                }}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.asset_type !== currentValues.asset_type}
          >
            {({ getFieldValue }) => {
              const assetType = getFieldValue('asset_type')
              return assetType === 'component' ? (
                <Form.Item
                  name="installation_notes"
                  label="Installation Notes (Optional)"
                  extra="Add notes about the component installation"
                >
                  <Input.TextArea rows={2} placeholder="E.g., Upgraded from previous component" />
                </Form.Item>
              ) : null
            }}
          </Form.Item>

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
          ...(viewingAsset?.asset_type !== 'component' ? [
            <Button key="assign" type="primary" icon={<UserOutlined />} onClick={() => {
              setViewDetailsModalVisible(false)
              showAssignModal(viewingAsset)
            }}>
              Assign Asset
            </Button>
          ] : []),
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
              <Col span={8}>
                <div className="bg-gray-50 p-3 rounded">
                  <Text type="secondary" className="text-xs">Asset Tag (Auto-generated)</Text>
                  <div className="font-medium text-lg">{viewingAsset.asset_tag}</div>
                </div>
              </Col>
              <Col span={8}>
                <div className="bg-gray-50 p-3 rounded">
                  <Text type="secondary" className="text-xs">Serial Number</Text>
                  <div className="font-medium text-lg">{viewingAsset.serial_number || 'N/A'}</div>
                </div>
              </Col>
              <Col span={8}>
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

            <Divider orientation="left">Asset Type & Hierarchy</Divider>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">Asset Type:</Text>
                <div className="font-medium">
                  <Tag color={
                    viewingAsset.asset_type === 'component' ? 'green' :
                    viewingAsset.asset_type === 'parent' ? 'blue' : 'default'
                  }>
                    {viewingAsset.asset_type ? viewingAsset.asset_type.toUpperCase() : 'STANDALONE'}
                  </Tag>
                </div>
              </Col>
              {viewingAsset.asset_type === 'component' && viewingAsset.parent_asset_tag && (
                <Col span={12}>
                  <Text type="secondary">Parent Asset:</Text>
                  <div className="font-medium flex items-center">
                    <ApiOutlined className="mr-2" />
                    {viewingAsset.parent_asset_tag}
                  </div>
                </Col>
              )}
              {viewingAsset.asset_type === 'component' && viewingAsset.installation_date && (
                <Col span={12}>
                  <Text type="secondary">Installation Date:</Text>
                  <div className="font-medium">{new Date(viewingAsset.installation_date).toLocaleDateString()}</div>
                </Col>
              )}
              {viewingAsset.asset_type === 'component' && viewingAsset.installed_by_name && (
                <Col span={12}>
                  <Text type="secondary">Installed By:</Text>
                  <div className="font-medium">{viewingAsset.installed_by_name}</div>
                </Col>
              )}
            </Row>

            {viewingAsset.asset_type === 'component' && viewingAsset.installation_notes && (
              <>
                <Divider orientation="left">Installation Notes</Divider>
                <div className="bg-blue-50 p-3 rounded">
                  <Text>{viewingAsset.installation_notes}</Text>
                </div>
              </>
            )}

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
                    <div>{viewingAsset.assigned_user_name || (viewingAsset.asset_type === 'component' ? 'N/A (Components cannot be assigned)' : 'Unassigned')}</div>
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

      {/* Filter Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Filter Assets</span>
            <Badge count={Object.values(tempFilters).filter(v => v && v !== '').length} showZero={false} />
          </div>
        }
        placement="right"
        width={400}
        open={filterDrawerVisible}
        onClose={handleFilterDrawerClose}
        footer={
          <div className="flex justify-between">
            <Button onClick={handleClearFilters}>Clear All</Button>
            <Space>
              <Button onClick={handleFilterDrawerClose}>Cancel</Button>
              <Button type="primary" onClick={handleApplyFilters}>Apply Filters</Button>
            </Space>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <Input
              placeholder="Search by asset tag, product name, model..."
              value={tempFilters.search || ''}
              onChange={(e) => handleTempFilterChange('search', e.target.value)}
              allowClear
            />
          </div>

          {/* Board */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Board</label>
            <Select
              placeholder="Select board"
              value={tempFilters.board_id || undefined}
              onChange={(value) => handleTempFilterChange('board_id', value)}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => {
                const searchText = `${option.label || ''}`.toLowerCase()
                return searchText.includes(input.toLowerCase())
              }}
              style={{ width: '100%' }}
              options={boards.data?.map(board => ({
                value: board.id,
                label: board.name
              }))}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <Select
              placeholder="Select status"
              value={tempFilters.status || undefined}
              onChange={(value) => handleTempFilterChange('status', value)}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="available">Available</Option>
              <Option value="assigned">Assigned</Option>
              <Option value="in_use">In Use</Option>
              <Option value="under_repair">Under Repair</Option>
              <Option value="discarded">Discarded</Option>
            </Select>
          </div>

          {/* Condition Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
            <Select
              placeholder="Select condition"
              value={tempFilters.condition_status || undefined}
              onChange={(value) => handleTempFilterChange('condition_status', value)}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="excellent">Excellent</Option>
              <Option value="good">Good</Option>
              <Option value="fair">Fair</Option>
              <Option value="poor">Poor</Option>
            </Select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <Select
              placeholder="Select category"
              value={tempFilters.category_id || undefined}
              onChange={(value) => handleTempFilterChange('category_id', value)}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => {
                const searchText = `${option.label || ''}`.toLowerCase()
                return searchText.includes(input.toLowerCase())
              }}
              style={{ width: '100%' }}
              options={categories.data?.map(category => ({
                value: category.id,
                label: category.name
              }))}
            />
          </div>

          {/* Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
            <Select
              placeholder="Select product"
              value={tempFilters.product_id || undefined}
              onChange={(value) => handleTempFilterChange('product_id', value)}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => {
                const searchText = `${option.label || ''}`.toLowerCase()
                return searchText.includes(input.toLowerCase())
              }}
              style={{ width: '100%' }}
              options={products.data?.map(product => ({
                value: product.id,
                label: `${product.name}${product.model ? ` (${product.model})` : ''}`
              }))}
            />
          </div>

          {/* OEM */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">OEM/Manufacturer</label>
            <Select
              placeholder="Select OEM"
              value={tempFilters.oem_id || undefined}
              onChange={(value) => handleTempFilterChange('oem_id', value)}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => {
                const searchText = `${option.label || ''}`.toLowerCase()
                return searchText.includes(input.toLowerCase())
              }}
              style={{ width: '100%' }}
              options={oems.data?.map(oem => ({
                value: oem.id,
                label: oem.name
              }))}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <Select
              placeholder="Select location"
              value={tempFilters.location_id || undefined}
              onChange={(value) => handleTempFilterChange('location_id', value)}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => {
                const searchText = `${option.label || ''}`.toLowerCase()
                return searchText.includes(input.toLowerCase())
              }}
              style={{ width: '100%' }}
              options={locations.data?.map(location => ({
                value: location.id,
                label: `${location.name}${location.building ? ` - ${location.building}` : ''}${location.floor ? ` (Floor: ${location.floor})` : ''}`
              }))}
            />
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
            <Select
              placeholder="Select user"
              value={tempFilters.assigned_to || undefined}
              onChange={(value) => handleTempFilterChange('assigned_to', value)}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => {
                const searchText = `${option.label || ''}`.toLowerCase()
                return searchText.includes(input.toLowerCase())
              }}
              style={{ width: '100%' }}
              options={users.data?.map(user => ({
                value: user.id,
                label: `${user.firstName} ${user.lastName} (${user.email})`
              }))}
            />
          </div>
        </div>
      </Drawer>

      {/* Component Manager Drawer */}
      <Drawer
        title={
          <Space>
            <ApiOutlined className="text-blue-600" />
            <span>Component Manager</span>
            {managingComponentsAsset && (
              <Tag color="blue">{managingComponentsAsset.asset_tag}</Tag>
            )}
          </Space>
        }
        open={componentDrawerVisible}
        onClose={() => {
          setComponentDrawerVisible(false)
          setManagingComponentsAsset(null)
        }}
        width={1200}
        destroyOnClose
      >
        {managingComponentsAsset && (
          <ComponentManager
            assetId={managingComponentsAsset.id}
            assetTag={managingComponentsAsset.asset_tag}
            assetType={managingComponentsAsset.asset_type}
          />
        )}
      </Drawer>
    </div>
  )
}

export default AssetInventory