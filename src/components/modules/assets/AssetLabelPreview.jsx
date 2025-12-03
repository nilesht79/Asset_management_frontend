import { Modal, Button, Space, Divider, Row, Col, Typography, Tag, Spin, message } from 'antd'
import { QrcodeOutlined, DownloadOutlined, PrinterOutlined, CloseOutlined } from '@ant-design/icons'
import { QRCodeSVG } from 'react-qr-code'
import { useState, useEffect } from 'react'
import assetService from '../../../services/asset'

const { Text, Title } = Typography

/**
 * Asset Label Preview Component
 * Displays a preview of the asset label with QR code
 */
const AssetLabelPreview = ({ visible, onClose, assetId }) => {
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [labelData, setLabelData] = useState(null)

  useEffect(() => {
    if (visible && assetId) {
      fetchLabelData()
    }
  }, [visible, assetId])

  const fetchLabelData = async () => {
    setLoading(true)
    try {
      const response = await assetService.getLabelPreview(assetId)
      if (response.success) {
        setLabelData(response.data)
      } else {
        message.error('Failed to load label data')
      }
    } catch (error) {
      console.error('Error fetching label data:', error)
      message.error(error.message || 'Failed to load label data')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const response = await assetService.downloadLabel(assetId)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `asset-label-${labelData?.asset_tag || assetId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      message.success('Label downloaded successfully')
    } catch (error) {
      console.error('Error downloading label:', error)
      message.error(error.message || 'Failed to download label')
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = async () => {
    try {
      // Download PDF and open in new tab for printing
      const response = await assetService.downloadLabel(assetId)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const printWindow = window.open(url, '_blank')
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      }
    } catch (error) {
      console.error('Error printing label:', error)
      message.error(error.message || 'Failed to print label')
    }
  }

  return (
    <Modal
      title={
        <Space>
          <QrcodeOutlined />
          <span>Asset Label Preview</span>
          {labelData && <Tag color="blue">{labelData.asset_tag}</Tag>}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="close" icon={<CloseOutlined />} onClick={onClose}>
          Close
        </Button>,
        <Button key="print" icon={<PrinterOutlined />} onClick={handlePrint} disabled={!labelData}>
          Print
        </Button>,
        <Button
          key="download"
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          loading={downloading}
          disabled={!labelData}
        >
          Download PDF
        </Button>,
      ]}
    >
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" tip="Loading label data..." />
        </div>
      ) : labelData ? (
        <div className="space-y-4">
          {/* Label Preview Card */}
          <div className="border-2 border-gray-300 rounded-lg p-6 bg-white">
            <div className="text-center mb-4">
              <Title level={4} className="mb-1">POLESTAR</Title>
              <Text type="secondary" className="text-xs">Asset Management System</Text>
            </div>

            <Divider className="my-4" />

            <Row gutter={24}>
              {/* Left Side - QR Code */}
              <Col span={10}>
                <div className="flex flex-col items-center">
                  <div className="border-2 border-gray-200 p-3 rounded bg-white">
                    <QRCodeSVG
                      value={labelData.assetCode}
                      size={160}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <Text strong className="text-sm font-mono">
                      {labelData.assetCode}
                    </Text>
                  </div>
                </div>
              </Col>

              {/* Right Side - Asset Details */}
              <Col span={14}>
                <div className="space-y-3">
                  <div>
                    <Text type="secondary" className="text-xs">Asset Tag:</Text>
                    <div>
                      <Text strong className="text-sm">{labelData.asset_tag}</Text>
                    </div>
                  </div>

                  <div>
                    <Text type="secondary" className="text-xs">Product:</Text>
                    <div>
                      <Text className="text-sm">{labelData.product_name || 'N/A'}</Text>
                    </div>
                  </div>

                  <div>
                    <Text type="secondary" className="text-xs">Serial Number:</Text>
                    <div>
                      <Text className="text-sm font-mono">{labelData.serial_number || 'N/A'}</Text>
                    </div>
                  </div>

                  <div>
                    <Text type="secondary" className="text-xs">Location:</Text>
                    <div>
                      <Text className="text-sm">{labelData.location_name || 'N/A'}</Text>
                    </div>
                  </div>

                  <div>
                    <Text type="secondary" className="text-xs">Department:</Text>
                    <div>
                      <Text className="text-sm">{labelData.department_name || 'N/A'}</Text>
                    </div>
                  </div>

                  <div>
                    <Text type="secondary" className="text-xs">Status:</Text>
                    <div>
                      <Tag color="blue" className="text-xs">
                        {labelData.status ? labelData.status.toUpperCase() : 'N/A'}
                      </Tag>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>

            <Divider className="my-4" />

            <div className="text-center">
              <Text type="secondary" className="text-xs">
                Generated: {new Date(labelData.generatedAt).toLocaleDateString('en-GB')}
              </Text>
            </div>
          </div>

          {/* Asset Code Breakdown */}
          <div className="bg-gray-50 p-4 rounded">
            <Text strong className="text-sm">Asset Code Breakdown:</Text>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between">
                <Text type="secondary" className="text-xs">Organization:</Text>
                <Text className="text-xs font-mono">{labelData.codeBreakdown.org}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary" className="text-xs">Sub Organization:</Text>
                <Text className="text-xs font-mono">{labelData.codeBreakdown.subOrg}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary" className="text-xs">Department Code:</Text>
                <Text className="text-xs font-mono">
                  {labelData.codeBreakdown.department} ({labelData.department_name || 'N/A'})
                </Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary" className="text-xs">Location Code:</Text>
                <Text className="text-xs font-mono">
                  {labelData.codeBreakdown.location} ({labelData.location_name || 'N/A'})
                </Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary" className="text-xs">Asset Type:</Text>
                <Text className="text-xs font-mono">
                  {labelData.codeBreakdown.assetType} ({labelData.category_name || 'N/A'})
                </Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary" className="text-xs">OEM Code:</Text>
                <Text className="text-xs font-mono">
                  {labelData.codeBreakdown.oem} ({labelData.oem_name || 'N/A'})
                </Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary" className="text-xs">Asset Number:</Text>
                <Text className="text-xs font-mono">
                  {labelData.codeBreakdown.assetNumber} (from S/N: {labelData.serial_number || 'N/A'})
                </Text>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 p-3 rounded">
            <Text className="text-xs">
              <strong>Note:</strong> The label will be generated in 4" x 2" size format, optimized for standard label printers.
              The QR code contains the complete asset code for easy scanning and identification.
            </Text>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <Text type="secondary">No label data available</Text>
        </div>
      )}
    </Modal>
  )
}

export default AssetLabelPreview
