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
  const [resolvedImageUrl, setResolvedImageUrl] = useState(null);
  const blobUrlRef = useRef(null);
  const resolvedBlobRef = useRef(null);

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

  // Resolve remote URLs to same-origin blob URLs to avoid canvas tainting and CORS issues
  React.useEffect(() => {
    let aborted = false;
    const resolveUrl = async () => {
      // Cleanup any previous blob URL
      if (blobUrlRef.current) {
        try { URL.revokeObjectURL(blobUrlRef.current); } catch {}
        blobUrlRef.current = null;
      }

      if (!imageUrl) {
        setResolvedImageUrl(null);
        resolvedBlobRef.current = null;
        return;
      }

      try {
        // Do not fetch here to avoid client-side CORS/503. Just pass through.
        setResolvedImageUrl(imageUrl);
        resolvedBlobRef.current = null;
      } catch (e) {
        console.warn('[SimpleImageCrop] Failed to resolve image URL, using original. Error:', e);
        setResolvedImageUrl(imageUrl);
        resolvedBlobRef.current = null;
      }
    };
    resolveUrl();
    return () => {
      aborted = true;
      if (blobUrlRef.current) {
        try { URL.revokeObjectURL(blobUrlRef.current); } catch {}
        blobUrlRef.current = null;
      }
      resolvedBlobRef.current = null;
    };
  }, [imageUrl]);

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
      console.log('🔍 [SimpleImageCrop-createCroppedImage] Using resolved image URL:', {
        provided: imageUrl?.substring(0, 100) + '...',
        resolved: resolvedImageUrl?.substring(0, 100) + '...'
      });

      console.log('🖼️ [SimpleImageCrop-createCroppedImage] Creating canvas and decoding image blob...');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      // Always fetch via proxy to avoid CORS/remote 503
      const source = resolvedImageUrl || imageUrl;
      const proxied = /^https?:\/\//i.test(source) ? `/api/proxy-image?url=${encodeURIComponent(source)}` : source;
      const r = await fetch(proxied, { headers: { Accept: 'image/*' }, cache: 'no-store' });
      if (!r.ok) throw new Error('Failed to fetch image blob');
      let sourceBlob = await r.blob();
      let bitmap;
      try {
        bitmap = await createImageBitmap(sourceBlob);
      } catch (e) {
        console.warn('⚠️ createImageBitmap failed, falling back to HTMLImageElement decode:', e);
        const tmpUrl = URL.createObjectURL(sourceBlob);
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            // Draw full image to temp canvas to normalize
            const temp = document.createElement('canvas');
            temp.width = img.naturalWidth;
            temp.height = img.naturalHeight;
            const tctx = temp.getContext('2d');
            tctx.drawImage(img, 0, 0);
            temp.toBlob(async (b) => {
              try {
                bitmap = await createImageBitmap(b);
                resolve();
              } catch (ee) {
                console.warn('⚠️ createImageBitmap still failed after normalize. Using image directly.', ee);
                // Use image directly for drawing later
                bitmap = img; // Not an ImageBitmap; handle below
                resolve();
              }
            }, 'image/jpeg', 0.95);
          };
          img.onerror = reject;
          img.src = tmpUrl;
        });
      }
      let { width, height, x, y } = croppedAreaPixels;
      
      console.log('📐 [SimpleImageCrop-createCroppedImage] Original crop area:', {
        width, height, x, y,
        imageWidth: bitmap.width,
        imageHeight: bitmap.height
      });
      
      // Validate and adjust crop area to be within image bounds
      const maxWidth = (bitmap.width || bitmap.naturalWidth);
      const maxHeight = (bitmap.height || bitmap.naturalHeight);
      
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
        
        // Smart fallback: Calculate proper center crop based on aspect ratio
        let fallbackWidth, fallbackHeight, fallbackX, fallbackY;
        
        if (selectedAspectRatio === 1) {
          // Square crop - use largest possible square
          const fallbackSize = Math.min(maxWidth, maxHeight);
          fallbackWidth = fallbackHeight = fallbackSize;
          fallbackX = Math.max(0, (maxWidth - fallbackSize) / 2);
          fallbackY = Math.max(0, (maxHeight - fallbackSize) / 2);
        } else if (selectedAspectRatio < 1) {
          // Portrait crop (e.g., 4:5 = 0.8)
          // Width should be smaller than height
          if (maxWidth * (1/selectedAspectRatio) <= maxHeight) {
            // Image is wide enough for portrait crop
            fallbackWidth = maxWidth;
            fallbackHeight = maxWidth * (1/selectedAspectRatio);
            fallbackX = 0;
            fallbackY = Math.max(0, (maxHeight - fallbackHeight) / 2);
          } else {
            // Image is too tall, crop by height
            fallbackHeight = maxHeight;
            fallbackWidth = maxHeight * selectedAspectRatio;
            fallbackX = Math.max(0, (maxWidth - fallbackWidth) / 2);
            fallbackY = 0;
          }
        } else {
          // Landscape crop
          if (maxHeight * selectedAspectRatio <= maxWidth) {
            // Image is tall enough for landscape crop
            fallbackHeight = maxHeight;
            fallbackWidth = maxHeight * selectedAspectRatio;
            fallbackX = Math.max(0, (maxWidth - fallbackWidth) / 2);
            fallbackY = 0;
          } else {
            // Image is too wide, crop by width
            fallbackWidth = maxWidth;
            fallbackHeight = maxWidth * (1/selectedAspectRatio);
            fallbackX = 0;
            fallbackY = Math.max(0, (maxHeight - fallbackHeight) / 2);
          }
        }
        
        console.log('🔄 [SimpleImageCrop-createCroppedImage] Using smart fallback center crop:', {
          selectedAspectRatio,
          imageSize: { maxWidth, maxHeight },
          fallbackCrop: { 
            width: fallbackWidth, 
            height: fallbackHeight, 
            x: fallbackX, 
            y: fallbackY 
          },
          originalCrop: { 
            width: croppedAreaPixels.width, 
            height: croppedAreaPixels.height, 
            x: croppedAreaPixels.x, 
            y: croppedAreaPixels.y 
          }
        });
        
        width = Math.floor(fallbackWidth);
        height = Math.floor(fallbackHeight);
        x = Math.floor(fallbackX);
        y = Math.floor(fallbackY);
      }
      
      // Additional validation for questionable crop areas even if they pass basic checks
      const cropAreaRatio = width / height;
      const expectedRatio = selectedAspectRatio;
      const ratioTolerance = 0.1;
      
      // Recalculează doar dacă raportul deviază semnificativ; nu penaliza crop-uri care ocupă întreaga imagine
      if (Math.abs(cropAreaRatio - expectedRatio) > ratioTolerance) {
        
        console.log('⚠️ [SimpleImageCrop-createCroppedImage] Crop area seems wrong, recalculating:', {
          cropAreaRatio,
          expectedRatio,
          ratioDiff: Math.abs(cropAreaRatio - expectedRatio),
          currentCrop: { width, height, x, y },
          imageSize: { maxWidth, maxHeight }
        });
        
        // Smart recalculation based on aspect ratio
        let newWidth, newHeight, newX, newY;
        
        if (selectedAspectRatio === 1) {
          // Square crop
          const size = Math.min(maxWidth, maxHeight) * 0.8; // Use 80% of smaller dimension
          newWidth = newHeight = size;
          newX = (maxWidth - size) / 2;
          newY = (maxHeight - size) / 2;
        } else if (selectedAspectRatio < 1) {
          // Portrait crop
          const targetHeight = Math.min(maxHeight * 0.9, maxWidth * (1/selectedAspectRatio));
          newHeight = targetHeight;
          newWidth = targetHeight * selectedAspectRatio;
          newX = (maxWidth - newWidth) / 2;
          newY = (maxHeight - newHeight) / 2;
        } else {
          // Landscape crop
          const targetWidth = Math.min(maxWidth * 0.9, maxHeight * selectedAspectRatio);
          newWidth = targetWidth;
          newHeight = targetWidth * (1/selectedAspectRatio);
          newX = (maxWidth - newWidth) / 2;
          newY = (maxHeight - newHeight) / 2;
        }
        
        width = Math.floor(newWidth);
        height = Math.floor(newHeight);
        x = Math.floor(newX);
        y = Math.floor(newY);
        
        console.log('🔄 [SimpleImageCrop-createCroppedImage] Recalculated crop area:', {
          newCrop: { width, height, x, y },
          newRatio: width / height,
          targetRatio: selectedAspectRatio
        });
      }
      
      console.log('📐 [SimpleImageCrop-createCroppedImage] Final crop dimensions:', {
        width, height, x, y,
        canvasSize: { width, height },
        sourceRect: { x, y, width, height },
        targetRect: { x: 0, y: 0, width, height },
        finalRatio: width / height,
        expectedRatio: selectedAspectRatio
      });
      
      console.log('📐 [SimpleImageCrop-createCroppedImage] Setting canvas dimensions:', {
        width, height, x, y
      });
      
      canvas.width = width;
      canvas.height = height;
      
      console.log('🎨 [SimpleImageCrop-createCroppedImage] Drawing image to canvas...');
      console.log('🎨 [SimpleImageCrop-createCroppedImage] Drawing source to canvas...');
      if ('close' in bitmap && typeof bitmap.close === 'function') {
        ctx.drawImage(bitmap, x, y, width, height, 0, 0, width, height);
        try { bitmap.close(); } catch {}
      } else {
        // bitmap is an HTMLImageElement fallback
        ctx.drawImage(bitmap, x, y, width, height, 0, 0, width, height);
      }

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
      let imageData;
      try {
        imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
      } catch (e) {
        // If canvas is tainted for any reason, skip content validation
        console.warn('⚠️ [SimpleImageCrop] getImageData failed (likely tainted). Proceeding without validation.', e);
      }
      const pixels = imageData.data;
      let hasContent = false;
      let nonTransparentPixels = 0;
      let colorfulPixels = 0;
      
      // Check if canvas has non-transparent, non-black pixels
      if (imageData) {
        const pixels = imageData.data;
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
      } else {
        // If we cannot read pixels, assume content exists (since drawImage didn't error)
        hasContent = true;
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