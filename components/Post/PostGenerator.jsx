"use client";
import React, { useRef, useState } from "react";
import css from "@/styles/PostGenerator.module.css";
import Box from "../Box";
import { Avatar, Button, Flex, Image, Input, Spin, Typography, Divider, Card } from "antd";
import Iconify from "../Iconify";
import { createPost } from "@/actions/post";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useFirebaseAuth";

const YDestinyPrompts = [
  "Ce emoție te domină azi?",
  "La ce te gândești chiar acum?",
  "Ce te-ar bucura cel mai mult astăzi?",
  "Dacă ai putea schimba ceva azi, ce ar fi?",
  "Ce ți-ar plăcea să afle ceilalți despre tine?",
  "Ce moment ți-a adus un zâmbet astăzi?",
  "Împărtășește o mică bucurie sau un mic triumf!",
  "Cum e partenerul perfect pentru tine acum? – 3 calități",
  "Ce este cel mai important într-o relație pentru tine?"
];

const PostGenerator = () => {
  const imgInputRef = useRef(null);
  const vidInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null); // [image, video]
  const [postText, setPostText] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [showPrompts, setShowPrompts] = useState(false);
  const queryClient = useQueryClient();
  const { mutate: execute, isPending } = useMutation({
    mutationFn: (data) => createPost({ ...data, authorId: user?.id }),
    onSuccess: () => {
      handleSuccess();
      queryClient.invalidateQueries("posts");
    },
    onError: () => showError("Something wrong happened. Try again!"),
  });

  const handleSuccess = () => {
    setSelectedFile(null);
    setFileType(null);
    setPostText("");
    setSelectedPrompt(null);
    toast.success("Postarea ta a fost partajată pe Calea Destinului! ✨");
  };

  const handlePromptSelect = (prompt) => {
    setPostText(prompt + " ");
    setSelectedPrompt(prompt);
    setShowPrompts(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    // put a limit of 5mb file size
    if (file && file.size > 5 * 1024 * 1024) {
      console.log("File size is too big");
      return;
    }

    if (
      file &&
      (file.type.startsWith("image/") || file.type.startsWith("video/"))
    ) {
      setFileType(file.type.split("/")[0]);

      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        setSelectedFile(reader.result);
      };
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileType(null);
  };

  const showError = (content = "Something went wrong! Try again.") => {
    toast.error(content);
  };

  function handleSubmitPost() {
    if ((postText === "" || !postText) && !selectedFile) {
      showError("Nu poți face o postare goală");
      return;
    }
    // don't forget to tell about the next.config.js file where we have set the limit of 5mb
    execute({ postText, media: selectedFile });
  }

  const { user } = useUser();
  return (
    <>
      <Spin
        spinning={isPending}
        tip={
          <Typography className="typoBody1" style={{ marginTop: "1rem" }}>
            Se publică pe Calea Destinului...
          </Typography>
        }
      >
        <div className={css.postGenWrapper}>
          <Box className={css.container}>
            {/* Header with YDestiny branding */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              padding: '16px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Iconify icon="eva:star-fill" width="24px" style={{ color: '#FFD700' }} />
                <Typography.Title level={4} style={{ margin: 0, color: 'white', fontSize: '18px' }}>
                  Calea Destinului
                </Typography.Title>
                <Iconify icon="eva:star-fill" width="24px" style={{ color: '#FFD700' }} />
              </div>
              <Typography.Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>
                Împărtășește-ți gândurile cu universul ✨
              </Typography.Text>
            </div>

            <Flex gap={"1rem"} align={"flex-start"} vertical>
              {/* avatar */}

              <Flex style={{ width: "100%" }} gap={"1rem"}>
                <Avatar
                  src={user?.imageUrl}
                  style={{
                    boxShadow: "var(--avatar-shadow)",
                    width: "2.6rem",
                    height: "2.6rem",
                  }}
                />

                <Input.TextArea
                  // maxLength={100}
                  placeholder={selectedPrompt || "Împărtășește ce simți în această clipă..."}
                  style={{ height: 80, resize: "none", flex: 1 }}
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                />
              </Flex>

              {/* YDestiny Prompts */}
              <div style={{ width: '100%' }}>
                <Button 
                  type="text" 
                  onClick={() => setShowPrompts(!showPrompts)}
                  style={{ 
                    marginBottom: '12px',
                    border: '1px dashed #667eea',
                    borderRadius: '8px',
                    background: showPrompts ? '#667eea15' : 'transparent'
                  }}
                >
                  <Flex align="center" gap={".5rem"}>
                    <Iconify icon="eva:bulb-fill" width="16px" style={{ color: '#667eea' }} />
                    <Typography.Text style={{ color: '#667eea' }}>
                      {showPrompts ? 'Ascunde inspirația' : 'Inspirație pentru postare'}
                    </Typography.Text>
                    <Iconify 
                      icon={showPrompts ? "eva:chevron-up-fill" : "eva:chevron-down-fill"} 
                      width="16px" 
                      style={{ color: '#667eea' }} 
                    />
                  </Flex>
                </Button>

                {showPrompts && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    {YDestinyPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        type="text"
                        size="small"
                        onClick={() => handlePromptSelect(prompt)}
                        style={{
                          textAlign: 'left',
                          height: 'auto',
                          whiteSpace: 'normal',
                          padding: '8px 12px',
                          border: '1px solid #f0f0f0',
                          borderRadius: '8px',
                          background: selectedPrompt === prompt ? '#667eea15' : '#fafafa',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedPrompt !== prompt) {
                            e.target.style.background = '#667eea10';
                            e.target.style.borderColor = '#667eea';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedPrompt !== prompt) {
                            e.target.style.background = '#fafafa';
                            e.target.style.borderColor = '#f0f0f0';
                          }
                        }}
                      >
                        <Typography.Text 
                          style={{ 
                            fontSize: '13px',
                            color: selectedPrompt === prompt ? '#667eea' : '#666'
                          }}
                        >
                          {prompt}
                        </Typography.Text>
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* file preview */}
              {fileType && (
                <div className={css.previewContainer}>
                  {/* remove button */}
                  <Button
                    type="default"
                    className={css.remove}
                    style={{ position: "absolute" }}
                  >
                    <Typography
                      className="typoCaption"
                      onClick={handleRemoveFile}
                    >
                      Remove
                    </Typography>
                  </Button>

                  {/* media preview */}
                  {fileType === "image" && (
                    <Image
                      src={selectedFile}
                      className={css.preview}
                      alt="preview"
                      height={"350px"}
                      width={"100%"}
                    />
                  )}
                  {fileType === "video" && (
                    <video
                      className={css.preview}
                      controls
                      src={selectedFile}
                    />
                  )}
                </div>
              )}

              {/* buttons Container */}
              <Flex
                align="center"
                justify="space-between"
                className={css.bottom}
              >
                {/* upload buttons */}
                {/* image upload button */}
                <Button
                  type="text"
                  style={{ 
                    background: "linear-gradient(135deg, #667eea15, #764ba215)",
                    border: "1px solid #667eea30",
                    borderRadius: "8px"
                  }}
                  onClick={() => imgInputRef.current.click()}
                >
                  <Flex align="center" gap={".5rem"}>
                    <Iconify
                      icon="solar:camera-linear"
                      width="1.2rem"
                      color="#667eea"
                    />
                    <Typography className="typoSubtitle2" style={{ color: "#667eea" }}>Fotografie</Typography>
                  </Flex>
                </Button>

                {/* video upload button */}
                <Button
                  type="text"
                  style={{ 
                    background: "linear-gradient(135deg, #764ba215, #667eea15)",
                    border: "1px solid #764ba230",
                    borderRadius: "8px"
                  }}
                  onClick={() => vidInputRef.current.click()}
                >
                  <Flex align="center" gap={".5rem"}>
                    <Iconify
                      icon="gridicons:video"
                      width="1.2rem"
                      color="#764ba2"
                    />
                    <Typography className="typoSubtitle2" style={{ color: "#764ba2" }}>Video</Typography>
                  </Flex>
                </Button>

                <Button
                  style={{ 
                    marginLeft: "auto",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
                  }}
                  onClick={handleSubmitPost}
                >
                  <Flex align="center" gap={".5rem"}>
                    <Iconify icon="eva:star-fill" width="1.2rem" style={{ color: "white" }} />
                    <Typography
                      className="typoSubtitle2"
                      style={{ color: "white" }}
                    >
                      Împărtășește
                    </Typography>
                  </Flex>
                </Button>
              </Flex>
            </Flex>
          </Box>
        </div>
      </Spin>
      {/* make an input to only accept img files and max number of files as 1 */}
      <input
        type="file"
        accept="image/*"
        multiple={false}
        style={{ display: "none" }}
        ref={imgInputRef}
        onChange={(e) => handleFileChange(e)}
      />
      {/* make an input to only accept img files and max number of files as 1 */}
      <input
        type="file"
        accept="video/*"
        multiple={false}
        style={{ display: "none" }}
        ref={vidInputRef}
        onChange={(e) => handleFileChange(e)}
      />
    </>
  );
};

export default PostGenerator;
