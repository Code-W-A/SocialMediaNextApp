"use client";
import React, { useState, useRef, useCallback } from 'react';
import { Modal, Button, message, Slider, Row, Col, Space } from 'antd';
import { useLanguage } from '@/lib/i18n';
import Iconify from '@/components/Iconify';
import Cropper from 'react-easy-crop';

const SimpleImageCrop = ({ 
  visible, 
  onCancel, 
  onCropComplete, 
  imageUrl, 
  title,
  aspectRatios = [{ label: 'Square', value: 1, icon: 'eva:square-fill' }], // Array of aspect ratios
  defaultAspectRatio = 1
}) => {
  const { t } = useLanguage();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(defaultAspectRatio);

  const onCropChange = useCallback((crop) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleAspectRatioChange = (ratio) => {
    setSelectedAspectRatio(ratio);
    setCroppedAreaPixels(null); // Reset crop area when aspect ratio changes
  };

  const createCroppedImage = async () => {
    if (!croppedAreaPixels || !imageUrl) return;

    setLoading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const { width, height, x, y } = croppedAreaPixels;
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(
          img,
          x, y, width, height,
          0, 0, width, height
        );

        canvas.toBlob((blob) => {
          if (blob) {
            const croppedFile = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
            const previewUrl = URL.createObjectURL(blob);
            
            onCropComplete({
              file: croppedFile,
              preview: previewUrl,
              aspectRatio: selectedAspectRatio,
              cropData: { crop, zoom, croppedAreaPixels }
            });
            
            setLoading(false);
            resetState();
          }
        }, 'image/jpeg', 0.9);
      };

      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
    } catch (error) {
      console.error('Error cropping image:', error);
      message.error(t('imageCrop.cropError') || 'Error cropping image');
      setLoading(false);
    }
  };

  const resetState = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setSelectedAspectRatio(defaultAspectRatio);
  };

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Iconify icon="eva:crop-fill" width="20px" />
          <span>{title || t('imageCrop.cropImage') || 'Crop Image'}</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={700}
      centered
      maskClosable={!loading}
      closable={!loading}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={loading}>
          {t('common.cancel') || 'Cancel'}
        </Button>,
        <Button 
          key="crop" 
          type="primary" 
          loading={loading}
          onClick={createCroppedImage}
          disabled={!croppedAreaPixels || loading}
          icon={!loading ? <Iconify icon="eva:checkmark-fill" width="16px" /> : null}
        >
          {loading ? (t('imageCrop.processing') || 'Processing...') : (t('imageCrop.applyCrop') || 'Apply Crop')}
        </Button>
      ]}
      styles={{
        body: { padding: '0' }
      }}
    >
      <div style={{ position: 'relative', height: '400px', background: '#000' }}>
        {imageUrl && (
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={selectedAspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
            style={{
              containerStyle: {
                position: 'relative',
                width: '100%',
                height: '100%',
                background: '#000'
              }
            }}
          />
        )}
      </div>
      
      <div style={{ padding: '16px' }}>
        {/* Aspect Ratio Selection */}
        {aspectRatios.length > 1 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              marginBottom: '8px', 
              fontSize: '14px', 
              fontWeight: '500',
              color: '#333' 
            }}>
              {t('imageCrop.aspectRatio') || 'Aspect Ratio'}
            </div>
            <Space wrap>
              {aspectRatios.map((ratio) => (
                <Button
                  key={ratio.value}
                  type={selectedAspectRatio === ratio.value ? 'primary' : 'default'}
                  size="small"
                  onClick={() => handleAspectRatioChange(ratio.value)}
                  icon={<Iconify icon={ratio.icon} width="14px" />}
                >
                  {t(`imageCrop.${ratio.label.toLowerCase()}`) || ratio.label}
                </Button>
              ))}
            </Space>
          </div>
        )}

        {/* Zoom Control */}
        <div style={{ 
          marginBottom: '8px', 
          fontSize: '14px', 
          fontWeight: '500',
          color: '#333' 
        }}>
          {t('imageCrop.zoom') || 'Zoom'}: {Math.round(zoom * 100)}%
        </div>
        
        <Row gutter={16} align="middle">
          <Col span={4}>
            <Iconify icon="eva:zoom-out-fill" width="16px" style={{ color: '#666' }} />
          </Col>
          <Col span={16}>
            <Slider
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={setZoom}
              tooltip={{
                formatter: null // disable tooltip since we show percentage above
              }}
            />
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            <Iconify icon="eva:zoom-in-fill" width="16px" style={{ color: '#666' }} />
          </Col>
        </Row>
        
        <div style={{ 
          marginTop: '12px', 
          fontSize: '12px', 
          color: '#666', 
          textAlign: 'center' 
        }}>
          {t('imageCrop.instructions') || t('imageCrop.dragToMove') || 'Drag to move • Use slider to zoom • Click Apply when ready'}
        </div>
      </div>
    </Modal>
  );
};

export default SimpleImageCrop; 