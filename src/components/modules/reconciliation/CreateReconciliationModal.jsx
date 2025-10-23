import { Modal, Form, Input, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { createReconciliation, selectReconciliationLoading } from '../../../store/slices/reconciliationSlice';

const { TextArea } = Input;

const CreateReconciliationModal = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const loading = useSelector(selectReconciliationLoading);

  const handleSubmit = async (values) => {
    try {
      await dispatch(createReconciliation(values)).unwrap();
      message.success('Reconciliation process created successfully');
      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error(error || 'Failed to create reconciliation process');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Create New Reconciliation Process"
      open={visible}
      onOk={form.submit}
      onCancel={handleCancel}
      okText="Create"
      cancelText="Cancel"
      confirmLoading={loading}
      width={600}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: '24px' }}
      >
        <Form.Item
          label="Reconciliation Name"
          name="reconciliation_name"
          rules={[
            { required: true, message: 'Please enter reconciliation name' },
            { min: 3, message: 'Name must be at least 3 characters' },
            { max: 255, message: 'Name must not exceed 255 characters' }
          ]}
        >
          <Input
            placeholder="e.g., Q4 2025 Asset Reconciliation"
            showCount
            maxLength={255}
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Description (Optional)"
          name="description"
          rules={[
            { max: 5000, message: 'Description must not exceed 5000 characters' }
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Enter a description for this reconciliation process..."
            showCount
            maxLength={5000}
          />
        </Form.Item>

        <Form.Item
          label="Notes (Optional)"
          name="notes"
          rules={[
            { max: 5000, message: 'Notes must not exceed 5000 characters' }
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Any additional notes..."
            showCount
            maxLength={5000}
          />
        </Form.Item>
      </Form>

      <div className="mt-4 p-4 bg-blue-50 rounded">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> After creating the reconciliation process, you will need to start it before you can reconcile assets.
        </p>
      </div>
    </Modal>
  );
};

export default CreateReconciliationModal;
