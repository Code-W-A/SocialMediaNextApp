"use client";
import React, { useState } from "react";
import { Input, Button, Card, Typography, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import AdminDashboard from "@/sections/admin/AdminDashboard";

const { Title } = Typography;

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    
    // Check password
    if (password === "1234567890") {
      setIsAuthenticated(true);
      message.success("Admin access granted!");
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
          <Title level={2}>Admin Access</Title>
          <p style={{ marginBottom: 24, color: '#666' }}>
            Enter admin password to manage user compatibilities
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

  return <AdminDashboard />;
};

export default AdminPage; 