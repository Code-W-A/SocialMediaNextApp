"use client";
import React, { useState } from "react";
import { Input, Button, Card, Typography, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import StatisticsDashboard from "@/sections/statistics/StatisticsDashboard";

const { Title } = Typography;

const StatisticsPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    if (password === "Cristina1994!") {
      setIsAuthenticated(true);
      message.success("Statistics access granted!");
    } else {
      message.error("Invalid password!");
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <Card style={{ width: 400, textAlign: 'center' }}>
          <Title level={2}>Statistics Access</Title>
          <p style={{ marginBottom: 24, color: '#666' }}>
            Enter admin password to view statistics
          </p>
          <Input.Password
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onPressEnter={handleLogin}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            style={{ marginBottom: 16 }}
          />
          <Button
            type="primary"
            onClick={handleLogin}
            loading={loading}
            block
          >
            Login
          </Button>
        </Card>
      </div>
    );
  }

  return <StatisticsDashboard />;
};

export default StatisticsPage;


