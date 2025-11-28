import React from "react";
import { getErrorText } from "../utils/validation";

const FieldError = ({ error, className = "field-error" }) => {
  const text = getErrorText(error);
  const hasError = Boolean(text);

  return (
    <span
      className={className}
      style={!hasError ? { visibility: "hidden" } : undefined}
      aria-live="polite">
      {hasError ? text : "\u00a0"}
    </span>
  );
};

export default FieldError;
