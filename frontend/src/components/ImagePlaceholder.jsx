import { useState, useEffect } from "react";
import "../css/ImagePlaceholder.css";

const ImagePlaceholder = ({
  src,
  alt = "",
  className = "",
  style = {},
  aspect = null,
  placeholderSrc = null,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (aspect) {
      const wrapper = document.querySelector(`.${className}`);
      if (wrapper) {
        wrapper.style.aspectRatio = aspect;
      }
    }
  }, [aspect, className]);

  const placeholderClass = placeholderSrc ? "with-src" : "";
  const placeholderStyle = placeholderSrc
    ? { backgroundImage: `url(${placeholderSrc})` }
    : {};
  const imgClass = loaded && !error ? "loaded" : "";

  return (
    <div className={`image-placeholder__wrapper ${className}`} style={style}>
      <div
        className={`image-placeholder__placeholder ${placeholderClass}`}
        style={placeholderStyle}
      />
      {!error && (
        <img
          src={src}
          alt={alt}
          className={`image-placeholder__img ${imgClass}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
};

export default ImagePlaceholder;
