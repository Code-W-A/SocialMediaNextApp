"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Modal, Button, Radio, Slider, Typography, message, Space, Alert, Divider } from 'antd';
import Cropper from 'react-easy-crop';
import { 
  validateImageFile, 
  createCanvasFromFile, 
  cropImageCanvas, 
  smartCompressImage,
  getOptimalDimensions,
  getImageFileInfo,
  cleanupImagePreview
} from '@/utils/imageValidation';
import { useLanguage } from '@/lib/i18n';
import Iconify from '@/components/Iconify';

const { Text, Title } = Typography;

/**
 * ImageCropModal - Universal image cropping component
 * Supports multiple aspect ratios and drag-based crop selection
 */
const ImageCropModal = ({
  visible,
  onCancel,
  onCropComplete,
  file,
  title = "Crop Image",
  aspectRatios = ['square', 'landscape', 'portrait'],
  defaultAspectRatio = 'square',
  maxWidth = 1080,
  quality = 0.9,
  showAspectRatioSelector = true,
  showZoomSlider = true,
  showImageInfo = true
}) => {
  const { t } = useLanguage();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(defaultAspectRatio);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationWarnings, setValidationWarnings] = useState([]);

  // Create image preview when file changes
  useEffect(() => {
    if (file) {
      // Validate file
      const validation = validateImageFile(file, 'post');
      if (!validation.isValid) {
        setValidationErrors([validation.error]);
        setValidationWarnings([]);
        return;
      }
      
      setValidationErrors([]);
      setValidationWarnings(validation.warnings || []);
      
      // Create preview
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      
      // Get file info
      const info = getImageFileInfo(file);
      setImageInfo(info);

      return () => {
        cleanupImagePreview(preview);
      };
    } else {
      setImagePreview(null);
      setImageInfo(null);
      setValidationErrors([]);
      setValidationWarnings([]);
    }
  }, [file]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setSelectedAspectRatio(defaultAspectRatio);
    }
  }, [visible, defaultAspectRatio]);

  // Get aspect ratio value for react-easy-crop
  const getAspectRatioValue = (ratio) => {
    const ratios = {
      square: 1,
      landscape: 16 / 9,
      portrait: 9 / 16
    };
    return ratios[ratio] || 1;
  };

  const onCropAreaChange = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropComplete = async () => {
    if (!file || !croppedAreaPixels) {
      message.error(t('imageCrop.noCropSelected') || 'Please select a crop area');
      return;
    }

    setIsProcessing(true);
    try {
      // Create canvas from original file
      const canvas = await createCanvasFromFile(file);
      
      // Get optimal dimensions for selected aspect ratio
      const dimensions = getOptimalDimensions(selectedAspectRatio, maxWidth);
      
      // Create crop object for canvas processing
      const cropForCanvas = {
        x: (croppedAreaPixels.x / canvas.width) * 100,
        y: (croppedAreaPixels.y / canvas.height) * 100,
        width: (croppedAreaPixels.width / canvas.width) * 100,
        height: (croppedAreaPixels.height / canvas.height) * 100
      };

      // Crop image
      const croppedCanvas = cropImageCanvas(canvas, cropForCanvas, dimensions.width, dimensions.height);
      
      // Convert to file with smart compression
      const croppedFile = await smartCompressImage(
        croppedCanvas, 
        `cropped_${Date.now()}.jpg`, 
        file, // Original file for compression reference
        'post' // Default context
      );

      // Call completion callback with processed data
      onCropComplete({
        file: croppedFile,
        originalFile: file,
        aspectRatio: selectedAspectRatio,
        dimensions: {
          width: dimensions.width,
          height: dimensions.height
        },
        crop: croppedAreaPixels,
        size: croppedFile.size,
        preview: URL.createObjectURL(croppedFile)
      });

      message.success(t('imageCrop.cropSuccessful') || 'Image cropped successfully!');
    } catch (error) {
      console.error('Error cropping image:', error);
      message.error(t('imageCrop.cropError') || 'Failed to crop image');
    } finally {
      setIsProcessing(false);
    }
  };

  const aspectRatioOptions = [
    { 
      value: 'square', 
      label: t('imageCrop.square') || 'Square (1:1)',
      icon: 'mdi:square-outline'
    },
    { 
      value: 'landscape', 
      label: t('imageCrop.landscape') || 'Landscape (16:9)',
      icon: 'mdi:rectangle-outline'
    },
    { 
      value: 'portrait', 
      label: t('imageCrop.portrait') || 'Portrait (9:16)',
      icon: 'mdi:cellphone'
    }
  ].filter(option => aspectRatios.includes(option.value));

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Iconify icon="eva:crop-fill" width="20px" />
          <span>{title}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      centered
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={isProcessing}>
          {t('common.cancel') || 'Cancel'}
        </Button>,
        <Button 
          key="crop" 
          type="primary" 
          onClick={handleCropComplete}
          loading={isProcessing}
          disabled={!file || validationErrors.length > 0}
          icon={<Iconify icon="eva:checkmark-fill" width="16px" />}
        >
          {t('imageCrop.applyCrop') || 'Apply Crop'}
        </Button>
      ]}
      destroyOnClose
    >
      <div style={{ minHeight: '400px' }}>
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert
            type="error"
            message={t('imageCrop.validationError') || 'Validation Error'}
            description={validationErrors.join(', ')}
            style={{ marginBottom: '16px' }}
            showIcon
          />
        )}

        {/* Validation Warnings */}
        {validationWarnings.length > 0 && (
          <Alert
            type="warning"
            message={t('imageCrop.validationWarnings') || 'Warnings'}
            description={validationWarnings.join(', ')}
            style={{ marginBottom: '16px' }}
            showIcon
          />
        )}

        {/* Image Info */}
        {showImageInfo && imageInfo && (
          <div style={{ 
            background: '#f5f5f5', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '16px'
          }}>
            <Text style={{ fontSize: '12px', color: '#666' }}>
              <strong>{imageInfo.name}</strong> • {imageInfo.sizeFormatted} • {imageInfo.type}
            </Text>
          </div>
        )}

        {/* Aspect Ratio Selector */}
        {showAspectRatioSelector && aspectRatioOptions.length > 1 && (
          <div style={{ marginBottom: '16px' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              {t('imageCrop.selectAspectRatio') || 'Select Aspect Ratio:'}
            </Text>
            <Radio.Group
              value={selectedAspectRatio}
              onChange={(e) => setSelectedAspectRatio(e.target.value)}
              style={{ width: '100%' }}
            >
              <Space direction="horizontal" wrap>
                {aspectRatioOptions.map(option => (
                  <Radio.Button key={option.value} value={option.value}>
                    <Space>
                      <Iconify icon={option.icon} width="16px" />
                      {option.label}
                    </Space>
                  </Radio.Button>
                ))}
              </Space>
            </Radio.Group>
          </div>
        )}

        {/* Crop Area */}
        {imagePreview && validationErrors.length === 0 && (
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            height: '300px',
            background: '#000',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '16px'
          }}>
            <Cropper
              image={imagePreview}
              crop={crop}
              zoom={zoom}
              aspect={getAspectRatioValue(selectedAspectRatio)}
              onCropChange={setCrop}
              onCropComplete={onCropAreaChange}
              onZoomChange={setZoom}
              showGrid={true}
              cropShape="rect"
              style={{
                containerStyle: {
                  width: '100%',
                  height: '100%',
                  borderRadius: '8px'
                }
              }}
            />
          </div>
        )}

        {/* Zoom Slider */}
        {showZoomSlider && imagePreview && validationErrors.length === 0 && (
          <div style={{ marginBottom: '16px' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              {t('imageCrop.zoom') || 'Zoom:'}
            </Text>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={setZoom}
              tooltip={{ formatter: (value) => `${Math.round(value * 100)}%` }}
            />
          </div>
        )}

        {/* Instructions */}
        <div style={{ 
          background: '#f0f7ff', 
          padding: '12px', 
          borderRadius: '6px',
          border: '1px solid #d6e4ff'
        }}>
          <Text style={{ color: '#1890ff', fontSize: '13px' }}>
            <Iconify icon="eva:info-fill" width="16px" style={{ marginRight: '6px' }} />
            {t('imageCrop.instructions') || 'Drag to reposition • Pinch or scroll to zoom • Use corners to resize crop area'}
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default ImageCropModal; 