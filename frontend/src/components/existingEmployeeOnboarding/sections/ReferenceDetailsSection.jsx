import SectionHeader from "../components/SectionHeader";
import Input from "../components/Input";
import { MdOutlineContactEmergency } from "react-icons/md";

const ReferenceDetailsSection = ({
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
        icon={<MdOutlineContactEmergency size={24} className="text-gray-700" />}
        title="Reference & Emergency Details"
        edit={edit}
        onEdit={onEdit}
        onSave={onSave}
        onCancel={onCancel}
        saving={saving}
      />

      <div className="grid grid-cols-2 gap-6">
        <Input label="Reference 1 Name" name="reference1Name" value={data.reference1Name} onChange={handleChange} disabled={!edit} />
        <Input label="Reference 1 Phone" name="reference1Phone" value={data.reference1Phone} onChange={handleChange} disabled={!edit} />
        <Input label="Relationship" name="relationshipWithReference1" value={data.relationshipWithReference1} onChange={handleChange} disabled={!edit} />

        {/* ✅ SECOND REFERENCE */}
        <Input label="Reference 2 Name" name="reference2Name" value={data.reference2Name} onChange={handleChange} disabled={!edit} />
        <Input label="Reference 2 Phone" name="reference2Phone" value={data.reference2Phone} onChange={handleChange} disabled={!edit} />
        <Input label="Relationship" name="relationshipWithReference2" value={data.relationshipWithReference2} onChange={handleChange} disabled={!edit} />

        <Input label="Emergency Contact Name" name="emergencyContactName" value={data.emergencyContactName} onChange={handleChange} disabled={!edit} />
        <Input label="Emergency Contact Phone" name="emergencyContactPhone" value={data.emergencyContactPhone} onChange={handleChange} disabled={!edit} />
        <Input label="Relationship" name="relationshipWithEmergencyContact" value={data.relationshipWithEmergencyContact} onChange={handleChange} disabled={!edit} />
      </div>
    </div>
  );
};

export default ReferenceDetailsSection;
