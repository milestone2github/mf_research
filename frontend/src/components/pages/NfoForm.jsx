import React, { useCallback, useEffect, useState } from "react";
import CustomDatalist from "../nfoComponents/CustomDatalist";
import CustomSelect from "../nfoComponents/CustomSelect";
import { BsCurrencyRupee } from "react-icons/bs";
import { FaClipboard } from "react-icons/fa";
import UccTable from "../nfoComponents/UccTable";
import debounce from "../../utils/debounce";
import { useDispatch, useSelector } from "react-redux";
import AccessDenied from "./AccessDenied";
import Toast from "../common/Toast";
import { updateToast } from "../../reducers/ToastSlice";
import KycStatusTable from '../nfoComponents/KycStatusTable';
const backendUrl = process.env.REACT_APP_API_BASE_URL;

const kycStatusStyles = {
  registered: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  validated: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
};

function NfoForm() {
  const [name, setName] = useState("");
  const [kycStatus, setKycStatus] = useState(null);
  const [pan, setPan] = useState("");
  const [familyHead, setFamilyHead] = useState("");
  const [folio, setFolio] = useState("");
  const [nfo, setNfo] = useState("");
  const [amc, setAmc] = useState("");
  const [ucc, setUcc] = useState({});
  const [amount, setAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nfoUrl, setNfoUrl] = useState(null);
  const [showCopied, setShowCopied] = useState(false);

  const [clientList, setClientList] = useState([]);
  const [panList, setPanList] = useState([]);
  const [familyHeadList, setFamilyHeadList] = useState([]);
  const [uccList, setUccList] = useState([]);
  const [nfoList, setNfoList] = useState([]);
  const [amcList, setAmcList] = useState([]);
  const [folioList, setFolioList] = useState([""]);

  const [foliosFromIwell, setFoliosFromIwell] = useState([{}]);
  const [schemesWithCode, setSchemesWithCode] = useState([{}]);
  const [minAmount, setMinAmount] = useState(1);

  const { userData } = useSelector((state) => state.user);
  const permissions = userData?.role?.permissions;
  const dispatch = useDispatch();

  async function fetchFoliosFromFolioMaster(iwellfolios, joint1, joint2) {
    try {
      if (!iwellfolios.length) {
        setFolioList([""]);
        return;
      }

      // Initialize URLSearchParams
      const params = new URLSearchParams();

      // Add multiple values for 'folios'
      iwellfolios.forEach((folio) => params.append("folio", folio));
      if (joint1) {
        params.append("joint1", joint1);
      }
      if (joint2) {
        params.append("joint2", joint2);
      }
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
      setFolioList(["", ...folios]);
    } catch (error) {
      console.log(
        "Internal server error while getting folios from folio master: ",
        error.message
      );
    }
  }

  // side effect to fetch isin list
  useEffect(() => {
    const fetchIsin = () => {
      if (!amc) {
        return;
      }

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
          console.log(jsonRes);
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
          console.log(
            "Internal server error while getting folios isin data",
            error
          );
        });
    };
    fetchIsin();
  }, [amc]);

  // function to get UCC data
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

  // function to get folios from investwell
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

      if (!response.ok) {
        console.log("Error fetching folios");
        return;
      }

      setFoliosFromIwell(jsonRes.data);
    } catch (error) {
      console.log(
        "Internal server error while getting folios: ",
        error.message
      );
    }
  };
  const fetchKycStatus = async (pan) => {
    try {
      const response = await fetch(`${backendUrl}/api/data/KYCStatusCheck`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Pan: pan,
          detailCheck: "N",
          detailedOutput: "N",
        }),
      });
      const jsonData = await response.json();

      if (!response.ok) {
        console.log("Error fetching KYC status");
        return;
      }

      return jsonData;
    } catch (error) {
      console.log("Internal server error while getting KYC status");
    }
  };
  // side effect to get UCC data and folios from investwell and other states on PAN update
  useEffect(() => {
    if (pan?.length < 10) {
      setUccList([]);
      setFoliosFromIwell([]);
      setKycStatus(null); // Reset KYC status if PAN is not valid
      return;
    }
    fetchUccData();
    fetchFolios();
    fetchKycStatus(pan).then((status) => setKycStatus(status)); // Fetch and set KYC status
    setAmc("");
    setFolio("");
    setUcc("");
  }, [pan]);

  // side effect to get NFO AMC
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
        let amcs = jsonRes.data.map((item) => item["_id"]);
        setAmcList(amcs);
      } catch (error) {
        console.log("Internal server error while getting NFO AMCs");
      }
    };
    fetchNfoAmc();
  }, []);

  // side effect to get NFO Schemes
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
    setNfo(""); // reset selected scheme
  }, [amc]);

  useEffect(() => {
    setAmc("");
    setFolio("");
  }, [ucc]);

  // debounced function to get client names
  const debouncedGetNames = useCallback(
    debounce(async (name) => {
      try {
        if (!name) {
          setClientList([]);
          return;
        }

        const response = await fetch(
          `${backendUrl}/api/data/investors/?name=${name}&searchall=true`,
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

  // debounced function to get client PAN
  const debouncedGetPan = useCallback(
    debounce(async (pan) => {
      try {
        if (!pan) {
          setPanList([]);
          return;
        }

        const response = await fetch(
          `${backendUrl}/api/data/investors/?pan=${pan}&searchall=true`,
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

  // debounced function to get client family heads
  const debouncedGetFamilyHeads = useCallback(
    debounce(async (familyHead) => {
      try {
        if (!familyHead) {
          setFamilyHeadList([]);
          return;
        }

        const response = await fetch(
          `${backendUrl}/api/data/investors/?fh=${familyHead}&searchall=true`,
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
    debouncedGetNames(value);
  };

  const handlePANSearch = (value) => {
    setPan(value);
    debouncedGetPan(value);
  };

  const handleFamilyHeadSearch = (value) => {
    setFamilyHead(value);
    debouncedGetFamilyHeads(value);
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
        schemeName: nfo,
        folio: folio,
        amount: amount,
      };
      const response = await fetch("http://localhost:5000/api/data/nfo", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.error) {
        dispatch(updateToast({ type: "error", message: data.error }));
        return;
      }

      setNfoUrl(data.data.nfoUrl);
      dispatch(
        updateToast({ type: "success", message: "Submitted successfully" })
      );
      console.log("submitted");
    } catch (error) {
      console.log("Error occurred while submitting NFO form", error.message);
      dispatch(
        updateToast({ type: "error", message: "Internal server error" })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!permissions.find((perm) => perm === "NFO")) return <AccessDenied />;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-y-8 md:mx-0">
      <div className="mb-2">
        <h3 className="text-2xl w-fit font-semibold inline-block bg-clip-text text-transparent bg-gradient-to-r from-[#2D3748] to-[#1A202C]">
          New Fund Offer Form
        </h3>
        <span className="h-2 w-[6.7rem] block bg-indigo-500"></span>
      </div>
      <fieldset className="flex flex-wrap gap-x-8 gap-y-6 b-blue-100 rounded-md p-6 sm:border border-blue-200">
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

      <div className="flex gap-8">
  <div className="w-6/7">
    <UccTable data={uccList} selectedOption={ucc} updateSelected={setUcc} />
  </div>
  <div className="w-1/7">
    {kycStatus && <KycStatusTable kycStatus={kycStatus} />}
  </div>
</div>

      <fieldset className="flex flex-wrap gap-8 b-purple-50 rounded-md p-6 sm:border border-green-200">
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
            value={folio}
            onChange={(e) => setFolio(e.target.value)}
            className="block w-full mt-1 py-[10px] px-2 border-gray-300 rounded-md shadow-sm focus:outline-blue-500 outline-offset-0 outline outline-2 outline-gray-200"
          >
            {folioList.map((folio, index) => (
              <option key={index} value={folio}>
                {folio || "Select Folio"}
              </option>
            ))}
          </select>
        </div>

        <div className="grow shrink basis-60 md:basis-80 text-left flex flex-col">
          <label
            htmlFor="amount"
            className="text-gray-800 text-sm font-medium leading-none mb-1"
          >
            Amount
          </label>
          <div className="bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <span className="text-gray-600 text-sm absolute left-2 top-1/2 -translate-y-1/2">
              <BsCurrencyRupee />
            </span>
            <input
              className="px-3 py-2 text-gray-600 font-bold w-full bg-transparent ps-7 outline-none focus:outline-none"
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
              className={`text-sm ${
                amount < minAmount ? "text-red-500" : "text-green-500"
              }`}
            >
              Minimum purchase amount is <strong>{minAmount}</strong>
            </p>
          )}
        </div>
      </fieldset>

      {nfoUrl && (
        <fieldset className="relative flex items-center gap-x-4 b-purple-50 rounded-md p-6 sm:border bg-gray-800 text-gray-200">
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
        disabled={isSubmitting}
        value={isSubmitting ? "Submitting..." : "Submit"}
        className="px-8 py-2 rounded-lg bg-indigo-500 cursor-pointer text-slate-50 w-full max-w-80 mx-auto"
      />
      <Toast />
    </form>
  );
}

export default NfoForm;


  {/* {kycStatus && (
    <fieldset className="bg-gray-50 rounded-md p-6 border-indigo-200 w-auto min-w-[50vw]">
      <h3 className="text-xl font-semibold">KYC Status</h3>
      <p>
        <strong>PAN:</strong> {kycStatus.PAN}
      </p>
      <p>
        <strong>KRA:</strong> {kycStatus.KRA}
      </p>
      <p>
        <strong>Status:</strong> {kycStatus.Status}
      </p>
      <p>
        <strong>KYC Code:</strong> {kycStatus.kyc_code}
      </p>
    </fieldset>
  )} */}