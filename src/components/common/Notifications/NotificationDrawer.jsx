import React, { useState, useEffect } from 'react'
import { Drawer, List, Button, Empty, Spin, Typography, Space, Tag, Select, Tabs, Divider, Badge } from 'antd'
import {
  BellOutlined,
  CheckOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  FilterOutlined,
  CloseOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import notificationApiService from '../../../services/notificationApi'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const { Title, Text } = Typography
const { Option } = Select

/**
 * NOTIFICATION DRAWER COMPONENT
 * Full-featured drawer for viewing and managing notifications
 */
const NotificationDrawer = ({ open, onClose, onNotificationRead }) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [markingAllRead, setMarkingAllRead] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [activeTab, setActiveTab] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState(null)
  const navigate = useNavigate()

  const PAGE_SIZE = 20

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = async (pageNum = 1, filter = activeTab, priority = priorityFilter) => {
    try {
      setLoading(true)
      const params = {
        page: pageNum,
        limit: PAGE_SIZE
      }

      // Apply read/unread filter
      if (filter === 'unread') {
        params.is_read = false
      } else if (filter === 'read') {
        params.is_read = true
      }

      // Apply priority filter
      if (priority) {
        params.priority = priority
      }

      const response = await notificationApiService.getNotifications(params)

      if (response?.data?.success && response.data.data) {
        const { notifications: fetchedNotifications, pagination } = response.data.data
        setNotifications(fetchedNotifications || [])
        setTotal(pagination.total || 0)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load notifications when drawer opens
   */
  useEffect(() => {
    if (open) {
      fetchNotifications(1, activeTab, priorityFilter)
    }
  }, [open, activeTab, priorityFilter])

  /**
   * Handle notification click - navigate to ticket and mark as read
   */
  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read if unread
      if (!notification.is_read) {
        await notificationApiService.markAsRead(notification.notification_id)

        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n.notification_id === notification.notification_id
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        )

        // Notify parent to refresh count
        if (onNotificationRead) {
          onNotificationRead()
        }
      }

      // Navigate to ticket details if ticket_id exists
      if (notification.ticket_id) {
        navigate(`/tickets/${notification.ticket_id}`)
        onClose() // Close drawer after navigation
      }
    } catch (error) {
      console.error('Error handling notification click:', error)
    }
  }

  /**
   * Mark all notifications as read
   */
  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllRead(true)
      await notificationApiService.markAllAsRead()

      // Refresh notifications
      await fetchNotifications(page, activeTab, priorityFilter)

      // Notify parent
      if (onNotificationRead) {
        onNotificationRead()
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    } finally {
      setMarkingAllRead(false)
    }
  }

  /**
   * Delete a notification
   */
  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation() // Prevent notification click
    try {
      await notificationApiService.deleteNotification(notificationId)

      // Remove from local state
      setNotifications(prev => prev.filter(n => n.notification_id !== notificationId))
      setTotal(prev => prev - 1)

      // Notify parent
      if (onNotificationRead) {
        onNotificationRead()
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  /**
   * Get priority icon and color
   */
  const getPriorityConfig = (priority) => {
    const configs = {
      critical: {
        icon: <ExclamationCircleOutlined />,
        color: '#ff4d4f',
        bgColor: '#fff1f0',
        tag: 'Critical'
      },
      high: {
        icon: <WarningOutlined />,
        color: '#fa8c16',
        bgColor: '#fff7e6',
        tag: 'High'
      },
      medium: {
        icon: <InfoCircleOutlined />,
        color: '#1890ff',
        bgColor: '#e6f7ff',
        tag: 'Medium'
      },
      low: {
        icon: <BellOutlined />,
        color: '#52c41a',
        bgColor: '#f6ffed',
        tag: 'Low'
      }
    }
    return configs[priority] || configs.medium
  }

  /**
   * Get notification type icon
   */
  const getTypeIcon = (type) => {
    const typeIcons = {
      warning_zone: <ClockCircleOutlined style={{ color: '#faad14' }} />,
      imminent_breach: <WarningOutlined style={{ color: '#ff7a45' }} />,
      breached: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      recurring_breach: <ExclamationCircleOutlined style={{ color: '#cf1322' }} />,
      ticket_assigned: <CheckCircleOutlined style={{ color: '#1890ff' }} />,
      status_change: <InfoCircleOutlined style={{ color: '#52c41a' }} />,
      comment_added: <BellOutlined style={{ color: '#722ed1' }} />
    }
    return typeIcons[type] || <BellOutlined />
  }

  /**
   * Render notification item
   */
  const renderNotificationItem = (notification) => {
    const priorityConfig = getPriorityConfig(notification.priority)
    const isUnread = !notification.is_read

    return (
      <List.Item
        key={notification.notification_id}
        onClick={() => handleNotificationClick(notification)}
        style={{
          cursor: 'pointer',
          backgroundColor: isUnread ? priorityConfig.bgColor : '#ffffff',
          borderLeft: isUnread ? `4px solid ${priorityConfig.color}` : '4px solid transparent',
          padding: '16px',
          transition: 'all 0.2s ease',
          marginBottom: '4px',
          borderRadius: '4px'
        }}
        className="hover:bg-gray-50"
        actions={[
          <Button
            key="delete"
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={(e) => handleDeleteNotification(notification.notification_id, e)}
          />
        ]}
      >
        <List.Item.Meta
          avatar={
            <div style={{
              fontSize: '28px',
              display: 'flex',
              alignItems: 'center',
              color: priorityConfig.color
            }}>
              {getTypeIcon(notification.notification_type)}
            </div>
          }
          title={
            <Space size={8} style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text strong={isUnread} style={{ fontSize: '14px' }}>
                {notification.title}
              </Text>
              {isUnread && (
                <Badge status="processing" color={priorityConfig.color} />
              )}
            </Space>
          }
          description={
            <div>
              <Text
                type="secondary"
                style={{
                  fontSize: '13px',
                  display: 'block',
                  marginBottom: '6px'
                }}
              >
                {notification.message}
              </Text>
              <Space size={8}>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  <ClockCircleOutlined /> {dayjs(notification.created_at).fromNow()}
                </Text>
                {notification.priority !== 'low' && (
                  <Tag
                    color={priorityConfig.color}
                    style={{
                      fontSize: '10px',
                      padding: '0 6px',
                      lineHeight: '16px'
                    }}
                  >
                    {priorityConfig.tag}
                  </Tag>
                )}
                {notification.ticket_number && (
                  <Tag style={{ fontSize: '10px', padding: '0 6px' }}>
                    {notification.ticket_number}
                  </Tag>
                )}
              </Space>
            </div>
          }
        />
      </List.Item>
    )
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const tabItems = [
    {
      key: 'all',
      label: <span>All ({total})</span>
    },
    {
      key: 'unread',
      label: <span>Unread ({unreadCount})</span>
    },
    {
      key: 'read',
      label: 'Read'
    }
  ]

  return (
    <Drawer
      title={
        <Space>
          <BellOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
          <span style={{ fontSize: '18px', fontWeight: 600 }}>Notifications</span>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={520}
      closeIcon={<CloseOutlined />}
      styles={{
        body: { padding: '0' }
      }}
    >
      {/* Controls */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Select
            placeholder="Filter by priority"
            allowClear
            style={{ width: 160 }}
            size="small"
            value={priorityFilter}
            onChange={setPriorityFilter}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="critical">Critical</Option>
            <Option value="high">High</Option>
            <Option value="medium">Medium</Option>
            <Option value="low">Low</Option>
          </Select>
          {unreadCount > 0 && (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={handleMarkAllAsRead}
              loading={markingAllRead}
            >
              Mark all read
            </Button>
          )}
        </Space>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 24px', backgroundColor: '#fff' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="small"
        />
      </div>

      {/* Notification List */}
      <div style={{ height: 'calc(100vh - 220px)', overflowY: 'auto', padding: '8px 24px' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Spin size="large" />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={`No ${activeTab === 'all' ? '' : activeTab} notifications`}
            style={{ padding: '60px 0' }}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={renderNotificationItem}
            style={{ backgroundColor: '#fafafa', padding: '4px', borderRadius: '4px' }}
          />
        )}
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #f0f0f0',
          backgroundColor: '#fafafa',
          textAlign: 'center'
        }}>
          <Space>
            <Button
              size="small"
              disabled={page === 1}
              onClick={() => fetchNotifications(page - 1, activeTab, priorityFilter)}
            >
              Previous
            </Button>
            <Text style={{ fontSize: '12px' }}>
              Page {page} of {Math.ceil(total / PAGE_SIZE)}
            </Text>
            <Button
              size="small"
              disabled={page >= Math.ceil(total / PAGE_SIZE)}
              onClick={() => fetchNotifications(page + 1, activeTab, priorityFilter)}
            >
              Next
            </Button>
          </Space>
        </div>
      )}
    </Drawer>
  )
}

export default NotificationDrawer
