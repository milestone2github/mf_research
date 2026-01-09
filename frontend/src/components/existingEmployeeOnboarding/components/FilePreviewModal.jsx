const FilePreviewModal = ({ url, onClose }) => {
  if (!url) return null;

  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full h-[80vh] p-4">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
        >
          ✕
        </button>

        {/* Content */}
        <div className="h-full w-full flex items-center justify-center overflow-hidden rounded-lg">
          {isImage ? (
            <img
              src={url}
              alt="Preview"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <iframe
              src={url}
              title="Document Preview"
              className="w-full h-full border rounded"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
