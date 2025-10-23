import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Tooltip,
  Empty,
  Spin,
  Alert,
  Dropdown,
  Modal,
  Typography,
  Badge,
  Tabs
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  ReloadOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ApiOutlined,
  UnorderedListOutlined,
  ApartmentOutlined
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAssetComponents,
  removeComponent,
  reinstallComponent,
  selectAssetComponents,
  selectComponentOperation,
  clearComponentOperationState
} from '../../../../store/slices/assetSlice'
import InstallComponentModal from './InstallComponentModal'
import AssetHierarchyTree from './AssetHierarchyTree'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { confirm } = Modal

const ComponentManager = ({ assetId, assetTag, assetType }) => {
  const dispatch = useDispatch()
  const [isInstallModalVisible, setIsInstallModalVisible] = useState(false)
  const [includeRemoved, setIncludeRemoved] = useState(false)
  const [viewingComponent, setViewingComponent] = useState(null)
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false)

  const { data: components, loading, error, parentAsset } = useSelector(selectAssetComponents)
  const { loading: operationLoading, error: operationError, success: operationSuccess } = useSelector(selectComponentOperation)

  // Fetch components on mount and when assetId changes
  useEffect(() => {
    if (assetId) {
      dispatch(fetchAssetComponents({ assetId, includeRemoved }))
    }
  }, [dispatch, assetId, includeRemoved])

  // Handle operation success
  useEffect(() => {
    if (operationSuccess) {
      // Refresh component list
      dispatch(fetchAssetComponents({ assetId, includeRemoved }))
      dispatch(clearComponentOperationState())
    }
  }, [operationSuccess, dispatch, assetId, includeRemoved])

  // Handle install modal close
  const handleInstallModalClose = () => {
    setIsInstallModalVisible(false)
  }

  // Handle remove component
  const handleRemoveComponent = (component) => {
    confirm({
      title: 'Remove Component?',
      icon: <WarningOutlined />,
      content: `Are you sure you want to remove "${component.asset_tag} - ${component.product_name}" from this asset?`,
      okText: 'Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        return dispatch(removeComponent({
          parentAssetId: assetId,
          componentId: component.id,
          removalNotes: 'Removed via Component Manager'
        })).unwrap()
      }
    })
  }

  // Handle reinstall component
  const handleReinstallComponent = (component) => {
    confirm({
      title: 'Reinstall Component?',
      icon: <CheckCircleOutlined />,
      content: `Do you want to reinstall "${component.asset_tag} - ${component.product_name}"?`,
      okText: 'Reinstall',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: () => {
        return dispatch(reinstallComponent({
          parentAssetId: assetId,
          componentId: component.id,
          installationNotes: 'Reinstalled via Component Manager'
        })).unwrap()
      }
    })
  }

  // Handle toggle include removed
  const handleToggleIncludeRemoved = () => {
    setIncludeRemoved(!includeRemoved)
  }

  // Handle view component details
  const handleViewDetails = (component) => {
    setViewingComponent(component)
    setIsDetailsModalVisible(true)
  }

  // Handle close details modal
  const handleCloseDetailsModal = () => {
    setIsDetailsModalVisible(false)
    setViewingComponent(null)
  }

  // Get installation status tag
  const getInstallationStatusTag = (installationStatus) => {
    const statusMap = {
      installed: { color: 'success', icon: <CheckCircleOutlined />, text: 'Installed' },
      removed: { color: 'default', icon: <ClockCircleOutlined />, text: 'Removed' }
    }

    const status = statusMap[installationStatus] || { color: 'default', icon: null, text: installationStatus }

    return (
      <Tag color={status.color} icon={status.icon}>
        {status.text}
      </Tag>
    )
  }

  // Table columns
  const columns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => <span className="text-gray-600">{index + 1}</span>
    },
    {
      title: 'Component',
      key: 'component',
      render: (_, record) => (
        <div className="py-1">
          <div className="font-semibold text-gray-800 text-sm">{record.product_name || 'N/A'}</div>
          <div className="text-xs text-gray-500 mt-0.5">{record.product_model || 'No model'}</div>
        </div>
      )
    },
    {
      title: 'Asset Tag',
      dataIndex: 'asset_tag',
      key: 'asset_tag',
      width: 140,
      render: (text) => <span className="font-mono text-xs bg-blue-50 px-2 py-1 rounded text-blue-700">{text}</span>
    },
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number',
      width: 150,
      render: (text) => <span className="font-mono text-xs text-gray-600">{text || 'N/A'}</span>
    },
    {
      title: 'Status',
      dataIndex: 'installation_status',
      key: 'installation_status',
      width: 120,
      align: 'center',
      render: (status) => getInstallationStatusTag(status)
    },
    {
      title: 'Installation Date',
      dataIndex: 'installation_date',
      key: 'installation_date',
      width: 140,
      render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : 'N/A'
    },
    {
      title: 'Installed By',
      dataIndex: 'installed_by_name',
      key: 'installed_by_name',
      width: 150,
      render: (name) => name || 'N/A'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      align: 'center',
      render: (_, record) => {
        const isInstalled = record.installation_status === 'installed'

        return (
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            menu={{
              items: [
                {
                  key: 'view',
                  label: 'View Details',
                  icon: <EyeOutlined />,
                  onClick: () => handleViewDetails(record)
                },
                {
                  type: 'divider'
                },
                ...(isInstalled ? [{
                  key: 'remove',
                  label: 'Remove',
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => handleRemoveComponent(record)
                }] : [{
                  key: 'reinstall',
                  label: 'Reinstall',
                  icon: <ReloadOutlined />,
                  onClick: () => handleReinstallComponent(record)
                }])
              ]
            }}
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
              className="flex items-center justify-center"
            />
          </Dropdown>
        )
      }
    }
  ]

  // Show loading state
  if (loading && components.length === 0) {
    return (
      <Card>
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  // Tab items
  const tabItems = [
    {
      key: 'list',
      label: (
        <span>
          <UnorderedListOutlined /> Components List
        </span>
      ),
      children: (
        <div>
          {error && (
            <Alert
              message="Error Loading Components"
              description={error}
              type="error"
              closable
              className="mb-4"
            />
          )}

          {operationError && (
            <Alert
              message="Operation Failed"
              description={operationError}
              type="error"
              closable
              className="mb-4"
              onClose={() => dispatch(clearComponentOperationState())}
            />
          )}

          {assetType === 'component' && (
            <Alert
              message="Cannot Install Components"
              description="Components cannot contain other components. Only parent assets or standalone assets can have components installed."
              type="warning"
              showIcon
              className="mb-4"
            />
          )}

          <Table
            columns={columns}
            dataSource={components}
            rowKey="id"
            loading={loading || operationLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} component${total !== 1 ? 's' : ''}`
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    assetType === 'component'
                      ? 'Components cannot contain other components'
                      : includeRemoved
                        ? 'No components found'
                        : 'No installed components. Click "Install Component" to add one.'
                  }
                />
              )
            }}
            scroll={{ x: 1200 }}
            size="small"
          />
        </div>
      )
    },
    {
      key: 'hierarchy',
      label: (
        <span>
          <ApartmentOutlined /> Hierarchy Tree
        </span>
      ),
      children: <AssetHierarchyTree assetId={assetId} />
    }
  ]

  return (
    <div className="component-manager">
      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ApiOutlined className="text-blue-600" />
              <span>Component Manager</span>
              <Badge count={components.filter(c => c.installation_status === 'installed').length} showZero />
            </div>
            {parentAsset && (
              <Text type="secondary" className="text-sm">
                Asset: {parentAsset.asset_tag}
              </Text>
            )}
          </div>
        }
        extra={
          <Space>
            <Tooltip title={includeRemoved ? 'Hide removed components' : 'Show removed components'}>
              <Button
                type={includeRemoved ? 'primary' : 'default'}
                size="small"
                onClick={handleToggleIncludeRemoved}
              >
                {includeRemoved ? 'Hide Removed' : 'Show Removed'}
              </Button>
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsInstallModalVisible(true)}
              disabled={assetType === 'component'}
            >
              Install Component
            </Button>
          </Space>
        }
      >
        <Tabs
          items={tabItems}
          defaultActiveKey="list"
          type="card"
        />
      </Card>

      {/* Install Component Modal */}
      <InstallComponentModal
        visible={isInstallModalVisible}
        onClose={handleInstallModalClose}
        parentAssetId={assetId}
        parentAssetTag={assetTag}
      />

      {/* Component Details Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined className="text-blue-600" />
            <span>Component Details</span>
          </Space>
        }
        open={isDetailsModalVisible}
        onCancel={handleCloseDetailsModal}
        footer={[
          <Button key="close" onClick={handleCloseDetailsModal}>
            Close
          </Button>
        ]}
        width={700}
      >
        {viewingComponent && (
          <div className="space-y-4">
            {/* Basic Information */}
            <div>
              <Title level={5} className="text-gray-700 mb-3">Basic Information</Title>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text type="secondary" className="text-xs">Asset Tag</Text>
                  <div className="font-mono text-sm bg-blue-50 px-2 py-1 rounded text-blue-700 inline-block">
                    {viewingComponent.asset_tag}
                  </div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">Serial Number</Text>
                  <div className="font-mono text-sm">{viewingComponent.serial_number || 'N/A'}</div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">Product Name</Text>
                  <div className="font-medium">{viewingComponent.product_name || 'N/A'}</div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">Model</Text>
                  <div>{viewingComponent.product_model || 'N/A'}</div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">Category</Text>
                  <div>{viewingComponent.category_name || 'N/A'}</div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">Status</Text>
                  <div>{getInstallationStatusTag(viewingComponent.installation_status)}</div>
                </div>
              </div>
            </div>

            {/* Specifications */}
            {(viewingComponent.capacity_value || viewingComponent.speed_value || viewingComponent.interface_type || viewingComponent.form_factor) && (
              <div>
                <Title level={5} className="text-gray-700 mb-3">Specifications</Title>
                <div className="grid grid-cols-2 gap-4">
                  {viewingComponent.capacity_value && (
                    <div>
                      <Text type="secondary" className="text-xs">Capacity</Text>
                      <div>{viewingComponent.capacity_value} {viewingComponent.capacity_unit || ''}</div>
                    </div>
                  )}
                  {viewingComponent.speed_value && (
                    <div>
                      <Text type="secondary" className="text-xs">Speed</Text>
                      <div>{viewingComponent.speed_value} {viewingComponent.speed_unit || ''}</div>
                    </div>
                  )}
                  {viewingComponent.interface_type && (
                    <div>
                      <Text type="secondary" className="text-xs">Interface</Text>
                      <div>{viewingComponent.interface_type}</div>
                    </div>
                  )}
                  {viewingComponent.form_factor && (
                    <div>
                      <Text type="secondary" className="text-xs">Form Factor</Text>
                      <div>{viewingComponent.form_factor}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Installation Information */}
            <div>
              <Title level={5} className="text-gray-700 mb-3">Installation Information</Title>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text type="secondary" className="text-xs">Installation Date</Text>
                  <div>{viewingComponent.installation_date ? dayjs(viewingComponent.installation_date).format('MMM DD, YYYY HH:mm') : 'N/A'}</div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">Installed By</Text>
                  <div>{viewingComponent.installed_by_name || 'N/A'}</div>
                </div>
                {viewingComponent.removal_date && (
                  <>
                    <div>
                      <Text type="secondary" className="text-xs">Removal Date</Text>
                      <div>{dayjs(viewingComponent.removal_date).format('MMM DD, YYYY HH:mm')}</div>
                    </div>
                  </>
                )}
              </div>
              {viewingComponent.installation_notes && (
                <div className="mt-3">
                  <Text type="secondary" className="text-xs">Installation Notes</Text>
                  <div className="bg-gray-50 p-3 rounded text-sm mt-1" style={{ whiteSpace: 'pre-wrap' }}>
                    {viewingComponent.installation_notes}
                  </div>
                </div>
              )}
            </div>

            {/* Purchase Information */}
            {(viewingComponent.purchase_date || viewingComponent.warranty_end_date || viewingComponent.purchase_cost) && (
              <div>
                <Title level={5} className="text-gray-700 mb-3">Purchase Information</Title>
                <div className="grid grid-cols-2 gap-4">
                  {viewingComponent.purchase_date && (
                    <div>
                      <Text type="secondary" className="text-xs">Purchase Date</Text>
                      <div>{dayjs(viewingComponent.purchase_date).format('MMM DD, YYYY')}</div>
                    </div>
                  )}
                  {viewingComponent.warranty_end_date && (
                    <div>
                      <Text type="secondary" className="text-xs">Warranty End Date</Text>
                      <div>{dayjs(viewingComponent.warranty_end_date).format('MMM DD, YYYY')}</div>
                    </div>
                  )}
                  {viewingComponent.purchase_cost && (
                    <div>
                      <Text type="secondary" className="text-xs">Purchase Cost</Text>
                      <div className="font-medium">${viewingComponent.purchase_cost}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ComponentManager
