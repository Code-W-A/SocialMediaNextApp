import React, { useState } from "react";
import { Upload, Modal, Typography } from "antd";
import { PlusOutlined, StarFilled, StarOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

/**
 * SimpleImageSelector – a lightweight replacement for the old Dragger/image-crop workflow.
 *
 * Props:
 *  uploadedImages        Array   – current Ant Design fileList (can include existing images with {url})
 *  setUploadedImages     Func    – setter from parent
 *  mainImageIndex        Number  – index of the current main image
 *  setMainImageIndex     Func    – setter from parent
 *  maxCount              Number  – total images allowed (default 6)
 */
const SimpleImageSelector = ({
  uploadedImages = [],
  setUploadedImages = () => {},
  mainImageIndex = 0,
  setMainImageIndex = () => {},
  maxCount = 6
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // Ant Design requires a dummy request to avoid upload errors when beforeUpload returns false
  const dummyRequest = ({ onSuccess }) => {
    setTimeout(() => onSuccess("ok"), 0);
  };

  const handlePreview = async (file) => {
    // If the file has a URL already, use it; otherwise create one
    const src = file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : "");
    setPreviewImage(src);
    setPreviewOpen(true);
  };

  const handleChange = ({ fileList }) => {
    // Mark all as done to avoid AntD showing uploading state
    const readyList = fileList.map((f) => ({ ...f, status: "done" }));
    setUploadedImages(readyList);
    if (mainImageIndex >= readyList.length) {
      setMainImageIndex(readyList.length - 1);
    }
  };

  const handleRemove = (file) => {
    const newList = uploadedImages.filter((f) => f.uid !== file.uid);
    setUploadedImages(newList);
    // Adjust main image index if needed
    const removedIndex = uploadedImages.findIndex((f) => f.uid === file.uid);
    if (removedIndex === mainImageIndex) {
      setMainImageIndex(0);
    } else if (removedIndex < mainImageIndex) {
      setMainImageIndex((prev) => prev - 1);
    }
    return false; // prevent default remove as we'll manage state
  };

  const beforeUpload = (file) => {
    // Accept **any** image the browser provides – no strict validation
    // Just limit total count
    if (uploadedImages.length >= maxCount) {
      return Upload.LIST_IGNORE;
    }
    return false; // prevent auto upload – we handle locally
  };

  // Custom rendering to show main-image star and a small "Set main" button
  const itemRender = (originNode, file, _fileList, actions) => {
    const index = uploadedImages.findIndex((f) => f.uid === file.uid);

    return (
      <div style={{ position: "relative", width: 104, height: 104 }}>
        {originNode}

        {/* Star overlay */}
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            zIndex: 2,
            cursor: "pointer"
          }}
          onClick={() => setMainImageIndex(index)}
        >
          {index === mainImageIndex ? (
            <StarFilled style={{ color: "#fadb14", fontSize: 18 }} />
          ) : (
            <StarOutlined style={{ color: "white", fontSize: 18 }} />
          )}
        </div>

        {/* Remove button */}
        <div
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            zIndex: 2,
            cursor: "pointer",
            color: "white"
          }}
          onClick={() => actions.remove(file)}
        >
          <DeleteOutlined style={{ fontSize: 16 }} />
        </div>
      </div>
    );
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Add</div>
    </div>
  );

  return (
    <>
      <Upload
        accept="image/*"
        listType="picture-card"
        multiple
        fileList={uploadedImages}
        onPreview={handlePreview}
        customRequest={dummyRequest}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        itemRender={itemRender}
        onRemove={handleRemove}
      >
        {uploadedImages.length >= maxCount ? null : uploadButton}
      </Upload>

      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        width={400}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>

      <Text type="secondary" style={{ fontSize: 12 }}>
        Click the star to set your main profile picture.
      </Text>
    </>
  );
};

export default SimpleImageSelector; 