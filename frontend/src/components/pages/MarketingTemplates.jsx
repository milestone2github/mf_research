import React, { useEffect, useState } from 'react';
import Select from "react-select";
import { useDispatch, useSelector } from 'react-redux';
import { BsArrowDownCircle, BsPencilSquare } from "react-icons/bs";
import { CgSpinner } from "react-icons/cg";
import { BiLoaderAlt } from "react-icons/bi";
import { IoMdClose } from 'react-icons/io';
import { updateToast } from '../../reducers/ToastSlice';
import Toast from '../common/Toast';
import { createUser, getUser, updateUser } from '../../Actions/MarketingUserAction';
import axios from 'axios';
import footerImgSrc from '../../assets/FooterMarketingTemplate.png';

const DISCLAIMER_TEXT_BY_TYPE = {
  MUTUAL_FUND:
    "Mutual Fund investments are subject to market risks, read all scheme related documents carefully.",
  INSURANCE:
    "Insurance is a subject matter of solicitation. The information provided here cannot substitute for the advice of a licensed professional.",
  STOCK_MARKET:
    "Investments in the securities market are subject to market risks, read all the related documents carefully before investing.",
};

const getDisclaimerText = (tpl) => {
  const type = tpl?.disclaimerType || tpl?.disclaimer; // your DB currently stores in `disclaimer`
  return DISCLAIMER_TEXT_BY_TYPE[type] || DISCLAIMER_TEXT_BY_TYPE.MUTUAL_FUND;
};

// Image Loader Utility
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

//  Skeleton Card Component
const TemplateSkeleton = () => (
  <div className="relative w-[316px] sm:w-[395px] overflow-hidden shadow rounded">
    {/* Main image placeholder */}
    <div className="w-full bg-gray-200 animate-pulse" style={{ height: '260px' }} />

    {/* Footer placeholder */}
    <div className="w-full bg-gray-300 animate-pulse" style={{ height: '72px' }} />
  </div>
);


