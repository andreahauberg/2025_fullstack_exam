import React, { useState, useEffect, useRef } from "react";
import { api } from "../api";
import Dialog from "./Dialog";
import {
  parseApiErrorMessage,
  validateImageFile,
  validateFields,
} from "../utils/validation";
import FieldError from "./FieldError";

const PostDialog = ({ isOpen, onClose, onSuccess }) => {
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const maxLength = 280;
  const remaining = maxLength - (postContent?.length || 0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setPostContent("");
      setPostImage(null);
      setPostImagePreview(null);
      setMessage("");
      setErrors({});
    }
  }, [isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageError = validateImageFile(file);
      if (imageError) {
        setErrors((prev) => ({ ...prev, post_image: imageError }));
        setPostImage(null);
        setPostImagePreview(null);
        return;
      }
      setPostImage(file);
      setPostImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, post_image: "" }));
      setMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const clientErrors = validateFields(
      { post_content: postContent },
      ["post_content"]
    );
    const imageError = validateImageFile(postImage);
    if (imageError) clientErrors.post_image = imageError;
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("post_content", postContent);
      if (postImage) {
        formData.append("post_image", postImage);
      }

      const response = await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setErrors({});
      setMessage("Post created successfully!");
      onSuccess(response.data);
      setTimeout(() => {
        setMessage("");
        onClose();
      }, 2000);
    } catch (error) {
      setMessage(parseApiErrorMessage(error, "An error occurred."));
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
      <form className="x-dialog__form" onSubmit={handleSubmit} noValidate>
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="What's on your mind?"
          disabled={isLoading}
          autoFocus
          rows="4"
          maxLength={maxLength}
          className={
            errors.post_content
              ? "form-control form-control--textarea post__dialog-textarea input-error"
              : "form-control form-control--textarea post__dialog-textarea"
          }
        />
        <div className="post-meta">
          <div className={`char-count ${remaining < 20 ? "warn" : ""}`}>
            {remaining} / {maxLength}
          </div>
          <FieldError error={errors.post_content} className="field-error" />
        </div>
        {postImagePreview && (
          <div className="post-image-preview">
            <img src={postImagePreview} alt="Preview" className="post-image" />
            <button
              type="button"
              className="remove-image-btn"
              onClick={() => {
                setPostImage(null);
                setPostImagePreview(null);
                setErrors((prev) => ({ ...prev, post_image: "" }));
              }}>
              Remove Image
            </button>
          </div>
        )}
        <div className="post-image-actions">
          <div className="post-media-hint">
            Add an image to boost engagement. <br></br>Max 1 image per post.
          </div>
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
            <i className="fa-regular fa-image"></i>
            {postImage ? "Change Image" : "Add Image"}
          </button>
        </div>
        <button type="submit" className="x-dialog__btn" disabled={isLoading}>
          {isLoading ? "Posting..." : "Post"}
        </button>
        <FieldError error={errors.post_image} className="field-error" />
      </form>
    </Dialog>
  );
};

export default PostDialog;
