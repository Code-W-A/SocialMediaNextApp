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

  console.log('🎭 [SimpleImageCrop] Component state:', {
    visible,
    hasImageUrl: !!imageUrl,
    imageUrl: imageUrl ? imageUrl.substring(0, 50) + '...' : 'NULL',
    title,
    selectedAspectRatio,
    hasCroppedAreaPixels: !!croppedAreaPixels,
    loading,
    crop,
    zoom
  });

  const onCropChange = useCallback((crop) => {
    console.log('🔄 [SimpleImageCrop] Crop changed:', crop);
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom) => {
    console.log('🔍 [SimpleImageCrop] Zoom changed:', zoom);
    setZoom(zoom);
  }, []);

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    console.log('✅ [SimpleImageCrop] Crop area completed:', {
      croppedArea,
      croppedAreaPixels
    });
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleAspectRatioChange = (ratio) => {
    setSelectedAspectRatio(ratio);
    setCroppedAreaPixels(null); // Reset crop area when aspect ratio changes
  };

  const createCroppedImage = async () => {
    console.log('🚀 [SimpleImageCrop-createCroppedImage] STARTING crop process with:', {
      hasCroppedAreaPixels: !!croppedAreaPixels,
      hasImageUrl: !!imageUrl,
      croppedAreaPixels,
      imageUrl: imageUrl ? imageUrl.substring(0, 50) + '...' : 'NULL'
    });
    
    if (!croppedAreaPixels || !imageUrl) {
      console.error('❌ [SimpleImageCrop-createCroppedImage] Missing required data:', {
        croppedAreaPixels: !!croppedAreaPixels,
        imageUrl: !!imageUrl
      });
      return;
    }

    setLoading(true);
    console.log('⏳ [SimpleImageCrop-createCroppedImage] Set loading to true');
    
    try {
      console.log('🔍 [SimpleImageCrop-createCroppedImage] Analyzing image URL type:', {
        isServerUrl: imageUrl.startsWith('http'),
        isFirebaseStorage: imageUrl.includes('firebasestorage.googleapis.com'),
        imageUrl: imageUrl.substring(0, 100) + '...'
      });

      console.log('🖼️ [SimpleImageCrop-createCroppedImage] Creating canvas and image elements...');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // For Firebase Storage URLs, use direct loading with crossOrigin
      if (imageUrl.includes('firebasestorage.googleapis.com')) {
        console.log('🔥 [SimpleImageCrop-createCroppedImage] Firebase Storage URL detected - using direct loading');
        img.crossOrigin = 'anonymous';
      } else if (imageUrl.startsWith('http')) {
        console.log('🌐 [SimpleImageCrop-createCroppedImage] External URL detected - using crossOrigin');
        img.crossOrigin = 'anonymous';
      } else {
        console.log('📁 [SimpleImageCrop-createCroppedImage] Local blob URL detected');
      }
      
      console.log('⏳ [SimpleImageCrop-createCroppedImage] Loading image directly...');
      await new Promise((resolve, reject) => {
        img.onload = () => {
          console.log('✅ [SimpleImageCrop-createCroppedImage] Image loaded successfully:', {
            width: img.width,
            height: img.height,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            complete: img.complete
          });
          resolve();
        };
        img.onerror = (e) => {
          console.error('❌ [SimpleImageCrop-createCroppedImage] Image failed to load:', {
            error: e,
            src: img.src,
            crossOrigin: img.crossOrigin
          });
          reject(new Error('Failed to load image for cropping'));
        };
        
        // Set src after setting up event handlers
        img.src = imageUrl;
      });

      const { width, height, x, y } = croppedAreaPixels;
      console.log('📐 [SimpleImageCrop-createCroppedImage] Setting canvas dimensions:', {
        width, height, x, y
      });
      
      canvas.width = width;
      canvas.height = height;
      
      console.log('🎨 [SimpleImageCrop-createCroppedImage] Drawing image to canvas...');
      ctx.drawImage(
        img,
        x, y, width, height,
        0, 0, width, height
      );

      console.log('🔍 [SimpleImageCrop-createCroppedImage] Verifying canvas content...');
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
        console.error('❌ [SimpleImageCrop-createCroppedImage] Canvas appears to be empty/black');
        console.log('🔍 [SimpleImageCrop-createCroppedImage] Canvas dimensions:', { width, height });
        console.log('🔍 [SimpleImageCrop-createCroppedImage] Crop area:', croppedAreaPixels);
        console.log('🔍 [SimpleImageCrop-createCroppedImage] Image src:', imageUrl);
        throw new Error('Cropped area appears to be empty');
      }
      
      console.log('✅ [SimpleImageCrop-createCroppedImage] Canvas contains valid image data');

      console.log('📦 [SimpleImageCrop-createCroppedImage] Converting canvas to blob...');
      canvas.toBlob((blob) => {
        if (blob) {
          console.log('✅ [SimpleImageCrop-createCroppedImage] Crop successful, blob size:', blob.size);
          
          // Verify blob is valid
          if (blob.size === 0) {
            console.error('❌ [SimpleImageCrop-createCroppedImage] Blob is empty');
            throw new Error('Cropped image is empty');
          }
          
          const croppedFile = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
          const previewUrl = URL.createObjectURL(blob);
          
          console.log('✅ [SimpleImageCrop-createCroppedImage] Preview URL created:', previewUrl);
          console.log('✅ [SimpleImageCrop-createCroppedImage] File created:', {
            name: croppedFile.name,
            size: croppedFile.size,
            type: croppedFile.type
          });
          
          // Test if preview URL is accessible
          console.log('🧪 [SimpleImageCrop-createCroppedImage] Testing preview URL validity...');
          const testImg = new Image();
          testImg.onload = () => {
            console.log('✅ [SimpleImageCrop-createCroppedImage] Preview URL is valid and loadable');
            console.log('🎉 [SimpleImageCrop-createCroppedImage] Calling onCropComplete with final result');
            
            onCropComplete({
              file: croppedFile,
              preview: previewUrl,
              aspectRatio: selectedAspectRatio,
              cropData: { crop, zoom, croppedAreaPixels }
            });
            
            setLoading(false);
            resetState();
            console.log('🏁 [SimpleImageCrop-createCroppedImage] COMPLETED successfully');
          };
          testImg.onerror = (e) => {
            console.error('❌ [SimpleImageCrop-createCroppedImage] Preview URL is not loadable:', e);
            URL.revokeObjectURL(previewUrl);
            throw new Error('Failed to create valid preview URL');
          };
          testImg.src = previewUrl;
          
        } else {
          console.error('❌ [SimpleImageCrop-createCroppedImage] Failed to create blob from canvas');
          throw new Error('Failed to create blob from canvas');
        }
      }, 'image/jpeg', 0.9);

    } catch (error) {
      console.error('❌ [SimpleImageCrop-createCroppedImage] Error cropping image:', {
        error,
        message: error.message,
        stack: error.stack
      });
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