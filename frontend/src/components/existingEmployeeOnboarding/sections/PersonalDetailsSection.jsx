import SectionHeader from "../components/SectionHeader";
import Input from "../components/Input";
import FileThumbnail from "../components/FileThumbnail";
import { PiAddressBookLight } from "react-icons/pi";

const PersonalDetailsSection = ({
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
        icon={<PiAddressBookLight size={24} className="text-gray-700" />}
        title="Personal Details"
        edit={edit}
        onEdit={onEdit}
        onSave={onSave}
        onCancel={onCancel}
        saving={saving}
      />

      <div className="grid grid-cols-2 gap-6">
        <Input label="First Name" name="firstName" value={data.firstName} onChange={handleChange} disabled={!edit} />
        <Input label="Last Name" name="lastName" value={data.lastName} onChange={handleChange} disabled={!edit} />
        <Input label="Email" name="email" value={data.email} onChange={handleChange} disabled={!edit}/>
        <Input label="Phone" name="phone" value={data.phone} onChange={handleChange} disabled={!edit} />
        <Input label="Father Name" name="fatherName" value={data.fatherName} onChange={handleChange} disabled={!edit} />
        <Input label="Mother Name" name="motherName" value={data.motherName} onChange={handleChange} disabled={!edit} />
        <Input label="PAN Number" name="panNumber" value={data.panNumber} onChange={handleChange} disabled={!edit} />
        <Input label="Date of Birth" name="dob" type="date" value={data.dob} onChange={handleChange} disabled={!edit} />
        <Input label="Gender" name="gender" value={data.gender} onChange={handleChange} disabled={!edit} />
        <Input label="Marital Status" name="maritalStatus" value={data.maritalStatus} onChange={handleChange} disabled={!edit} />
        <Input label="Street Address" name="streetAddress" value={data.streetAddress} onChange={handleChange} disabled={!edit} />
        <Input label="Address Line 2" name="addressLine2" value={data.addressLine2} onChange={handleChange} disabled={!edit} />
        <Input label="City" name="city" value={data.city} onChange={handleChange} disabled={!edit} />
        <Input label="State" name="stateRegionProvince" value={data.stateRegionProvince} onChange={handleChange} disabled={!edit} />
        <Input label="Postal Code" name="postalZipCode" value={data.postalZipCode} onChange={handleChange} disabled={!edit} />
        <Input label="Country" name="country" value={data.country} onChange={handleChange} disabled={!edit} />

        {/*  PHOTO */}
        <div className="col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Profile Photo
          </label>
          {typeof data.photo === "string" &&
          data.photo.trim().startsWith("http") && (
          <div className="mb-3">
      <FileThumbnail file={data.photo} label="Profile Photo" />
    </div>
        )}

        {data.photo instanceof File && (
          <p className="mb-2 text-sm text-blue-600">
            Selected: {data.photo.name}
          </p>
        )}
          <input
            type="file"
            disabled={!edit}
            onChange={(e) =>
              setData({ ...data, photo: e.target.files[0] })
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

export default PersonalDetailsSection;