/* ---------------------------
   Main Component
--------------------------- */
function MarketingTemplates() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasCreatedMarketingUser, setHasCreatedMarketingUser] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState({});

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { userData } = useSelector((state) => state.user);
  const { user, status, error, fetchStatus } = useSelector((state) => state.marketingUser);

  const dispatch = useDispatch();

  // Reusable Image Generator: Returns a Blob
  async function generateImageBlob(tpl, user) {
    try {
      // 1) Load main template image
      const mainImg = await loadImage(tpl.proxyImageUrl);

      // 2) Load footer background image
      const footerImg = await loadImage(footerImgSrc);

      // 3) Sizes & Upscaling Logic
      const MIN_WIDTH = 2000;
      const naturalWidth = mainImg.naturalWidth;
      const scale = Math.max(1, MIN_WIDTH / naturalWidth);

      const canvasWidth = Math.round(naturalWidth * scale);

      const disclaimerHeight = Math.max(Math.round(30 * scale), Math.round(canvasWidth * 0.030));

      const footerHeight = Math.round(
        (footerImg.naturalHeight / footerImg.naturalWidth) * canvasWidth
      );

      // 4) Canvas Setup
      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      const gapAboveDisclaimer = Math.round(canvasWidth * 0.005);
      const mainImgHeight = Math.round(mainImg.naturalHeight * scale);

      canvas.height = mainImgHeight + gapAboveDisclaimer + disclaimerHeight + footerHeight;

      const ctx = canvas.getContext("2d");

      // Fill white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 5) MAIN IMAGE
      ctx.drawImage(mainImg, 0, 0, canvasWidth, mainImgHeight);

      // 6) DISCLAIMER STRIP
      const disclaimerY = mainImgHeight + gapAboveDisclaimer;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, disclaimerY, canvasWidth, disclaimerHeight);

      const disclaimerText = `Disclaimer: ${getDisclaimerText(tpl)}`;

      ctx.fillStyle = "#111827";
      ctx.font = `${Math.max(Math.round(9.5 * scale), Math.round(canvasWidth * 0.013))}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(disclaimerText, canvasWidth / 2, disclaimerY + disclaimerHeight / 2);

      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      // 7) FOOTER IMAGE
      const footerY = disclaimerY + disclaimerHeight;
      ctx.drawImage(footerImg, 0, footerY, canvasWidth, footerHeight);

      // 8) FOOTER TEXT
      const fontSize = Math.max(Math.round(14 * scale), Math.round(canvasWidth * 0.018));
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = "#111827";

      const textX = canvasWidth * 0.65;
      const nameY = footerY + footerHeight * 0.06;
      const phoneY = footerY + footerHeight * 0.36;

      ctx.fillText(user?.name || "", textX, nameY);
      ctx.fillText(`+91 ${user?.phone || ""}`, textX, phoneY);

      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 1.0);
      });
    } catch (err) {
      console.error("Error generating image blob:", err);
      return null;
    }
  }

  // Handle Download
  const handleDownload = async (tpl) => {
    setIsDownloading(true);
    try {
      const blob = await generateImageBlob(tpl, user);
      if (!blob) return;

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${tpl.title || tpl?._doc?.title || "template"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } finally {
      setIsDownloading(false);
    }
  };

  // Preview State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Handle Preview
  const handlePreview = async (tpl) => {
    setPreviewModalOpen(true);
    setPreviewLoading(true);
    setPreviewBlobUrl(null);
    setIsZoomed(false); // Reset zoom

    const blob = await generateImageBlob(tpl, user);
    if (blob) {
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
    }
    setPreviewLoading(false);
  };

  const closePreview = () => {
    setPreviewModalOpen(false);
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
    setIsZoomed(false);
  };

  const toggleZoom = (e) => {
    e.stopPropagation();
    if (!previewLoading) {
      setIsZoomed(!isZoomed);
    }
  };

  const handleEditMarkting = () => setIsModalOpen(true);
  const handleCancelEdit = () => setIsModalOpen(false);

  //  Fetch User
  useEffect(() => {
    dispatch(getUser());

    // Fetch Categories
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/marketing-template/getList`);
        if (res.data.success) {
          setCategoryOptions(res.data.category.map(c => ({
            label: c.label,
            value: c.key
          })));
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, [dispatch]);


  //  Fetch Templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setTemplatesLoading(true);

        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/marketing-template/`
        );

        if (res.data.success) {
          setTemplates(res.data.data);
        } else {
          console.error('Failed:', res.data.message);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setTemplatesLoading(false);
      }
    };

    fetchTemplates();
  }, []);


  const phone =
    user?.phone ||
    userData?.phone ||
    user?.user?.onboarding?.hrFilledInfo?.phone ||
    "";

  useEffect(() => {
    if (fetchStatus === 404 && !hasCreatedMarketingUser) {
      dispatch(createUser({
        name: userData?.name,
        email: userData?.email,
        phone,
      }));
      setHasCreatedMarketingUser(true);
    }

    if (fetchStatus !== 404 && error) {
      dispatch(updateToast({ type: "error", message: error }));
    }
  }, [
    dispatch,
    fetchStatus,
    error,
    hasCreatedMarketingUser,
    userData?.name,
    userData?.email,
    phone,
  ]);


  //  Loading UI for fetching user
  if (status === 'pending') {
    return (
      <div className="h-[80vh] flex justify-center items-center">
        <div className="loader"></div>
      </div>
    );
  }


  // Group Templates by Category Label
  const groupedTemplates = templates.reduce((acc, tpl) => {
    const label = tpl.category?.label || "Marketing";
    if (!acc[label]) acc[label] = [];
    acc[label].push(tpl);
    return acc;
  }, {});

  // Sort Sections: Selected Category First
  const sortedSections = Object.entries(groupedTemplates).sort(([labelA], [labelB]) => {
    if (selectedCategory) {
      if (labelA === selectedCategory.label) return -1;
      if (labelB === selectedCategory.label) return 1;
    }
    // Default alphabetical or keep order? keys order is not guaranteed but usually insertion order.
    // Let's just keep them as is for others.
    return 0;
  });

  return (
    <main className="relative overflow-x-hidden">

      <div className="mb-2 flex bg-gray-100 px-2 py-2 rounded-lg items-center justify-between flex-wrap gap-3">
        <h3 className="text-3xl font-bold">Marketing Templates</h3>

        <div className="w-56">
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categoryOptions}
            placeholder="Sort by Category"
            isClearable
            className="text-sm z-50"
            classNamePrefix="react-select"
          />
        </div>

        <div className="fixed z-[999] bottom-6 right-6 p-3 rounded-lg bg-white shadow-slate-200">
          <button
            title="Edit branding"
            onClick={handleEditMarkting}
            className="border text-sm flex items-center rounded-md py-3 px-3 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <BsPencilSquare />
          </button>
        </div>
      </div>

      {/* SECTIONS */}
      {templatesLoading ? (
        <section className="w-full px-2 sm:px-4 mt-4">
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 sm:gap-8 [column-fill:_balance]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="mb-6 sm:mb-8 break-inside-avoid">
                <TemplateSkeleton />
              </div>
            ))}
          </div>
        </section>
      ) : Object.keys(groupedTemplates).length === 0 ? (
        <div className="flex flex-col items-center py-10 mt-8 text-center w-full">
          <h2 className="text-gray-700 font-medium text-lg">Nothing here yet.</h2>
          <p className="text-gray-500 text-sm mt-1">
            Templates will appear once they’re published.
          </p>
        </div>
      ) : (
        sortedSections.map(([categoryLabel, categoryTemplates]) => (
          <section key={categoryLabel} className="w-full px-2 sm:px-4 mt-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">
              {categoryLabel}
            </h2>
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 sm:gap-8 [column-fill:_balance]">
              {categoryTemplates.map((tpl) => {
                const id = tpl._id || tpl?._doc?._id;
                const loaded = imageLoaded[id];

                return (
                  <div
                    key={id}
                    className="mb-6 sm:mb-8 break-inside-avoid"
                  >
                    <div className="relative group w-full overflow-hidden shadow rounded">
                      {/* CARD-LEVEL SKELETON */}
                      {!loaded && (
                        <div className="absolute inset-0 z-0">
                          <div className="w-full bg-gray-200 animate-pulse" style={{ height: '260px' }} />
                          <div className="w-full bg-gray-300 animate-pulse" style={{ height: '72px' }} />
                        </div>
                      )}

                      {/* REAL CARD */}
                      <figure
                        className={`relative z-10 transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"
                          }`}
                      >
                        <img
                          src={tpl.proxyImageUrl}
                          alt={tpl.title || tpl?._doc?.title || "template"}
                          className="w-full h-auto block"
                          onLoad={() => setImageLoaded((prev) => ({ ...prev, [id]: true }))}
                          onError={() => setImageLoaded((prev) => ({ ...prev, [id]: true }))}
                        />

                        <div
                          className="absolute inset-0 flex items-end justify-center transition-all group-hover:bg-gradient-to-bl from-black/20 to-transparent bg-transparent duration-300 ease-out group-hover:bg-black/10 cursor-pointer"
                          onClick={() => handlePreview(tpl)}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(tpl);
                            }}
                            className="group hidden group-hover:flex justify-center absolute top-2 right-2 items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 text-white font-medium backdrop-blur-sm border border-white transition-all hover:bg-white/30 hover:shadow-xl cursor-pointer min-w-36"
                          >
                            {!isDownloading ? (
                              <>
                                <BsArrowDownCircle className="text-xl transition-transform duration-200" />
                                <span className="text-base tracking-wide">Download</span>
                              </>
                            ) : (
                              <span className="text-xl tracking-wide animate-spin">
                                <CgSpinner />
                              </span>
                            )}
                          </button>
                        </div>
                      </figure>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}


      {/* // PREVIEW MODAL
      {/* MODAL PORTAL would be ideal, but inline works if z-index is high enough */}
      {previewModalOpen && (
        <div
          className="fixed inset-0 z-[1001] bg-black/95 text-white overflow-y-auto"
          onClick={closePreview}
        >
          {/* Header Bar */}
          <div className="fixed top-0 left-0 right-0 z-[1002] flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
            {/* Left: Close */}
            <button
              onClick={closePreview}
              className="pointer-events-auto text-white/80 hover:text-white transition p-2"
              title="Close"
            >
              <IoMdClose size={28} />
            </button>

            {/* Right: Download Action */}
            {previewBlobUrl && (
              <a
                href={previewBlobUrl}
                download="template.jpg"
                onClick={(e) => e.stopPropagation()}
                className="pointer-events-auto bg-white text-black px-4 py-1.5 rounded shadow hover:bg-gray-200 transition text-sm font-medium"
              >
                Download
              </a>
            )}
          </div>

          {/* Image Container */}
          <div
            className={`min-h-screen w-full flex items-center justify-center p-4 transition-all duration-300 ${isZoomed ? "custom-cursor-zoom-out" : "custom-cursor-zoom-in"}`}
          // If we are zoomed, we might need click to zoom out, but the container click closes modal? 
          // Better behavior: 
          // - Click on IMAGE toggles zoom. 
          // - Click on BACKGROUND closes modal.
          >
            {previewLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="loader border-t-white border-4 w-10 h-10"></div>
                <span className="text-gray-300 font-medium tracking-wide">Generating Preview...</span>
              </div>
            ) : (
              previewBlobUrl && (
                <img
                  src={previewBlobUrl}
                  alt="Preview"
                  onClick={toggleZoom}
                  className={`transition-all duration-300 shadow-2xl ${isZoomed
                    ? "w-full max-w-none cursor-zoom-out"
                    : "max-h-[90vh] max-w-full object-contain cursor-zoom-in"
                    }`}
                  style={{
                    // if zoomed, ensure it doesn't get constrained by flex center in a weird way 
                    // actually simple max-w logic works well for flex items
                  }}
                />
              )
            )}
          </div>
        </div>
      )}

      {/* SIDEBAR FORM + TOAST */}
      <UserForm isModalOpen={isModalOpen} handleClose={handleCancelEdit} />
      <Toast />
    </main>
  );
}

export default MarketingTemplates

const UserForm = ({ isModalOpen, handleClose }) => {
  const { user, updateStatus } = useSelector(state => state.marketingUser);
  const { userData } = useSelector((state) => state.user);

  const [marketingUser, setMarketingUser] = useState({
    _id: user?._id,
    name: user?.name || userData?.name || '',
    email: user?.email || userData?.email || '',
    phone: user?.user?.onboarding?.hrFilledInfo?.phone || user?.phone || ''
  });

  const dispatch = useDispatch();

  useEffect(() => {
    setMarketingUser({
      _id: user?._id,
      name: user?.name || userData?.name || "",
      email: user?.email || userData?.email || "",
      phone: user?.phone || userData?.phone || user?.user?.onboarding?.hrFilledInfo?.phone || "",
    });
  }, [user, userData]);

  useEffect(() => {
    if (updateStatus === "completed") handleClose();
  }, [updateStatus, handleClose]);

  const handleBrandingChange = (e) => {
    const { name, value } = e.target;
    setMarketingUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    dispatch(updateUser(marketingUser));
  };

  const handleCancel = () => {
    setMarketingUser({
      _id: user?._id,
      name: user?.name || userData?.name || "",
      email: user?.email || userData?.email || "",
      phone: user?.user?.onboarding?.hrFilledInfo?.phone || user?.phone || marketingUser.phone || "",
    });
    handleClose();
  };

  return (
    <section
      className={`fixed z-[1000] top-0 bottom-0 bg-slate-100 p-3 md:p-6 ${isModalOpen ? "right-0" : "-right-full"
        } w-full h-screen md:w-[460px] transition-all border`}
    >
      <button
        onClick={handleCancel}
        className="absolute right-full rounded-md bg-gray-200 top-0 p-2 text-gray-700 text-xl hover:text-gray-900 z-10"
      >
        <IoMdClose />
      </button>

      <form onSubmit={handleUpdate} className="flex flex-col gap-y-6 h-full justify-center">
        <p className="text-gray-800 text-2xl font-bold">Edit branding details</p>

        <div className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-px">
            <label htmlFor="name" className="text-sm text-gray-600">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              autoComplete="off"
              className="rounded-md p-2 w-full border border-gray-500 focus:outline-2 focus:outline-blue-500"
              value={marketingUser.name}
              onChange={handleBrandingChange}
            />
          </div>

          {/* keep email in form if you want to store it, but it is NOT shown in footer now */}
          <div className="flex flex-col gap-y-px">
            <label htmlFor="email" className="text-sm text-gray-600">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              autoComplete='off'
              className='rounded-md p-2 w-full border border-gray-500 focus:outline-2 focus:outline-blue-500'
              value={marketingUser?.email}
              onChange={handleBrandingChange}
            />
          </div>
          <div className="flex flex-col gap-y-px">
            <label htmlFor="phone" className='text-sm text-gray-600'>Phone</label>
            <input
              type="tel"
              name="phone"
              id="phone"
              required
              autoComplete='off'
              className='rounded-md p-2 w-full border border-gray-500 focus:outline-2 focus:outline-blue-500'
              placeholder='Enter your Phone Number'
              value={marketingUser.phone}
              onChange={handleBrandingChange}
            />
          </div>
        </div>
        <div className='flex gap-x-3 mt-2 justify-end'>
          <button onClick={handleCancel} type='button' className='border rounded-lg py-2 px-6 text-gray-800 hover:bg-gray-200'>Cancel</button>
          <button type='submit' disabled={updateStatus === 'pending'} className='border w-28 flex items-center justify-center rounded-lg py-2 px-6 bg-blue-500 enabled:hover:bg-blue-600 disabled:bg-blue-400 text-white'>
            {updateStatus === 'pending' ? <BiLoaderAlt className='animate-spin text-xl' /> : 'Update'}
          </button>
        </div>
      </form>
    </section>
  );
};