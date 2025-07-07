"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Typography,
  Space,
  Button,
  Select,
  Input,
  Modal,
  Tag,
  Alert,
  Tooltip,
  Descriptions,
  Collapse,
  DatePicker,
  Row,
  Col,
  Statistic,
  Progress,
  message,
  Spin
} from 'antd';
import {
  BugOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  FilterOutlined,
  EyeOutlined,
  CheckOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { 
  getErrorsForAdmin, 
  markErrorAsResolved, 
  getErrorStatistics,
  ERROR_SEVERITY,
  ERROR_TYPES 
} from '@/services/errorLoggingService';
import { useLanguage } from '@/lib/i18n';
import Iconify from '@/components/Iconify';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

const ErrorsManagement = () => {
  const { t } = useLanguage();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [selectedError, setSelectedError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [resolveModal, setResolveModal] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolvingError, setResolvingError] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    severity: null,
    type: null,
    resolved: null,
    searchTerm: '',
    dateRange: null
  });

  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  const severityConfig = {
    [ERROR_SEVERITY.CRITICAL]: { color: '#ff4d4f', icon: ExclamationCircleOutlined, text: 'Critical' },
    [ERROR_SEVERITY.HIGH]: { color: '#ff7a45', icon: WarningOutlined, text: 'High' },
    [ERROR_SEVERITY.MEDIUM]: { color: '#faad14', icon: InfoCircleOutlined, text: 'Medium' },
    [ERROR_SEVERITY.LOW]: { color: '#52c41a', icon: CheckCircleOutlined, text: 'Low' },
    'user_reported': { color: '#722ed1', icon: BugOutlined, text: 'User Reported' }
  };

  const typeConfig = {
    [ERROR_TYPES.JAVASCRIPT]: { color: '#f1c40f', text: 'JavaScript' },
    [ERROR_TYPES.NETWORK]: { color: '#e74c3c', text: 'Network' },
    [ERROR_TYPES.AUTH]: { color: '#9b59b6', text: 'Authentication' },
    [ERROR_TYPES.FIREBASE]: { color: '#ff9800', text: 'Firebase' },
    [ERROR_TYPES.UI]: { color: '#3498db', text: 'UI Component' },
    [ERROR_TYPES.API]: { color: '#e67e22', text: 'API Call' },
    [ERROR_TYPES.UNKNOWN]: { color: '#95a5a6', text: 'Unknown' }
  };

  // Load errors
  const loadErrors = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getErrorsForAdmin(
        pagination.pageSize, 
        filters.severity, 
        filters.resolved
      );
      
      if (result.success) {
        let filteredErrors = result.errors;
        
        // Apply search filter
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          filteredErrors = filteredErrors.filter(error => 
            error.message?.toLowerCase().includes(searchLower) ||
            error.userEmail?.toLowerCase().includes(searchLower) ||
            error.userName?.toLowerCase().includes(searchLower) ||
            error.context?.toLowerCase().includes(searchLower)
          );
        }

        // Apply type filter
        if (filters.type) {
          filteredErrors = filteredErrors.filter(error => error.type === filters.type);
        }

        // Apply date range filter
        if (filters.dateRange && filters.dateRange.length === 2) {
          const [startDate, endDate] = filters.dateRange;
          filteredErrors = filteredErrors.filter(error => {
            const errorDate = new Date(error.timestamp);
            return errorDate >= startDate.toDate() && errorDate <= endDate.toDate();
          });
        }

        setErrors(filteredErrors);
        setPagination(prev => ({ ...prev, total: filteredErrors.length }));
      } else {
        message.error('Failed to load errors');
      }
    } catch (error) {
      console.error('Error loading errors:', error);
      message.error('Error loading errors: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.pageSize]);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      const result = await getErrorStatistics();
      if (result.success) {
        setStatistics(result.stats);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadErrors();
    loadStatistics();
  }, [loadErrors, loadStatistics]);

  // Handle error resolution
  const handleResolveError = async () => {
    if (!resolvingError) return;

    try {
      const result = await markErrorAsResolved(
        resolvingError.id, 
        'Admin User', // You should pass actual admin user info
        resolveNotes
      );

      if (result.success) {
        message.success('Error marked as resolved');
        setResolveModal(false);
        setResolvingError(null);
        setResolveNotes('');
        loadErrors(); // Reload errors
      } else {
        message.error('Failed to resolve error');
      }
    } catch (error) {
      console.error('Error resolving error:', error);
      message.error('Error resolving error: ' + error.message);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity) => {
        const config = severityConfig[severity] || severityConfig[ERROR_SEVERITY.LOW];
        const IconComponent = config.icon;
        return (
          <Tooltip title={config.text}>
            <Tag color={config.color} icon={<IconComponent />}>
              {config.text}
            </Tag>
          </Tooltip>
        );
      },
      filters: Object.values(ERROR_SEVERITY).concat(['user_reported']).map(severity => ({
        text: severityConfig[severity]?.text || severity,
        value: severity,
      })),
      onFilter: (value, record) => record.severity === value,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const config = typeConfig[type] || typeConfig[ERROR_TYPES.UNKNOWN];
        return (
          <Tag color={config.color}>
            {config.text}
          </Tag>
        );
      },
      filters: Object.values(ERROR_TYPES).map(type => ({
        text: typeConfig[type]?.text || type,
        value: type,
      })),
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Error Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (text, record) => (
        <Tooltip title={text}>
          <div style={{ maxWidth: '300px' }}>
            <Text>{text}</Text>
            {record.context && (
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Context: {record.context}
                </Text>
              </div>
            )}
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'user',
      width: 150,
      render: (name, record) => (
        <div>
          <Text>{name || 'Anonymous'}</Text>
          {record.userEmail && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.userEmail}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      render: (timestamp) => (
        <div>
          <div>{new Date(timestamp).toLocaleDateString()}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {new Date(timestamp).toLocaleTimeString()}
          </Text>
        </div>
      ),
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Status',
      dataIndex: 'resolved',
      key: 'resolved',
      width: 100,
      render: (resolved) => (
        <Tag color={resolved ? 'green' : 'red'} icon={resolved ? <CheckOutlined /> : <ExclamationCircleOutlined />}>
          {resolved ? 'Resolved' : 'Open'}
        </Tag>
      ),
      filters: [
        { text: 'Open', value: false },
        { text: 'Resolved', value: true },
      ],
      onFilter: (value, record) => record.resolved === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedError(record);
                setShowErrorModal(true);
              }}
            />
          </Tooltip>
          {!record.resolved && (
            <Tooltip title="Mark as Resolved">
              <Button
                type="text"
                icon={<CheckOutlined />}
                onClick={() => {
                  setResolvingError(record);
                  setResolveModal(true);
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Statistics Cards */}
      {statistics && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Errors"
                value={statistics.total}
                prefix={<BugOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Unresolved"
                value={statistics.unresolved}
                prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              />
              <Progress 
                percent={statistics.total > 0 ? Math.round((statistics.unresolved / statistics.total) * 100) : 0}
                size="small"
                strokeColor="#ff4d4f"
                showInfo={false}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Resolved"
                value={statistics.resolved}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              />
              <Progress 
                percent={statistics.total > 0 ? Math.round((statistics.resolved / statistics.total) * 100) : 0}
                size="small"
                strokeColor="#52c41a"
                showInfo={false}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Critical"
                value={statistics.bySeverity?.critical || 0}
                prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Space wrap>
          <Search
            placeholder="Search errors..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            style={{ width: 300 }}
            allowClear
          />
          
          <Select
            placeholder="Filter by severity"
            value={filters.severity}
            onChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}
            style={{ width: 150 }}
            allowClear
          >
            {Object.values(ERROR_SEVERITY).concat(['user_reported']).map(severity => (
              <Option key={severity} value={severity}>
                {severityConfig[severity]?.text || severity}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Filter by type"
            value={filters.type}
            onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            style={{ width: 150 }}
            allowClear
          >
            {Object.values(ERROR_TYPES).map(type => (
              <Option key={type} value={type}>
                {typeConfig[type]?.text || type}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Filter by status"
            value={filters.resolved}
            onChange={(value) => setFilters(prev => ({ ...prev, resolved: value }))}
            style={{ width: 120 }}
            allowClear
          >
            <Option value={false}>Open</Option>
            <Option value={true}>Resolved</Option>
          </Select>

          <RangePicker
            value={filters.dateRange}
            onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
          />

          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => {
              loadErrors();
              loadStatistics();
            }}
          >
            Refresh
          </Button>
        </Space>
      </Card>

      {/* Errors Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={errors}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} errors`,
          }}
          onChange={(paginationInfo, filtersInfo, sorterInfo) => {
            setPagination(prev => ({
              ...prev,
              current: paginationInfo.current,
              pageSize: paginationInfo.pageSize,
            }));
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Error Details Modal */}
      <Modal
        title={
          <Space>
            <BugOutlined />
            Error Details
            {selectedError && (
              <Tag color={severityConfig[selectedError.severity]?.color}>
                {severityConfig[selectedError.severity]?.text}
              </Tag>
            )}
          </Space>
        }
        open={showErrorModal}
        onCancel={() => {
          setShowErrorModal(false);
          setSelectedError(null);
        }}
        footer={null}
        width={800}
      >
        {selectedError && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Error ID">{selectedError.id}</Descriptions.Item>
              <Descriptions.Item label="Message">{selectedError.message}</Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag color={typeConfig[selectedError.type]?.color}>
                  {typeConfig[selectedError.type]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Context">{selectedError.context}</Descriptions.Item>
              <Descriptions.Item label="Timestamp">
                {new Date(selectedError.timestamp).toLocaleString()}
              </Descriptions.Item>
              {selectedError.userMessage && (
                <Descriptions.Item label="User Message">
                  <Alert
                    message={selectedError.userMessage}
                    type="info"
                    showIcon
                  />
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedError.stack && (
              <Collapse style={{ marginTop: '16px' }}>
                <Panel header="Stack Trace" key="stack">
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: '12px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    overflow: 'auto',
                    maxHeight: '300px'
                  }}>
                    {selectedError.stack}
                  </pre>
                </Panel>
              </Collapse>
            )}

            {selectedError.browserInfo && (
              <Collapse style={{ marginTop: '16px' }}>
                <Panel header="Browser Information" key="browser">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="User Agent">
                      {selectedError.browserInfo.userAgent}
                    </Descriptions.Item>
                    <Descriptions.Item label="URL">
                      {selectedError.browserInfo.url}
                    </Descriptions.Item>
                    <Descriptions.Item label="Language">
                      {selectedError.browserInfo.language}
                    </Descriptions.Item>
                  </Descriptions>
                </Panel>
              </Collapse>
            )}
          </div>
        )}
      </Modal>

      {/* Resolve Error Modal */}
      <Modal
        title="Mark Error as Resolved"
        open={resolveModal}
        onOk={handleResolveError}
        onCancel={() => {
          setResolveModal(false);
          setResolvingError(null);
          setResolveNotes('');
        }}
        okText="Mark as Resolved"
        okButtonProps={{ icon: <CheckOutlined /> }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>
            Are you sure you want to mark this error as resolved?
          </Text>
          
          {resolvingError && (
            <Alert
              message={resolvingError.message}
              type="info"
              showIcon
            />
          )}

          <Text strong>Resolution Notes (optional):</Text>
          <Input.TextArea
            value={resolveNotes}
            onChange={(e) => setResolveNotes(e.target.value)}
            placeholder="Add any notes about how this error was resolved..."
            rows={3}
          />
        </Space>
      </Modal>
    </div>
  );
};

export default ErrorsManagement; 