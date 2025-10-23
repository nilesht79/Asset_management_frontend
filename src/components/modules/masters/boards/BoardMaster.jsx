import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Button, Input, Space, Modal, message, Tag, Tooltip } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  TeamOutlined
} from '@ant-design/icons'
import BoardForm from './BoardForm'
import { fetchBoards, deleteBoard } from '../../../../store/slices/masterSlice'
import { usePermissions } from '../../../../hooks/usePermissions'

const { Search } = Input
const { confirm } = Modal

const BoardMaster = () => {
  const dispatch = useDispatch()
  const { boards } = useSelector((state) => state.master)
  const { hasPermission } = usePermissions()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBoard, setSelectedBoard] = useState(null)
  const [modalMode, setModalMode] = useState('create')
  const [searchText, setSearchText] = useState('')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} boards`
  })

  useEffect(() => {
    loadBoards()
  }, [pagination.current, pagination.pageSize, searchText])

  const loadBoards = () => {
    const params = {
      page: pagination.current,
      limit: pagination.pageSize,
      search: searchText || undefined
    }
    dispatch(fetchBoards(params))
  }

  useEffect(() => {
    if (boards.total !== undefined) {
      setPagination(prev => ({
        ...prev,
        total: boards.total
      }))
    }
  }, [boards.total])

  const handleSearch = (value) => {
    setSearchText(value)
    setPagination(prev => ({
      ...prev,
      current: 1
    }))
  }

  const handleCreate = () => {
    setSelectedBoard(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setSelectedBoard(record)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (record) => {
    confirm({
      title: 'Delete Board',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${record.name}"? This will also remove all department assignments for this board.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(deleteBoard(record.id)).unwrap()
          message.success('Board deleted successfully')
        } catch (error) {
          message.error(error.message || 'Failed to delete board')
        }
      }
    })
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedBoard(null)
    setModalMode('create')
  }

  const handleFormSuccess = () => {
    handleModalClose()
    loadBoards()
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
      title: 'Board ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (_, __, index) => {
        const serialNumber = (pagination.current - 1) * pagination.pageSize + index + 1
        return String(serialNumber).padStart(2, '0')
      }
    },
    {
      title: 'Board Name',
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
      title: 'Departments',
      dataIndex: 'departmentCount',
      key: 'departmentCount',
      width: 130,
      align: 'center',
      render: (count) => (
        <Tooltip title={`${count} department(s) assigned`}>
          <Tag color="blue" icon={<TeamOutlined />}>
            {count}
          </Tag>
        </Tooltip>
      )
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {hasPermission('boards.update') && (
            <Tooltip title="Edit Board">
              <Button
                type="primary"
                ghost
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
          )}
          {hasPermission('boards.delete') && (
            <Tooltip title="Delete Board">
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Board Master</h2>
        <Space>
          <Search
            placeholder="Search boards..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 250 }}
          />
          {hasPermission('boards.create') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Add Board
            </Button>
          )}
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={boards.data}
        rowKey="id"
        loading={boards.loading}
        pagination={{
          ...pagination,
          total: boards.total
        }}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={modalMode === 'create' ? 'Create New Board' : 'Edit Board'}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        destroyOnClose
      >
        <BoardForm
          mode={modalMode}
          board={selectedBoard}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  )
}

export default BoardMaster
