import React from "react";
import { getPostImageUrl } from "../utils/imageUtils";

const PostContent = ({ content, imagePath, editedAt }) => {
  return (
    <div>
      <div className="post__content">{content}</div>
      {editedAt && <span className="edited-tag">Edited</span>}
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
