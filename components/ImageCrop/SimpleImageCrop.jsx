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
    console.log('🔍 [SimpleImageCrop] Detailed crop analysis:', {
      croppedArea: {
        x: croppedArea.x,
        y: croppedArea.y, 
        width: croppedArea.width,
        height: croppedArea.height
      },
      croppedAreaPixels: {
        x: croppedAreaPixels.x,
        y: croppedAreaPixels.y,
        width: croppedAreaPixels.width,
        height: croppedAreaPixels.height
      },
      currentZoom: zoom,
      selectedAspectRatio,
      imageUrlPresent: !!imageUrl
    });
    setCroppedAreaPixels(croppedAreaPixels);
  }, [zoom, selectedAspectRatio, imageUrl]);

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

      let { width, height, x, y } = croppedAreaPixels;
      
      console.log('📐 [SimpleImageCrop-createCroppedImage] Original crop area:', {
        width, height, x, y,
        imageWidth: img.naturalWidth,
        imageHeight: img.naturalHeight
      });
      
      // Validate and adjust crop area to be within image bounds
      const maxWidth = img.naturalWidth;
      const maxHeight = img.naturalHeight;
      
      // Adjust x and width
      if (x < 0) {
        width += x; // reduce width by the negative x
        x = 0;
      }
      if (x + width > maxWidth) {
        width = maxWidth - x;
      }
      
      // Adjust y and height  
      if (y < 0) {
        height += y; // reduce height by the negative y
        y = 0;
      }
      if (y + height > maxHeight) {
        height = maxHeight - y;
      }
      
      // Ensure minimum dimensions
      width = Math.max(1, Math.floor(width));
      height = Math.max(1, Math.floor(height));
      x = Math.max(0, Math.floor(x));
      y = Math.max(0, Math.floor(y));
      
      console.log('📐 [SimpleImageCrop-createCroppedImage] Adjusted crop area:', {
        width, height, x, y,
        adjustedFromOriginal: {
          widthDiff: width - croppedAreaPixels.width,
          heightDiff: height - croppedAreaPixels.height,
          xDiff: x - croppedAreaPixels.x,
          yDiff: y - croppedAreaPixels.y
        }
      });
      
      // Final validation - ensure crop area is valid
      if (width <= 0 || height <= 0 || x >= maxWidth || y >= maxHeight) {
        console.error('❌ [SimpleImageCrop-createCroppedImage] Invalid crop area after adjustment:', {
          width, height, x, y, maxWidth, maxHeight
        });
        
        // Fallback: Use center crop with maximum possible square
        const fallbackSize = Math.min(maxWidth, maxHeight);
        const fallbackX = Math.max(0, (maxWidth - fallbackSize) / 2);
        const fallbackY = Math.max(0, (maxHeight - fallbackSize) / 2);
        
        console.log('🔄 [SimpleImageCrop-createCroppedImage] Using fallback center crop:', {
          fallbackSize,
          fallbackX,
          fallbackY,
          originalCrop: { width: croppedAreaPixels.width, height: croppedAreaPixels.height, x: croppedAreaPixels.x, y: croppedAreaPixels.y }
        });
        
        width = fallbackSize;
        height = fallbackSize;
        x = fallbackX;
        y = fallbackY;
      }
      
      console.log('📐 [SimpleImageCrop-createCroppedImage] Final crop dimensions:', {
        width, height, x, y,
        canvasSize: { width, height },
        sourceRect: { x, y, width, height },
        targetRect: { x: 0, y: 0, width, height }
      });
      
      console.log('📐 [SimpleImageCrop-createCroppedImage] Setting canvas dimensions:', {
        width, height, x, y
      });
      
      canvas.width = width;
      canvas.height = height;
      
      console.log('🎨 [SimpleImageCrop-createCroppedImage] Drawing image to canvas...');
      console.log('🎨 [SimpleImageCrop-createCroppedImage] Canvas drawImage parameters:', {
        sourceImage: {
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          displayWidth: img.width,
          displayHeight: img.height
        },
        sourceRect: { sx: x, sy: y, sWidth: width, sHeight: height },
        targetRect: { dx: 0, dy: 0, dWidth: width, dHeight: height }
      });
      
      ctx.drawImage(
        img,
        x, y, width, height,
        0, 0, width, height
      );

      console.log('🔍 [SimpleImageCrop-createCroppedImage] Verifying canvas content...');
      console.log('🔍 [SimpleImageCrop-createCroppedImage] Canvas state after drawing:', {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        contextExists: !!ctx,
        canvasData: canvas.toDataURL ? 'Can convert to DataURL' : 'Cannot convert'
      });
      
      // Sample a larger area for content verification
      const sampleWidth = Math.min(100, width);
      const sampleHeight = Math.min(100, height);
      const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
      const pixels = imageData.data;
      let hasContent = false;
      let nonTransparentPixels = 0;
      let colorfulPixels = 0;
      
      // Check if canvas has non-transparent, non-black pixels
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1]; 
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        
        if (a > 0) {
          nonTransparentPixels++;
          if (r > 10 || g > 10 || b > 10) {
            colorfulPixels++;
            hasContent = true;
          }
        }
      }
      
      console.log('🔍 [SimpleImageCrop-createCroppedImage] Canvas content analysis:', {
        totalPixelsChecked: pixels.length / 4,
        nonTransparentPixels,
        colorfulPixels,
        hasContent,
        sampleArea: { width: sampleWidth, height: sampleHeight },
        firstPixel: {
          r: pixels[0],
          g: pixels[1], 
          b: pixels[2],
          a: pixels[3]
        }
      });
      
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
          <>
            <div style={{ 
              position: 'absolute', 
              top: '5px', 
              left: '5px', 
              background: 'rgba(0,0,0,0.7)', 
              color: 'white', 
              padding: '2px 6px', 
              fontSize: '10px',
              borderRadius: '3px',
              zIndex: 10
            }}>
              Debug: {imageUrl.substring(0, 30)}...
            </div>
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={selectedAspectRatio}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropCompleteCallback}
              onMediaLoaded={(mediaSize) => {
                console.log('🎭 [SimpleImageCrop] Media loaded in Cropper:', {
                  mediaSize,
                  naturalWidth: mediaSize.naturalWidth,
                  naturalHeight: mediaSize.naturalHeight,
                  width: mediaSize.width,
                  height: mediaSize.height,
                  aspect: selectedAspectRatio,
                  zoom: zoom
                });
              }}
              style={{
                containerStyle: {
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  background: '#000'
                }
              }}
            />
          </>
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