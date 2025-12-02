import React, { useState } from "react";

const ImagePlaceholder = ({ src, alt = "", className = "", style = {}, aspect = "16/9" }) => {
  const [loaded, setLoaded] = useState(false);
  const wrapperStyle = {
    position: "relative",
    width: "100%",
    aspectRatio: aspect,
    overflow: "hidden",
    borderRadius: 12,
    background: "linear-gradient(180deg,#eef3f6,#e6edf1)",
    ...style,
  };

  const placeholderStyle = {
    position: "absolute",
    inset: 0,
    display: loaded ? "none" : "block",
    background: "linear-gradient(180deg,#eef3f6,#e6edf1)",
  };

  const imgStyle = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "opacity 240ms ease-in",
    opacity: loaded ? 1 : 0,
    display: "block",
  };

  return (
    <div className={className} style={wrapperStyle}>
      <div style={placeholderStyle} />
      <img src={src} alt={alt} style={imgStyle} onLoad={() => setLoaded(true)} onError={() => setLoaded(true)} />
    </div>
  );
};

export default ImagePlaceholder;
