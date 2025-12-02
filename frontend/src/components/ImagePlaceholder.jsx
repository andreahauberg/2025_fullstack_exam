import React, { useState } from "react";

const ImagePlaceholder = ({ src, alt = "", className = "", style = {}, aspect = null, placeholderSrc = null }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Keep wrapper minimal so external CSS (avatar sizes, border-radius) can control appearance.
  const wrapperStyle = {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(180deg,#eef3f6,#e6edf1)",
    ...style,
  };

  if (aspect) wrapperStyle.aspectRatio = aspect;

  const placeholderStyle = {
    position: "absolute",
    inset: 0,
    display: !loaded && !error ? "block" : "none",
    background: placeholderSrc ? `url(${placeholderSrc}) center/cover no-repeat` : "linear-gradient(180deg,#eef3f6,#e6edf1)",
  };

  const imgStyle = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "opacity 240ms ease-in",
    opacity: loaded && !error ? 1 : 0,
    display: loaded && !error ? "block" : "none",
  };

  return (
    <div className={className} style={wrapperStyle}>
      <div style={placeholderStyle} />
      {!error && <img src={src} alt={alt} style={imgStyle} onLoad={() => setLoaded(true)} onError={() => setError(true)} />}
    </div>
  );
};

export default ImagePlaceholder;
