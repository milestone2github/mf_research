const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  disabled = false,
}) => {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={`border rounded-md p-2 ${
          disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "bg-white"
        }`}
      />
    </div>
  );
};

export default Input;
