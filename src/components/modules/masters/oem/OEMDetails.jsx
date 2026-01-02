import React from 'react'
import { Modal, Descriptions, Tag, Space, Button, Divider } from 'antd'
import {
  GlobalOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  CalendarOutlined,
  ShoppingOutlined
} from '@ant-design/icons'
import { formatDateOnly } from '../../../../utils/dateUtils'

const OEMDetails = ({ visible, onClose, oem }) => {
  if (!oem) return null

  const getStatusTag = (status) => {
    return (
      <Tag color={status === 'active' ? 'green' : 'red'}>
        {status.toUpperCase()}
      </Tag>
    )
  }

  return (
    <Modal
      title={
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
            <GlobalOutlined className="text-white text-lg" />
          </div>
          <div>
            <div className="text-xl font-semibold text-gray-900">{oem.name}</div>
            <div className="text-sm text-gray-500">OEM Details</div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>
      ]}
      destroyOnClose
    >
      <div className="py-4">
        {/* Basic Information */}
        <Descriptions
          title="Basic Information"
          bordered
          column={2}
          size="small"
          className="mb-6"
        >
          <Descriptions.Item label="OEM Code" span={1}>
            <Tag color="blue" className="font-mono text-sm">
              {oem.code}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status" span={1}>
            {getStatusTag(oem.status)}
          </Descriptions.Item>
          <Descriptions.Item label="OEM Name" span={2}>
            <span className="font-semibold text-gray-900">{oem.name}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {oem.description || 'No description provided'}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Contact Information */}
        <Descriptions
          title="Contact Information"
          bordered
          column={1}
          size="small"
          className="mb-6"
        >
          <Descriptions.Item 
            label={
              <Space>
                <UserOutlined className="text-blue-500" />
                Contact Person
              </Space>
            }
          >
            <span className="font-medium">{oem.contactPerson}</span>
          </Descriptions.Item>
          <Descriptions.Item 
            label={
              <Space>
                <MailOutlined className="text-green-500" />
                Email Address
              </Space>
            }
          >
            <a 
              href={`mailto:${oem.contactEmail}`} 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {oem.contactEmail}
            </a>
          </Descriptions.Item>
          <Descriptions.Item 
            label={
              <Space>
                <PhoneOutlined className="text-orange-500" />
                Phone Number
              </Space>
            }
          >
            <a 
              href={`tel:${oem.contactPhone}`} 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {oem.contactPhone}
            </a>
          </Descriptions.Item>
          <Descriptions.Item 
            label={
              <Space>
                <GlobalOutlined className="text-purple-500" />
                Website
              </Space>
            }
          >
            {oem.website ? (
              <a 
                href={oem.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {oem.website}
              </a>
            ) : (
              'Not provided'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Business Address">
            <div className="whitespace-pre-line">{oem.address}</div>
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Statistics & Dates */}
        <Descriptions
          title="Statistics & Timeline"
          bordered
          column={2}
          size="small"
          className="mb-6"
        >
          <Descriptions.Item 
            label={
              <Space>
                <ShoppingOutlined className="text-green-500" />
                Products Count
              </Space>
            }
          >
            <Tag color="green" className="font-semibold">
              {oem.productsCount} Products
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Active Status">
            {oem.status === 'active' ? (
              <span className="text-green-600 font-medium">✓ Currently Active</span>
            ) : (
              <span className="text-red-600 font-medium">✗ Currently Inactive</span>
            )}
          </Descriptions.Item>
          <Descriptions.Item 
            label={
              <Space>
                <CalendarOutlined className="text-blue-500" />
                Created Date
              </Space>
            }
          >
            <span className="font-medium">{formatDateOnly(oem.createdAt)}</span>
          </Descriptions.Item>
          <Descriptions.Item 
            label={
              <Space>
                <CalendarOutlined className="text-orange-500" />
                Last Updated
              </Space>
            }
          >
            <span className="font-medium">{formatDateOnly(oem.updatedAt)}</span>
          </Descriptions.Item>
        </Descriptions>

        {/* Quick Actions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Quick Actions</div>
              <div className="text-sm text-gray-500">Manage this OEM</div>
            </div>
            <Space>
              <Button 
                type="primary" 
                size="small"
                className="bg-gradient-to-r from-blue-600 to-blue-700 border-0"
              >
                View Products
              </Button>
              <Button 
                type="default" 
                size="small"
              >
                View History
              </Button>
            </Space>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default OEMDetails