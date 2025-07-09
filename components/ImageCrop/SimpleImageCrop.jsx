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
      // For server URLs, fetch and convert to blob first
      let imageBlob;
      let imgSrc;
      
      if (imageUrl.startsWith('http')) {
        // It's a server URL - fetch it first
        const response = await fetch(imageUrl);
        imageBlob = await response.blob();
        imgSrc = URL.createObjectURL(imageBlob);
      } else {
        // It's already a blob URL
        imgSrc = imageUrl;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.crossOrigin = 'anonymous';
        img.src = imgSrc;
      });

      const { width, height, x, y } = croppedAreaPixels;
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(
        img,
        x, y, width, height,
        0, 0, width, height
      );

      // Verify canvas has actual image data (not just transparent/black)
      const imageData = ctx.getImageData(0, 0, Math.min(50, width), Math.min(50, height));
      const pixels = imageData.data;
      let hasContent = false;
      
      // Check if canvas has non-transparent, non-black pixels
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1]; 
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        
        if (a > 0 && (r > 10 || g > 10 || b > 10)) {
          hasContent = true;
          break;
        }
      }
      
      if (!hasContent) {
        console.error('❌ [SimpleImageCrop] Canvas appears to be empty/black');
        console.log('🔍 [SimpleImageCrop] Canvas dimensions:', { width, height });
        console.log('🔍 [SimpleImageCrop] Crop area:', croppedAreaPixels);
        console.log('🔍 [SimpleImageCrop] Image src:', imgSrc);
        throw new Error('Cropped area appears to be empty');
      }
      
      console.log('✅ [SimpleImageCrop] Canvas contains valid image data');

      // Cleanup blob URL if we created one
      if (imgSrc !== imageUrl) {
        URL.revokeObjectURL(imgSrc);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          console.log('✅ [SimpleImageCrop] Crop successful, blob size:', blob.size);
          
          // Verify blob is valid
          if (blob.size === 0) {
            console.error('❌ [SimpleImageCrop] Blob is empty');
            throw new Error('Cropped image is empty');
          }
          
          const croppedFile = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
          const previewUrl = URL.createObjectURL(blob);
          
          console.log('✅ [SimpleImageCrop] Preview URL created:', previewUrl);
          console.log('✅ [SimpleImageCrop] File created:', {
            name: croppedFile.name,
            size: croppedFile.size,
            type: croppedFile.type
          });
          
          // Test if preview URL is accessible
          const testImg = new Image();
          testImg.onload = () => {
            console.log('✅ [SimpleImageCrop] Preview URL is valid and loadable');
            onCropComplete({
              file: croppedFile,
              preview: previewUrl,
              aspectRatio: selectedAspectRatio,
              cropData: { crop, zoom, croppedAreaPixels }
            });
            
            setLoading(false);
            resetState();
          };
          testImg.onerror = (e) => {
            console.error('❌ [SimpleImageCrop] Preview URL is not loadable:', e);
            URL.revokeObjectURL(previewUrl);
            throw new Error('Failed to create valid preview URL');
          };
          testImg.src = previewUrl;
          
        } else {
          console.error('❌ [SimpleImageCrop] Failed to create blob from canvas');
          throw new Error('Failed to create blob from canvas');
        }
      }, 'image/jpeg', 0.9);

    } catch (error) {
      console.error('❌ Error cropping image:', error);
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