import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Statistic,
  Tag,
  Typography,
  Space,
  Divider,
  message,
  Empty
} from 'antd';
import {
  ToolOutlined,
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import serviceReportService from '../services/serviceReport';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const SparePartsReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({ summary: [], details: [] });
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'details'

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.date_from = dateRange[0].format('YYYY-MM-DD');
        params.date_to = dateRange[1].format('YYYY-MM-DD');
      }
      if (categoryFilter) {
        params.category_id = categoryFilter;
      }

      const response = await serviceReportService.getPartsConsumptionReport(params);
      setReportData(response.data?.data || { summary: [], details: [] });
    } catch (error) {
      console.error('Failed to fetch report:', error);
      message.error('Failed to load spare parts consumption report');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  const handleApplyFilter = () => {
    fetchReport();
  };

  const handleExportCSV = () => {
    const data = viewMode === 'summary' ? reportData.summary : reportData.details;
    if (!data || data.length === 0) {
      message.warning('No data to export');
      return;
    }

    // Create CSV content
    let csvContent = '';
    const headers = Object.keys(data[0]);
    csvContent += headers.join(',') + '\n';

    data.forEach(row => {
      const values = headers.map(h => {
        let value = row[h] || '';
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
      });
      csvContent += values.join(',') + '\n';
    });

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `spare_parts_report_${dayjs().format('YYYY-MM-DD')}.csv`;
    link.click();
  };

  // Calculate totals
  const totalUnitsUsed = reportData.summary.reduce((sum, item) => sum + (item.total_units_used || 0), 0);
  const totalQuantity = reportData.summary.reduce((sum, item) => sum + (item.total_quantity || 0), 0);
  const totalCost = reportData.summary.reduce((sum, item) => sum + parseFloat(item.total_cost || 0), 0);

  const summaryColumns = [
    {
      title: 'Product/Part',
      dataIndex: 'product_name',
      key: 'product_name',
      sorter: (a, b) => (a.product_name || '').localeCompare(b.product_name || '')
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
      render: (text) => text || 'Uncategorized'
    },
    {
      title: 'Units Used',
      dataIndex: 'total_units_used',
      key: 'total_units_used',
      align: 'center',
      sorter: (a, b) => (a.total_units_used || 0) - (b.total_units_used || 0)
    },
    {
      title: 'Total Quantity',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      align: 'center',
      sorter: (a, b) => (a.total_quantity || 0) - (b.total_quantity || 0)
    },
    {
      title: 'Total Cost',
      dataIndex: 'total_cost',
      key: 'total_cost',
      align: 'right',
      render: (value) => `₹${parseFloat(value || 0).toFixed(2)}`,
      sorter: (a, b) => parseFloat(a.total_cost || 0) - parseFloat(b.total_cost || 0)
    }
  ];

  const detailColumns = [
    {
      title: 'Report #',
      dataIndex: 'report_number',
      key: 'report_number',
      width: 120
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 100,
      render: (date) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: 'Ticket',
      dataIndex: 'ticket_number',
      key: 'ticket_number',
      width: 120
    },
    {
      title: 'Main Asset',
      dataIndex: 'main_asset',
      key: 'main_asset',
      width: 150,
      render: (text) => text || '-'
    },
    {
      title: 'Part Used',
      key: 'part',
      render: (_, record) => (
        <div>
          <div>{record.part_product_name}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.part_asset_tag}
          </Text>
        </div>
      )
    },
    {
      title: 'Category',
      dataIndex: 'part_category',
      key: 'part_category',
      render: (text) => text || '-'
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: 60
    },
    {
      title: 'Unit Cost',
      dataIndex: 'unit_cost',
      key: 'unit_cost',
      align: 'right',
      width: 100,
      render: (value) => `₹${parseFloat(value || 0).toFixed(2)}`
    },
    {
      title: 'Total',
      dataIndex: 'total_cost',
      key: 'total_cost',
      align: 'right',
      width: 100,
      render: (value) => `₹${parseFloat(value || 0).toFixed(2)}`
    },
    {
      title: 'Engineer',
      dataIndex: 'engineer_name',
      key: 'engineer_name',
      width: 150
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3}>
          <ToolOutlined style={{ marginRight: 8 }} />
          Spare Parts Consumption Report
        </Title>
        <Text type="secondary">
          Track spare parts usage across all repair services
        </Text>
      </div>

      {/* Filters */}
      <Card size="small" className="mb-4">
        <Row gutter={[16, 12]} align="middle">
          <Col>
            <Space>
              <FilterOutlined />
              <Text strong>Filters:</Text>
            </Space>
          </Col>
          <Col>
            <RangePicker
              value={dateRange}
              onChange={handleDateChange}
              format="YYYY-MM-DD"
            />
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleApplyFilter}
            >
              Apply
            </Button>
          </Col>
          <Col flex="auto" />
          <Col>
            <Space>
              <Select
                value={viewMode}
                onChange={setViewMode}
                style={{ width: 120 }}
              >
                <Option value="summary">Summary</Option>
                <Option value="details">Details</Option>
              </Select>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>
            </Space>
          </Col>
        </Row>
        <Divider style={{ margin: '12px 0' }} />
        <Row gutter={8}>
          <Col>
            <Text type="secondary" style={{ marginRight: 8 }}>Quick Presets:</Text>
          </Col>
          <Col>
            <Space size={4} wrap>
              <Button
                size="small"
                onClick={() => {
                  setDateRange([dayjs().subtract(30, 'day'), dayjs()]);
                  setTimeout(() => fetchReport(), 0);
                }}
              >
                Last 30 Days
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setDateRange([dayjs().subtract(60, 'day'), dayjs()]);
                  setTimeout(() => fetchReport(), 0);
                }}
              >
                Last 60 Days
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setDateRange([dayjs().subtract(90, 'day'), dayjs()]);
                  setTimeout(() => fetchReport(), 0);
                }}
              >
                Last 90 Days
              </Button>
              <Divider type="vertical" />
              <Button
                size="small"
                onClick={() => {
                  const year = dayjs().year();
                  setDateRange([dayjs(`${year}-01-01`), dayjs(`${year}-03-31`)]);
                  setTimeout(() => fetchReport(), 0);
                }}
              >
                Q1 {dayjs().year()}
              </Button>
              <Button
                size="small"
                onClick={() => {
                  const year = dayjs().year();
                  setDateRange([dayjs(`${year}-04-01`), dayjs(`${year}-06-30`)]);
                  setTimeout(() => fetchReport(), 0);
                }}
              >
                Q2 {dayjs().year()}
              </Button>
              <Button
                size="small"
                onClick={() => {
                  const year = dayjs().year();
                  setDateRange([dayjs(`${year}-07-01`), dayjs(`${year}-09-30`)]);
                  setTimeout(() => fetchReport(), 0);
                }}
              >
                Q3 {dayjs().year()}
              </Button>
              <Button
                size="small"
                onClick={() => {
                  const year = dayjs().year();
                  setDateRange([dayjs(`${year}-10-01`), dayjs(`${year}-12-31`)]);
                  setTimeout(() => fetchReport(), 0);
                }}
              >
                Q4 {dayjs().year()}
              </Button>
              <Divider type="vertical" />
              <Button
                size="small"
                onClick={() => {
                  setDateRange([dayjs().startOf('year'), dayjs()]);
                  setTimeout(() => fetchReport(), 0);
                }}
              >
                YTD
              </Button>
              <Button
                size="small"
                onClick={() => {
                  const lastYear = dayjs().year() - 1;
                  setDateRange([dayjs(`${lastYear}-01-01`), dayjs(`${lastYear}-12-31`)]);
                  setTimeout(() => fetchReport(), 0);
                }}
              >
                Full Year {dayjs().year() - 1}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} className="mb-4">
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Parts Used"
              value={totalUnitsUsed}
              prefix={<ToolOutlined />}
              suffix="units"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Quantity"
              value={totalQuantity}
              prefix={<PieChartOutlined />}
              suffix="items"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Cost"
              value={totalCost}
              prefix="₹"
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      {/* Report Table */}
      <Card
        title={
          <Space>
            {viewMode === 'summary' ? (
              <>
                <PieChartOutlined />
                Summary by Product
              </>
            ) : (
              <>
                <ToolOutlined />
                Detailed Usage
              </>
            )}
          </Space>
        }
      >
        <Table
          loading={loading}
          dataSource={viewMode === 'summary' ? reportData.summary : reportData.details}
          columns={viewMode === 'summary' ? summaryColumns : detailColumns}
          rowKey={(record, index) => record.report_number || record.product_name || index}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} records`
          }}
          scroll={{ x: viewMode === 'details' ? 1200 : undefined }}
          locale={{
            emptyText: (
              <Empty
                description="No spare parts consumption data found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )
          }}
          summary={() =>
            viewMode === 'summary' && reportData.summary.length > 0 ? (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    <Text strong>Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} />
                  <Table.Summary.Cell index={2} align="center">
                    <Text strong>{totalUnitsUsed}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="center">
                    <Text strong>{totalQuantity}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="right">
                    <Text strong>₹{totalCost.toFixed(2)}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            ) : null
          }
        />
      </Card>
    </div>
  );
};

export default SparePartsReport;
