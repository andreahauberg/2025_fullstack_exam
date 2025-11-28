import React, { useState, useEffect, useRef } from "react";
import { api } from "../api";
import Dialog from "./Dialog";

const PostDialog = ({ isOpen, onClose, onSuccess }) => {
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setPostContent("");
      setPostImage(null);
      setPostImagePreview(null);
      setMessage("");
    }
  }, [isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostImage(file);
      setPostImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("post_content", postContent);
      if (postImage) {
        formData.append("post_image", postImage);
      }

      const response = await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("Post created successfully!");
      onSuccess(response.data);
      setTimeout(() => {
        setMessage("");
        onClose();
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create a post"
      logo={false}>
      {message && (
        <div
          className={`alert ${
            message.includes("success") ? "alert-success" : "alert-error"
          }`}>
          {message}
        </div>
      )}
      <form className="x-dialog__form" onSubmit={handleSubmit}>
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="What's on your mind?"
          required
          disabled={isLoading}
          autoFocus
          rows="4"
        />
        {postImagePreview && (
          <div className="post-image-preview">
            <img src={postImagePreview} alt="Preview" className="post-image" />
            <button
              type="button"
              className="remove-image-btn"
              onClick={() => {
                setPostImage(null);
                setPostImagePreview(null);
              }}>
              Remove Image
            </button>
          </div>
        )}
        <div className="post-image-actions">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: "none" }}
          />
          <button
            type="button"
            className="upload-image-btn"
            onClick={() => fileInputRef.current.click()}>
            {postImage ? "Change Image" : "Add Image"}
          </button>
        </div>
        <button type="submit" className="x-dialog__btn" disabled={isLoading}>
          {isLoading ? "Posting..." : "Post"}
        </button>
      </form>
    </Dialog>
  );
};

export default PostDialog;
