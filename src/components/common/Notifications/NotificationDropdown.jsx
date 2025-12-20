import React, { useState, useEffect } from 'react'
import { List, Button, Empty, Spin, Typography, Space, Tag, Divider } from 'antd'
import {
  BellOutlined,
  CheckOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import notificationApiService from '../../../services/notificationApi'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const { Text, Title } = Typography

/**
 * NOTIFICATION DROPDOWN COMPONENT
 * Displays notification list with mark as read functionality
 */
const NotificationDropdown = ({ onNotificationRead, onAllRead, onClose, onViewAll }) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [markingAllRead, setMarkingAllRead] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const navigate = useNavigate()

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = async (pageNum = 1) => {
    try {
      setLoading(true)
      const response = await notificationApiService.getNotifications({
        page: pageNum,
        limit: 10,
        // Fetch all but show unread first via sorting in display
      })

      if (response?.data?.success && response.data.data) {
        const { notifications: fetchedNotifications, pagination } = response.data.data

        if (pageNum === 1) {
          setNotifications(fetchedNotifications || [])
        } else {
          setNotifications(prev => [...prev, ...(fetchedNotifications || [])])
        }

        setHasMore(
          pagination.page < pagination.totalPages
        )
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load notifications on mount
   */
  useEffect(() => {
    console.log('🔔 NotificationDropdown mounted - fetching notifications...')
    fetchNotifications(1)
  }, [])

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

        // Close dropdown
        if (onClose) {
          onClose()
        }
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

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString()
        }))
      )

      // Notify parent
      if (onAllRead) {
        onAllRead()
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

      // Notify parent to refresh count
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
          padding: '12px 16px',
          transition: 'all 0.2s ease'
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
            style={{ fontSize: '12px' }}
          />
        ]}
      >
        <List.Item.Meta
          avatar={
            <div style={{
              fontSize: '24px',
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
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: priorityConfig.color,
                    flexShrink: 0
                  }}
                />
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
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {dayjs(notification.created_at).fromNow()}
                </Text>
                {notification.priority !== 'low' && (
                  <Tag
                    color={priorityConfig.color}
                    style={{
                      fontSize: '11px',
                      padding: '0 6px',
                      lineHeight: '18px'
                    }}
                  >
                    {priorityConfig.tag}
                  </Tag>
                )}
              </Space>
            </div>
          }
        />
      </List.Item>
    )
  }

  /**
   * Load more notifications
   */
  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchNotifications(nextPage)
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div
      style={{
        width: '420px',
        maxHeight: '600px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fafafa'
        }}
      >
        <Space>
          <BellOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
          <Title level={5} style={{ margin: 0 }}>
            Notifications
          </Title>
          {unreadCount > 0 && (
            <Tag color="blue" style={{ marginLeft: '8px' }}>
              {unreadCount} unread
            </Tag>
          )}
        </Space>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined />}
            onClick={handleMarkAllAsRead}
            loading={markingAllRead}
            style={{ padding: '4px 8px' }}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Notification List */}
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {loading && notifications.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Spin size="large" />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No notifications"
            style={{ padding: '40px' }}
          />
        ) : (
          <>
            <List
              dataSource={notifications}
              renderItem={renderNotificationItem}
              split={true}
              style={{ backgroundColor: '#fff' }}
            />
            {hasMore && (
              <div style={{ padding: '12px', textAlign: 'center' }}>
                <Button
                  type="link"
                  onClick={handleLoadMore}
                  loading={loading}
                >
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Divider style={{ margin: 0 }} />
          <div
            style={{
              padding: '12px 20px',
              textAlign: 'center',
              backgroundColor: '#fafafa'
            }}
          >
            <Button
              type="link"
              onClick={() => {
                if (onViewAll) {
                  onViewAll()
                }
                if (onClose) onClose()
              }}
            >
              View all notifications
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationDropdown
