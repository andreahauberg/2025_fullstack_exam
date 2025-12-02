import React from "react";
import { getPostImageUrl } from "../utils/imageUtils";
import ImagePlaceholder from "./ImagePlaceholder";

const PostContent = ({ content, imagePath, editedAt, createdAt }) => {
  return (
    <div>
      <div className="post__content-row">
        <div className="post__content">{content}</div>
      </div>
      {imagePath && <ImagePlaceholder src={getPostImageUrl(imagePath)} alt="Post" className="post__image" aspect="16/9" />}
    </div>
  );
};

export default PostContent;
