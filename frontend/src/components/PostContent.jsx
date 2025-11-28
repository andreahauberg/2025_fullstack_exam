import React from "react";
import { getPostImageUrl } from "../utils/imageUtils";

const PostContent = ({ content, imagePath, editedAt, createdAt }) => {
  const showEdited =
    editedAt && createdAt && String(editedAt) !== String(createdAt);

  return (
    <div>
      <div className="post__content-row">
        <div className="post__content">{content}</div>
        {showEdited && <span className="edited-tag"> · Edited</span>}
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
