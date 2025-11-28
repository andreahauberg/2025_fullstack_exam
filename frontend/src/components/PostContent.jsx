import React from "react";
import { getPostImageUrl } from "../utils/imageUtils";

const PostContent = ({ content, imagePath, editedAt, createdAt }) => {
  return (
    <div>
      <div className="post__content-row">
        <div className="post__content">{content}</div>
      </div>
      {imagePath && (
        <img
          src={getPostImageUrl(imagePath)}
          alt="Post"
          className="post__image"
        />
      )}
    </div>
  );
};

export default PostContent;
