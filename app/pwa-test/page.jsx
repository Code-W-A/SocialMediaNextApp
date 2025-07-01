'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Divider, Alert, List, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, ReloadOutlined } from '@ant-design/icons';
import { usePWA } from '@/hooks/usePWA';

const { Title, Paragraph, Text } = Typography;

export default function PWATestPage() {
  const [diagnostics, setDiagnostics] = useState({});
  const [loading, setLoading] = useState(true);
  const pwa = usePWA();

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    const results = {};

    // Check service worker
    results.serviceWorker = 'serviceWorker' in navigator;
    
    // Check if service worker is registered
    if (results.serviceWorker) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        results.serviceWorkerRegistered = !!registration;
        results.serviceWorkerActive = !!registration?.active;
      } catch (e) {
        results.serviceWorkerRegistered = false;
        results.serviceWorkerActive = false;
      }
    }

    // Check manifest
    try {
      const response = await fetch('/manifest.json');
      results.manifestExists = response.ok;
      if (response.ok) {
        const manifest = await response.json();
        results.manifestValid = !!(manifest.name && manifest.start_url && manifest.display);
        results.manifestIcons = manifest.icons?.length > 0;
      }
    } catch (e) {
      results.manifestExists = false;
      results.manifestValid = false;
    }

    // Check HTTPS
    results.isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';

    // Check beforeinstallprompt support
    results.beforeInstallPromptSupported = typeof window !== 'undefined' && 'BeforeInstallPromptEvent' in window;

    // Check if already installed
    results.isInstalled = window.matchMedia('(display-mode: standalone)').matches;

    // Check if installable
    results.isInstallable = pwa.isInstallable;

    // Browser info
    results.userAgent = navigator.userAgent;
    results.isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    results.isFirefox = /Firefox/.test(navigator.userAgent);
    results.isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    results.isEdge = /Edg/.test(navigator.userAgent);

    setDiagnostics(results);
    setLoading(false);
  };

  const getStatus = (condition) => {
    if (condition) {
      return <Tag color="success" icon={<CheckCircleOutlined />}>OK</Tag>;
    } else {
      return <Tag color="error" icon={<CloseCircleOutlined />}>FAIL</Tag>;
    }
  };

  const getRecommendations = () => {
    const recommendations = [];

    if (!diagnostics.isHTTPS) {
      recommendations.push('Aplicația trebuie să ruleze pe HTTPS pentru ca PWA să funcționeze');
    }

    if (!diagnostics.serviceWorkerRegistered) {
      recommendations.push('Service Worker nu este înregistrat - verifică console pentru erori');
    }

    if (!diagnostics.manifestExists) {
      recommendations.push('Manifest.json nu este disponibil');
    }

    if (!diagnostics.manifestValid) {
      recommendations.push('Manifest.json nu este valid - verifică câmpurile obligatorii');
    }

    if (!diagnostics.manifestIcons) {
      recommendations.push('Manifest.json nu conține iconuri');
    }

    if (diagnostics.isInstalled) {
      recommendations.push('Aplicația este deja instalată ca PWA');
    }

    if (!diagnostics.beforeInstallPromptSupported && diagnostics.isChrome) {
      recommendations.push('Browserul nu suportă BeforeInstallPromptEvent');
    }

    if (!diagnostics.isInstallable && !diagnostics.isInstalled) {
      recommendations.push('Aplicația nu îndeplinește criteriile pentru instalare PWA');
    }

    return recommendations;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>🔧 PWA Diagnostics</Title>
      <Paragraph>
        Această pagină te ajută să diagnostichezi problemele cu instalarea PWA.
      </Paragraph>

      <Button 
        type="primary" 
        icon={<ReloadOutlined />} 
        onClick={runDiagnostics}
        loading={loading}
        style={{ marginBottom: '20px' }}
      >
        Rulează din nou diagnosticul
      </Button>

      <Card title="📋 Rezultate Diagnostic" loading={loading}>
        <List>
          <List.Item>
            <Text strong>HTTPS: </Text>
            {getStatus(diagnostics.isHTTPS)}
            <Text type="secondary"> - Necesar pentru PWA</Text>
          </List.Item>
          
          <List.Item>
            <Text strong>Service Worker suport: </Text>
            {getStatus(diagnostics.serviceWorker)}
          </List.Item>
          
          <List.Item>
            <Text strong>Service Worker înregistrat: </Text>
            {getStatus(diagnostics.serviceWorkerRegistered)}
          </List.Item>
          
          <List.Item>
            <Text strong>Service Worker activ: </Text>
            {getStatus(diagnostics.serviceWorkerActive)}
          </List.Item>
          
          <List.Item>
            <Text strong>Manifest exists: </Text>
            {getStatus(diagnostics.manifestExists)}
          </List.Item>
          
          <List.Item>
            <Text strong>Manifest valid: </Text>
            {getStatus(diagnostics.manifestValid)}
          </List.Item>
          
          <List.Item>
            <Text strong>Manifest icons: </Text>
            {getStatus(diagnostics.manifestIcons)}
          </List.Item>
          
          <List.Item>
            <Text strong>Deja instalat: </Text>
            {getStatus(diagnostics.isInstalled)}
          </List.Item>
          
          <List.Item>
            <Text strong>Poate fi instalat: </Text>
            {getStatus(diagnostics.isInstallable)}
          </List.Item>
        </List>
      </Card>

      <Card title="🌐 Informații Browser" style={{ marginTop: '20px' }}>
        <List>
          <List.Item>
            <Text strong>Chrome: </Text>
            {getStatus(diagnostics.isChrome)}
          </List.Item>
          
          <List.Item>
            <Text strong>Firefox: </Text>
            {getStatus(diagnostics.isFirefox)}
          </List.Item>
          
          <List.Item>
            <Text strong>Safari: </Text>
            {getStatus(diagnostics.isSafari)}
          </List.Item>
          
          <List.Item>
            <Text strong>Edge: </Text>
            {getStatus(diagnostics.isEdge)}
          </List.Item>
        </List>
        
        <Divider />
        <Text code style={{ fontSize: '12px', wordBreak: 'break-all' }}>
          {diagnostics.userAgent}
        </Text>
      </Card>

      <Card title="🎯 Starea PWA" style={{ marginTop: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Instalat: </Text>
            <Tag color={pwa.isInstalled ? 'success' : 'default'}>
              {pwa.isInstalled ? 'DA' : 'NU'}
            </Tag>
          </div>
          
          <div>
            <Text strong>Poate fi instalat: </Text>
            <Tag color={pwa.canInstall ? 'success' : 'default'}>
              {pwa.canInstall ? 'DA' : 'NU'}
            </Tag>
          </div>
          
          <div>
            <Text strong>Online: </Text>
            <Tag color={pwa.isOnline ? 'success' : 'error'}>
              {pwa.isOnline ? 'DA' : 'NU'}
            </Tag>
          </div>

          {pwa.canInstall && (
            <Button 
              type="primary" 
              onClick={pwa.installApp}
              style={{ marginTop: '10px' }}
            >
              Instalează PWA
            </Button>
          )}
        </Space>
      </Card>

      {getRecommendations().length > 0 && (
        <Card title="💡 Recomandări" style={{ marginTop: '20px' }}>
          <List
            dataSource={getRecommendations()}
            renderItem={item => (
              <List.Item>
                <Alert 
                  message={item} 
                  type="warning" 
                  showIcon 
                  icon={<WarningOutlined />}
                  style={{ width: '100%' }}
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      <Card title="📖 Instrucțiuni" style={{ marginTop: '20px' }}>
        <Paragraph>
          <Text strong>Pentru a testa PWA:</Text>
        </Paragraph>
        <List>
          <List.Item>1. Asigură-te că rulezi pe HTTPS (sau localhost)</List.Item>
          <List.Item>2. Deschide Chrome DevTools → Application → Manifest</List.Item>
          <List.Item>3. Verifică Service Workers în Chrome DevTools</List.Item>
          <List.Item>4. Încearcă să instalezi manual din meniul browserului</List.Item>
          <List.Item>5. Pentru iPhone/iPad: Safari → Share → Add to Home Screen</List.Item>
        </List>
      </Card>
    </div>
  );
} 