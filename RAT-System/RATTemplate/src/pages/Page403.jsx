//Page404
import React from "react";
import ResultComponent from "../components/Global/ResultComponent";

const Page404 = () => (
  <ResultComponent
    status={"403"}
    title={"403"}
    subTitle={"Sorry, you are not authorized to access this page."}
  />
);

export default Page404;
