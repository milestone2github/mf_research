import SectionHeader from "../components/SectionHeader";
import FileThumbnail from "../components/FileThumbnail";


const EducationDetailsSection = ({
  data,
  setData,
  edit,
  onEdit,
  onSave,
  onCancel,
  saving,
}) => {
  return (
    <div className="border rounded-xl p-6 mb-8">
      <SectionHeader
        title="🎓 Education & Certificates"
        edit={edit}
        onEdit={onEdit}
        onSave={onSave}
        onCancel={onCancel}
        saving={saving}
      />

      <div className="grid grid-cols-2 gap-6">
        <FileField
          label="10th Marksheet"
          file={data.tenthMarksheet}
          disabled={!edit}
          onChange={(file) =>
            setData({ ...data, tenthMarksheet: file })
          }
        />

        {/*  LAST EDUCATION FILE */}
        <FileField
          label="Last Education Certificate"
          file={data.lastEducationFile}
          disabled={!edit}
          onChange={(file) =>
            setData({ ...data, lastEducationFile: file })
          }
        />

        <FileField
          label="Latest Updated CV"
          file={data.latestUpdateCv}
          disabled={!edit}
          onChange={(file) =>
            setData({ ...data, latestUpdateCv: file })
          }
        />
      </div>
    </div>
  );
};

const FileField = ({ label, file, onChange, disabled }) => {
  const isUploaded =
  typeof file === "string" && file.trim().startsWith("http");
  const isNewFile = file instanceof File;

  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium text-gray-700">
        {label}
      </label>

      {/*  Existing uploaded file */}
      {isUploaded && (
        <FileThumbnail file={file} label={label} />

      )}

      {/*  New file selected */}
      {isNewFile && (
        <p className="mb-2 text-sm text-blue-600">
          Selected: {file.name}
        </p>
      )}

      <input
        type="file"
        disabled={disabled}
        onChange={(e) => onChange(e.target.files[0])}
        className={`border rounded-md p-2 ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
};


export default EducationDetailsSection;
