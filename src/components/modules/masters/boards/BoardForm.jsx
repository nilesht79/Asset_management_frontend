import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Form, Input, Select, Switch, Button, message, Space, Spin } from 'antd'
import PropTypes from 'prop-types'
import { createBoard, updateBoard, fetchBoardById } from '../../../../store/slices/masterSlice'
import departmentService from '../../../../services/department'
import boardService from '../../../../services/board'

const { TextArea } = Input

const BoardForm = ({ mode, board, onSuccess, onCancel }) => {
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [loadingBoard, setLoadingBoard] = useState(false)
  const [departments, setDepartments] = useState([])
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [boardDetails, setBoardDetails] = useState(null)

  // Load departments for multi-select
  const loadDepartments = async () => {
    setLoadingDepartments(true)
    try {
      const response = await departmentService.getDepartments({ limit: 1000 })
      if (response.data.success) {
        const depts = response.data.data.departments || []
        setDepartments(depts)
      }
    } catch (error) {
      console.error('Error loading departments:', error)
      message.error('Failed to load departments')
    } finally {
      setLoadingDepartments(false)
    }
  }

  // Load board details with departments for edit mode
  const loadBoardDetails = async (boardId) => {
    setLoadingBoard(true)
    try {
      const response = await boardService.getBoardById(boardId)
      if (response.data.success) {
        const details = response.data.data.board
        setBoardDetails(details)

        // Extract department IDs from departments array
        const departmentIds = details.departments?.map(d => d.id) || []

        form.setFieldsValue({
          name: details.name || '',
          description: details.description || '',
          isActive: details.isActive !== undefined ? details.isActive : true,
          departmentIds: departmentIds
        })
      }
    } catch (error) {
      console.error('Error loading board details:', error)
      message.error('Failed to load board details')
    } finally {
      setLoadingBoard(false)
    }
  }

  useEffect(() => {
    loadDepartments()
  }, [])

  useEffect(() => {
    if (board && mode === 'edit') {
      loadBoardDetails(board.id)
    } else if (mode === 'create') {
      form.setFieldsValue({
        isActive: true
      })
    }
  }, [form, board, mode])

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      if (mode === 'create') {
        await dispatch(createBoard(values)).unwrap()
        message.success('Board created successfully')
      } else if (mode === 'edit') {
        await dispatch(updateBoard({ id: board.id, data: values })).unwrap()
        message.success('Board updated successfully')
      }

      form.resetFields()
      onSuccess()
    } catch (error) {
      console.error(`Failed to ${mode} board:`, error)
      message.error(error.message || `Failed to ${mode} board`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  if (loadingBoard) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" tip="Loading board details..." />
      </div>
    )
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      autoComplete="off"
    >
      <Form.Item
        name="name"
        label="Board Name"
        rules={[
          { required: true, message: 'Please enter board name' },
          { min: 2, message: 'Board name must be at least 2 characters' },
          { max: 100, message: 'Board name cannot exceed 100 characters' }
        ]}
      >
        <Input placeholder="Enter board name" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[
          { max: 500, message: 'Description cannot exceed 500 characters' }
        ]}
      >
        <TextArea
          rows={3}
          placeholder="Enter board description (optional)"
        />
      </Form.Item>

      <Form.Item
        name="departmentIds"
        label="Assign Departments"
        tooltip="Select departments that belong to this board. A department can be assigned to multiple boards."
      >
        <Select
          mode="multiple"
          placeholder="Select departments"
          loading={loadingDepartments}
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
          allowClear
        >
          {departments.map(dept => (
            <Select.Option key={dept.id} value={dept.id}>
              {dept.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {mode === 'edit' && (
        <Form.Item
          name="isActive"
          label="Status"
          valuePropName="checked"
        >
          <Switch
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
        </Form.Item>
      )}

      <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
        <Space style={{ float: 'right' }}>
          <Button onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {mode === 'create' ? 'Create Board' : 'Update Board'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

BoardForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  board: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
}

export default BoardForm
