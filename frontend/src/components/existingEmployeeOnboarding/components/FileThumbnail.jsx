import { useState } from "react";
import FilePreviewModal from "./FilePreviewModal";

const FileThumbnail = ({ file, label }) => {
  const [open, setOpen] = useState(false);

  const isUploaded =
    typeof file === "string" && file.trim().startsWith("http");

  if (!isUploaded) return null;

  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(file);
  const isPdf = /\.pdf$/i.test(file);

  return (
    <>
      <div
        onClick={() => {
          if (isPdf) {
            window.open(file, "_blank", "noopener,noreferrer");
          } else {
            setOpen(true);
          }
        }}
        className="
          w-32 h-32 border rounded-xl cursor-pointer
          flex items-center justify-center
          bg-gray-50 hover:bg-gray-100
          transition shadow-sm
        "
      >
        {isImage ? (
          <img
            src={file}
            alt={label}
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <div className="flex flex-col items-center text-gray-600">
            <span className="text-3xl">📄</span>
            <span className="text-xs mt-1 text-center px-2">
              {label}
            </span>
          </div>
        )}
      </div>

      {open && isImage && (
        <FilePreviewModal
          url={file}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default FileThumbnail;
