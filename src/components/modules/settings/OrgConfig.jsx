import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  Tag,
  message,
  Tooltip,
  Typography,
  Divider,
  Alert
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  ExclamationCircleOutlined,
  SettingOutlined
} from '@ant-design/icons'
import masterService from '../../../services/master'

const { Title, Text } = Typography
const { confirm } = Modal

const OrgConfig = () => {
  const [orgs, setOrgs] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  useEffect(() => {
    loadOrgs()
  }, [pagination.current, pagination.pageSize])

  const loadOrgs = async () => {
    setLoading(true)
    try {
      const response = await masterService.getOrgs({
        page: pagination.current,
        limit: pagination.pageSize
      })
      if (response.data.success) {
        setOrgs(response.data.data.orgs)
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination?.total || 0
        }))
      }
    } catch (error) {
      message.error('Failed to load organizations')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedOrg(null)
    setModalMode('create')
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setSelectedOrg(record)
    setModalMode('edit')
    form.setFieldsValue({
      orgCode: record.orgCode,
      orgName: record.orgName,
      subOrgCode: record.subOrgCode,
      subOrgName: record.subOrgName,
      isDefault: record.isDefault,
      isActive: record.isActive
    })
    setIsModalOpen(true)
  }

  const handleDelete = (record) => {
    if (record.isDefault) {
      message.warning('Cannot delete the default organization. Set another as default first.')
      return
    }

    confirm({
      title: 'Delete Organization',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${record.orgCode}/${record.subOrgCode}"?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await masterService.deleteOrg(record.id)
          message.success('Organization deleted successfully')
          loadOrgs()
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to delete organization')
        }
      }
    })
  }

  const handleSetDefault = async (record) => {
    if (record.isDefault) return

    try {
      await masterService.setDefaultOrg(record.id)
      message.success(`${record.orgCode}/${record.subOrgCode} is now the default organization`)
      loadOrgs()
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to set default organization')
    }
  }

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (modalMode === 'create') {
        await masterService.createOrg(values)
        message.success('Organization created successfully')
      } else {
        await masterService.updateOrg(selectedOrg.id, values)
        message.success('Organization updated successfully')
      }

      setIsModalOpen(false)
      form.resetFields()
      loadOrgs()
    } catch (error) {
      if (error.errorFields) {
        // Form validation error
        return
      }
      message.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleTableChange = (paginationInfo) => {
    setPagination(prev => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize
    }))
  }

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1
    },
    {
      title: 'ORG Code',
      dataIndex: 'orgCode',
      key: 'orgCode',
      width: 120,
      render: (text, record) => (
        <Space>
          <Text strong style={{ fontFamily: 'monospace' }}>{text}</Text>
          {record.isDefault && (
            <Tooltip title="Default for Asset Code Generation">
              <StarFilled style={{ color: '#faad14' }} />
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: 'ORG Name',
      dataIndex: 'orgName',
      key: 'orgName'
    },
    {
      title: 'SUB_ORG Code',
      dataIndex: 'subOrgCode',
      key: 'subOrgCode',
      width: 120,
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'SUB_ORG Name',
      dataIndex: 'subOrgName',
      key: 'subOrgName',
      render: (text) => text || <Text type="secondary">-</Text>
    },
    {
      title: 'Asset Code Preview',
      key: 'preview',
      width: 200,
      render: (_, record) => (
        <Text code style={{ fontSize: '12px' }}>
          {record.orgCode}/{record.subOrgCode}/IT/BK-DT/HP/1234
        </Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={record.isDefault ? 'Current Default' : 'Set as Default'}>
            <Button
              type="text"
              size="small"
              icon={record.isDefault ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
              onClick={() => handleSetDefault(record)}
              disabled={record.isDefault}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              disabled={record.isDefault}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                <SettingOutlined style={{ marginRight: 8 }} />
                Organization Configuration
              </Title>
              <Text type="secondary">
                Manage ORG/SUB_ORG codes used in Asset Code generation
              </Text>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Add Organization
            </Button>
          </div>
        </div>

        <Alert
          message="Asset Code Format"
          description={
            <div>
              <Text>Asset codes are generated in the format: </Text>
              <Text code>ORG/SUB_ORG/DEPT/LOC-TYPE/OEM/NUM</Text>
              <br />
              <Text type="secondary">
                Example: CID/0/IT/BK-DT/HP/1234 where CID is ORG and 0 is SUB_ORG
              </Text>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />

        <Table
          columns={columns}
          dataSource={orgs}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} organizations`
          }}
          onChange={handleTableChange}
          size="middle"
        />
      </Card>

      <Modal
        title={modalMode === 'create' ? 'Add Organization' : 'Edit Organization'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        onOk={handleModalSubmit}
        okText={modalMode === 'create' ? 'Create' : 'Update'}
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
          <Form.Item
            name="orgCode"
            label="ORG Code"
            rules={[
              { required: true, message: 'Please enter ORG code' },
              { max: 10, message: 'ORG code must be 10 characters or less' }
            ]}
            tooltip="Organization code used in asset code (e.g., CID)"
          >
            <Input
              placeholder="e.g., CID"
              style={{ textTransform: 'uppercase' }}
              maxLength={10}
            />
          </Form.Item>

          <Form.Item
            name="orgName"
            label="ORG Name"
            rules={[
              { required: true, message: 'Please enter organization name' },
              { max: 100, message: 'Name must be 100 characters or less' }
            ]}
          >
            <Input placeholder="e.g., CID Organization" />
          </Form.Item>

          <Divider />

          <Form.Item
            name="subOrgCode"
            label="SUB_ORG Code"
            rules={[
              { required: true, message: 'Please enter SUB_ORG code' },
              { max: 5, message: 'SUB_ORG code must be 5 characters or less' }
            ]}
            tooltip="Sub-organization code used in asset code (e.g., 0, 1, A)"
          >
            <Input placeholder="e.g., 0" maxLength={5} />
          </Form.Item>

          <Form.Item
            name="subOrgName"
            label="SUB_ORG Name"
            rules={[{ max: 100, message: 'Name must be 100 characters or less' }]}
          >
            <Input placeholder="e.g., Main Office (optional)" />
          </Form.Item>

          <Divider />

          <Form.Item
            name="isDefault"
            label="Set as Default"
            valuePropName="checked"
            tooltip="Default organization will be used for all new asset code generation"
          >
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>

          {modalMode === 'edit' && (
            <Form.Item
              name="isActive"
              label="Active Status"
              valuePropName="checked"
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}

export default OrgConfig
