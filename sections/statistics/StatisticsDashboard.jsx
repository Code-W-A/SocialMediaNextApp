"use client";
import React, { useState, useMemo } from "react";
import { Typography, Card, Row, Col, Radio, Divider, Statistic, Progress, Select, Table } from "antd";
import { 
  CrownOutlined, 
  UserAddOutlined, 
  RiseOutlined, 
  CheckCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  TrendingUpOutlined
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "@/actions/admin";

const { Title, Text } = Typography;
const { Option } = Select;

const StatisticsDashboard = () => {
  const [timePeriod, setTimePeriod] = useState("week"); // 'week' or 'month'
  const [chartMetric, setChartMetric] = useState("all"); // 'all', 'newUsers', 'premium', 'onboarding'

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAllUsers,
  });

  const isPremiumUser = (user) => {
    if (!user?.subscription) return false;
    const status = user.subscription.status;
    return status === "active" || status === "trialing";
  };

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
    };
  };

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
    };
  };

  const getProfileCompleteness = (user) => {
    if (!user) return { percentage: 0, missingFields: [] };
    const fields = {
      bio: user.bio && user.bio.trim(),
      location: user.location && user.location.trim(),
      website: user.website && user.website.trim(),
      relationshipStatus: user.relationshipStatus && user.relationshipStatus.trim(),
    };
    const completedFields = Object.values(fields).filter(Boolean).length;
    const totalFields = Object.keys(fields).length;
    const percentage = Math.round((completedFields / totalFields) * 100);
    const missingFields = Object.keys(fields).filter((key) => !fields[key]);
    return { percentage, missingFields, completedFields, totalFields };
  };

  const premiumStats = users
    ? {
        totalUsers: users.length,
        premiumUsers: users.filter((user) => isPremiumUser(user)).length,
        freeUsers: users.filter((user) => !isPremiumUser(user)).length,
        expiringSoon: users.filter((user) => {
          const details = getPremiumDetails(user);
          return (
            details?.endDate && details.endDate.getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
          );
        }).length,
        cancelingUsers: users.filter((user) => {
          const details = getPremiumDetails(user);
          return details?.cancelAtPeriodEnd;
        }).length,
      }
    : null;

  const onboardingStats = users
    ? {
        completedOnboarding: users.filter((user) => getOnboardingStatus(user).isComplete).length,
        inProgressOnboarding: users.filter((user) => {
          const status = getOnboardingStatus(user);
          return !status.isComplete && status.completedSteps > 0;
        }).length,
        notStartedOnboarding: users.filter((user) => getOnboardingStatus(user).completedSteps === 0).length,
        withPhotos: users.filter((user) => getOnboardingStatus(user).hasPhotos).length,
        withInterests: users.filter((user) => getOnboardingStatus(user).hasInterests).length,
        withQuestionnaire: users.filter((user) => getOnboardingStatus(user).hasQuestionnaire).length,
        fullProfileComplete: users.filter((user) => {
          const profile = getProfileCompleteness(user);
          return profile.percentage === 100;
        }).length,
        recentlyActive: users.filter((user) => {
          if (!user.lastTimeActive) return false;
          const lastActive = user.lastTimeActive.seconds
            ? new Date(user.lastTimeActive.seconds * 1000)
            : new Date(user.lastTimeActive);
          const daysSinceActive = (new Date() - lastActive) / (1000 * 60 * 60 * 24);
          return daysSinceActive <= 7;
        }).length,
      }
    : null;

  // Advanced chart data with trend analysis
  const chartData = useMemo(() => {
    if (!users || users.length === 0) return null;

    const now = new Date();
    const days = timePeriod === "week" ? 7 : 30;
    const dataPoints = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      // New users on this day
      const newUsers = users.filter((user) => {
        if (!user.createdAt) return false;
        const createdDate = user.createdAt.seconds
          ? new Date(user.createdAt.seconds * 1000)
          : new Date(user.createdAt);
        return createdDate >= date && createdDate < nextDate;
      }).length;

      // New premium users
      const newPremium = users.filter((user) => {
        if (!isPremiumUser(user)) return false;
        const sub = user.subscription;
        if (!sub.currentPeriodStart) return false;
        const startDate = sub.currentPeriodStart.seconds
          ? new Date(sub.currentPeriodStart.seconds * 1000)
          : new Date(sub.currentPeriodStart);
        return startDate >= date && startDate < nextDate;
      }).length;

      // Active users
      const activeUsers = users.filter((user) => {
        if (!user.lastTimeActive) return false;
        const activeDate = user.lastTimeActive.seconds
          ? new Date(user.lastTimeActive.seconds * 1000)
          : new Date(user.lastTimeActive);
        return activeDate >= date && activeDate < nextDate;
      }).length;

      // Total users up to this date
      const totalUsers = users.filter((user) => {
        if (!user.createdAt) return false;
        const createdDate = user.createdAt.seconds
          ? new Date(user.createdAt.seconds * 1000)
          : new Date(user.createdAt);
        return createdDate <= nextDate;
      }).length;

      // Onboarding completions
      const completedOnboarding = users.filter((user) => {
        if (!getOnboardingStatus(user).isComplete) return false;
        if (!user.createdAt) return false;
        const createdDate = user.createdAt.seconds
          ? new Date(user.createdAt.seconds * 1000)
          : new Date(user.createdAt);
        return createdDate >= date && createdDate < nextDate;
      }).length;

      dataPoints.push({
        date: date.toLocaleDateString("ro-RO", { month: "short", day: "numeric" }),
        fullDate: date,
        newUsers,
        newPremium,
        activeUsers,
        totalUsers,
        completedOnboarding,
        conversionRate: newUsers > 0 ? ((newPremium / newUsers) * 100).toFixed(1) : 0,
      });
    }

    return dataPoints;
  }, [users, timePeriod]);

  // Trend analysis
  const trendAnalysis = useMemo(() => {
    if (!chartData || chartData.length < 2) return null;

    const half = Math.floor(chartData.length / 2);
    const firstHalf = chartData.slice(0, half);
    const secondHalf = chartData.slice(half);

    const avgNewUsersFirst = firstHalf.reduce((sum, d) => sum + d.newUsers, 0) / firstHalf.length;
    const avgNewUsersSecond = secondHalf.reduce((sum, d) => sum + d.newUsers, 0) / secondHalf.length;
    const newUsersTrend = ((avgNewUsersSecond - avgNewUsersFirst) / (avgNewUsersFirst || 1)) * 100;

    const avgPremiumFirst = firstHalf.reduce((sum, d) => sum + d.newPremium, 0) / firstHalf.length;
    const avgPremiumSecond = secondHalf.reduce((sum, d) => sum + d.newPremium, 0) / secondHalf.length;
    const premiumTrend = ((avgPremiumSecond - avgPremiumFirst) / (avgPremiumFirst || 1)) * 100;

    const avgActiveFirst = firstHalf.reduce((sum, d) => sum + d.activeUsers, 0) / firstHalf.length;
    const avgActiveSecond = secondHalf.reduce((sum, d) => sum + d.activeUsers, 0) / secondHalf.length;
    const activeTrend = ((avgActiveSecond - avgActiveFirst) / (avgActiveFirst || 1)) * 100;

    return {
      newUsersTrend: newUsersTrend.toFixed(1),
      premiumTrend: premiumTrend.toFixed(1),
      activeTrend: activeTrend.toFixed(1),
      totalNewUsers: chartData.reduce((sum, d) => sum + d.newUsers, 0),
      totalPremium: chartData.reduce((sum, d) => sum + d.newPremium, 0),
      avgDailyNewUsers: (chartData.reduce((sum, d) => sum + d.newUsers, 0) / chartData.length).toFixed(1),
      avgDailyPremium: (chartData.reduce((sum, d) => sum + d.newPremium, 0) / chartData.length).toFixed(1),
    };
  }, [chartData]);

  // Professional line chart component
  const LineChart = ({ data, metrics, height = 300 }) => {
    if (!data || data.length === 0) return null;

    const colors = {
      newUsers: "#1890ff",
      newPremium: "#722ed1",
      activeUsers: "#52c41a",
      totalUsers: "#faad14",
      completedOnboarding: "#13c2c2",
    };

    // Calculate max values for each metric
    const maxValues = {};
    metrics.forEach((metric) => {
      maxValues[metric] = Math.max(...data.map((d) => d[metric] || 0), 1);
    });

    const padding = { top: 30, right: 20, bottom: 50, left: 50 };
    const chartWidth = 800;
    const chartHeight = height - padding.top - padding.bottom;
    const chartWidthActual = chartWidth - padding.left - padding.right;

    return (
      <div style={{ width: "100%", overflowX: "auto", padding: "10px" }}>
        <svg width={chartWidth} height={height} style={{ minWidth: "600px" }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + chartHeight * (1 - ratio);
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#f0f0f0"
                  strokeWidth="1"
                />
                <text x={padding.left - 10} y={y + 4} fontSize="10" fill="#999" textAnchor="end">
                  {Math.round(maxValues[metrics[0]] * ratio)}
                </text>
              </g>
            );
          })}

          {/* Draw lines for each metric */}
          {metrics.map((metric, metricIndex) => {
            const points = data.map((point, index) => {
              const x = padding.left + (index / (data.length - 1)) * chartWidthActual;
              const value = point[metric] || 0;
              const y = padding.top + chartHeight * (1 - value / maxValues[metric]);
              return { x, y, value };
            });

            return (
              <g key={metric}>
                {/* Line */}
                <path
                  d={points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
                  fill="none"
                  stroke={colors[metric]}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Points */}
                {points.map((point, index) => (
                  <g key={index}>
                    <circle cx={point.x} cy={point.y} r="5" fill={colors[metric]} />
                    <circle cx={point.x} cy={point.y} r="8" fill={colors[metric]} fillOpacity="0.2" />
                    {point.value > 0 && (
                      <text
                        x={point.x}
                        y={point.y - 12}
                        fontSize="10"
                        fontWeight="bold"
                        fill={colors[metric]}
                        textAnchor="middle"
                      >
                        {point.value}
                      </text>
                    )}
                  </g>
                ))}
              </g>
            );
          })}

          {/* X-axis labels */}
          {data.map((point, index) => {
            const x = padding.left + (index / (data.length - 1)) * chartWidthActual;
            const showLabel = data.length <= 15 || index % Math.ceil(data.length / 10) === 0;
            return showLabel ? (
              <text
                key={index}
                x={x}
                y={height - padding.bottom + 20}
                fontSize="10"
                fill="#666"
                textAnchor="middle"
                transform={`rotate(-45 ${x} ${height - padding.bottom + 20})`}
              >
                {point.date}
              </text>
            ) : null;
          })}

          {/* Legend */}
          {metrics.map((metric, index) => {
            const labels = {
              newUsers: "Useri Noi",
              newPremium: "Premium Noi",
              activeUsers: "Useri Activi",
              totalUsers: "Total Useri",
              completedOnboarding: "Onboarding Complet",
            };
            return (
              <g key={metric} transform={`translate(${padding.left + index * 120}, 15)`}>
                <rect width="12" height="12" fill={colors[metric]} />
                <text x="18" y="10" fontSize="11" fill="#666">
                  {labels[metric]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // Table columns for detailed analysis
  const tableColumns = [
    {
      title: "Data",
      dataIndex: "date",
      key: "date",
      fixed: "left",
      width: 100,
    },
    {
      title: "Useri Noi",
      dataIndex: "newUsers",
      key: "newUsers",
      sorter: (a, b) => a.newUsers - b.newUsers,
      render: (val) => <Text strong style={{ color: "#1890ff" }}>{val}</Text>,
    },
    {
      title: "Premium Noi",
      dataIndex: "newPremium",
      key: "newPremium",
      sorter: (a, b) => a.newPremium - b.newPremium,
      render: (val) => <Text strong style={{ color: "#722ed1" }}>{val}</Text>,
    },
    {
      title: "Useri Activi",
      dataIndex: "activeUsers",
      key: "activeUsers",
      sorter: (a, b) => a.activeUsers - b.activeUsers,
      render: (val) => <Text strong style={{ color: "#52c41a" }}>{val}</Text>,
    },
    {
      title: "Total Useri",
      dataIndex: "totalUsers",
      key: "totalUsers",
      sorter: (a, b) => a.totalUsers - b.totalUsers,
      render: (val) => <Text strong style={{ color: "#faad14" }}>{val}</Text>,
    },
    {
      title: "Rata Conversie (%)",
      dataIndex: "conversionRate",
      key: "conversionRate",
      sorter: (a, b) => parseFloat(a.conversionRate) - parseFloat(b.conversionRate),
      render: (val) => <Text>{val}%</Text>,
    },
  ];

  const getMetricsForChart = () => {
    switch (chartMetric) {
      case "newUsers":
        return ["newUsers"];
      case "premium":
        return ["newPremium"];
      case "onboarding":
        return ["completedOnboarding"];
      case "activity":
        return ["activeUsers"];
      case "all":
      default:
        return ["newUsers", "newPremium", "activeUsers"];
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Text>Loading statistics...</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <Card>
        <Title level={2}>📊 Analytics Dashboard</Title>
        <Text type="secondary">Analiză detaliată a statisticilor utilizatorilor</Text>

        <Divider />

        {/* Controls */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12}>
            <div>
              <Text strong style={{ marginRight: "12px" }}>Perioadă:</Text>
              <Radio.Group value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} buttonStyle="solid">
                <Radio.Button value="week">Ultima Săptămână</Radio.Button>
                <Radio.Button value="month">Ultima Lună</Radio.Button>
              </Radio.Group>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div>
              <Text strong style={{ marginRight: "12px" }}>Metrici:</Text>
              <Select value={chartMetric} onChange={setChartMetric} style={{ width: 200 }}>
                <Option value="all">Toate</Option>
                <Option value="newUsers">Useri Noi</Option>
                <Option value="premium">Premium</Option>
                <Option value="activity">Activitate</Option>
              </Select>
            </div>
          </Col>
        </Row>

        {/* Trend Cards */}
        {trendAnalysis && (
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic
                  title="Trend Useri Noi"
                  value={Math.abs(trendAnalysis.newUsersTrend)}
                  precision={1}
                  valueStyle={{ color: trendAnalysis.newUsersTrend >= 0 ? "#3f8600" : "#cf1322" }}
                  prefix={trendAnalysis.newUsersTrend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  suffix="%"
                />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Media zilnică: {trendAnalysis.avgDailyNewUsers} useri
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic
                  title="Trend Premium"
                  value={Math.abs(trendAnalysis.premiumTrend)}
                  precision={1}
                  valueStyle={{ color: trendAnalysis.premiumTrend >= 0 ? "#3f8600" : "#cf1322" }}
                  prefix={trendAnalysis.premiumTrend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  suffix="%"
                />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Media zilnică: {trendAnalysis.avgDailyPremium} conversii
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic
                  title="Trend Activitate"
                  value={Math.abs(trendAnalysis.activeTrend)}
                  precision={1}
                  valueStyle={{ color: trendAnalysis.activeTrend >= 0 ? "#3f8600" : "#cf1322" }}
                  prefix={trendAnalysis.activeTrend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  suffix="%"
                />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Total în perioadă: {trendAnalysis.totalNewUsers} useri
                </Text>
              </Card>
            </Col>
          </Row>
        )}

        {/* Main Chart */}
        {chartData && (
          <Card title="📈 Grafic Trend" style={{ marginBottom: "24px" }}>
            <LineChart data={chartData} metrics={getMetricsForChart()} height={350} />
          </Card>
        )}

        {/* Detailed Table */}
        {chartData && (
          <Card title="📋 Date Detaliate" style={{ marginBottom: "24px" }}>
            <Table
              dataSource={chartData}
              columns={tableColumns}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
              size="small"
              rowKey={(record) => record.date}
            />
          </Card>
        )}

        <Divider />

        {/* Premium Statistics */}
        <Title level={4} style={{ marginTop: "24px" }}>Statistici Premium</Title>
        {premiumStats && (
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card size="small">
                <Statistic
                  title="Total Useri"
                  value={premiumStats.totalUsers}
                  valueStyle={{ color: "#1890ff" }}
                  prefix={<UserAddOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card size="small">
                <Statistic
                  title="Useri Premium"
                  value={premiumStats.premiumUsers}
                  valueStyle={{ color: "#722ed1" }}
                  prefix={<CrownOutlined />}
                />
                <Progress
                  percent={Math.round((premiumStats.premiumUsers / premiumStats.totalUsers) * 100)}
                  size="small"
                  strokeColor="#722ed1"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card size="small">
                <Statistic
                  title="Useri Free"
                  value={premiumStats.freeUsers}
                  valueStyle={{ color: "#52c41a" }}
                />
                <Progress
                  percent={Math.round((premiumStats.freeUsers / premiumStats.totalUsers) * 100)}
                  size="small"
                  strokeColor="#52c41a"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card size="small">
                <Statistic
                  title="Expiră Curând"
                  value={premiumStats.expiringSoon}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card size="small">
                <Statistic
                  title="Se Anulează"
                  value={premiumStats.cancelingUsers}
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Card>
            </Col>
          </Row>
        )}

        <Divider />

        {/* Onboarding Statistics */}
        <Title level={4}>Statistici Onboarding</Title>
        {onboardingStats && (
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card size="small">
                <Statistic
                  title="Onboarding Complet"
                  value={onboardingStats.completedOnboarding}
                  valueStyle={{ color: "#52c41a" }}
                  prefix="✅"
                />
                <Progress
                  percent={premiumStats ? Math.round((onboardingStats.completedOnboarding / premiumStats.totalUsers) * 100) : 0}
                  size="small"
                  strokeColor="#52c41a"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card size="small">
                <Statistic
                  title="În Progres"
                  value={onboardingStats.inProgressOnboarding}
                  valueStyle={{ color: "#fa8c16" }}
                  prefix="🔄"
                />
                <Progress
                  percent={premiumStats ? Math.round((onboardingStats.inProgressOnboarding / premiumStats.totalUsers) * 100) : 0}
                  size="small"
                  strokeColor="#fa8c16"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card size="small">
                <Statistic
                  title="Nu Au Început"
                  value={onboardingStats.notStartedOnboarding}
                  valueStyle={{ color: "#ff4d4f" }}
                  prefix="❌"
                />
                <Progress
                  percent={premiumStats ? Math.round((onboardingStats.notStartedOnboarding / premiumStats.totalUsers) * 100) : 0}
                  size="small"
                  strokeColor="#ff4d4f"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card size="small">
                <Statistic
                  title="Cu Poze"
                  value={onboardingStats.withPhotos}
                  valueStyle={{ color: "#1890ff" }}
                  prefix="📸"
                />
                <Progress
                  percent={premiumStats ? Math.round((onboardingStats.withPhotos / premiumStats.totalUsers) * 100) : 0}
                  size="small"
                  strokeColor="#1890ff"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card size="small">
                <Statistic
                  title="Cu Interese"
                  value={onboardingStats.withInterests}
                  valueStyle={{ color: "#722ed1" }}
                  prefix="💎"
                />
                <Progress
                  percent={premiumStats ? Math.round((onboardingStats.withInterests / premiumStats.totalUsers) * 100) : 0}
                  size="small"
                  strokeColor="#722ed1"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card size="small">
                <Statistic
                  title="Profil Complet"
                  value={onboardingStats.fullProfileComplete}
                  valueStyle={{ color: "#13c2c2" }}
                  prefix="📝"
                />
                <Progress
                  percent={premiumStats ? Math.round((onboardingStats.fullProfileComplete / premiumStats.totalUsers) * 100) : 0}
                  size="small"
                  strokeColor="#13c2c2"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Card size="small">
                <Statistic
                  title="Activi (7 zile)"
                  value={onboardingStats.recentlyActive}
                  valueStyle={{ color: "#52c41a" }}
                  prefix="🌟"
                />
                <Progress
                  percent={premiumStats ? Math.round((onboardingStats.recentlyActive / premiumStats.totalUsers) * 100) : 0}
                  size="small"
                  strokeColor="#52c41a"
                />
              </Card>
            </Col>
          </Row>
        )}
      </Card>
    </div>
  );
};

export default StatisticsDashboard;
