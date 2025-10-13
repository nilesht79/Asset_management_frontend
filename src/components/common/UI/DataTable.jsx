import React, { useState } from 'react'
import { Table, Input, Button, Space, Card } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'

const { Search } = Input

const DataTable = ({ 
  title,
  data = [],
  columns = [],
  loading = false,
  pagination = {},
  selectedRowKeys = [],
  onSelectionChange,
  onRefresh,
  searchable = true,
  searchPlaceholder = "Search...",
  onSearch,
  actions,
  rowSelection = true,
  ...tableProps
}) => {
  const [searchText, setSearchText] = useState('')

  const handleSearch = (value) => {
    setSearchText(value)
    if (onSearch) {
      onSearch(value)
    }
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    }
  }

  const rowSelectionConfig = rowSelection ? {
    selectedRowKeys,
    onChange: onSelectionChange,
    getCheckboxProps: (record) => ({
      disabled: record.disabled || false,
    }),
  } : undefined

  return (
    <Card 
      className="shadow-sm border-0"
      title={title}
      extra={
        <Space>
          {searchable && (
            <Search
              placeholder={searchPlaceholder}
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              style={{ width: 250 }}
            />
          )}
          
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
          
          {actions}
        </Space>
      }
    >
      <Table
        {...tableProps}
        dataSource={data}
        columns={columns}
        loading={loading}
        rowSelection={rowSelectionConfig}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} items`,
          ...pagination,
        }}
        scroll={{ x: 'max-content' }}
        size="middle"
      />
    </Card>
  )
}

export default DataTable