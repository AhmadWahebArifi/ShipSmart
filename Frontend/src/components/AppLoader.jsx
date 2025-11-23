import React from "react";
import { useLoader } from "../context/LoaderContext";
import Loader from "./Loader";

const AppLoader = () => {
  const { showLoader, loaderText } = useLoader();

  if (!showLoader) return null;

  return <Loader showText={true} customText={loaderText} size="medium" />;
};

export default AppLoader;
