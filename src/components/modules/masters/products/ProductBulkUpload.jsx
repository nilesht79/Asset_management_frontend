import React, { useState } from 'react';
import { Modal, Button, Upload, Progress, Alert, Table, Space, message } from 'antd';
import { UploadOutlined, DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import api from '../../../../services/api';

const { Dragger } = Upload;

const ProductBulkUpload = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/masters/products/bulk-upload/template', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products-bulk-upload-template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      message.error('Failed to download template');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      message.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await api.post('/masters/products/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResult(response.data.data || response.data);

      if (response.data.data?.failed === 0 || response.data.failed === 0) {
        message.success('All products uploaded successfully!');
        setTimeout(() => {
          onSuccess?.();
          handleClose();
        }, 2000);
      } else {
        message.warning('Upload completed with some errors');
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error(error.response?.data?.message || 'Upload failed');
      setUploadResult({
        total: 0,
        success: 0,
        failed: 1,
        errors: [{
          row: 0,
          error: error.response?.data?.message || error.message || 'Upload failed'
        }]
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setUploading(false);
    setUploadProgress(0);
    setUploadResult(null);
    onClose();
  };

  const uploadProps = {
    beforeUpload: (uploadFile) => {
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (!allowedTypes.includes(uploadFile.type)) {
        message.error('Invalid file type. Please upload CSV or Excel files only.');
        return false;
      }

      if (uploadFile.size > 10 * 1024 * 1024) {
        message.error('File size exceeds 10MB limit.');
        return false;
      }

      setFile(uploadFile);
      setUploadResult(null);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setFile(null);
    },
    fileList: file ? [file] : [],
    maxCount: 1,
  };

  const errorColumns = [
    {
      title: 'Row',
      dataIndex: 'row',
      key: 'row',
      width: 80,
    },
    {
      title: 'Error',
      dataIndex: 'error',
      key: 'error',
    },
  ];

  const getAlertType = () => {
    if (!uploadResult) return 'info';
    if (uploadResult.failed === 0) return 'success';
    if (uploadResult.success === 0) return 'error';
    return 'warning';
  };

  const getAlertIcon = () => {
    if (!uploadResult) return null;
    if (uploadResult.failed === 0) return <CheckCircleOutlined />;
    if (uploadResult.success === 0) return <CloseCircleOutlined />;
    return <WarningOutlined />;
  };

  return (
    <Modal
      title="Bulk Upload Products"
      open={isOpen}
      onCancel={handleClose}
      width={900}
      footer={[
        <Button key="close" onClick={handleClose}>
          {uploadResult ? 'Close' : 'Cancel'}
        </Button>,
        !uploadResult && (
          <Button
            key="upload"
            type="primary"
            onClick={handleUpload}
            loading={uploading}
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Products'}
          </Button>
        ),
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Download Template */}
        <Alert
          message="Need a template?"
          description={
            <Space>
              <span>Download our Excel template with sample data and required columns</span>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownloadTemplate}
                size="small"
              >
                Download Template
              </Button>
            </Space>
          }
          type="info"
          showIcon
        />

        {/* File Upload */}
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
            Supports CSV and Excel files (max 10MB)
          </p>
        </Dragger>

        {/* Upload Progress */}
        {uploading && (
          <div>
            <div style={{ marginBottom: 8 }}>
              <span>Uploading... {uploadProgress}%</span>
            </div>
            <Progress percent={uploadProgress} status="active" />
          </div>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Alert
              type={getAlertType()}
              icon={getAlertIcon()}
              message={
                uploadResult.failed === 0
                  ? `Successfully uploaded ${uploadResult.success} products`
                  : uploadResult.success === 0
                  ? 'Upload failed - no products were created'
                  : `Partial upload: ${uploadResult.success} succeeded, ${uploadResult.failed} failed`
              }
              description={
                <div>
                  <div>Total rows: {uploadResult.total}</div>
                  <div style={{ color: '#52c41a' }}>Success: {uploadResult.success}</div>
                  <div style={{ color: '#ff4d4f' }}>Failed: {uploadResult.failed}</div>
                </div>
              }
              showIcon
            />

            {/* Error List */}
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div>
                <div style={{
                  backgroundColor: '#fff2f0',
                  padding: '12px',
                  borderRadius: '4px 4px 0 0',
                  borderBottom: '1px solid #ffccc7'
                }}>
                  <strong style={{ color: '#cf1322' }}>
                    Errors ({uploadResult.errors.length})
                  </strong>
                </div>
                <Table
                  columns={errorColumns}
                  dataSource={uploadResult.errors}
                  pagination={false}
                  scroll={{ y: 240 }}
                  size="small"
                  rowKey={(record, index) => index}
                />
              </div>
            )}
          </Space>
        )}
      </Space>
    </Modal>
  );
};

export default ProductBulkUpload;
