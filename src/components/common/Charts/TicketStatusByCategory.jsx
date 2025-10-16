import React from 'react'
import { Card, Row, Col, Badge, Collapse, Empty } from 'antd'
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  CloseCircleOutlined,
  SyncOutlined
} from '@ant-design/icons'

const { Panel } = Collapse

/**
 * Ticket Status by Category Component
 * Displays ticket counts grouped by category with status breakdown
 * Shows both today's tickets and total tickets
 */
const TicketStatusByCategory = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Empty
        description="No ticket data available"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    )
  }

  const statusConfig = {
    open: { icon: <AlertOutlined />, color: 'blue', label: 'Open' },
    assigned: { icon: <SyncOutlined />, color: 'orange', label: 'Assigned' },
    in_progress: { icon: <ClockCircleOutlined />, color: 'purple', label: 'In Progress' },
    pending: { icon: <ClockCircleOutlined />, color: 'gold', label: 'Pending' },
    resolved: { icon: <CheckCircleOutlined />, color: 'green', label: 'Resolved' },
    closed: { icon: <CloseCircleOutlined />, color: 'default', label: 'Closed' }
  }

  const renderStatusBadge = (status, count, todayCount) => {
    const config = statusConfig[status]
    if (!config) return null

    return (
      <div key={status} className="flex items-center justify-between p-2 bg-gray-50 rounded mb-2">
        <div className="flex items-center space-x-2">
          <span className={`text-${config.color}-500`}>{config.icon}</span>
          <span className="text-sm font-medium">{config.label}</span>
        </div>
        <div className="flex items-center space-x-3">
          {todayCount > 0 && (
            <Badge
              count={todayCount}
              showZero
              style={{ backgroundColor: '#52c41a' }}
              title="Today's tickets"
            />
          )}
          <span className="text-sm font-bold">{count}</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Collapse
        defaultActiveKey={[data[0]?.category]}
        ghost
        expandIconPosition="end"
      >
        {data.map((category) => {
          const total = category.total_tickets || 0
          const todayTotal = category.today_total || 0

          return (
            <Panel
              key={category.category}
              header={
                <div className="flex items-center justify-between pr-4">
                  <div className="flex items-center space-x-3">
                    <FileTextOutlined className="text-lg text-blue-500" />
                    <span className="font-semibold text-base">{category.category}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    {todayTotal > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Today:</span>
                        <Badge
                          count={todayTotal}
                          showZero
                          style={{ backgroundColor: '#52c41a' }}
                        />
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Total:</span>
                      <Badge count={total} showZero />
                    </div>
                  </div>
                </div>
              }
            >
              <div className="pl-4 pr-2">
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Status Breakdown</h4>
                    {renderStatusBadge('open', category.open_tickets || 0, category.today_open || 0)}
                    {renderStatusBadge('assigned', category.assigned_tickets || 0, category.today_assigned || 0)}
                    {renderStatusBadge('in_progress', category.in_progress_tickets || 0, category.today_in_progress || 0)}
                  </Col>
                  <Col span={12}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">&nbsp;</h4>
                    {renderStatusBadge('pending', category.pending_tickets || 0, 0)}
                    {renderStatusBadge('resolved', category.resolved_tickets || 0, category.today_resolved || 0)}
                    {renderStatusBadge('closed', category.closed_tickets || 0, category.today_closed || 0)}
                  </Col>
                </Row>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Today's Tickets:</span>
                    <span className="font-bold text-green-600">{todayTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">All Time Total:</span>
                    <span className="font-bold text-blue-600">{total}</span>
                  </div>
                </div>
              </div>
            </Panel>
          )
        })}
      </Collapse>
    </div>
  )
}

export default TicketStatusByCategory
