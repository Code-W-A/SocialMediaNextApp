"use client";
import React, { useState } from "react";
import { Modal, Input, Button, message, Upload, Image } from "antd";
import { PictureOutlined, SendOutlined, CloseOutlined } from "@ant-design/icons";
import { uploadMessageImage, sendImageMessage } from "@/actions/chat";

const ImageUpload = ({ conversation, currentUser, onImageSent }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (file) => {
    // Validate file type
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    setIsModalVisible(true);
    return false; // Prevent auto upload
  };

  const handleSendImage = async () => {
    if (!selectedFile || !conversation?.id || !currentUser?.id) return;

    setUploading(true);
    try {
      // Upload image to Firebase Storage
      const imageData = await uploadMessageImage(selectedFile, conversation.id);
      
      // Send image message
      await sendImageMessage({
        conversationId: conversation.id,
        senderId: currentUser.id,
        imageData,
        caption
      });

      message.success("Image sent successfully!");
      handleCloseModal();
      onImageSent?.();
    } catch (error) {
      console.error("Error sending image:", error);
      message.error("Failed to send image");
    } finally {
      setUploading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedFile(null);
    setImagePreview(null);
    setCaption("");
  };

  return (
    <>
      <Upload
        accept="image/*"
        showUploadList={false}
        beforeUpload={handleFileSelect}
        multiple={false}
      >
        <Button 
          type="text" 
          icon={<PictureOutlined />}
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px'
          }}
        />
      </Upload>

      <Modal
        title="Send Image"
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={400}
        destroyOnHidden
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Image Preview */}
          {imagePreview && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              padding: '8px'
            }}>
              <Image
                src={imagePreview}
                alt="Preview"
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '8px'
                }}
                preview={false}
              />
            </div>
          )}

          {/* Caption Input */}
          <Input.TextArea
            placeholder="Add a caption (optional)..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            maxLength={500}
            showCount
            disabled={uploading}
          />

          {/* File Info */}
          {selectedFile && (
            <div style={{ 
              fontSize: '12px', 
              color: '#666',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>{selectedFile.name}</span>
              <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '8px',
            marginTop: '16px'
          }}>
            <Button 
              onClick={handleCloseModal}
              disabled={uploading}
              icon={<CloseOutlined />}
            >
              Cancel
            </Button>
            <Button 
              type="primary"
              onClick={handleSendImage}
              loading={uploading}
              disabled={!selectedFile}
              icon={<SendOutlined />}
            >
              Send Image
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ImageUpload; 