"use client";
import React, { useState, useEffect, useCallback } from "react";
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
import { UserOutlined, HeartOutlined, SearchOutlined, CrownOutlined, MessageOutlined, DeleteOutlined, EyeOutlined, WarningOutlined, HeartFilled } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAllUsers, addCompatibility, removeCompatibility, getUserCompatibilities, addOppositeGenderCompatibilities, addSameGenderCompatibilities, addCompatibilitiesByIntent, grantPremiumToUser, removePremiumFromUser, getAllPostsForAdmin, deletePostAsAdmin, deleteCommentAsAdmin, getAllResonanceRequests } from "@/actions/admin";
// Removed admin settings import - simplified feed system
import { getMainProfileImage } from "@/utils/imageHelpers";

import AdminChatDashboard from "@/components/AdminChatDashboard";
import ErrorsManagement from "./ErrorsManagement";

const { Title, Text } = Typography;
const { Search } = Input;

// Separate component to avoid hooks in render method
const CompatibilityCell = ({ userId }) => {
  const [compatibilityData, setCompatibilityData] = useState({ count: 0, lastDate: null, loading: true });
  
  useEffect(() => {
    const fetchCompatibilityData = async () => {
      try {
        const compatibilitiesRef = collection(db, "Compatibilities");
        const q = query(compatibilitiesRef, where("userId", "==", userId));
        const snapshot = await getDocs(q);
        const count = snapshot.size;
        
        // Get last compatibility date
        const qLast = query(
          compatibilitiesRef,
          where("userId", "==", userId),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const lastSnapshot = await getDocs(qLast);
        const lastDate = lastSnapshot.empty ? null : lastSnapshot.docs[0].data().createdAt?.toDate();
        
        setCompatibilityData({ count, lastDate, loading: false });
      } catch (error) {
        console.error('Error fetching compatibility data:', error);
        setCompatibilityData({ count: 0, lastDate: null, loading: false });
      }
    };
    
    fetchCompatibilityData();
  }, [userId]);

  if (compatibilityData.loading) {
    return <Spin size="small" />;
  }

  const { count, lastDate } = compatibilityData;
  
  let lastCompatibilityText = 'Never';
  let lastCompatibilityColor = 'default';
  
  if (lastDate) {
    const now = new Date();
    const timeDiff = now - lastDate;
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      lastCompatibilityText = 'Today';
      lastCompatibilityColor = 'green';
    } else if (daysDiff === 1) {
      lastCompatibilityText = 'Yesterday';
      lastCompatibilityColor = 'blue';
    } else if (daysDiff <= 7) {
      lastCompatibilityText = `${daysDiff} days ago`;
      lastCompatibilityColor = 'orange';
    } else if (daysDiff <= 30) {
      lastCompatibilityText = `${daysDiff} days ago`;
      lastCompatibilityColor = 'red';
    } else {
      lastCompatibilityText = lastDate.toLocaleDateString();
      lastCompatibilityColor = 'default';
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <HeartFilled style={{ color: count > 0 ? '#ff4d4f' : '#d9d9d9' }} />
        <Text strong style={{ color: count > 0 ? '#ff4d4f' : '#999' }}>
          {count}
        </Text>
      </div>
      <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
        <Text type="secondary">Last: </Text>
        <Tag color={lastCompatibilityColor} size="small">
          {lastCompatibilityText}
        </Tag>
      </div>
    </div>
  );
};

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
  const [intentFilter, setIntentFilter] = useState(null); // 'long_term' | 'casual' | 'friendship'
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [sortBy, setSortBy] = useState('lastActive'); // 'name', 'age', 'lastActive'
  const [compatibilitySearchText, setCompatibilitySearchText] = useState("");
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'moderation' or 'chats'
  const [selectedPost, setSelectedPost] = useState(null);
  const [postDetailsModalVisible, setPostDetailsModalVisible] = useState(false);
  
  // New compatibility filters
  const [hasCompatibilitiesFilter, setHasCompatibilitiesFilter] = useState(null); // 'has' | 'none' | null
  const [lastCompatibilityPeriod, setLastCompatibilityPeriod] = useState(null); // 'week' | 'month' | '3months' | '6months' | 'year' | null
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteringUsers, setFilteringUsers] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAllUsers,
  });

  // Initialize filteredUsers with all users when users data is loaded
  useEffect(() => {
    if (users && filteredUsers.length === 0 && !filteringUsers) {
      setFilteredUsers(users);
    }
  }, [users, filteredUsers.length, filteringUsers]);

  // Fetch all posts for moderation
  const { data: postsData, isLoading: postsLoading, refetch: refetchPosts } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: () => getAllPostsForAdmin(50), // Get 50 posts at a time
    enabled: activeTab === 'moderation', // Only fetch when on moderation tab
  });

  // Fetch all resonance requests
  const { data: resonanceRequests, isLoading: resonanceLoading, refetch: refetchResonanceRequests } = useQuery({
    queryKey: ["admin-resonance-requests"],
    queryFn: getAllResonanceRequests,
    enabled: activeTab === 'resonance', // Only fetch when on resonance tab
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

  // Add by intent mutation (long_term / casual / friendship)
  const addByIntentMutation = useMutation({
    mutationFn: addCompatibilitiesByIntent,
    onSuccess: (res) => {
      message.success(res?.message || 'Compatibilities added by intent');
      queryClient.invalidateQueries(["user-compatibilities"]);
    },
    onError: () => message.error('Failed to add compatibilities by intent')
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

  // Approve resonance request mutation (creates compatibility)
  const approveResonanceMutation = useMutation({
    mutationFn: ({ requesterId, targetUserId, requestId }) => addCompatibility({ userId: requesterId, targetUserId }),
    onSuccess: (data, variables) => {
      message.success("Resonance approved! Compatibility created successfully! ✨");
      
      // Update compatibility status immediately
      if (variables.requestId) {
        setCompatibilityStatuses(prev => ({
          ...prev,
          [variables.requestId]: true
        }));
      }
      
      queryClient.invalidateQueries(["admin-resonance-requests"]);
      queryClient.invalidateQueries(["user-compatibilities"]);
    },
    onError: (error) => {
      message.error("Failed to approve resonance request!");
      console.error(error);
    },
  });

  // Remove compatibility mutation for resonance requests
  const removeResonanceCompatibilityMutation = useMutation({
    mutationFn: ({ requesterId, targetUserId, requestId }) => removeCompatibility({ userId: requesterId, targetUserId }),
    onSuccess: (data, variables) => {
      message.success("Compatibility removed successfully! The cosmic connection has been dissolved. 💫");
      
      // Update compatibility status immediately
      if (variables.requestId) {
        setCompatibilityStatuses(prev => ({
          ...prev,
          [variables.requestId]: false
        }));
      }
      
      queryClient.invalidateQueries(["admin-resonance-requests"]);
      queryClient.invalidateQueries(["user-compatibilities"]);
    },
    onError: (error) => {
      message.error("Failed to remove compatibility!");
      console.error(error);
    },
  });

  // Check compatibility status for resonance requests
  const [compatibilityStatuses, setCompatibilityStatuses] = useState({});
  
  useEffect(() => {
    const checkCompatibilityStatuses = async () => {
      if (!resonanceRequests || resonanceRequests.length === 0) return;
      
      const statuses = {};
      for (const request of resonanceRequests) {
        try {
          const { areUsersCompatible } = await import('@/actions/admin');
          const isCompatible = await areUsersCompatible(request.requesterId, request.targetUserId);
          statuses[request.id] = isCompatible;
        } catch (error) {
          console.error('Error checking compatibility:', error);
          statuses[request.id] = false;
        }
      }
      setCompatibilityStatuses(statuses);
    };

    checkCompatibilityStatuses();
  }, [resonanceRequests]);

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

  const handleApproveResonance = (requesterId, targetUserId, requestId) => {
    approveResonanceMutation.mutate({ requesterId, targetUserId, requestId });
  };

  const handleRemoveResonanceCompatibility = (requesterId, targetUserId, requestId) => {
    removeResonanceCompatibilityMutation.mutate({ requesterId, targetUserId, requestId });
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

  // Helper function to check if user matches compatibility filters
  const checkCompatibilityFilters = useCallback(async (user) => {
    if (!hasCompatibilitiesFilter && !lastCompatibilityPeriod) return true;
    
    try {
      const compatibilitiesRef = collection(db, "Compatibilities");
      const q = query(compatibilitiesRef, where("userId", "==", user.id));
      const snapshot = await getDocs(q);
      const compatibilitiesCount = snapshot.size;
      
      // Check has/no compatibilities filter
      if (hasCompatibilitiesFilter) {
        if (hasCompatibilitiesFilter === 'has' && compatibilitiesCount === 0) return false;
        if (hasCompatibilitiesFilter === 'none' && compatibilitiesCount > 0) return false;
      }
      
      // Check last compatibility period filter
      if (lastCompatibilityPeriod) {
        const qLast = query(
          compatibilitiesRef,
          where("userId", "==", user.id),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const lastSnapshot = await getDocs(qLast);
        const lastCompatibilityDate = lastSnapshot.empty ? null : lastSnapshot.docs[0].data().createdAt?.toDate();
        
        if (!lastCompatibilityDate) {
          // No compatibility found, this matches period filters only if looking for users with no recent activity
          return true;
        }
        
        const now = new Date();
        const timeDiff = now - lastCompatibilityDate;
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        
        switch (lastCompatibilityPeriod) {
          case 'week':
            return daysDiff > 7;
          case 'month':
            return daysDiff > 30;
          case '3months':
            return daysDiff > 90;
          case '6months':
            return daysDiff > 180;
          case 'year':
            return daysDiff > 365;
          default:
            return true;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error checking compatibility filters:', error);
      return true;
    }
  }, [hasCompatibilitiesFilter, lastCompatibilityPeriod]);

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

  // Helper functions for onboarding and profile statistics
  const getOnboardingStatus = (user) => {
    if (!user) return { isComplete: false, completedSteps: 0, totalSteps: 3, percentage: 0 };
    
    const hasPhotos = user.images && Array.isArray(user.images) && user.images.length > 0;
    const hasInterests = user.interests && Array.isArray(user.interests) && user.interests.length > 0;
    const hasQuestionnaire = user.questionnaire && Object.keys(user.questionnaire || {}).length >= 3;
    const isMarkedComplete = user.onboardingCompleted === true;
    
    let completedSteps = 0;
    if (hasPhotos) completedSteps++;
    if (hasInterests) completedSteps++;
    if (hasQuestionnaire) completedSteps++;
    
    const totalSteps = 3;
    const percentage = Math.round((completedSteps / totalSteps) * 100);
    const isComplete = isMarkedComplete && hasPhotos && hasInterests && hasQuestionnaire;
    
    return {
      isComplete,
      completedSteps,
      totalSteps,
      percentage,
      hasPhotos,
      hasInterests,
      hasQuestionnaire,
      isMarkedComplete,
      missingSteps: [
        !hasPhotos && 'Photos',
        !hasInterests && 'Interests', 
        !hasQuestionnaire && 'Questionnaire'
      ].filter(Boolean)
    };
  };

  const getProfileCompleteness = (user) => {
    if (!user) return { percentage: 0, missingFields: [] };
    
    const fields = {
      bio: user.bio && user.bio.trim(),
      location: user.location && user.location.trim(),
      website: user.website && user.website.trim(),
      relationshipStatus: user.relationshipStatus && user.relationshipStatus.trim()
    };
    
    const completedFields = Object.values(fields).filter(Boolean).length;
    const totalFields = Object.keys(fields).length;
    const percentage = Math.round((completedFields / totalFields) * 100);
    const missingFields = Object.keys(fields).filter(key => !fields[key]);
    
    return { percentage, missingFields, completedFields, totalFields };
  };

  const getAccountAge = (user) => {
    if (!user || !user.createdAt) return null;
    
    const createdDate = user.createdAt.seconds 
      ? new Date(user.createdAt.seconds * 1000) 
      : new Date(user.createdAt);
    
    const now = new Date();
    const diffMs = now - createdDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return '1 day';
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  const getAstrologicalInfo = (user) => {
    if (!user || !user.questionnaire) return { hasInfo: false };
    
    return {
      hasInfo: true,
      zodiacSign: user.questionnaire.zodiacSign || null,
      birthDate: user.questionnaire.birthDate || null,
      relationshipType: user.questionnaire.relationshipType || null,
      age: user.age || null
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
      title: "Onboarding",
      dataIndex: "onboardingCompleted",
      key: "onboarding",
      render: (onboardingCompleted, record) => {
        const status = getOnboardingStatus(record);
        const profileStatus = getProfileCompleteness(record);
        
        return (
          <Tooltip 
            title={
              <div>
                <div><strong>Onboarding Progress:</strong> {status.completedSteps}/{status.totalSteps} steps</div>
                <div>✅ Photos: {status.hasPhotos ? 'Complete' : 'Missing'} ({record.images?.length || 0})</div>
                <div>✅ Interests: {status.hasInterests ? 'Complete' : 'Missing'} ({record.interests?.length || 0})</div>
                <div>✅ Questionnaire: {status.hasQuestionnaire ? 'Complete' : 'Missing'}</div>
                {status.missingSteps.length > 0 && (
                  <div style={{ color: '#ff4d4f' }}><strong>Missing:</strong> {status.missingSteps.join(', ')}</div>
                )}
                <div style={{ marginTop: '8px' }}>
                  <strong>Profile Completeness:</strong> {profileStatus.percentage}%
                </div>
                {profileStatus.missingFields.length > 0 && (
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    Optional fields: {profileStatus.missingFields.join(', ')}
                  </div>
                )}
                {getAstrologicalInfo(record).hasInfo && (
                  <div style={{ marginTop: '4px', fontSize: '11px', color: '#1890ff' }}>
                    🔮 {getAstrologicalInfo(record).zodiacSign} {getAstrologicalInfo(record).age && `• ${getAstrologicalInfo(record).age}y`}
                  </div>
                )}
              </div>
            }
          >
            <div>
              {status.isComplete ? (
                <div>
                  <Tag color="green" icon="✅">Complete</Tag>
                  <div style={{ fontSize: '11px', color: '#52c41a' }}>
                    {status.percentage}% • Profile {profileStatus.percentage}%
                  </div>
                </div>
              ) : (
                <div>
                  <Tag color={status.completedSteps === 0 ? 'red' : 'orange'}>
                    {status.completedSteps === 0 ? 'Not Started' : `${status.completedSteps}/3 Steps`}
                  </Tag>
                  <div style={{ fontSize: '11px', color: status.completedSteps === 0 ? '#ff4d4f' : '#fa8c16' }}>
                    {status.percentage}% complete
                  </div>
                </div>
              )}
            </div>
          </Tooltip>
        );
      },
      sorter: (a, b) => {
        const aStatus = getOnboardingStatus(a);
        const bStatus = getOnboardingStatus(b);
        if (aStatus.isComplete && !bStatus.isComplete) return -1;
        if (!aStatus.isComplete && bStatus.isComplete) return 1;
        return bStatus.percentage - aStatus.percentage;
      },
      filters: [
        { text: 'Complete', value: 'complete' },
        { text: 'In Progress', value: 'in_progress' },
        { text: 'Not Started', value: 'not_started' },
      ],
      onFilter: (value, record) => {
        const status = getOnboardingStatus(record);
        if (value === 'complete') return status.isComplete;
        if (value === 'in_progress') return !status.isComplete && status.completedSteps > 0;
        if (value === 'not_started') return status.completedSteps === 0;
        return false;
      },
      width: 160,
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
      title: "Account Age",
      dataIndex: "createdAt",
      key: "accountAge",
      render: (createdAt, record) => {
        const accountAge = getAccountAge(record);
        if (!accountAge) return <Text type="secondary">Unknown</Text>;
        
        const days = (() => {
          if (!record.createdAt) return 0;
          const createdDate = record.createdAt.seconds 
            ? new Date(record.createdAt.seconds * 1000) 
            : new Date(record.createdAt);
          return Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
        })();
        
        let color = 'default';
        if (days <= 7) color = 'green';      // New users (1 week)
        else if (days <= 30) color = 'blue'; // Recent users (1 month)
        else if (days <= 90) color = 'orange'; // Established users (3 months)
        else color = 'default';               // Long-term users
        
        return (
          <div>
            <Tag color={color} size="small">{accountAge}</Tag>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
              {days === 0 ? 'Today' : `${days} day${days !== 1 ? 's' : ''} ago`}
            </div>
          </div>
        );
      },
      sorter: (a, b) => {
        const getTimestamp = (user) => {
          if (!user.createdAt) return 0;
          return user.createdAt.seconds 
            ? user.createdAt.seconds * 1000 
            : new Date(user.createdAt).getTime();
        };
        return getTimestamp(b) - getTimestamp(a); // Newest first
      },
      filters: [
        { text: 'New (< 1 week)', value: 'new' },
        { text: 'Recent (< 1 month)', value: 'recent' },
        { text: 'Established (< 3 months)', value: 'established' },
        { text: 'Long-term (> 3 months)', value: 'longtime' },
      ],
      onFilter: (value, record) => {
        if (!record.createdAt) return false;
        const createdDate = record.createdAt.seconds 
          ? new Date(record.createdAt.seconds * 1000) 
          : new Date(record.createdAt);
        const days = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
        
        if (value === 'new') return days <= 7;
        if (value === 'recent') return days > 7 && days <= 30;
        if (value === 'established') return days > 30 && days <= 90;
        if (value === 'longtime') return days > 90;
        return false;
      },
      width: 120,
    },
    {
      title: "Compatibilities",
      key: "compatibilities",
      render: (_, record) => {
        return <CompatibilityCell userId={record.id} />;
      },
      sorter: (a, b) => {
        // Note: This will be async, so sorting might not work perfectly
        // For better sorting, we'd need to preload compatibility data
        return 0;
      },
      width: 140,
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
  const applyFilters = useCallback(async () => {
    if (!users) {
      setFilteredUsers([]);
      return;
    }
    
    setFilteringUsers(true);
    
    try {
      const filtered = [];
      
      for (const user of users) {
        if (!user) continue;
        
        const fullName = (user.firstName && user.lastName) 
          ? `${user.firstName} ${user.lastName}` 
          : user.displayName || user.name || "";
        const username = user.username || user.email?.split('@')[0] || "";
        
        // Text search
        const matchesSearch = !searchText || 
          fullName.toLowerCase().includes(searchText.toLowerCase()) ||
          username.toLowerCase().includes(searchText.toLowerCase()) ||
          (user.bio && user.bio.toLowerCase().includes(searchText.toLowerCase()));
        
        // Gender filter
        const matchesGender = !genderFilter || user.gender === genderFilter;
        
        // Age filter
        const userAge = user.age || user.dateOfBirth ? 
          (user.age || new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()) : null;
        const matchesAge = !userAge || (userAge >= ageRange[0] && userAge <= ageRange[1]);
        
        // Relationship intent filter
        const userIntentRaw = user?.questionnaire?.relationshipType || '';
        const normIntent = userIntentRaw.toLowerCase().includes('lung') || userIntentRaw.toLowerCase().includes('long') ? 'long_term'
          : userIntentRaw.toLowerCase().includes('casual') ? 'casual'
          : userIntentRaw.toLowerCase().includes('prieten') || userIntentRaw.toLowerCase().includes('friend') ? 'friendship'
          : null;
        const matchesIntent = !intentFilter || normIntent === intentFilter;

        // Basic filters
        const matchesBasicFilters = matchesSearch && matchesGender && matchesAge && matchesIntent;
        
        if (!matchesBasicFilters) continue;
        
        // Compatibility filters (async)
        const matchesCompatibilityFilters = await checkCompatibilityFilters(user);
        
        if (matchesCompatibilityFilters) {
          filtered.push(user);
        }
      }
      
      setFilteredUsers(filtered);
    } catch (error) {
      console.error('Error filtering users:', error);
      setFilteredUsers(users || []);
    } finally {
      setFilteringUsers(false);
    }
  }, [users, searchText, genderFilter, ageRange, intentFilter, checkCompatibilityFilters]);
  
  // Apply filters when users or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

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

  // Onboarding and engagement statistics
  const onboardingStats = users ? {
    completedOnboarding: users.filter(user => getOnboardingStatus(user).isComplete).length,
    inProgressOnboarding: users.filter(user => {
      const status = getOnboardingStatus(user);
      return !status.isComplete && status.completedSteps > 0;
    }).length,
    notStartedOnboarding: users.filter(user => getOnboardingStatus(user).completedSteps === 0).length,
    withPhotos: users.filter(user => getOnboardingStatus(user).hasPhotos).length,
    withInterests: users.filter(user => getOnboardingStatus(user).hasInterests).length,
    withQuestionnaire: users.filter(user => getOnboardingStatus(user).hasQuestionnaire).length,
    fullProfileComplete: users.filter(user => {
      const profile = getProfileCompleteness(user);
      return profile.percentage === 100;
    }).length,
    hasAstrologyInfo: users.filter(user => getAstrologicalInfo(user).hasInfo).length,
    recentlyActive: users.filter(user => {
      if (!user.lastTimeActive) return false;
      const lastActive = user.lastTimeActive.seconds 
        ? new Date(user.lastTimeActive.seconds * 1000) 
        : new Date(user.lastTimeActive);
      const daysSinceActive = (new Date() - lastActive) / (1000 * 60 * 60 * 24);
      return daysSinceActive <= 7; // Active within last 7 days
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

          {/* Onboarding Statistics */}
          {onboardingStats && (
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={12} md={8} lg={4}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                      ✅ {onboardingStats.completedOnboarding}
                    </div>
                    <div style={{ color: '#666' }}>Onboarding Complete</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {premiumStats ? Math.round((onboardingStats.completedOnboarding / premiumStats.totalUsers) * 100) : 0}%
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={4}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                      🔄 {onboardingStats.inProgressOnboarding}
                    </div>
                    <div style={{ color: '#666' }}>In Progress</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {premiumStats ? Math.round((onboardingStats.inProgressOnboarding / premiumStats.totalUsers) * 100) : 0}%
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={4}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>
                      ❌ {onboardingStats.notStartedOnboarding}
                    </div>
                    <div style={{ color: '#666' }}>Not Started</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {premiumStats ? Math.round((onboardingStats.notStartedOnboarding / premiumStats.totalUsers) * 100) : 0}%
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={4}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                      📸 {onboardingStats.withPhotos}
                    </div>
                    <div style={{ color: '#666' }}>Have Photos</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {premiumStats ? Math.round((onboardingStats.withPhotos / premiumStats.totalUsers) * 100) : 0}%
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={4}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                      💎 {onboardingStats.withInterests}
                    </div>
                    <div style={{ color: '#666' }}>Have Interests</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {premiumStats ? Math.round((onboardingStats.withInterests / premiumStats.totalUsers) * 100) : 0}%
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={4}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#eb2f96' }}>
                      🔮 {onboardingStats.hasAstrologyInfo}
                    </div>
                    <div style={{ color: '#666' }}>Astrology Info</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {premiumStats ? Math.round((onboardingStats.hasAstrologyInfo / premiumStats.totalUsers) * 100) : 0}%
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={4}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#13c2c2' }}>
                      📝 {onboardingStats.fullProfileComplete}
                    </div>
                    <div style={{ color: '#666' }}>Full Profile</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {premiumStats ? Math.round((onboardingStats.fullProfileComplete / premiumStats.totalUsers) * 100) : 0}%
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={4}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                      🌟 {onboardingStats.recentlyActive}
                    </div>
                    <div style={{ color: '#666' }}>Active (7d)</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {premiumStats ? Math.round((onboardingStats.recentlyActive / premiumStats.totalUsers) * 100) : 0}%
                    </div>
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
          <Col span={6}>
            <Search
              placeholder="Search users by name, username, or bio..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={3}>
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
              placeholder="Filter by intent"
              value={intentFilter}
              onChange={setIntentFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value="long_term">Long-term</Select.Option>
              <Select.Option value="casual">Casual</Select.Option>
              <Select.Option value="friendship">Friendship</Select.Option>
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
          <Col span={3}>
            <Select
              placeholder="Compatibilities"
              value={hasCompatibilitiesFilter}
              onChange={setHasCompatibilitiesFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value="has">Has Compatibilities</Select.Option>
              <Select.Option value="none">No Compatibilities</Select.Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Last Compatibility"
              value={lastCompatibilityPeriod}
              onChange={setLastCompatibilityPeriod}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value="week">No compatibility for 1 week</Select.Option>
              <Select.Option value="month">No compatibility for 1 month</Select.Option>
              <Select.Option value="3months">No compatibility for 3 months</Select.Option>
              <Select.Option value="6months">No compatibility for 6 months</Select.Option>
              <Select.Option value="year">No compatibility for 1 year</Select.Option>
            </Select>
          </Col>
          <Col span={4}>
            <div style={{ textAlign: 'right' }}>
              <Text strong>Total Users: {users?.length || 0}</Text><br/>
              <Text type="secondary">
                Filtered: {filteredUsers.length}
                {filteringUsers && <Spin size="small" style={{ marginLeft: 8 }} />}
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
            <Col span={24}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button onClick={() => addByIntentMutation.mutate({ intent: 'long_term', ageTolerance: 5, maxPerUser: 0 })} loading={addByIntentMutation.isPending}>
                  ❤️ Add by Intent: Long-term (opposite genders)
                </Button>
                <Button onClick={() => addByIntentMutation.mutate({ intent: 'casual', ageTolerance: 5, maxPerUser: 0 })} loading={addByIntentMutation.isPending}>
                  🔥 Add by Intent: Casual (opposite genders)
                </Button>
                <Button onClick={() => addByIntentMutation.mutate({ intent: 'friendship', maxPerUser: 0 })} loading={addByIntentMutation.isPending}>
                  🤝 Add by Intent: Friendship (same gender)
                </Button>
                <span style={{ marginLeft: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Age tolerance:</Text>
                  &nbsp;
                  <Select size="small" defaultValue={5} style={{ width: 80 }} onChange={(v) => addByIntentMutation.mutate({ intent: 'long_term', ageTolerance: v })}>
                    <Select.Option value={2}>±2</Select.Option>
                    <Select.Option value={5}>±5</Select.Option>
                    <Select.Option value={10}>±10</Select.Option>
                  </Select>
                </span>
              </div>
              <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: 4 }}>
                Uses users' relationshipType to constrain pairs (detected as long_term / casual / friendship)
              </Text>
            </Col>
          </Row>
        </Card>

        <Table
          columns={userColumns}
          dataSource={filteredUsers}
          loading={usersLoading || filteringUsers}
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
    {
      key: 'resonance',
      label: (
        <span>
          <HeartFilled />
          Resonance Requests
        </span>
      ),
      children: (
        <div>
          <Card>
            <Title level={3}>Cosmic Resonance Requests ✨</Title>
            <Text type="secondary">
              Premium users who feel a special connection with someone can send resonance requests. Review and approve these cosmic connections to create new compatibilities.
            </Text>
            
            <Divider />

            {resonanceLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Spin size="large" />
                <Typography style={{ marginTop: '1rem' }}>Loading resonance requests...</Typography>
              </div>
            ) : (
              <div>
                {/* Stats */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                  <Col xs={24} sm={12} md={8}>
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6b6b' }}>
                          <HeartFilled style={{ marginRight: '4px' }} />
                          {resonanceRequests?.length || 0}
                        </div>
                        <div style={{ color: '#666' }}>Total Requests</div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                          {resonanceRequests?.filter(req => req.status === 'pending')?.length || 0}
                        </div>
                        <div style={{ color: '#666' }}>Pending</div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        <Button 
                          type="primary" 
                          icon={<HeartFilled />}
                          onClick={() => refetchResonanceRequests()}
                          loading={resonanceLoading}
                          style={{ background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)', border: 'none' }}
                        >
                          Refresh
                        </Button>
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* Resonance Requests List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {resonanceRequests && resonanceRequests.length > 0 ? (
                    resonanceRequests.map((request) => (
                      <Card 
                        key={request.id}
                        size="small"
                        style={{ 
                          borderLeft: '4px solid #ff6b6b',
                          background: 'linear-gradient(135deg, #fff5f5 0%, #fff9f9 100%)'
                        }}
                        actions={[
                          // Show different actions based on compatibility status
                          compatibilityStatuses[request.id] ? (
                            <Button 
                              key="remove-compatibility"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemoveResonanceCompatibility(request.requesterId, request.targetUserId, request.id)}
                              loading={removeResonanceCompatibilityMutation.isPending}
                              style={{ background: 'linear-gradient(135deg, #ff4d4f, #ff7875)', border: 'none', color: 'white' }}
                            >
                              Remove Compatibility 💔
                            </Button>
                          ) : (
                            <Button 
                              key="approve"
                              type="primary"
                              icon={<HeartFilled />}
                              onClick={() => handleApproveResonance(request.requesterId, request.targetUserId, request.id)}
                              loading={approveResonanceMutation.isPending}
                              style={{ background: 'linear-gradient(135deg, #52c41a, #389e0d)', border: 'none' }}
                            >
                              Approve & Create Compatibility ✨
                            </Button>
                          ),
                          <Button 
                            key="view-requester"
                            type="text" 
                            icon={<UserOutlined />}
                            onClick={() => openProfileModal(request.requester)}
                          >
                            View Requester
                          </Button>,
                          <Button 
                            key="view-target"
                            type="text" 
                            icon={<UserOutlined />}
                            onClick={() => openProfileModal(request.target)}
                          >
                            View Target
                          </Button>
                        ]}
                      >
                        <Row gutter={[16, 8]} align="middle">
                          {/* Requester */}
                          <Col span={10}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '12px',
                              padding: '12px',
                              background: 'white',
                              borderRadius: '8px',
                              border: '1px solid #f0f0f0'
                            }}>
                              <Avatar 
                                src={getProfileImage(request.requester)} 
                                icon={<UserOutlined />}
                                size="large"
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                                  {request.requester ? 
                                    `${request.requester.firstName || ''} ${request.requester.lastName || ''}`.trim() || 
                                    request.requester.username || 'Unknown User' 
                                    : 'Unknown User'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  @{request.requester?.username || 'no-username'}
                                </div>
                                <div style={{ marginTop: '4px' }}>
                                  {request.requester?.gender && (
                                    <Tag color={request.requester.gender === 'male' ? 'blue' : 'pink'} size="small">
                                      {request.requester.gender}
                                    </Tag>
                                  )}
                                  {request.requester?.age && (
                                    <Tag color="green" size="small">{request.requester.age}y</Tag>
                                  )}
                                  <Tag color="purple" size="small" icon={<CrownOutlined />}>Premium</Tag>
                                </div>
                              </div>
                            </div>
                          </Col>

                          {/* Resonance Arrow */}
                          <Col span={4} style={{ textAlign: 'center' }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {compatibilityStatuses[request.id] ? (
                                <>
                                  <div style={{ fontSize: '24px' }}>💖</div>
                                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#52c41a' }}>
                                    COMPATIBLE
                                  </div>
                                  <div style={{ fontSize: '16px' }}>✨</div>
                                </>
                              ) : (
                                <>
                                  <div style={{ fontSize: '24px' }}>💫</div>
                                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff6b6b' }}>
                                    RESONATES
                                  </div>
                                  <div style={{ fontSize: '16px' }}>✨</div>
                                </>
                              )}
                            </div>
                          </Col>

                          {/* Target */}
                          <Col span={10}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '12px',
                              padding: '12px',
                              background: 'white',
                              borderRadius: '8px',
                              border: '1px solid #f0f0f0'
                            }}>
                              <Avatar 
                                src={getProfileImage(request.target)} 
                                icon={<UserOutlined />}
                                size="large"
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                                  {request.target ? 
                                    `${request.target.firstName || ''} ${request.target.lastName || ''}`.trim() || 
                                    request.target.username || 'Unknown User' 
                                    : 'Unknown User'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  @{request.target?.username || 'no-username'}
                                </div>
                                <div style={{ marginTop: '4px' }}>
                                  {request.target?.gender && (
                                    <Tag color={request.target.gender === 'male' ? 'blue' : 'pink'} size="small">
                                      {request.target.gender}
                                    </Tag>
                                  )}
                                  {request.target?.age && (
                                    <Tag color="green" size="small">{request.target.age}y</Tag>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Col>
                        </Row>

                        {/* Request Info */}
                        <div style={{ 
                          marginTop: '12px', 
                          padding: '8px 12px', 
                          background: 'rgba(255, 107, 107, 0.1)', 
                          borderRadius: '6px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <Text style={{ fontSize: '12px', color: '#666' }}>
                                Request sent: {new Date(request.createdAt?.seconds ? request.createdAt.seconds * 1000 : request.createdAt).toLocaleString()}
                              </Text>
                            </div>
                            <div>
                              {compatibilityStatuses[request.id] ? (
                                <Tag color="green" size="small" icon={<HeartFilled />}>
                                  Compatible ✨
                                </Tag>
                              ) : (
                                <Tag color="orange" size="small">
                                  {request.status || 'pending'}
                                </Tag>
                              )}
                            </div>
                          </div>
                          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                            Request ID: {request.id}
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>💫</div>
                      <Title level={4} style={{ color: '#666' }}>No Resonance Requests Yet</Title>
                      <Text type="secondary">
                        When premium users feel a cosmic connection with someone, their requests will appear here for your review.
                      </Text>
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
      key: 'errors',
      label: (
        <span>
          <WarningOutlined />
          Error Management
        </span>
      ),
      children: <ErrorsManagement />
    },
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

                    {/* Onboarding Status */}
                    <div>
                      <Text strong>Onboarding Status:</Text>
                      <div style={{ marginLeft: '12px', marginTop: '4px' }}>
                        {(() => {
                          const onboardingStatus = getOnboardingStatus(viewingUser);
                          const profileStatus = getProfileCompleteness(viewingUser);
                          const accountAge = getAccountAge(viewingUser);
                          const astroInfo = getAstrologicalInfo(viewingUser);
                          
                          return (
                            <>
                              <div>
                                <Text type="secondary">Progress:</Text> 
                                <Tag color={onboardingStatus.isComplete ? 'green' : onboardingStatus.completedSteps > 0 ? 'orange' : 'red'} style={{ marginLeft: '8px' }}>
                                  {onboardingStatus.isComplete ? '✅ Complete' : `${onboardingStatus.completedSteps}/3 Steps`}
                                </Tag>
                                <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
                                  {onboardingStatus.percentage}%
                                </span>
                              </div>
                              <div>
                                <Text type="secondary">Photos:</Text> 
                                <Tag color={onboardingStatus.hasPhotos ? 'green' : 'red'} style={{ marginLeft: '8px' }}>
                                  {onboardingStatus.hasPhotos ? `✅ ${viewingUser.images?.length || 0} photos` : '❌ No photos'}
                                </Tag>
                              </div>
                              <div>
                                <Text type="secondary">Interests:</Text> 
                                <Tag color={onboardingStatus.hasInterests ? 'green' : 'red'} style={{ marginLeft: '8px' }}>
                                  {onboardingStatus.hasInterests ? `✅ ${viewingUser.interests?.length || 0} interests` : '❌ No interests'}
                                </Tag>
                              </div>
                              <div>
                                <Text type="secondary">Questionnaire:</Text> 
                                <Tag color={onboardingStatus.hasQuestionnaire ? 'green' : 'red'} style={{ marginLeft: '8px' }}>
                                  {onboardingStatus.hasQuestionnaire ? '✅ Complete' : '❌ Incomplete'}
                                </Tag>
                              </div>
                              <div>
                                <Text type="secondary">Profile Completeness:</Text> 
                                <Tag color={profileStatus.percentage === 100 ? 'green' : profileStatus.percentage > 50 ? 'orange' : 'red'} style={{ marginLeft: '8px' }}>
                                  {profileStatus.percentage}%
                                </Tag>
                                {profileStatus.missingFields.length > 0 && (
                                  <span style={{ marginLeft: '8px', fontSize: '11px', color: '#999' }}>
                                    Missing: {profileStatus.missingFields.join(', ')}
                                  </span>
                                )}
                              </div>
                              {accountAge && (
                                <div>
                                  <Text type="secondary">Account Age:</Text> 
                                  <span style={{ marginLeft: '8px' }}>{accountAge}</span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Astrology Information */}
                    {(() => {
                      const astroInfo = getAstrologicalInfo(viewingUser);
                      if (astroInfo.hasInfo) {
                        return (
                          <>
                            <Divider style={{ margin: '12px 0' }} />
                            <div>
                              <Text strong>🔮 Astrology Information:</Text>
                              <div style={{ marginLeft: '12px', marginTop: '4px' }}>
                                {astroInfo.zodiacSign && (
                                  <div>
                                    <Text type="secondary">Zodiac Sign:</Text> 
                                    <Tag color="purple" style={{ marginLeft: '8px' }}>
                                      {astroInfo.zodiacSign}
                                    </Tag>
                                  </div>
                                )}
                                {astroInfo.birthDate && (
                                  <div>
                                    <Text type="secondary">Birth Date:</Text> 
                                    <span style={{ marginLeft: '8px' }}>{astroInfo.birthDate}</span>
                                  </div>
                                )}
                                {astroInfo.relationshipType && (
                                  <div>
                                    <Text type="secondary">Relationship Type:</Text> 
                                    <Tag color="blue" style={{ marginLeft: '8px' }}>
                                      {astroInfo.relationshipType}
                                    </Tag>
                                  </div>
                                )}
                                {astroInfo.age && (
                                  <div>
                                    <Text type="secondary">Calculated Age:</Text> 
                                    <span style={{ marginLeft: '8px' }}>{astroInfo.age} years</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        );
                      }
                      return null;
                    })()}

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