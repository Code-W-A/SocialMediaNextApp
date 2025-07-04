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
  Slider,
  Badge,
  Tooltip,
  Tabs,
  Form,
  DatePicker,
  Radio,
  Popconfirm,
  Spin
} from "antd";
import { UserOutlined, HeartOutlined, SearchOutlined, CrownOutlined, MessageOutlined, DeleteOutlined, EyeOutlined, WarningOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsers, addCompatibility, removeCompatibility, getUserCompatibilities, addOppositeGenderCompatibilities, addSameGenderCompatibilities, grantPremiumToUser, removePremiumFromUser, getAllPostsForAdmin, deletePostAsAdmin, deleteCommentAsAdmin } from "@/actions/admin";
// Removed admin settings import - simplified feed system
import { getMainProfileImage } from "@/utils/imageHelpers";

import AdminChatDashboard from "@/components/AdminChatDashboard";

const { Title, Text } = Typography;
const { Search } = Input;

const AdminDashboard = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [compatibilityModalVisible, setCompatibilityModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [selectedUserForPremium, setSelectedUserForPremium] = useState(null);
  const [premiumForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [genderFilter, setGenderFilter] = useState(null);
  const [ageRange, setAgeRange] = useState([18, 65]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [sortBy, setSortBy] = useState('lastActive'); // 'name', 'age', 'lastActive'
  const [compatibilitySearchText, setCompatibilitySearchText] = useState("");
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'moderation' or 'chats'
  const [selectedPost, setSelectedPost] = useState(null);
  const [postDetailsModalVisible, setPostDetailsModalVisible] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAllUsers,
  });

  // Fetch all posts for moderation
  const { data: postsData, isLoading: postsLoading, refetch: refetchPosts } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: () => getAllPostsForAdmin(50), // Get 50 posts at a time
    enabled: activeTab === 'moderation', // Only fetch when on moderation tab
  });

  // Removed admin settings query - simplified feed system

  // Removed V1 migration data fetch

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

  // Grant premium mutation
  const grantPremiumMutation = useMutation({
    mutationFn: ({ userId, premiumType, endDate }) => grantPremiumToUser(userId, premiumType, endDate),
    onSuccess: (data) => {
      message.success(data.message);
      queryClient.invalidateQueries(["admin-users"]);
      setPremiumModalVisible(false);
      premiumForm.resetFields();
    },
    onError: (error) => {
      message.error("Failed to grant premium!");
      console.error(error);
    },
  });

  // Remove premium mutation
  const removePremiumMutation = useMutation({
    mutationFn: removePremiumFromUser,
    onSuccess: (data) => {
      message.success(data.message);
      queryClient.invalidateQueries(["admin-users"]);
    },
    onError: (error) => {
      message.error("Failed to remove premium!");
      console.error(error);
    },
  });

  // Removed compatibility filter mutation - simplified feed system

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: ({ postId }) => deletePostAsAdmin(postId, 'admin'),
    onSuccess: (data) => {
      message.success(data.message);
      queryClient.invalidateQueries(["admin-posts"]);
      setPostDetailsModalVisible(false);
    },
    onError: (error) => {
      message.error("Failed to delete post!");
      console.error(error);
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: ({ postId, commentId }) => deleteCommentAsAdmin(postId, commentId, 'admin'),
    onSuccess: (data) => {
      message.success(data.message);
      queryClient.invalidateQueries(["admin-posts"]);
    },
    onError: (error) => {
      message.error("Failed to delete comment!");
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

  const openPremiumModal = (user) => {
    setSelectedUserForPremium(user);
    setPremiumModalVisible(true);
    premiumForm.resetFields();
  };

  const openPostDetailsModal = (post) => {
    setSelectedPost(post);
    setPostDetailsModalVisible(true);
  };

  const handleDeletePost = (postId) => {
    deletePostMutation.mutate({ postId });
  };

  const handleDeleteComment = (postId, commentId) => {
    deleteCommentMutation.mutate({ postId, commentId });
  };

  const getProfileImage = (user) => {
    if (!user) return null;
    
    if (user.images && user.images.length > 0) {
      return getMainProfileImage(user.images);
    }
    return user.image_url || user.imageUrl || null;
  };

  // Check if user is V1 migrated
  // Removed V1 user check

  // Check if user is premium
  const isPremiumUser = (user) => {
    if (!user?.subscription) return false;
    const status = user.subscription.status;
    return status === 'active' || status === 'trialing';
  };

  // Get premium subscription details
  const getPremiumDetails = (user) => {
    if (!isPremiumUser(user)) return null;
    
    const subscription = user.subscription;
    const currentPeriodEnd = subscription.currentPeriodEnd;
    let endDate = null;
    
    if (currentPeriodEnd) {
      if (currentPeriodEnd.seconds) {
        endDate = new Date(currentPeriodEnd.seconds * 1000);
      } else if (currentPeriodEnd._seconds) {
        endDate = new Date(currentPeriodEnd._seconds * 1000);
      } else {
        endDate = new Date(currentPeriodEnd);
      }
    }
    
    return {
      status: subscription.status,
      endDate,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      customerId: subscription.customerId,
      subscriptionId: subscription.subscriptionId
    };
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

              {isPremiumUser(record) && (
                <Tag color="purple" size="small" icon={<CrownOutlined />}>Premium</Tag>
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
      title: "Premium Status",
      dataIndex: "subscription",
      key: "premium",
      render: (subscription, record) => {
        if (!isPremiumUser(record)) {
          return <Tag color="default">Free</Tag>;
        }
        
        const details = getPremiumDetails(record);
        if (!details) return <Tag color="default">Free</Tag>;
        
        const isExpiringSoon = details.endDate && 
          (details.endDate.getTime() - new Date().getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days
        
        return (
          <Tooltip 
            title={
              <div>
                <div><strong>Status:</strong> {details.status}</div>
                {details.endDate && (
                  <div><strong>Ends:</strong> {details.endDate.toLocaleDateString()}</div>
                )}
                {details.cancelAtPeriodEnd && (
                  <div><strong>⚠️ Will cancel at period end</strong></div>
                )}
                {details.customerId && (
                  <div><strong>Customer ID:</strong> {details.customerId}</div>
                )}
              </div>
            }
          >
            <div>
              <Badge 
                status={details.status === 'active' ? 'success' : 'processing'} 
                text={
                  <Tag 
                    color={details.status === 'active' ? 'gold' : 'blue'} 
                    icon={<CrownOutlined />}
                  >
                    Premium
                  </Tag>
                }
              />
              {details.endDate && (
                <div style={{ fontSize: '11px', color: isExpiringSoon ? '#ff4d4f' : '#666' }}>
                  Until {details.endDate.toLocaleDateString()}
                  {details.cancelAtPeriodEnd && ' (canceling)'}
                </div>
              )}
            </div>
          </Tooltip>
        );
      },
      sorter: (a, b) => {
        const aIsPremium = isPremiumUser(a) ? 1 : 0;
        const bIsPremium = isPremiumUser(b) ? 1 : 0;
        return bIsPremium - aIsPremium; // Premium users first
      },
      filters: [
        { text: 'Premium Users', value: 'premium' },
        { text: 'Free Users', value: 'free' },
      ],
      onFilter: (value, record) => {
        const userIsPremium = isPremiumUser(record);
        return value === 'premium' ? userIsPremium : !userIsPremium;
      },
      width: 150,
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
        <Space direction="vertical" size="small">
          <Button 
            type="primary" 
            icon={<HeartOutlined />}
            onClick={() => openCompatibilityModal(record)}
            size="small"
          >
            Manage Compatibilities
          </Button>
          <Space>
            {!isPremiumUser(record) ? (
              <Button 
                type="default" 
                icon={<CrownOutlined />}
                onClick={() => openPremiumModal(record)}
                size="small"
                style={{ color: '#FFD700', borderColor: '#FFD700' }}
              >
                Grant Premium
              </Button>
            ) : (
              <Popconfirm
                title="Remove Premium"
                description="Are you sure you want to remove premium from this user?"
                onConfirm={() => removePremiumMutation.mutate(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button 
                  danger
                  icon={<CrownOutlined />}
                  size="small"
                  loading={removePremiumMutation.isPending}
                >
                  Remove Premium
                </Button>
              </Popconfirm>
            )}
          </Space>
        </Space>
      ),
      width: 200,
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
    
    return matchesSearch && matchesGender && matchesAge;
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

  // Premium statistics
  const premiumStats = users ? {
    totalUsers: users.length,
    premiumUsers: users.filter(user => isPremiumUser(user)).length,
    freeUsers: users.filter(user => !isPremiumUser(user)).length,
    expiringSoon: users.filter(user => {
      const details = getPremiumDetails(user);
      return details?.endDate && 
        (details.endDate.getTime() - new Date().getTime()) < (7 * 24 * 60 * 60 * 1000);
    }).length,
    cancelingUsers: users.filter(user => {
      const details = getPremiumDetails(user);
      return details?.cancelAtPeriodEnd;
    }).length
  } : null;

  const tabItems = [
    {
      key: 'users',
      label: (
        <span>
          <UserOutlined />
          User Management
        </span>
      ),
      children: (
        <div>
          {/* Premium Statistics */}
          {premiumStats && (
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={12} md={8} lg={4}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                      {premiumStats.totalUsers}
                    </div>
                    <div style={{ color: '#666' }}>Total Users</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={4}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                      <CrownOutlined style={{ marginRight: '4px' }} />
                      {premiumStats.premiumUsers}
                    </div>
                    <div style={{ color: '#666' }}>Premium Users</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={4}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                      {premiumStats.freeUsers}
                    </div>
                    <div style={{ color: '#666' }}>Free Users</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={4}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                      {premiumStats.expiringSoon}
                    </div>
                    <div style={{ color: '#666' }}>Expiring Soon</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={4}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>
                      {premiumStats.cancelingUsers}
                    </div>
                    <div style={{ color: '#666' }}>Canceling</div>
                  </div>
                </Card>
              </Col>
            </Row>
          )}
          
          {/* User Management Section */}
          <Card>
            <Title level={3}>User Management & Compatibilities</Title>
            <Text type="secondary">
              Manage manual compatibilities between users and monitor premium subscriptions. Compatible users can see each other's social media wall and chat.
            </Text>
            
            <Divider />


        
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
          <Col span={6}>
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
          <Col span={6}>
            <div style={{ textAlign: 'right' }}>
              <Text strong>Total Users: {users?.length || 0}</Text><br/>
              <Text type="secondary">Filtered: {filteredUsers.length}</Text>
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
        </div>
      )
    },
    {
      key: 'moderation',
      label: (
        <span>
          <WarningOutlined />
          Content Moderation
        </span>
      ),
      children: (
        <div>
          <Card>
            <Title level={3}>Posts & Comments Moderation</Title>
            <Text type="secondary">
              Supervise user behavior and manage inappropriate content. Delete posts or comments that violate community guidelines.
            </Text>
            
            <Divider />

            {postsLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Spin size="large" />
                <Typography style={{ marginTop: '1rem' }}>Loading posts...</Typography>
              </div>
            ) : (
              <div>
                {/* Stats */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                  <Col xs={24} sm={12} md={6}>
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                          {postsData?.data?.length || 0}
                        </div>
                        <div style={{ color: '#666' }}>Recent Posts</div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                          {postsData?.data?.reduce((sum, post) => sum + (post.commentsCount || 0), 0) || 0}
                        </div>
                        <div style={{ color: '#666' }}>Total Comments</div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>
                          <DeleteOutlined style={{ marginRight: '4px' }} />
                          0
                        </div>
                        <div style={{ color: '#666' }}>Deleted Today</div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        <Button 
                          type="primary" 
                          icon={<EyeOutlined />}
                          onClick={() => refetchPosts()}
                          loading={postsLoading}
                        >
                          Refresh
                        </Button>
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* Posts List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {postsData?.data?.map((post) => (
                    <Card 
                      key={post.id}
                      size="small"
                      style={{ borderLeft: '4px solid #1890ff' }}
                      actions={[
                        <Button 
                          key="view"
                          type="text" 
                          icon={<EyeOutlined />}
                          onClick={() => openPostDetailsModal(post)}
                        >
                          View Details
                        </Button>,
                        <Popconfirm
                          key="delete"
                          title="Delete this post?"
                          description="This will permanently delete the post and all its comments. Are you sure?"
                          onConfirm={() => handleDeletePost(post.id)}
                          okText="Yes, Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                        >
                          <Button 
                            type="text" 
                            danger
                            icon={<DeleteOutlined />}
                            loading={deletePostMutation.isPending}
                          >
                            Delete Post
                          </Button>
                        </Popconfirm>
                      ]}
                    >
                      <Row gutter={[16, 8]}>
                        <Col span={2}>
                          <Avatar 
                            src={getProfileImage(post.author)} 
                            icon={<UserOutlined />}
                            size="large"
                          />
                        </Col>
                        <Col span={22}>
                          <div>
                            <Text strong>
                              {post.author ? 
                                `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() || 
                                post.author.username || 'Unknown User' 
                                : 'Unknown User'}
                            </Text>
                            <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                              {new Date(post.createdAt).toLocaleString()}
                            </Text>
                          </div>
                          
                          <div style={{ marginTop: '8px', marginBottom: '12px' }}>
                            <Text>{post.content?.substring(0, 200)}{post.content?.length > 200 ? '...' : ''}</Text>
                          </div>

                          {post.images && post.images.length > 0 && (
                            <div style={{ marginBottom: '12px' }}>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                📷 {post.images.length} image(s) attached
                              </Text>
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '16px' }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              💬 {post.commentsCount || 0} comments
                            </Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              👍 {post.likesCount || 0} likes
                            </Text>
                          </div>

                          {/* Recent Comments Preview */}
                          {post.comments && post.comments.length > 0 && (
                            <div style={{ marginTop: '12px', padding: '8px', background: '#fafafa', borderRadius: '4px' }}>
                              <Text strong style={{ fontSize: '12px', color: '#666' }}>Recent Comments:</Text>
                              {post.comments.slice(0, 2).map((comment) => (
                                <div key={comment.id} style={{ marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                  <div style={{ flex: 1 }}>
                                    <Text style={{ fontSize: '11px' }}>
                                      <Text strong>
                                        {comment.author ? 
                                          `${comment.author.firstName || ''} ${comment.author.lastName || ''}`.trim() || 
                                          comment.author.username || 'Unknown User' 
                                          : 'Unknown User'}:
                                      </Text> {comment.comment?.substring(0, 100)}{comment.comment?.length > 100 ? '...' : ''}
                                    </Text>
                                  </div>
                                  <Popconfirm
                                    title="Delete comment?"
                                    description="Are you sure you want to delete this comment?"
                                    onConfirm={() => handleDeleteComment(post.id, comment.id)}
                                    okText="Delete"
                                    cancelText="Cancel"
                                    okButtonProps={{ danger: true, size: 'small' }}
                                  >
                                    <Button 
                                      type="text" 
                                      danger 
                                      size="small"
                                      icon={<DeleteOutlined />}
                                      style={{ padding: '2px 4px', height: 'auto', marginLeft: '8px' }}
                                      loading={deleteCommentMutation.isPending}
                                    />
                                  </Popconfirm>
                                </div>
                              ))}
                              {post.comments.length > 2 && (
                                <Text type="secondary" style={{ fontSize: '11px' }}>
                                  +{post.comments.length - 2} more comments
                                </Text>
                              )}
                            </div>
                          )}
                        </Col>
                      </Row>
                    </Card>
                  ))}

                  {postsData?.data?.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <Text type="secondary">No posts found.</Text>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      )
    },
    // Removed settings tab - simplified feed system without admin controls
    {
      key: 'chats',
      label: (
        <span>
          <MessageOutlined />
          Support Chats
        </span>
      ),
      children: <AdminChatDashboard />
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        <Title level={2}>Admin Dashboard</Title>
        <Text type="secondary">
          Manage users, compatibilities, premium subscriptions, content moderation, and support chats.
        </Text>
        
        <Divider />
        
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
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
                        {viewingUser.subscription?.type === 'admin_granted' && (
                          <div><Text type="secondary">Premium Type:</Text> Admin Granted</div>
                        )}
                        {viewingUser.subscription?.type === 'lifetime' && (
                          <div><Text type="secondary">Premium Type:</Text> Lifetime</div>
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

      {/* Premium Management Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CrownOutlined style={{ color: '#FFD700', fontSize: '24px' }} />
            <div>
              <div style={{ fontSize: '18px', fontWeight: 600 }}>
                Grant Premium Access
              </div>
              <Text type="secondary">
                {selectedUserForPremium && (selectedUserForPremium.firstName && selectedUserForPremium.lastName) 
                  ? `${selectedUserForPremium.firstName} ${selectedUserForPremium.lastName}` 
                  : selectedUserForPremium?.displayName || selectedUserForPremium?.name || "Unknown User"}
              </Text>
            </div>
          </div>
        }
        open={premiumModalVisible}
        onCancel={() => setPremiumModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedUserForPremium && (
          <Form
            form={premiumForm}
            layout="vertical"
            onFinish={(values) => {
              grantPremiumMutation.mutate({
                userId: selectedUserForPremium.id,
                premiumType: values.premiumType,
                endDate: values.endDate
              });
            }}
          >
            <Form.Item
              name="premiumType"
              label="Premium Type"
              rules={[{ required: true, message: 'Please select premium type' }]}
              initialValue="lifetime"
            >
              <Radio.Group>
                <Space direction="vertical">
                  <Radio value="lifetime">
                    <div>
                      <Text strong>Lifetime Premium</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Premium access until 2099 (effectively permanent)
                      </Text>
                    </div>
                  </Radio>
                  <Radio value="temporary">
                    <div>
                      <Text strong>Temporary Premium</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Premium access until a specific date
                      </Text>
                    </div>
                  </Radio>
                  <Radio value="admin_granted">
                    <div>
                      <Text strong>Admin Granted</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Default admin-granted premium (lifetime)
                      </Text>
                    </div>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.premiumType !== currentValues.premiumType
              }
            >
              {({ getFieldValue }) =>
                getFieldValue('premiumType') === 'temporary' ? (
                  <Form.Item
                    name="endDate"
                    label="End Date"
                    rules={[
                      { required: true, message: 'Please select end date for temporary premium' },
                      {
                        validator: (_, value) => {
                          if (!value || value.isAfter(new Date())) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('End date must be in the future'));
                        },
                      },
                    ]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder="Select end date"
                      disabledDate={(current) => current && current < new Date()}
                    />
                  </Form.Item>
                ) : null
              }
            </Form.Item>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <Space>
                <Button onClick={() => setPremiumModalVisible(false)}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={grantPremiumMutation.isPending}
                  icon={<CrownOutlined />}
                  style={{ background: '#FFD700', borderColor: '#FFD700', color: '#000' }}
                >
                  Grant Premium
                </Button>
              </Space>
            </div>
          </Form>
        )}
      </Modal>

      {/* Post Details Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <EyeOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
            <div>
              <span style={{ fontSize: '16px', fontWeight: 600 }}>Post Details</span>
            </div>
          </div>
        }
        open={postDetailsModalVisible}
        onCancel={() => setPostDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPostDetailsModalVisible(false)}>
            Close
          </Button>,
          <Popconfirm
            key="delete"
            title="Delete this post?"
            description="This will permanently delete the post and all its comments. Are you sure?"
            onConfirm={() => handleDeletePost(selectedPost?.id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button 
              danger
              icon={<DeleteOutlined />}
              loading={deletePostMutation.isPending}
            >
              Delete Post
            </Button>
          </Popconfirm>
        ]}
        width={800}
      >
        {selectedPost && (
          <div>
            {/* Post Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '12px', background: '#fafafa', borderRadius: '8px' }}>
              <Avatar 
                src={getProfileImage(selectedPost.author)} 
                icon={<UserOutlined />}
                size="large"
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 500 }}>
                  {selectedPost.author ? 
                    `${selectedPost.author.firstName || ''} ${selectedPost.author.lastName || ''}`.trim() || 
                    selectedPost.author.username || 'Unknown User' 
                    : 'Unknown User'}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Posted: {new Date(selectedPost.createdAt).toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Post ID: {selectedPost.id}
                </div>
              </div>
            </div>

            {/* Post Content */}
            <Card title="Post Content" size="small" style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
                {selectedPost.content || <Text type="secondary">No text content</Text>}
              </div>

              {/* Post Images */}
              {selectedPost.images && selectedPost.images.length > 0 && (
                <div>
                  <Text strong style={{ fontSize: '12px', color: '#666', marginBottom: '8px', display: 'block' }}>
                    Images ({selectedPost.images.length}):
                  </Text>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
                    gap: '8px',
                    marginTop: '8px'
                  }}>
                    {selectedPost.images.map((image, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img 
                          src={image.fileUri || image.url || image}
                          alt={`Post image ${index + 1}`}
                          style={{ 
                            width: '100%', 
                            height: '120px', 
                            objectFit: 'cover', 
                            borderRadius: '4px',
                            border: '1px solid #f0f0f0'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Post Stats */}
              <div style={{ marginTop: '16px', display: 'flex', gap: '16px', padding: '8px', background: '#f9f9f9', borderRadius: '4px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  💬 {selectedPost.commentsCount || 0} comments
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  👍 {selectedPost.likesCount || 0} likes
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  👁️ {selectedPost.viewsCount || 0} views
                </Text>
              </div>
            </Card>

            {/* Comments Section */}
            <Card 
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Comments ({selectedPost.commentsCount || 0})</span>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Click delete button to remove inappropriate comments
                  </Text>
                </div>
              } 
              size="small"
            >
              {selectedPost.comments && selectedPost.comments.length > 0 ? (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {selectedPost.comments.map((comment) => (
                    <div key={comment.id} style={{ 
                      padding: '12px', 
                      border: '1px solid #f0f0f0', 
                      borderRadius: '6px', 
                      marginBottom: '8px',
                      background: '#fff'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <Avatar 
                              src={getProfileImage(comment.author)} 
                              icon={<UserOutlined />}
                              size="small"
                            />
                            <Text strong style={{ fontSize: '13px' }}>
                              {comment.author ? 
                                `${comment.author.firstName || ''} ${comment.author.lastName || ''}`.trim() || 
                                comment.author.username || 'Unknown User' 
                                : 'Unknown User'}
                            </Text>
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              {new Date(comment.createdAt).toLocaleString()}
                            </Text>
                          </div>
                          <div style={{ fontSize: '13px', marginTop: '4px' }}>
                            {comment.comment}
                          </div>
                          <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                            Comment ID: {comment.id}
                          </div>
                        </div>
                        <Popconfirm
                          title="Delete comment?"
                          description="Are you sure you want to delete this comment?"
                          onConfirm={() => handleDeleteComment(selectedPost.id, comment.id)}
                          okText="Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                        >
                          <Button 
                            type="text" 
                            danger 
                            size="small"
                            icon={<DeleteOutlined />}
                            loading={deleteCommentMutation.isPending}
                          />
                        </Popconfirm>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Text type="secondary">No comments on this post</Text>
                </div>
              )}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard; 