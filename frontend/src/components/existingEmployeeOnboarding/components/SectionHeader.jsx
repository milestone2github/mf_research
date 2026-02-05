const SectionHeader = ({ title, edit, onEdit, onSave, onCancel, saving, icon, }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex gap-2">
      <i>{icon}</i>
      <h3 className="text-xl font-semibold text-gray-800 ">{title}</h3>
      </div>
      {!edit ? (
        <button
          onClick={onEdit}
          className="text-blue-600 font-semibold hover:underline"
        >
          Edit
        </button>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-1 border rounded-md text-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-1 bg-blue-600 text-white rounded-md disabled:opacity-60 flex items-center gap-2"
            >
            {saving ? (
                <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
                </>
            ) : (
                "Save"
            )}
            </button>
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
