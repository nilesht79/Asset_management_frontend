import React, { useState, useEffect } from 'react'
import { Table, Button, Input, Space, Modal, message, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, TeamOutlined } from '@ant-design/icons'
import DepartmentForm from './DepartmentForm'
import departmentService from '../../../../services/department'

const { Search } = Input
const { confirm } = Modal

const DepartmentMaster = () => {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [modalMode, setModalMode] = useState('create')
  const [searchText, setSearchText] = useState('')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} departments`
  })

  useEffect(() => {
    loadDepartments()
  }, [pagination.current, pagination.pageSize, searchText])

  const loadDepartments = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText || undefined
      }
      
      const response = await departmentService.getDepartments(params)
      
      if (response.data.success) {
        setDepartments(response.data.data.departments)
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination.total
        }))
      } else {
        message.error('Failed to load departments')
      }
    } catch (error) {
      console.error('Error loading departments:', error)
      message.error('Failed to load departments')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value) => {
    setSearchText(value)
    setPagination(prev => ({
      ...prev,
      current: 1
    }))
  }

  const handleCreate = () => {
    setSelectedDepartment(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setSelectedDepartment(record)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (record) => {
    confirm({
      title: 'Delete Department',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${record.name}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await departmentService.deleteDepartment(record.id)
          message.success('Department deleted successfully')
          loadDepartments()
        } catch (error) {
          message.error(error.message || 'Failed to delete department')
        }
      }
    })
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedDepartment(null)
    setModalMode('create')
  }

  const handleFormSuccess = () => {
    handleModalClose()
    loadDepartments()
  }

  const handleTableChange = (paginationInfo) => {
    setPagination({
      ...pagination,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize
    })
  }

  const columns = [
    {
      title: 'Department ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (_, __, index) => {
        const serialNumber = (pagination.current - 1) * pagination.pageSize + index + 1
        return String(serialNumber).padStart(2, '0')
      }
    },
    {
      title: 'Department Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text) => (
        <div style={{ fontWeight: 500 }}>
          {text}
        </div>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || <span style={{ color: '#999', fontStyle: 'italic' }}>No description</span>
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      render: (contactPerson) => {
        if (contactPerson) {
          return (
            <div>
              <div style={{ fontWeight: 500 }}>
                {contactPerson.firstName} {contactPerson.lastName}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {contactPerson.email}
              </div>
            </div>
          )
        }
        return <span style={{ color: '#999', fontStyle: 'italic' }}>Not assigned</span>
      }
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date) => new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ padding: '4px' }}
            title="Edit Department"
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            style={{ padding: '4px' }}
            title="Delete Department"
          />
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px', backgroundColor: '#fff' }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '24px',
        borderBottom: '1px solid #f0f0f0',
        paddingBottom: '16px'
      }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
          <TeamOutlined style={{ marginRight: '8px' }} />
          Department Master
        </h2>
        <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
          Dashboard {'>'} Master {'>'} User Management {'>'} Department Master
        </div>
      </div>

      {/* Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        gap: '16px'
      }}>
        <div style={{ flex: 1, maxWidth: '300px' }}>
          <Search
            placeholder="Search departments..."
            allowClear
            enterButton
            size="middle"
            onSearch={handleSearch}
            onChange={(e) => !e.target.value && handleSearch('')}
          />
        </div>
        
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="middle"
        >
          Add Department
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={departments}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: pagination.showSizeChanger,
          showQuickJumper: pagination.showQuickJumper,
          showTotal: pagination.showTotal,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
        scroll={{ x: 800 }}
        size="middle"
      />

      {/* Form Modal */}
      <DepartmentForm
        open={isModalOpen}
        mode={modalMode}
        department={selectedDepartment}
        onClose={handleModalClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}

export default DepartmentMaster