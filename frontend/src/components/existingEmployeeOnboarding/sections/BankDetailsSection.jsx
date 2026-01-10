import SectionHeader from "../components/SectionHeader";
import Input from "../components/Input";
import FileThumbnail from "../components/FileThumbnail";


const BankDetailsSection = ({
  data,
  setData,
  edit,
  onEdit,
  onSave,
  onCancel,
  saving,
}) => {
  const handleChange = (e) =>
    setData({ ...data, [e.target.name]: e.target.value });

  return (
    <div className="border rounded-xl p-6 mb-8">
      <SectionHeader
        title="🏦 Bank Details"
        edit={edit}
        onEdit={onEdit}
        onSave={onSave}
        onCancel={onCancel}
        saving={saving}
      />

      <div className="grid grid-cols-2 gap-6">
        <Input label="Beneficiary Name" name="beneficiaryName" value={data.beneficiaryName} onChange={handleChange} disabled={!edit} />
        <Input label="Account Number" name="accountNumber" value={data.accountNumber} onChange={handleChange} disabled={!edit} />
        <Input label="IFSC Code" name="ifscCode" value={data.ifscCode} onChange={handleChange} disabled={!edit} />
        <Input label="Bank Name" name="bankName" value={data.bankName} onChange={handleChange} disabled={!edit} />

        {/*  BANK VERIFICATION DOC */}
        <div className="col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Bank Verification Document
          </label>
          {typeof data.bankVerificationDoc === "string" &&
          data.bankVerificationDoc.trim().startsWith("http") && (
          <div className="mb-3">
          <FileThumbnail
            file={data.bankVerificationDoc}
            label="Bank Verification"
          />
        </div>
        )}
          <input
            type="file"
            disabled={!edit}
            onChange={(e) =>
              setData({
                ...data,
                bankVerificationDoc: e.target.files[0],
              })
            }
            className={`border rounded-md p-2 ${
              !edit ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default BankDetailsSection;
