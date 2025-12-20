import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Badge, Button, Dropdown, Tooltip } from 'antd'
import { BellOutlined } from '@ant-design/icons'
import notificationApiService from '../../../services/notificationApi'
import NotificationDropdown from './NotificationDropdown'
import NotificationDrawer from './NotificationDrawer'

/**
 * NOTIFICATION BELL COMPONENT
 * Displays notification bell icon with unread count badge
 * Implements auto-refresh polling every 30 seconds
 */
const NotificationBell = ({ theme }) => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const pollingIntervalRef = useRef(null)

  /**
   * Fetch unread count from API
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationApiService.getUnreadCount()
      if (response?.data?.success && response.data.data) {
        setUnreadCount(response.data.data.unread_count || 0)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
      // Don't show error toast for polling - silent fail
    }
  }, [])

  /**
   * Initialize polling on mount and cleanup on unmount
   */
  useEffect(() => {
    // Initial fetch
    fetchUnreadCount()

    // Setup polling interval (30 seconds)
    pollingIntervalRef.current = setInterval(() => {
      fetchUnreadCount()
    }, 30000) // 30 seconds

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [fetchUnreadCount])

  /**
   * Handle dropdown visibility change
   */
  const handleVisibleChange = (visible) => {
    setDropdownVisible(visible)

    // Refresh count when dropdown is opened
    if (visible) {
      fetchUnreadCount()
    }
  }

  /**
   * Callback when notifications are read - refresh count
   */
  const handleNotificationRead = useCallback(() => {
    fetchUnreadCount()
  }, [fetchUnreadCount])

  /**
   * Callback when all notifications are marked as read
   */
  const handleAllRead = useCallback(() => {
    setUnreadCount(0)
    fetchUnreadCount() // Verify with server
  }, [fetchUnreadCount])

  /**
   * Open the full notifications drawer
   */
  const handleOpenDrawer = useCallback(() => {
    setDropdownVisible(false) // Close dropdown
    setDrawerVisible(true) // Open drawer
  }, [])

  return (
    <>
      <Dropdown
        open={dropdownVisible}
        onOpenChange={handleVisibleChange}
        trigger={['click']}
        placement="bottomRight"
        dropdownRender={() => (
          <NotificationDropdown
            onNotificationRead={handleNotificationRead}
            onAllRead={handleAllRead}
            onClose={() => setDropdownVisible(false)}
            onViewAll={handleOpenDrawer}
          />
        )}
      >
      <Tooltip title="Notifications">
        <Badge
          count={unreadCount}
          size="small"
          color={theme?.accent || '#1890ff'}
          offset={[-6, 4]}
          overflowCount={99}
        >
          <Button
            type="text"
            icon={<BellOutlined />}
            className="text-gray-600 hover:text-current transition-colors duration-200"
            style={{
              color: theme?.accent || '#1890ff',
              fontSize: '18px',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        </Badge>
      </Tooltip>
    </Dropdown>

    {/* Full Notifications Drawer */}
    <NotificationDrawer
      open={drawerVisible}
      onClose={() => setDrawerVisible(false)}
      onNotificationRead={handleNotificationRead}
    />
    </>
  )
}

export default NotificationBell
