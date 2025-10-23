import { useState, useEffect } from 'react'
import {
  Modal,
  Form,
  Select,
  Input,
  Alert,
  Space,
  Typography,
  Divider,
  Tag,
  Spin,
  message
} from 'antd'
import {
  ApiOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import {
  installComponent,
  fetchAssetsDropdown,
  selectComponentOperation,
  selectAssetsDropdown,
  clearComponentOperationState
} from '../../../../store/slices/assetSlice'
import {
  fetchUsers,
  selectUsers
} from '../../../../store/slices/userSlice'

const { Option } = Select
const { TextArea } = Input
const { Text } = Typography

const InstallComponentModal = ({ visible, onClose, parentAssetId, parentAssetTag }) => {
  const dispatch = useDispatch()
  const [form] = Form.useForm()

  const { loading: operationLoading, error: operationError, success: operationSuccess } = useSelector(selectComponentOperation)
  const { data: assetsDropdown, loading: assetsLoading } = useSelector(selectAssetsDropdown)
  const usersState = useSelector(selectUsers)

  const [selectedComponent, setSelectedComponent] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])

  // Debug: Log the users state
  useEffect(() => {
    console.log('Users State:', usersState)
  }, [usersState])

  // Fetch dropdown data when modal opens
  useEffect(() => {
    if (visible) {
      // Fetch only assets suitable for component installation
      dispatch(fetchAssetsDropdown({
        status: 'available',           // Only available status
        asset_type: 'standalone',      // Only standalone type
        available_only: true,          // Enforce availability
        exclude_standby: true,         // ✅ NEW: Exclude standby pool assets
        exclude_components: true,      // ✅ NEW: Exclude already-installed components
        exclude_assigned: true         // ✅ NEW: Exclude assigned assets
      }))

      // Fetch engineers for "Installed By" field
      dispatch(fetchUsers({ page: 1, limit: 1000, role: 'engineer' }))
    }
  }, [visible, dispatch])

  // Handle success
  useEffect(() => {
    if (operationSuccess && visible) {
      message.success('Component installed successfully!')
      handleClose()
    }
  }, [operationSuccess, visible])

  // Handle component selection
  const handleComponentSelect = (componentId) => {
    const component = (assetsDropdown || []).find(a => a.id === componentId)
    setSelectedComponent(component)
  }

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      // Clear previous validation errors
      setValidationErrors([])

      // Perform client-side validation
      const errors = []

      if (!values.component_asset_id) {
        errors.push('Please select a component to install')
      }

      if (values.component_asset_id === parentAssetId) {
        errors.push('Cannot install an asset into itself')
      }

      if (errors.length > 0) {
        setValidationErrors(errors)
        return
      }

      // Dispatch install action
      await dispatch(installComponent({
        parentAssetId,
        componentAssetId: values.component_asset_id,
        installationNotes: values.installation_notes || '',
        installedBy: values.installed_by || null
      })).unwrap()

    } catch (error) {
      console.error('Install component error:', error)
      // Form validation errors are handled by Ant Design
      if (error.errorFields) {
        // Form validation failed
        return
      }
      // API errors are handled by Redux state
    }
  }

  // Handle close
  const handleClose = () => {
    form.resetFields()
    setSelectedComponent(null)
    setValidationErrors([])
    dispatch(clearComponentOperationState())
    onClose()
  }

  // Filter out the parent asset itself (API already returns only standalone, available assets)
  const availableComponents = (assetsDropdown || []).filter(asset =>
    asset.id !== parentAssetId
  )
  console.log(availableComponents)

  return (
    <Modal
      title={
        <Space>
          <ApiOutlined className="text-blue-600" />
          <span>Install Component</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      onOk={handleSubmit}
      width={600}
      confirmLoading={operationLoading}
      okText="Install Component"
      cancelText="Cancel"
      destroyOnClose
    >
      <Divider className="mt-2 mb-4" />

      {/* Parent Asset Info */}
      <Alert
        message={
          <Space>
            <Text strong>Installing into:</Text>
            <Tag color="blue">{parentAssetTag}</Tag>
          </Space>
        }
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        className="mb-4"
      />

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert
          message="Validation Error"
          description={
            <ul className="mb-0 pl-4">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          }
          type="error"
          icon={<WarningOutlined />}
          showIcon
          closable
          onClose={() => setValidationErrors([])}
          className="mb-4"
        />
      )}

      {/* API Error */}
      {operationError && (
        <Alert
          message="Installation Failed"
          description={operationError}
          type="error"
          showIcon
          closable
          onClose={() => dispatch(clearComponentOperationState())}
          className="mb-4"
        />
      )}

      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
      >
        {/* Component Selection */}
        <Form.Item
          label="Select Component"
          name="component_asset_id"
          rules={[
            { required: true, message: 'Please select a component to install' }
          ]}
          extra="Only available standalone assets (not in standby pool, not assigned, not already components) can be installed"
        >
          <Select
            placeholder="Select a component..."
            showSearch
            loading={assetsLoading}
            onChange={handleComponentSelect}
            filterOption={(input, option) => {
              const asset = availableComponents.find(a => a.id === option.value)
              if (!asset) return false
              const searchStr = `${asset.asset_tag} ${asset.product_name} ${asset.serial_number || ''}`.toLowerCase()
              return searchStr.includes(input.toLowerCase())
            }}
            notFoundContent={
              assetsLoading ? <Spin size="small" /> : (
                availableComponents.length === 0 ?
                  'No available components found' :
                  'No matching components'
              )
            }
          >
            {availableComponents.map(asset => (
              <Option key={asset.id} value={asset.id}>
                <Space>
                  <Text strong>SN: {asset.serial_number || 'N/A'}</Text>
                  <Text type="secondary">-</Text>
                  <Text>{asset.product_name || 'Unknown Product'}</Text>
                  <Text type="secondary" className="text-xs">
                    ({asset.label})
                  </Text>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Selected Component Info */}
        {selectedComponent && (
          <Alert
            message={
              <div>
                <Text strong>Selected Component Details:</Text>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <Text type="secondary">Asset Tag:</Text>{' '}
                    <Text>{selectedComponent.asset_tag}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Product:</Text>{' '}
                    <Text>{selectedComponent.product_name || 'N/A'}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Serial Number:</Text>{' '}
                    <Text className="font-mono text-xs">{selectedComponent.serial_number || 'N/A'}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Status:</Text>{' '}
                    <Tag color="green">{selectedComponent.status}</Tag>
                  </div>
                </div>
              </div>
            }
            type="success"
            className="mb-4"
          />
        )}

        {/* Installed By */}
        <Form.Item
          label="Installed By"
          name="installed_by"
          extra="Select the person who installed this component (optional)"
        >
          <Select
            placeholder="Select installer..."
            showSearch
            allowClear
            loading={usersState.loading}
            filterOption={(input, option) => {
              const user = usersState.data?.find(u => u.id === option.value)
              if (!user) return false
              const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
              const searchStr = `${fullName} ${user.email}`.toLowerCase()
              return searchStr.includes(input.toLowerCase())
            }}
          >
            {usersState.data?.map(user => {
              const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
              return (
                <Option key={user.id} value={user.id}>
                  {fullName} ({user.email})
                </Option>
              )
            })}
          </Select>
        </Form.Item>

        {/* Installation Notes */}
        <Form.Item
          label="Installation Notes"
          name="installation_notes"
          extra="Add any notes about this installation (optional)"
        >
          <TextArea
            rows={3}
            placeholder="E.g., Upgraded from previous component, replaced faulty part, etc."
            maxLength={1000}
            showCount
          />
        </Form.Item>
      </Form>

      <Divider className="mb-2" />

      <Alert
        message={
          <Text type="secondary" className="text-xs">
            Once installed, the component will be marked as "In Use" and cannot be assigned to users directly.
            It can only be managed through this parent asset.
          </Text>
        }
        type="info"
        showIcon={false}
        className="mt-2"
      />
    </Modal>
  )
}

export default InstallComponentModal
