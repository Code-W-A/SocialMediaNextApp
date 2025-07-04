import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, List, Space, Tag, message, Divider, Row, Col } from 'antd';
import { FileTextOutlined, DownloadOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useLanguage } from '@/lib/i18n';
import { useUser } from '@/lib/context/UserContext';

const { Title, Text, Paragraph } = Typography;

const OblioInvoiceInfo = () => {
  const { t } = useLanguage();
  const { user } = useUser();
  const [invoiceInfo, setInvoiceInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch invoice information
  const fetchInvoiceInfo = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/oblio/invoice-status');
      const data = await response.json();
      
      if (data.success) {
        setInvoiceInfo(data.invoiceInfo);
      } else {
        console.error('Failed to fetch invoice info:', data.error);
        message.error('Nu s-au putut încărca informațiile despre facturi');
      }
    } catch (error) {
      console.error('Error fetching invoice info:', error);
      message.error('Eroare la încărcarea informațiilor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceInfo();
  }, [user?.id]);

  const handleViewInvoice = (url) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      message.warning('Link-ul facturii nu este disponibil');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      if (date.seconds) {
        return new Date(date.seconds * 1000).toLocaleDateString('ro-RO');
      }
      return new Date(date).toLocaleDateString('ro-RO');
    } catch {
      return 'N/A';
    }
  };

  const InvoiceItem = ({ title, invoice, type = 'automatic' }) => {
    if (!invoice?.id) return null;

    return (
      <Card 
        size="small" 
        style={{ marginBottom: 12 }}
        title={
          <Space>
            <FileTextOutlined />
            <Text strong>{title}</Text>
            <Tag color={type === 'automatic' ? 'green' : 'blue'}>
              {type === 'automatic' ? 'Automată' : 'Manuală'}
            </Tag>
          </Space>
        }
        extra={
          <Space>
            {invoice.url && (
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewInvoice(invoice.url)}
              >
                Vezi
              </Button>
            )}
          </Space>
        }
      >
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Text type="secondary">Numărul facturii:</Text>
            <br />
            <Text strong>{invoice.number || 'N/A'}</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary">Data emiterii:</Text>
            <br />
            <Text strong>{formatDate(invoice.date)}</Text>
          </Col>
        </Row>
        {invoice.id && (
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">ID Oblio: </Text>
            <Text code>{invoice.id}</Text>
          </div>
        )}
      </Card>
    );
  };

  if (!user) return null;

  return (
    <Card
      title={
        <Space>
          <FileTextOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Facturi Oblio
          </Title>
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={fetchInvoiceInfo}
          >
            Actualizează
          </Button>
        </Space>
      }
      style={{ marginTop: 16 }}
      loading={loading}
    >
      <Paragraph type="secondary">
        Facturile sunt generate automat prin sistemul Oblio conform legislației românești 
        pentru fiecare plată de abonament Premium.
      </Paragraph>

      {invoiceInfo ? (
        <div>
          <InvoiceItem
            title="Ultima factură automată"
            invoice={invoiceInfo.lastOblioInvoice}
            type="automatic"
          />
          
          <InvoiceItem
            title="Ultima factură manuală"
            invoice={invoiceInfo.lastManualOblioInvoice}
            type="manual"
          />

          {!invoiceInfo.lastOblioInvoice?.id && !invoiceInfo.lastManualOblioInvoice?.id && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
              <br />
              <Text type="secondary">Nu există facturi generate încă</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Facturile vor fi generate automat la următoarea plată
              </Text>
            </div>
          )}

          <Divider />
          
          <div>
            <Title level={5}>Status abonament</Title>
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <Text type="secondary">Status Premium:</Text>
                <br />
                <Tag color={invoiceInfo.subscriptionInfo.isPremium ? 'green' : 'default'}>
                  {invoiceInfo.subscriptionInfo.isPremium ? 'Activ' : 'Inactiv'}
                </Tag>
              </Col>
              <Col span={12}>
                <Text type="secondary">Ultima plată:</Text>
                <br />
                <Text strong>
                  {formatDate(invoiceInfo.subscriptionInfo.lastPaymentDate)}
                </Text>
              </Col>
            </Row>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Text type="secondary">Se încarcă informațiile despre facturi...</Text>
        </div>
      )}

      <Divider />
      
      <div style={{ background: '#f9f9f9', padding: 12, borderRadius: 6 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <strong>Notă:</strong> Facturile sunt emise conform legislației românești prin sistemul Oblio. 
          Pentru întrebări despre facturare, vă rugăm să ne contactați la contact@ydestiny.com.
        </Text>
      </div>
    </Card>
  );
};

export default OblioInvoiceInfo; 