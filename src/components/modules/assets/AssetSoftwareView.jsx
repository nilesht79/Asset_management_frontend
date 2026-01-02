import { useState, useEffect } from 'react'
import { Table, Tag, Button, Space, Spin, Alert, Typography, Tooltip } from 'antd'
import { EyeOutlined, EyeInvisibleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import assetService from '../../../services/asset'
import { formatDateOnly } from '../../../utils/dateUtils'

const { Text } = Typography

const AssetSoftwareView = ({ assetId }) => {
  const [loading, setLoading] = useState(false)
  const [softwareData, setSoftwareData] = useState([])
  const [error, setError] = useState(null)
  const [visibleKeys, setVisibleKeys] = useState({})

  const fetchSoftware = async () => {
    if (!assetId) {
      console.log('AssetSoftwareView: No assetId provided')
      return
    }

    console.log('AssetSoftwareView: Fetching software for asset:', assetId)
    setLoading(true)
    setError(null)
    try {
      const response = await assetService.getAssetSoftware(assetId)
      console.log('AssetSoftwareView: Software response:', response)
      if (response.data && response.data.success && response.data.data) {
        setSoftwareData(response.data.data)
      } else {
        setSoftwareData([])
      }
    } catch (err) {
      console.error('AssetSoftwareView: Error fetching software:', err)
      setError(err.message || 'Failed to load software installations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('AssetSoftwareView: useEffect triggered, assetId:', assetId)
    if (assetId) {
      fetchSoftware()
    }
  }, [assetId])

  const toggleKeyVisibility = (id) => {
    setVisibleKeys(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const maskLicenseKey = (key) => {
    if (!key) return 'N/A'
    if (key.length <= 8) return '****'
    return key.substring(0, 4) + '****' + key.substring(key.length - 4)
  }

  const getLicenseStatusTag = (status, daysUntilExpiration) => {
    switch (status) {
      case 'Active':
        return <Tag color="success" icon={<CheckCircleOutlined />}>Active</Tag>
      case 'Expiring Soon':
        return (
          <Tooltip title={`${daysUntilExpiration} days remaining`}>
            <Tag color="warning" icon={<ExclamationCircleOutlined />}>Expiring Soon ({daysUntilExpiration}d)</Tag>
          </Tooltip>
        )
      case 'Expired':
        return <Tag color="error" icon={<CloseCircleOutlined />}>Expired</Tag>
      case 'Perpetual':
        return <Tag color="blue" icon={<ClockCircleOutlined />}>Perpetual</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

  const columns = [
    {
      title: 'Software Name',
      dataIndex: 'software_name',
      key: 'software_name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'License Pool',
      dataIndex: 'license_name',
      key: 'license_name',
      render: (licenseName, record) => {
        if (!licenseName) return <Text type="secondary">Manual Entry</Text>
        return (
          <Tooltip title={`${record.allocated_licenses || 0} / ${record.total_licenses || 0} allocated`}>
            <Tag color="blue">{licenseName}</Tag>
          </Tooltip>
        )
      }
    },
    {
      title: 'License Key',
      dataIndex: 'license_key',
      key: 'license_key',
      render: (key, record) => {
        if (!key) return <Text type="secondary">N/A</Text>
        const isVisible = visibleKeys[record.id]
        return (
          <Space>
            <Text code>{isVisible ? key : maskLicenseKey(key)}</Text>
            <Button
              type="text"
              size="small"
              icon={isVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => toggleKeyVisibility(record.id)}
            />
          </Space>
        )
      }
    },
    {
      title: 'License Status',
      dataIndex: 'license_status',
      key: 'license_status',
      render: (status, record) => getLicenseStatusTag(status, record.days_until_expiration)
    },
    {
      title: 'Installation Date',
      dataIndex: 'installation_date',
      key: 'installation_date',
      render: (date) => date ? formatDateOnly(date) : <Text type="secondary">N/A</Text>
    },
    {
      title: 'License Expiration',
      dataIndex: 'license_expiration_date',
      key: 'license_expiration_date',
      render: (date) => date ? formatDateOnly(date) : <Text type="secondary">Perpetual</Text>
    }
  ]

  // Responsive columns for mobile
  const responsiveColumns = typeof window !== 'undefined' && window.innerWidth < 768
    ? columns.filter(col => ['software_name', 'license_status'].includes(col.key))
    : columns

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading software installations...</Text>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Software"
        description={error}
        type="error"
        showIcon
      />
    )
  }

  if (softwareData.length === 0) {
    return (
      <Alert
        message="No Software Installations"
        description="This asset does not have any software installations recorded."
        type="info"
        showIcon
      />
    )
  }

  return (
    <div>
      <Table
        columns={responsiveColumns}
        dataSource={softwareData}
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{ x: typeof window !== 'undefined' && window.innerWidth < 768 ? 300 : 800 }}
      />
    </div>
  )
}

export default AssetSoftwareView
