import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Header from "../common/PortfolioResearchHeader";
import debounce from "lodash.debounce";
import Select from "react-select";

const ExistingPortfolio = () => {
  const [selectedOptionType, setSelectedOptionType] = useState("client");
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [portfolioData, setPortfolioData] = useState([]);
  const [authToken, setAuthToken] = useState("");
  const history = useNavigate(); // Use the useNavigate hook

  const fetchSearchResults = async () => {
    const searchApiUrl = `https://mniveshcalc.azurewebsites.net/api/searchfilter?type=${selectedOptionType}&query=${searchInput}`;
    try {
      const response = await fetch(searchApiUrl);
      const data = await response.json();
      const formattedResults = data.map((item) => ({
        label:
          selectedOptionType === "client" ? item.NAME : item["FAMILY HEAD"],
        value: item._id.$oid,
        pan: item.PAN,
      }));
      setSearchResults(formattedResults);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
    }
  };

  const debouncedFetchSearchResults = debounce(fetchSearchResults, 300);

  useEffect(() => {
    if (searchInput.length >= 3) {
      debouncedFetchSearchResults();
    } else {
      setSearchResults([]);
    }
    fetchAuthToken(); // Fetch auth token when the component mounts or when needed
  }, [searchInput, selectedOptionType]);

  const fetchAuthToken = async () => {
    const authUrl =
      "https://mnivesh.investwell.app/api/aggregator/auth/getAuthorizationToken";
    try {
      const response = await fetch(authUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authName: "mniveshAPI",
          password: "sfchdntgiu",
        }),
      });
      const data = await response.json();
      if (data.result && data.result.token) {
        setAuthToken(data.result.token);
        console.log(authToken);
      } else {
        console.error("Failed to fetch auth token:", data.message);
      }
    } catch (error) {
      console.error("Error fetching auth token:", error);
    }
  };

  const fetchPortfolioReturns = async (pan) => {
    const endDate = new Date().toISOString().split("T")[0]; // Format today's date as YYYY-MM-DD
    const portfolioUrl = `https://mnivesh.investwell.app/api/aggregator/reports/getPortfolioReturns?filters=[{"endDate":"${endDate}"},{"pan":"${pan}"}]&group=schid&token=${authToken}`;

    try {
      const response = await fetch(portfolioUrl);
      const data = await response.json();
      if (data.result && data.result.data) {
        const schemes = data.result.data.map((scheme) => ({
          schemeName: scheme.schemeName,
          isinNo: scheme.isinNo,
          currentValue: scheme.currentValue,
        }));

        const totalCurrentValue = schemes.reduce(
          (acc, scheme) => acc + scheme.currentValue,
          0
        );

        const schemesWithWeightage = schemes.map((scheme) => ({
          ...scheme,
          weightage: (scheme.currentValue / totalCurrentValue) * 100, // Calculate weightage as a percentage
        }));
        setPortfolioData(schemesWithWeightage);
      }
    } catch (error) {
      console.error("Error fetching portfolio returns:", error);
    }
  };

  // Use useEffect to log portfolioData when it updates
  useEffect(() => {
    if (portfolioData) {
      console.log(portfolioData);
    }
  }, [portfolioData]);

  const handleSelectChange = (selectedOption) => {
    setSelectedValue(selectedOption);
    setSearchInput("");

    if (selectedOption && selectedOption.pan && authToken) {
      fetchPortfolioReturns(selectedOption.pan);
    } else {
      console.error("No PAN found or authToken is missing");
    }
  };

  // Function to navigate to PortfolioReports with the portfolioData
  const navigateToReports = () => {
    if (portfolioData.length > 0) {
      history.push("/PortfolioReports", { portfolioData });
    }
  };

  // Call navigateToReports() when you want to navigate, for example after fetchPortfolioReturns()

  return (
    <div>
      <Header title="Portfolio Analysis - Existing Client" />
      <div className="container">
        <div className="centered-container">
          <div className="radio-buttons">
            <label>
              <input
                type="radio"
                value="client"
                checked={selectedOptionType === "client"}
                onChange={() => setSelectedOptionType("client")}
              />
              Client Name
            </label>
            <label>
              <input
                type="radio"
                value="familyHead"
                checked={selectedOptionType === "familyHead"}
                onChange={() => setSelectedOptionType("familyHead")}
              />
              Family Head
            </label>
          </div>
          <Select
            value={selectedValue}
            onChange={handleSelectChange}
            options={searchResults}
            onInputChange={setSearchInput}
            inputValue={searchInput}
            placeholder="Search..."
            isSearchable={true}
          />
        </div>
        <div className="pdf-div">
          <div className="generate-pdf-icon">
            <i className="fas fa-file-pdf"></i>
          </div>
        </div>
        <div className="report-container"></div>
      </div>
    </div>
  );
};

export default ExistingPortfolio;
