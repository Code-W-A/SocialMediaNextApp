"use client";

import { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Typography, 
  Space, 
  Tag, 
  message, 
  Statistic, 
  Row, 
  Col,
  Popconfirm,
  Modal,
  Descriptions
} from 'antd';
import { 
  UserOutlined, 
  CrownOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ReloadOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { 
  getAllV1UsersForMigration, 
  batchMigrateV1Users,
  migrateV1UserToPremium 
} from '@/actions/v1Migration';

const { Title, Text } = Typography;

export default function V1MigrationAdminPage() {
  const [loading, setLoading] = useState(false);
  const [migrationData, setMigrationData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  // Load migration data
  const loadMigrationData = async () => {
    setLoading(true);
    try {
      const data = await getAllV1UsersForMigration();
      setMigrationData(data);
    } catch (error) {
      console.error('Error loading migration data:', error);
      message.error('Eroare la încărcarea datelor de migrare');
    } finally {
      setLoading(false);
    }
  };

  // Batch migrate all V1 users
  const handleBatchMigration = async () => {
    setLoading(true);
    try {
      const result = await batchMigrateV1Users();
      message.success(result.message);
      loadMigrationData(); // Reload data
    } catch (error) {
      console.error('Error in batch migration:', error);
      message.error('Eroare la migrarea în lot');
    } finally {
      setLoading(false);
    }
  };

  // Migrate single user
  const handleSingleMigration = async (userId) => {
    try {
      await migrateV1UserToPremium(userId);
      message.success('Utilizator migrat cu succes');
      loadMigrationData(); // Reload data
    } catch (error) {
      console.error('Error migrating user:', error);
      message.error('Eroare la migrarea utilizatorului');
    }
  };

  // Show user details
  const showUserDetails = (user) => {
    setSelectedUser(user);
    setDetailsVisible(true);
  };

  useEffect(() => {
    loadMigrationData();
  }, []);

  // Table columns for V1 users needing migration
  const v1UsersColumns = [
    {
      title: 'Utilizator',
      key: 'user',
      render: (_, user) => (
        <Space>
          <UserOutlined />
          <div>
            <Text strong>{user.firstName} {user.lastName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              @{user.username}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Proprietăți V1',
      key: 'v1Properties',
      render: (_, user) => (
        <Space wrap>
          {user.v1Properties?.map(prop => (
            <Tag key={prop} color="blue" style={{ fontSize: '11px' }}>
              {prop}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Acțiuni',
      key: 'actions',
      render: (_, user) => (
        <Space>
          <Button 
            size="small" 
            onClick={() => showUserDetails(user)}
          >
            Detalii
          </Button>
          <Popconfirm
            title="Ești sigur că vrei să migrezi acest utilizator?"
            onConfirm={() => handleSingleMigration(user.id)}
            okText="Da"
            cancelText="Nu"
          >
            <Button 
              size="small" 
              type="primary"
              icon={<ThunderboltOutlined />}
            >
              Migrează
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Table columns for already migrated users
  const migratedUsersColumns = [
    {
      title: 'Utilizator',
      key: 'user',
      render: (_, user) => (
        <Space>
          <CrownOutlined style={{ color: '#FFD700' }} />
          <div>
            <Text strong>{user.firstName} {user.lastName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              @{user.username}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Data Migrării',
      key: 'migrationDate',
      render: (_, user) => (
        <Text>
          {user.v1Migration?.migratedAt?.toDate?.() 
            ? user.v1Migration.migratedAt.toDate().toLocaleDateString('ro-RO')
            : 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, user) => (
        <Space>
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Premium Activ
          </Tag>
          {user.v1Migration?.welcomeShown && (
            <Tag color="blue">
              Welcome Văzut
            </Tag>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <CrownOutlined style={{ marginRight: '8px', color: '#FFD700' }} />
          Administrare Migrare V1 → V2
        </Title>
        <Text type="secondary">
          Gestionează migrarea utilizatorilor din YDestiny V1 la Premium V2
        </Text>
      </div>

      {/* Statistics */}
      {migrationData && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Utilizatori V1"
                value={migrationData.totalV1Users}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Necesită Migrare"
                value={migrationData.needsMigration}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Deja Migrați"
                value={migrationData.alreadyMigrated.length}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Rata Migrare"
                value={migrationData.totalV1Users > 0 
                  ? Math.round((migrationData.alreadyMigrated.length / migrationData.totalV1Users) * 100)
                  : 0}
                suffix="%"
                prefix={<CrownOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Actions */}
      <Card style={{ marginBottom: '24px' }}>
        <Space>
          <Button 
            icon={<ReloadOutlined />}
            onClick={loadMigrationData}
            loading={loading}
          >
            Reîmprospătează Date
          </Button>
          
          {migrationData?.needsMigration > 0 && (
            <Popconfirm
              title={`Ești sigur că vrei să migrezi toți ${migrationData.needsMigration} utilizatori V1?`}
              description="Această acțiune va acorda Premium gratuit tuturor utilizatorilor V1 identificați."
              onConfirm={handleBatchMigration}
              okText="Da, migrează tot"
              cancelText="Anulează"
            >
              <Button 
                type="primary"
                icon={<ThunderboltOutlined />}
                loading={loading}
                danger
              >
                Migrare în Lot ({migrationData.needsMigration})
              </Button>
            </Popconfirm>
          )}
        </Space>
      </Card>

      {/* V1 Users needing migration */}
      {migrationData?.v1Users?.length > 0 && (
        <Card 
          title={
            <Space>
              <ClockCircleOutlined style={{ color: '#faad14' }} />
              <span>Utilizatori V1 - Necesită Migrare ({migrationData.v1Users.length})</span>
            </Space>
          }
          style={{ marginBottom: '24px' }}
        >
          <Table
            columns={v1UsersColumns}
            dataSource={migrationData.v1Users}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </Card>
      )}

      {/* Already migrated users */}
      {migrationData?.alreadyMigrated?.length > 0 && (
        <Card 
          title={
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <span>Utilizatori Deja Migrați ({migrationData.alreadyMigrated.length})</span>
            </Space>
          }
        >
          <Table
            columns={migratedUsersColumns}
            dataSource={migrationData.alreadyMigrated}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </Card>
      )}

      {/* User Details Modal */}
      <Modal
        title={`Detalii Utilizator: ${selectedUser?.firstName} ${selectedUser?.lastName}`}
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width={600}
      >
        {selectedUser && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Nume">
              {selectedUser.firstName} {selectedUser.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Username">
              @{selectedUser.username}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedUser.email}
            </Descriptions.Item>
            <Descriptions.Item label="Proprietăți V1">
              <Space wrap>
                {selectedUser.v1Properties?.map(prop => (
                  <Tag key={prop} color="blue">
                    {prop}: {JSON.stringify(selectedUser[prop])}
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Data Înregistrării">
              {selectedUser.createdAt?.toDate?.() 
                ? selectedUser.createdAt.toDate().toLocaleDateString('ro-RO')
                : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
} 