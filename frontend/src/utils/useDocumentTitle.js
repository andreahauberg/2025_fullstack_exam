import { useEffect, useRef } from "react";

const DEFAULT_TITLE = "Welcome to X";

export const useDocumentTitle = (title, { restoreOnUnmount = true } = {}) => {
  const previousTitle = useRef(document?.title || DEFAULT_TITLE);

  useEffect(() => {
    document.title = title || DEFAULT_TITLE;
    return () => {
      if (restoreOnUnmount) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        document.title = previousTitle.current || DEFAULT_TITLE;
      }
    };
  }, [title, restoreOnUnmount]);
};

export { DEFAULT_TITLE };
