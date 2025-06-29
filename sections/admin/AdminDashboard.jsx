"use client";
import React, { useState, useEffect } from "react";
import { 
  Table, 
  Button, 
  Modal, 
  Avatar, 
  Tag, 
  Typography, 
  Card, 
  Row, 
  Col, 
  Space,
  Input,
  message,
  Divider,
  Select,
  Checkbox,
  Slider
} from "antd";
import { UserOutlined, HeartOutlined, SearchOutlined, FilterOutlined, CrownOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsers, addCompatibility, removeCompatibility, getUserCompatibilities, addOppositeGenderCompatibilities, addSameGenderCompatibilities } from "@/actions/admin";
import { getMainProfileImage } from "@/utils/imageHelpers";
import { getAllV1UsersForMigration } from "@/actions/v1Migration";

const { Title, Text } = Typography;
const { Search } = Input;

const AdminDashboard = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [compatibilityModalVisible, setCompatibilityModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [genderFilter, setGenderFilter] = useState(null);
  const [ageRange, setAgeRange] = useState([18, 65]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [sortBy, setSortBy] = useState('lastActive'); // 'name', 'age', 'lastActive'
  const [compatibilitySearchText, setCompatibilitySearchText] = useState("");
  const [premiumFilter, setPremiumFilter] = useState(null); // null, true, false
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAllUsers,
  });

  // Fetch V1 migration data
  const { data: v1MigrationData, isLoading: v1MigrationLoading } = useQuery({
    queryKey: ["admin-v1-migration"],
    queryFn: getAllV1UsersForMigration,
  });

  // Fetch compatibilities for selected user
  const { data: compatibilities, isLoading: compatibilitiesLoading } = useQuery({
    queryKey: ["user-compatibilities", selectedUser?.id],
    queryFn: () => getUserCompatibilities(selectedUser?.id),
    enabled: !!selectedUser?.id,
  });

  // Add compatibility mutation
  const addCompatibilityMutation = useMutation({
    mutationFn: addCompatibility,
    onSuccess: () => {
      message.success("Compatibility added successfully!");
      queryClient.invalidateQueries(["user-compatibilities"]);
    },
    onError: () => {
      message.error("Failed to add compatibility!");
    },
  });

  // Remove compatibility mutation
  const removeCompatibilityMutation = useMutation({
    mutationFn: removeCompatibility,
    onSuccess: () => {
      message.success("Compatibility removed successfully!");
      queryClient.invalidateQueries(["user-compatibilities"]);
    },
    onError: () => {
      message.error("Failed to remove compatibility!");
    },
  });

  // Bulk add opposite gender compatibilities mutation
  const addOppositeGenderMutation = useMutation({
    mutationFn: addOppositeGenderCompatibilities,
    onSuccess: (data) => {
      message.success(data.message);
      queryClient.invalidateQueries(["user-compatibilities"]);
      queryClient.invalidateQueries(["admin-users"]);
    },
    onError: (error) => {
      message.error("Failed to add opposite gender compatibilities!");
      console.error(error);
    },
  });

  // Bulk add same gender compatibilities mutation
  const addSameGenderMutation = useMutation({
    mutationFn: addSameGenderCompatibilities,
    onSuccess: (data) => {
      message.success(data.message);
      queryClient.invalidateQueries(["user-compatibilities"]);
      queryClient.invalidateQueries(["admin-users"]);
    },
    onError: (error) => {
      message.error("Failed to add same gender compatibilities!");
      console.error(error);
    },
  });

  const openCompatibilityModal = (user) => {
    setSelectedUser(user);
    setCompatibilityModalVisible(true);
    setCompatibilitySearchText(""); // Clear search when opening modal
  };

  const openProfileModal = (user) => {
    setViewingUser(user);
    setProfileModalVisible(true);
  };

  const getProfileImage = (user) => {
    if (!user) return null;
    
    if (user.images && user.images.length > 0) {
      return getMainProfileImage(user.images);
    }
    return user.image_url || user.imageUrl || null;
  };

  // Check if user is V1 migrated
  const isV1User = (userId) => {
    if (!v1MigrationData) return false;
    return v1MigrationData.alreadyMigrated?.some(user => user.id === userId) || false;
  };

  // Helper function to check if user is premium
  const isUserPremium = (user) => {
    return user?.subscription?.isPremium || 
           user?.subscription?.status === 'active' || 
           user?.subscription?.status === 'trialing' ||
           user?.subscriptionActive !== undefined;
  };

  const userColumns = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space 
          style={{ cursor: 'pointer' }}
          onClick={() => openProfileModal(record)}
        >
          <Avatar 
            src={getProfileImage(record)} 
            icon={<UserOutlined />}
            size="default"
          />
          <div>
            <div style={{ fontWeight: 500, color: '#1890ff' }}>
              {(record?.firstName && record?.lastName) 
                ? `${record.firstName} ${record.lastName}` 
                : record?.displayName || record?.name || "Unknown User"}
              {isUserPremium(record) && (
                <CrownOutlined style={{ color: '#FFD700', marginLeft: '8px', fontSize: '14px' }} />
              )}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              @{record?.username || record?.email?.split('@')[0] || "no-username"}
            </Text>
            <div>
              {record?.gender && (
                <Tag color={record.gender === 'male' ? 'blue' : record.gender === 'female' ? 'pink' : 'default'} size="small">
                  {record.gender}
                </Tag>
              )}
              {record?.age && (
                <Tag color="green" size="small">{record.age} years</Tag>
              )}
              {isUserPremium(record) && (
                <Tag color="gold" size="small" icon={<CrownOutlined />}>Premium</Tag>
              )}
              {isV1User(record?.id) && (
                <Tag color="gold" size="small">V1 User</Tag>
              )}
            </div>
          </div>
        </Space>
      ),
      filterable: true,
      onFilter: (value, record) => {
        if (!record) return false;
        const fullName = (record.firstName && record.lastName) 
          ? `${record.firstName} ${record.lastName}` 
          : record.displayName || record.name || "";
        const username = record.username || record.email?.split('@')[0] || "";
        return fullName.toLowerCase().includes(value.toLowerCase()) ||
               username.toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      title: "Bio",
      dataIndex: "bio",
      key: "bio",
      render: (text) => text || <Text type="secondary">No bio</Text>,
      width: 200,
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (text) => text || <Text type="secondary">No location</Text>,
    },
    {
      title: "Interests",
      dataIndex: "interests",
      key: "interests",
      render: (interests) => (
        <div>
          {interests && interests.length > 0 ? (
            interests.slice(0, 3).map((interest, index) => (
              <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                {interest}
              </Tag>
            ))
          ) : (
            <Text type="secondary">No interests</Text>
          )}
          {interests && interests.length > 3 && (
            <Text type="secondary">+{interests.length - 3} more</Text>
          )}
        </div>
      ),
    },
    {
      title: "Last Active",
      dataIndex: "lastTimeActive",
      key: "lastTimeActive",
             render: (lastTimeActive, record) => {
         if (!record || !lastTimeActive) return <Text type="secondary">Never</Text>;
        
        const date = lastTimeActive.seconds ? 
          new Date(lastTimeActive.seconds * 1000) : 
          new Date(lastTimeActive);
        
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        let timeAgo;
        let color = 'default';
        
        if (diffMinutes < 5) {
          timeAgo = 'Online';
          color = 'green';
        } else if (diffMinutes < 60) {
          timeAgo = `${diffMinutes}m ago`;
          color = 'blue';
        } else if (diffHours < 24) {
          timeAgo = `${diffHours}h ago`;
          color = 'orange';
        } else if (diffDays < 7) {
          timeAgo = `${diffDays}d ago`;
          color = 'red';
        } else {
          timeAgo = date.toLocaleDateString();
          color = 'default';
        }
        
        return (
          <div>
            <Tag color={color} size="small">{timeAgo}</Tag>
            <br />
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {date.toLocaleString()}
            </Text>
          </div>
        );
      },
             sorter: (a, b) => {
         const getTime = (user) => {
           if (!user || !user.lastTimeActive) return 0;
           return user.lastTimeActive.seconds ? 
             user.lastTimeActive.seconds * 1000 : 
             new Date(user.lastTimeActive).getTime();
         };
         return getTime(b) - getTime(a); // Most recent first
       },
      defaultSortOrder: 'descend',
      width: 150,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<HeartOutlined />}
          onClick={() => openCompatibilityModal(record)}
        >
          Manage Compatibilities
        </Button>
      ),
    },
  ];

  const handleAddCompatibility = (targetUserId) => {
    addCompatibilityMutation.mutate({
      userId: selectedUser.id,
      targetUserId: targetUserId,
    });
  };

  const handleRemoveCompatibility = (targetUserId) => {
    removeCompatibilityMutation.mutate({
      userId: selectedUser.id,
      targetUserId: targetUserId,
    });
  };

  const handleBulkAddCompatibilities = () => {
    if (selectedUsers.length === 0) {
      message.warning("Please select users to add as compatibilities");
      return;
    }

    selectedUsers.forEach(targetUserId => {
      addCompatibilityMutation.mutate({
        userId: selectedUser.id,
        targetUserId: targetUserId,
      });
    });

    setSelectedUsers([]);
    message.success(`Adding ${selectedUsers.length} compatibilities...`);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Filter users for search and criteria
  const filteredUsers = users?.filter(user => {
    if (!user) return false;
    
    const fullName = (user.firstName && user.lastName) 
      ? `${user.firstName} ${user.lastName}` 
      : user.displayName || user.name || "";
    const username = user.username || user.email?.split('@')[0] || "";
    
    // Text search
    const matchesSearch = searchText === "" || 
      fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.bio?.toLowerCase().includes(searchText.toLowerCase());
    
    // Gender filter
    const matchesGender = !genderFilter || user.gender === genderFilter;
    
    // Age filter
    const userAge = user.age || user.dateOfBirth ? 
      (user.age || new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()) : null;
    const matchesAge = !userAge || (userAge >= ageRange[0] && userAge <= ageRange[1]);
    
    // Premium filter
    const matchesPremium = premiumFilter === null || 
      (premiumFilter === true && isUserPremium(user)) ||
      (premiumFilter === false && !isUserPremium(user));
    
    return matchesSearch && matchesGender && matchesAge && matchesPremium;
  }) || [];

  // Get available users for compatibility (exclude current user and already compatible)
  const availableUsers = users?.filter(user => {
    if (!user || user.id === selectedUser?.id) return false;
    
    // Exclude users who are already compatible
    const isAlreadyCompatible = compatibilities?.some(comp => comp && comp.id === user.id);
    if (isAlreadyCompatible) return false;
    
    // Apply search filter for compatibility modal
    if (compatibilitySearchText.trim()) {
      const fullName = (user.firstName && user.lastName) 
        ? `${user.firstName} ${user.lastName}` 
        : user.displayName || user.name || "";
      const username = user.username || user.email?.split('@')[0] || "";
      
      const matchesCompatibilitySearch = 
        fullName.toLowerCase().includes(compatibilitySearchText.toLowerCase()) ||
        username.toLowerCase().includes(compatibilitySearchText.toLowerCase()) ||
        (user.bio && user.bio.toLowerCase().includes(compatibilitySearchText.toLowerCase()));
      
      if (!matchesCompatibilitySearch) return false;
    }
    
    return true;
  }) || [];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        <Title level={2}>Admin Dashboard - User Compatibilities</Title>
        <Text type="secondary">
          Manage manual compatibilities between users. Compatible users can see each other's social media wall and chat.
        </Text>
        
        <Divider />

        {/* V1 Migration Statistics */}
        {v1MigrationData && (
          <Card 
            title="📊 V1 Migration Statistics" 
            size="small" 
            style={{ marginBottom: 16, background: '#fff7e6', border: '1px solid #ffd591' }}
          >
            <Row gutter={[16, 8]}>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                    {v1MigrationData.totalV1Users}
                  </div>
                  <Text type="secondary">Total V1 Users</Text>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    {v1MigrationData.alreadyMigrated?.length || 0}
                  </div>
                  <Text type="secondary">Migrated to Premium</Text>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                    {v1MigrationData.needsMigration || 0}
                  </div>
                  <Text type="secondary">Pending Migration</Text>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                    {v1MigrationData.totalV1Users > 0 
                      ? Math.round((v1MigrationData.alreadyMigrated?.length || 0) / v1MigrationData.totalV1Users * 100)
                      : 0}%
                  </div>
                  <Text type="secondary">Migration Rate</Text>
                </div>
              </Col>
            </Row>
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                V1 users are automatically migrated to Premium when they log in. They receive a welcome dialog and lifetime Premium access.
              </Text>
            </div>
          </Card>
        )}
        
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="Search users by name, username, or bio..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Filter by gender"
              value={genderFilter}
              onChange={setGenderFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value="male">Male</Select.Option>
              <Select.Option value="female">Female</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Premium status"
              value={premiumFilter}
              onChange={setPremiumFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value={true}>
                <Space>
                  <CrownOutlined style={{ color: '#FFD700' }} />
                  Premium Users
                </Space>
              </Select.Option>
              <Select.Option value={false}>Free Users</Select.Option>
            </Select>
          </Col>
          <Col span={4}>
            <div>
              <Text strong style={{ marginBottom: 8, display: 'block' }}>Age Range: {ageRange[0]} - {ageRange[1]}</Text>
              <Slider
                range
                min={18}
                max={80}
                value={ageRange}
                onChange={setAgeRange}
              />
            </div>
          </Col>
          <Col span={4}>
            <div style={{ textAlign: 'right' }}>
              <Text strong>Total Users: {users?.length || 0}</Text><br/>
              <Text type="secondary">Filtered: {filteredUsers.length}</Text><br/>
              <Text style={{ color: '#FFD700' }}>
                Premium: {users?.filter(isUserPremium).length || 0}
              </Text>
            </div>
          </Col>
        </Row>

        {/* Bulk Compatibility Actions */}
        <Card 
          title="Bulk Compatibility Actions" 
          size="small" 
          style={{ marginBottom: 16, background: '#fafafa' }}
        >
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Button 
                type="primary"
                onClick={() => addOppositeGenderMutation.mutate()}
                loading={addOppositeGenderMutation.isPending}
                style={{ width: '100%' }}
                size="large"
              >
                🔄 Add Opposite Gender Compatibilities
              </Button>
              <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: 4 }}>
                Adds compatibilities between opposite genders with similar age (±5 years)
              </Text>
            </Col>
            <Col span={12}>
              <Button 
                type="default"
                onClick={() => addSameGenderMutation.mutate()}
                loading={addSameGenderMutation.isPending}
                style={{ width: '100%' }}
                size="large"
              >
                👥 Add Same Gender Compatibilities
              </Button>
              <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: 4 }}>
                Adds compatibilities between same genders (any age range)
              </Text>
            </Col>
          </Row>
        </Card>

        <Table
          columns={userColumns}
          dataSource={filteredUsers}
          loading={usersLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Compatibility Management Modal */}
      <Modal
        title={`Manage Compatibilities for ${selectedUser?.firstName} ${selectedUser?.lastName}`}
        open={compatibilityModalVisible}
        onCancel={() => setCompatibilityModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedUser && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="Current Compatibilities" size="small">
                  {compatibilitiesLoading ? (
                    <Text>Loading...</Text>
                  ) : compatibilities && compatibilities.length > 0 ? (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {compatibilities.map((user) => (
                        <div key={user.id} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '8px',
                          border: '1px solid #f0f0f0',
                          borderRadius: '6px'
                        }}>
                          <Space>
                            <Avatar 
                              src={user.image_url || user.imageUrl} 
                              icon={<UserOutlined />}
                              size="small"
                            />
                            <div>
                              <div style={{ fontSize: '14px' }}>{user.firstName} {user.lastName}</div>
                              <Text type="secondary" style={{ fontSize: '12px' }}>@{user.username}</Text>
                            </div>
                          </Space>
                          <Button 
                            danger 
                            size="small"
                            onClick={() => handleRemoveCompatibility(user.id)}
                            loading={removeCompatibilityMutation.isPending}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </Space>
                  ) : (
                    <Text type="secondary">No compatibilities yet</Text>
                  )}
                </Card>
              </Col>
              
              <Col span={12}>
                <Card 
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Add New Compatibility</span>
                      <div>
                        <Checkbox 
                          checked={bulkMode}
                          onChange={(e) => setBulkMode(e.target.checked)}
                        >
                          Bulk Mode
                        </Checkbox>
                        {bulkMode && selectedUsers.length > 0 && (
                          <Button 
                            type="primary" 
                            size="small" 
                            style={{ marginLeft: 8 }}
                            onClick={handleBulkAddCompatibilities}
                          >
                            Add {selectedUsers.length} Selected
                          </Button>
                        )}
                      </div>
                    </div>
                  } 
                  size="small"
                >
                  {/* Search for users to add */}
                  <div style={{ marginBottom: 16 }}>
                    <Search
                      placeholder="Search users by name, username, or bio..."
                      value={compatibilitySearchText}
                      onChange={(e) => setCompatibilitySearchText(e.target.value)}
                      style={{ width: '100%' }}
                      prefix={<SearchOutlined />}
                      allowClear
                    />
                    {compatibilitySearchText.trim() && (
                      <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        Found {availableUsers.length} user(s) matching "{compatibilitySearchText}"
                      </Text>
                    )}
                  </div>

                  {/* Smart suggestions based on selected user */}
                  {selectedUser?.gender && (
                    <div style={{ marginBottom: 12, padding: '8px', background: '#f6f6f6', borderRadius: '4px' }}>
                      <Text strong style={{ fontSize: '12px' }}>Smart Suggestions for {selectedUser.firstName}:</Text><br/>
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        Opposite gender: {selectedUser.gender === 'male' ? 'Female' : selectedUser.gender === 'female' ? 'Male' : 'Any'} | 
                        Similar age: {selectedUser.age ? `${Math.max(18, selectedUser.age - 5)} - ${Math.min(80, selectedUser.age + 5)} years` : 'Any age'}
                      </Text>
                    </div>
                  )}
                  
                  {availableUsers.length > 0 ? (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {availableUsers
                        .sort((a, b) => {
                          // Smart sorting: opposite gender first, then similar age
                          const aGenderScore = selectedUser?.gender && a.gender && 
                            ((selectedUser.gender === 'male' && a.gender === 'female') ||
                             (selectedUser.gender === 'female' && a.gender === 'male')) ? 1 : 0;
                          const bGenderScore = selectedUser?.gender && b.gender && 
                            ((selectedUser.gender === 'male' && b.gender === 'female') ||
                             (selectedUser.gender === 'female' && b.gender === 'male')) ? 1 : 0;
                          
                          if (aGenderScore !== bGenderScore) return bGenderScore - aGenderScore;
                          
                          // Sort by age similarity
                          if (selectedUser?.age && a.age && b.age) {
                            const ageA = Math.abs(a.age - selectedUser.age);
                            const ageB = Math.abs(b.age - selectedUser.age);
                            return ageA - ageB;
                          }
                          
                          return 0;
                        })
                        .map((user) => (
                        <div key={user.id} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '8px',
                          border: `1px solid ${
                            // Highlight good matches
                            selectedUser?.gender && user.gender && 
                            ((selectedUser.gender === 'male' && user.gender === 'female') ||
                             (selectedUser.gender === 'female' && user.gender === 'male')) 
                              ? '#52c41a' : '#f0f0f0'
                          }`,
                          borderRadius: '6px',
                          background: selectedUsers.includes(user.id) ? '#e6f7ff' : 'white'
                        }}>
                          <Space>
                            {bulkMode && (
                              <Checkbox 
                                checked={selectedUsers.includes(user.id)}
                                onChange={() => toggleUserSelection(user.id)}
                              />
                            )}
                            <Avatar 
                              src={user.image_url || user.imageUrl} 
                              icon={<UserOutlined />}
                              size="small"
                            />
                            <div>
                              <div style={{ fontSize: '14px' }}>
                                {(user.firstName && user.lastName) 
                                  ? `${user.firstName} ${user.lastName}` 
                                  : user.displayName || user.name || "Unknown User"}
                              </div>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                @{user.username || user.email?.split('@')[0] || "no-username"}
                              </Text>
                              <div>
                                {user.gender && (
                                  <Tag 
                                    color={user.gender === 'male' ? 'blue' : user.gender === 'female' ? 'pink' : 'default'} 
                                    size="small"
                                  >
                                    {user.gender}
                                  </Tag>
                                )}
                                {user.age && (
                                  <Tag color="green" size="small">{user.age}y</Tag>
                                )}
                                {/* Compatibility indicator */}
                                {selectedUser?.gender && user.gender && 
                                  ((selectedUser.gender === 'male' && user.gender === 'female') ||
                                   (selectedUser.gender === 'female' && user.gender === 'male')) && (
                                  <Tag color="gold" size="small">Perfect Match</Tag>
                                )}
                              </div>
                            </div>
                          </Space>
                          {!bulkMode && (
                            <Button 
                              type="primary" 
                              size="small"
                              onClick={() => handleAddCompatibility(user.id)}
                              loading={addCompatibilityMutation.isPending}
                            >
                              Add
                            </Button>
                          )}
                        </div>
                      ))}
                    </Space>
                  ) : (
                    <Text type="secondary">No more users available</Text>
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Profile Viewing Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar 
              src={getProfileImage(viewingUser)} 
              icon={<UserOutlined />}
              size="large"
            />
            <div>
              <div style={{ fontSize: '18px', fontWeight: 600 }}>
                {viewingUser && (viewingUser.firstName && viewingUser.lastName) 
                  ? `${viewingUser.firstName} ${viewingUser.lastName}` 
                  : viewingUser?.displayName || viewingUser?.name || "Unknown User"}
              </div>
              <Text type="secondary">
                @{viewingUser?.username || viewingUser?.email?.split('@')[0] || "no-username"}
              </Text>
            </div>
          </div>
        }
        open={profileModalVisible}
        onCancel={() => setProfileModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setProfileModalVisible(false)}>
            Close
          </Button>,
          <Button 
            key="compatibility" 
            type="primary" 
            icon={<HeartOutlined />}
            onClick={() => {
              setProfileModalVisible(false);
              openCompatibilityModal(viewingUser);
            }}
          >
            Manage Compatibilities
          </Button>
        ]}
        width={800}
      >
        {viewingUser && (
          <div>
            <Row gutter={[24, 24]}>
              {/* Left Column - Photos */}
              <Col span={12}>
                <Card title="Photos" size="small">
                  {viewingUser.images && viewingUser.images.length > 0 ? (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                      gap: '16px' 
                    }}>
                      {viewingUser.images.map((image, index) => {
                        // Handle different image structure formats
                        // Firebase structure: {fileName, fileUri, isMain}
                        // Legacy structure: {url, downloadURL, isMain}  
                        const imageUrl = image?.fileUri || image?.url || image?.downloadURL || image;
                        const isMain = image?.isMain || false;
                        
                        return (
                          <div key={index} style={{ position: 'relative' }}>
                            <Avatar
                              src={imageUrl}
                              size={150}
                              shape="square"
                              style={{ 
                                cursor: 'pointer',
                                border: isMain ? '3px solid #1890ff' : '1px solid #f0f0f0'
                              }}
                            />
                            {isMain && (
                              <div style={{
                                position: 'absolute',
                                top: '2px',
                                right: '2px',
                                background: '#1890ff',
                                color: 'white',
                                fontSize: '10px',
                                padding: '2px 4px',
                                borderRadius: '4px'
                              }}>
                                MAIN
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <Avatar 
                        src={viewingUser.image_url || viewingUser.imageUrl} 
                        icon={<UserOutlined />}
                        size={150}
                      />
                      <div style={{ marginTop: '12px' }}>
                        <Text type="secondary">
                          {viewingUser.image_url || viewingUser.imageUrl ? "Single profile photo" : "No photos uploaded"}
                        </Text>
                        {viewingUser.images && viewingUser.images.length === 0 && (
                          <div style={{ marginTop: '8px' }}>
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              Images array exists but is empty
                            </Text>
                          </div>
                        )}
                        {!viewingUser.images && (
                          <div style={{ marginTop: '8px' }}>
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              No images array found
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </Col>

              {/* Right Column - Profile Info */}
              <Col span={12}>
                <Card title="Profile Information" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Basic Info:</Text>
                      <div style={{ marginLeft: '12px', marginTop: '4px' }}>
                        <div><Text type="secondary">Name:</Text> {
                          (viewingUser.firstName && viewingUser.lastName) 
                            ? `${viewingUser.firstName} ${viewingUser.lastName}` 
                            : viewingUser.displayName || viewingUser.name || "Not provided"
                        }</div>
                        <div><Text type="secondary">Username:</Text> @{viewingUser.username || "Not provided"}</div>
                        <div><Text type="secondary">Email:</Text> {viewingUser.email || "Not provided"}</div>
                        {viewingUser.gender && (
                          <div><Text type="secondary">Gender:</Text> 
                            <Tag color={viewingUser.gender === 'male' ? 'blue' : viewingUser.gender === 'female' ? 'pink' : 'default'} style={{ marginLeft: '8px' }}>
                              {viewingUser.gender}
                            </Tag>
                          </div>
                        )}
                        {viewingUser.age && (
                          <div><Text type="secondary">Age:</Text> {viewingUser.age} years</div>
                        )}
                        {viewingUser.dateOfBirth && (
                          <div><Text type="secondary">Date of Birth:</Text> {new Date(viewingUser.dateOfBirth).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>

                    <Divider style={{ margin: '12px 0' }} />

                    <div>
                      <Text strong>Profile Details:</Text>
                      <div style={{ marginLeft: '12px', marginTop: '4px' }}>
                        <div><Text type="secondary">Bio:</Text> {viewingUser.bio || "Not provided"}</div>
                        <div><Text type="secondary">Location:</Text> {viewingUser.location || "Not provided"}</div>
                        <div><Text type="secondary">Website:</Text> {viewingUser.website || "Not provided"}</div>
                        {viewingUser.relationshipStatus && (
                          <div><Text type="secondary">Relationship Status:</Text> {viewingUser.relationshipStatus}</div>
                        )}
                      </div>
                    </div>

                    <Divider style={{ margin: '12px 0' }} />

                    <div>
                      <Text strong>Interests:</Text>
                      <div style={{ marginTop: '8px' }}>
                        {viewingUser.interests && viewingUser.interests.length > 0 ? (
                          viewingUser.interests.map((interest, index) => (
                            <Tag key={index} color="blue" style={{ marginBottom: '4px' }}>
                              {interest}
                            </Tag>
                          ))
                        ) : (
                          <Text type="secondary">No interests provided</Text>
                        )}
                      </div>
                    </div>

                    <Divider style={{ margin: '12px 0' }} />

                    <div>
                      <Text strong>Account Info:</Text>
                      <div style={{ marginLeft: '12px', marginTop: '4px' }}>
                        <div><Text type="secondary">User ID:</Text> {viewingUser.id}</div>
                        {viewingUser.createdAt && (
                          <div><Text type="secondary">Created:</Text> {new Date(viewingUser.createdAt.seconds ? viewingUser.createdAt.seconds * 1000 : viewingUser.createdAt).toLocaleDateString()}</div>
                        )}
                        {viewingUser.lastTimeActive ? (
                          <div><Text type="secondary">Last Active:</Text> {new Date(viewingUser.lastTimeActive.seconds ? viewingUser.lastTimeActive.seconds * 1000 : viewingUser.lastTimeActive).toLocaleString()}</div>
                        ) : (
                          <div><Text type="secondary">Last Active:</Text> Never</div>
                        )}
                        {isV1User(viewingUser.id) && (
                          <div>
                            <Text type="secondary">V1 Status:</Text> 
                            <Tag color="gold" style={{ marginLeft: '8px' }}>V1 Migrated User</Tag>
                          </div>
                        )}
                        {viewingUser.subscription?.type === 'v1_migration' && (
                          <div><Text type="secondary">Premium Type:</Text> Lifetime (V1 Migration)</div>
                        )}
                        {viewingUser.gpsCoordinates && (
                          <div><Text type="secondary">GPS Coordinates:</Text> {viewingUser.gpsCoordinates.latitude}, {viewingUser.gpsCoordinates.longitude}</div>
                        )}
                      </div>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard; 