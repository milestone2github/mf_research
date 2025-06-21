import React from "react";
import { useSelector } from "react-redux";

const Home = () => {
  const { insuranceDashboardID } = useSelector((state) => state.user.userData)
  return (
    <div>
      <iframe
        className="responsive-iframe"
        // src={`https://analytics.zoho.com/open-view/1679473000002415828`}
        src={`https://analytics.zoho.com/open-view/${insuranceDashboardID}`}
        title="Dashboard"
      ></iframe>
    </div>
  );
};

export default Home;
