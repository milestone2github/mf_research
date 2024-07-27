import React, { useCallback, useEffect, useState } from "react";
import CustomDatalist from "../nfoComponents/CustomDatalist";
import CustomSelect from "../nfoComponents/CustomSelect";
import { BsCurrencyRupee } from "react-icons/bs";
import { FaCheck, FaClipboard } from "react-icons/fa";
import UccTable from "../nfoComponents/UccTable";
import debounce from "../../utils/debounce";
import { useDispatch, useSelector } from "react-redux";
import AccessDenied from "./AccessDenied";
import Toast from "../common/Toast";
import { updateToast } from "../../reducers/ToastSlice";
import KycStatusTable from '../nfoComponents/KycStatusTable';

const backendUrl = process.env.REACT_APP_API_BASE_URL;

function NfoForm() {
  const [name, setName] = useState("");
  const [overallKycStatus, setOverallKycStatus] = useState("KYC Rejected"); // Added state for overall KYC status
  const [pan, setPan] = useState("");
  const [familyHead, setFamilyHead] = useState("");
  const [folio, setFolio] = useState("");
  const [nfo, setNfo] = useState("");
  const [amc, setAmc] = useState("");
  const [ucc, setUcc] = useState({});
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nfoUrl, setNfoUrl] = useState(null);
  const [showCopied, setShowCopied] = useState(false);
  const [bseStatus, setBseStatus] = useState(1);

  const [clientList, setClientList] = useState([]);
  const [panList, setPanList] = useState([]);
  const [familyHeadList, setFamilyHeadList] = useState([]);
  const [uccList, setUccList] = useState([]);
  const [nfoList, setNfoList] = useState([]);
  const [amcList, setAmcList] = useState([]);
  const [folioList, setFolioList] = useState([]);

  const [foliosFromIwell, setFoliosFromIwell] = useState([]);
  const [schemesWithCode, setSchemesWithCode] = useState([]);
  const [minAmount, setMinAmount] = useState(1);

  const { userData } = useSelector((state) => state.user);
  const permissions = userData?.role?.permissions;
  const dispatch = useDispatch();
  const [searchAll, setSearchAll] = useState(false);
  const [schemeOption, setSchemeOption] = useState("Growth");
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    const fetchIsin = () => {
      if (!amc) return;

      fetch(`${backendUrl}/api/data/isin?amc=${amc}`, {
        method: "GET",
        credentials: "include",
      })
        .then((response) => {
          if (!response.ok) {
            console.log("Error fetching ISIN");
            return response.json().then((error) => {
              throw error;
            });
          }
          return response.json();
        })
        .then((jsonRes) => {
          let isinList = jsonRes.data.map((item) => item["ISIN"]);

          const isinFilteredFolios = foliosFromIwell
            .filter((folio) => isinList.includes(folio.isin))
            .map((item) => item.folioNo);

          fetchFoliosFromFolioMaster(
            isinFilteredFolios,
            ucc.Second_Holder_First_Name,
            ucc.Third_Holder_First_Name
          );
        })
        .catch((error) => {
          console.log("Internal server error while getting folios isin data", error);
        });
    };

    fetchIsin();
  }, [amc, foliosFromIwell, ucc]);

  async function fetchFoliosFromFolioMaster(iwellfolios, joint1, joint2) {
    try {
      if (!iwellfolios.length) {
        setFolioList([]);
        return;
      }

      const params = new URLSearchParams();
      iwellfolios.forEach((folio) => params.append("folio", folio));
      if (joint1) params.append("joint1", joint1);
      if (joint2) params.append("joint2", joint2);

      const response = await fetch(
        `${backendUrl}/api/data/folios/from-folios/?${params}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const jsonRes = await response.json();

      if (!response.ok) {
        console.log("Error fetching folios from folio master");
        return;
      }

      let folios = jsonRes.data.map((item) => item["_id"]);
      console.log(folios);
      setFolioList([...folios]);
    } catch (error) {
      console.log("Internal server error while getting folios from folio master:", error.message);
    }
  }

  const fetchUccData = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/data/ucc/?pan=${pan}`, {
        method: "GET",
        credentials: "include",
      });
      const jsonData = await response.json();

      if (!response.ok) {
        console.log("Error fetching UCC");
        return;
      }

      setUccList(jsonData.data);
    } catch (error) {
      console.log("Internal server error while getting UCC data");
    }
  };

  const fetchFolios = async () => {
    try {
      const response = await fetch(
        `${backendUrl}/api/data/iwell-folios/?pan=${pan}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const jsonRes = await response.json();
      console.log(jsonRes.data)
      if (!response.ok) {
        console.log("Error fetching folios");
        return;
      }
      
      setFoliosFromIwell(jsonRes.data);
    } catch (error) {
      console.log("Internal server error while getting folios:", error.message);
    }
  };

  useEffect(() => {
    if (pan?.length < 10) {
      setUccList([]);
      setFoliosFromIwell([]);
      setAmc("");
      setFolio("");
      setFolioList([])
      setUcc({});
      setAmount('')
      return;
    }
    fetchUccData();
    fetchFolios();
  }, [pan]);

  useEffect(() => {
    const fetchNfoAmc = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/data/nfo-amc`, {
          method: "GET",
          credentials: "include",
        });
        const jsonRes = await response.json();

        if (!response.ok) {
          console.log("Error fetching NFO AMC");
          return;
        }
        // let amcs = jsonRes.data.map((item) => item["_id"]);
        let amcs = jsonRes.data;
        setAmcList(amcs);
      } catch (error) {
        console.log("Internal server error while getting NFO AMCs");
      }
    };
    fetchNfoAmc();
  }, []);

  useEffect(() => {
    const fetchNfoData = async () => {
      if (!amc) {
        setNfoList([]);
        return;
      }
      try {
        const response = await fetch(
          `${backendUrl}/api/data/nfo-schemes?amc=${amc}&schemePlan=NORMAL&purchaseTrxMode=DP&purchaseTrxMode=P`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const jsonRes = await response.json();

        if (!response.ok) {
          console.log("Error fetching NFO");
          return;
        }
        setNfoList(jsonRes.data.map((item) => item["Scheme Name"]));

        let schemesWithCode = jsonRes.data.map((item) => ({
          name: item["Scheme Name"],
          code: item["Scheme Code"],
          minAmount: item["Minimum Purchase Amount"],
        }));
        setSchemesWithCode(schemesWithCode);
      } catch (error) {
        console.log("Internal server error while getting NFO data");
      }
    };
    fetchNfoData();
    setNfo("");
    console.log(folioList );
    console.log(overallKycStatus );
  }, [amc]);

  useEffect(() => {
    setHasReviewed(false);
  }, [pan, ucc, amc, nfo, schemeOption, folio, amount]);

  useEffect(() => {
    setAmc("");
    setNfo("");
    setFolio("");
  }, [ucc]);

  const debouncedGetNames = useCallback(
    debounce(async (name, searchAll) => {
      try {
        if (!name) {
          setClientList([]);
          return;
        }

        const response = await fetch(
          `${backendUrl}/api/data/investors/?name=${name}&searchall=${searchAll}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await response.json();
        if (!response.ok) {
          console.log("Error fetching names");
          return;
        }

        let names = data.map((client) => ({
          name: client.NAME,
          pan: client.PAN,
          familyHead: client["FAMILY HEAD"],
        }));
        setClientList(names);
      } catch (error) {
        console.log("Internal server error while getting names");
      }
    }, 400),
    []
  );

  const debouncedGetPan = useCallback(
    debounce(async (pan, searchAll) => {
      try {
        if (!pan) {
          setPanList([]);
          return;
        }

        const response = await fetch(
          `${backendUrl}/api/data/investors/?pan=${pan}&searchall=${searchAll}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await response.json();

        if (!response.ok) {
          console.log("Error fetching PAN numbers");
          return;
        }

        let list = data.map((client) => ({
          name: client.NAME,
          pan: client.PAN,
          familyHead: client["FAMILY HEAD"],
        }));
        setPanList(list);
      } catch (error) {
        console.log("Internal server error while getting PAN numbers");
      }
    }, 500),
    []
  );

  const debouncedGetFamilyHeads = useCallback(
    debounce(async (familyHead, searchAll) => {
      try {
        if (!familyHead) {
          setFamilyHeadList([]);
          return;
        }

        const response = await fetch(
          `${backendUrl}/api/data/investors/?fh=${familyHead}&searchall=${searchAll}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await response.json();

        if (!response.ok) {
          console.log("Error fetching family head");
          return;
        }

        let list = data.map((client) => ({
          name: client.NAME,
          pan: client.PAN,
          familyHead: client["FAMILY HEAD"],
        }));
        setFamilyHeadList(list);
      } catch (error) {
        console.log("Internal server error while getting family head");
      }
    }, 500),
    []
  );

  const handleNameSearch = (value) => {
    setName(value);
    setPan('')
    setFamilyHead('')
    debouncedGetNames(value, searchAll);
  };

  const handlePANSearch = (value) => {
    setPan(value);
    setName('')
    setFamilyHead('')
    debouncedGetPan(value, searchAll);
  };

  const handleFamilyHeadSearch = (value) => {
    setFamilyHead(value);
    setPan('')
    setName('')
    debouncedGetFamilyHeads(value, searchAll);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(nfoUrl).then(() => {
      setShowCopied(true);

      setTimeout(() => {
        setShowCopied(false);
      }, 1500);
    });
  };

  const handleClientUpdate = (option) => {
    setName(option.name);
    setPan(option.pan);
    setFamilyHead(option.familyHead);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!nfo) {
        dispatch(
          updateToast({ type: "error", message: "NFO Scheme is required" })
        );
        return;
      }

      const formData = {
        investorName: name,
        pan: pan,
        familyHead: familyHead,
        ucc: ucc._id,
        amc: amc,
        schemeCode: schemesWithCode.find((item) => item.name === nfo).code,
        schemeOption: schemeOption,
        schemeName: nfo,
        folio: folio,
        amount: amount,
      };
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/data/nfo`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json();

      if (data.error) {
        dispatch(updateToast({ type: "error", message: data.error }));
        return;
      }

      setNfoUrl(data.data.nfoUrl);
      dispatch(
        updateToast({ type: "success", message: "Submitted successfully" })
      );
    } catch (error) {
      console.log("Error occurred while submitting NFO form", error.message);
      dispatch(
        updateToast({ type: "error", message: "Internal server error" })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = () => {
    if (bseStatus===0 || !hasReviewed) return true;
    return false;
  };

  if (!permissions.find((perm) => perm === "NFO")) return <AccessDenied />;
  
  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-y-8 md:mx-0">
        {bseStatus===0 && (
          <fieldset className="sticky top-0 z-[9990] shadow-md rounded-md p-4 -mb-3 border border-red-200 bg-red-50 text-red-700">
            You have to process this manually as BSE status is inactive.
          </fieldset>
        )}
      <div className="mb-2">
        <h3 className="text-2xl w-fit font-semibold inline-block bg-clip-text text-transparent bg-gradient-to-r from-[#2D3748] to-[#1A202C]">
          New Fund Offer Form
        </h3>
        <span className="h-2 w-[6.7rem] block bg-indigo-500"></span>
      </div>
      <fieldset className="flex flex-wrap gap-x-8 gap-y-6 rounded-md p-6 sm:border border-blue-200">
        {userData?.email.includes("@niveshonline.com") && (
          <div className="w-full flex items-center">
            <input
              type="checkbox"
              id="searchAll"
              checked={searchAll}
              onChange={() => setSearchAll(!searchAll)}
              className="mr-2"
            />
            <label htmlFor="searchAll" className="text-gray-800 text-sm font-medium">
              Search All
            </label>
          </div>
        )}
        <CustomDatalist
          id="clientName"
          label="Name"
          selectedValue={name}
          updateKeywords={handleNameSearch}
          updateSelectedValue={handleClientUpdate}
          options={clientList}
          field={"name"}
        />
        <CustomDatalist
          id="clientPan"
          label="PAN"
          selectedValue={pan}
          updateKeywords={handlePANSearch}
          updateSelectedValue={handleClientUpdate}
          options={panList}
          field={"pan"}
        />
        <CustomDatalist
          id="clientFamilyHead"
          label="Family Head"
          selectedValue={familyHead}
          updateKeywords={handleFamilyHeadSearch}
          updateSelectedValue={handleClientUpdate}
          options={familyHeadList}
          field={"familyHead"}
        />
      </fieldset>

      <fieldset className=' rounded-md p-[22px] border border-slate-200 w-full min-w-[50vw] overflow-x-auto'>
        <UccTable data={uccList} selectedOption={ucc} updateSelected={(selectedUcc) => {
          setUcc(selectedUcc);
          var hasValidNominee = selectedUcc["Nomination_Flag"] === "Y";
          var isPanValid = selectedUcc["Primary_Holder_PAN_Aadhaar_Status"] === "VALID";
          var isAadhaarValid = selectedUcc["Aadhaar_Updated"] === "Y";
          var isBankValid = ["Bank1_Status", "Bank2_Status", "Bank3_Status", "Bank4_Status", "Bank5_Status"].some(status => selectedUcc[status] === "VALID");
          // var isKycValid = kycStatus==="KYC Resistered";
          setBseStatus(hasValidNominee && isPanValid && isBankValid ? 1 : 0)
        }} />
      </fieldset>
      <fieldset className="flex flex-wrap gap-8 rounded-md p-6 sm:border border-indigo-200">
        <KycStatusTable pan={pan} name={name} ucc={ucc} setOverallKycStatus={setOverallKycStatus} />
      </fieldset>
      <fieldset className="flex flex-wrap gap-8 rounded-md p-6 sm:border border-green-200">
        <div className="grow shrink basis-60 md:basis-80">
          <CustomSelect
            id="nfoAmc"
            label="NFO AMC"
            selectedOption={amc}
            onSelect={(value) => setAmc(value)}
            options={amcList}
          />
        </div>
        <div className="grow shrink basis-60 md:basis-80">
          <CustomSelect
            id="nfoSchemeName"
            label="NFO Scheme"
            selectedOption={nfo}
            onSelect={(value) => {
              setNfo(value);
              setMinAmount(
                schemesWithCode.find((item) => item.name === value).minAmount
              );
            }}
            options={nfoList}
          />
        </div>
        <div className="grow shrink basis-60 md:basis-80">
          <label
            htmlFor="schemeOption"
            className="text-gray-800 text-sm font-medium leading-none mb-1"
          >
            Scheme Option
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              className={`px-4 py-2 rounded-lg ${schemeOption === "Growth" ? "bg-indigo-500 text-white" : "bg-gray-200"
                }`}
              onClick={() => setSchemeOption("Growth")}
            >
              Growth
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-lg ${schemeOption === "IDCW" ? "bg-indigo-500 text-white" : "bg-gray-200"
                }`}
              onClick={() => setSchemeOption("IDCW")}
            >
              IDCW
            </button>
          </div>
        </div>

        <div className="flex flex-col text-left basis-60 md:basis-80 grow shrink">
          <label
            htmlFor="folios"
            className="text-gray-800 text-sm font-medium p-0 leading-none mb-1"
          >
            Folio Number
          </label>
          <select
            name="folio"
            id="folios"
            required={true}
            value={folio}
            onChange={(e) => setFolio(e.target.value)}
            className="block w-full mt-1 py-[10px] px-2 border-gray-300 rounded-md shadow-sm focus:outline-blue-500 outline-offset-0 outline outline-2 outline-gray-200"
            // disabled={kycStatus?.Status === "KYC Registered" && !folioList.length}
          >
            {/* {overallKycStatus !== "KYC Validated" && folioList.length===0 && ( */}
              <option value="">Select folio</option>
            {/* )} */}
            {overallKycStatus === "KYC Validated" && (
              <option value="Create new folio">Create new folio</option>
            )}
            {overallKycStatus === "KYC Registered" && folioList.length>0 && (
              <option value="Create new folio">Create new folio</option>
            )}
            {folioList.map((folioItem, index) => (
              <option key={index} value={folioItem}>
                {folioItem || "Select Folio"}
              </option>
            ))}
          </select>
        </div>

        <div className="grow shrink basis-60 md:basis-80 text-left flex flex-col max-w-full md:max-w-[calc(50%-16px)]">
          <label
            htmlFor="amount"
            className="text-gray-800 text-sm font-medium leading-none mb-1"
          >
            Amount
          </label>
          <div className="bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500 w-full">
            <span className="text-gray-600 text-sm absolute left-2 top-1/2 -translate-y-1/2">
              <BsCurrencyRupee />
            </span>
            <input
              className="px-3 py-2 text-gray-600 font-bold bg-transparent ps-7 outline-none focus:outline-none w-full"
              type="number"
              id="amount"
              name="amount"
              min={minAmount}
              required={true}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          {nfo && (
            <p
              className={`text-sm ${amount < minAmount ? "text-red-500" : "text-green-500"
                }`}
            >
              Minimum purchase amount is <strong>{minAmount}</strong>
            </p>
          )}
        </div>
      </fieldset>

      <fieldset className="flex flex-wrap gap-8 rounded-md p-6 sm:border border-blue-200">
        <label className="inline-flex relative items-center cursor-pointer space-x-2">
          <input
            type="checkbox"
            checked={hasReviewed}
            onChange={(e) => setHasReviewed(e.target.checked)}
            className={`w-6 h-6 text-indigo-500 ${hasReviewed ? 'bg-gray-100' : 'bg-gray-300'} border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-500 dark:ring-offset-gray-800 focus:ring-2 appearance-none`}
            id="custom-checkbox"
          />
          {hasReviewed && (
            <span className="absolute top-1/2 -left-[6px] -translate-y-1/2 text-indigo-500">
              <FaCheck className="w-5 h-5" />
            </span>
          )}
          <span className="text-gray-900">I have reviewed all the fields</span>
        </label>
      </fieldset>

      {nfoUrl && (
        <fieldset className="relative flex items-center gap-x-4 rounded-md p-6 sm:border bg-gray-800 text-gray-200">
          <p className="text-left text-blue-300 w-full">{nfoUrl}</p>
          <button
            title="copy"
            type="button"
            onClick={handleCopy}
            className=" text-xl px-4 py-4 rounded-md border border-gray-700"
            >
            <FaClipboard />
          </button>
          {showCopied && (
            <span className="absolute top-1/2 -translate-y-1/2 right-20 text-sm px-4 py-1 shadow-md shadow-gray-900 rounded-md text-green-700 border border-green-700">
              copied
            </span>
          )}
        </fieldset>
      )}
    
      <input
        type="submit"
        value={isSubmitting ? "Submitting..." : "Submit"}
        className="px-8 py-2 rounded-lg bg-indigo-500 cursor-pointer text-slate-50 w-full max-w-80 mx-auto disabled:bg-indigo-400 disabled:cursor-default"
        disabled={isSubmitDisabled()}
        />
      <Toast />
    </form>
  );
}

export default NfoForm;
