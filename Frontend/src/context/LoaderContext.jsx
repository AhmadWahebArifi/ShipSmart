import React, { createContext, useContext, useState } from "react";

const LoaderContext = createContext();

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
};

export const LoaderProvider = ({ children }) => {
  const [showLoader, setShowLoader] = useState(false);
  const [loaderText, setLoaderText] = useState("Loading...");

  const showLoaderWithText = (text = "Loading...", duration = 2000) => {
    setLoaderText(text);
    setShowLoader(true);

    if (duration > 0) {
      setTimeout(() => {
        setShowLoader(false);
      }, duration);
    }
  };

  const hideLoader = () => {
    setShowLoader(false);
  };

  return (
    <LoaderContext.Provider
      value={{
        showLoader,
        loaderText,
        showLoaderWithText,
        hideLoader,
      }}
    >
      {children}
    </LoaderContext.Provider>
  );
};
