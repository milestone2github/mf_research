// Common string responses
module.exports.INTERNAL_SERVER_ERROR = "Internal Server Error.";
module.exports.INTERNAL_ERROR_CONSOLE = (error) => `Internal server error: ${error} in the Asset.`;

module.exports.REQUIRED_FIELDS_NOT_FOUND = "You have one or more missing required fields, try again.";
module.exports.USER_ID_NOT_FOUND = "User ID not found.";
module.exports.ASSET_ID_NOT_FOUND = "Asset ID not found.";

// Asset-related messages
module.exports.ASSET_FOUND_IN_DB = "Asset already exists in the database.";
module.exports.ASSET_NOT_FOUND_IN_DB = "Asset does not exist in the database. Please create one.";
module.exports.ASSET_FETCH_SUCCESS = "Asset fetched successfully.";
module.exports.ASSET_CREATE_SUCCESS = "Asset created successfully.";
module.exports.ASSET_UPDATE_SUCCESS = "Asset updated successfully.";

module.exports.ASSET_ALLOTTED_ERROR = "Asset is allocated to someone and cannot be removed. Please deallocate it first.";
module.exports.ASSET_NOT_AVAILABLE_ERROR = "Asset is currently allocated. Please deallocate it before sending for repair.";

// PATCH requests in Asset
module.exports.ID_STATUS_PARAMS_REQUIRED = "ID and/or Status are required fields in parameters.";
module.exports.INVALID_STATUS_ACTION = "Provided status does not match any valid action.";

module.exports.VALID_STATUS_ACTIONS = [
  'allocate',
  'deallocate',
  'remove',
  'repair',
  'restore'
];

module.exports.STATUS_MAP = {
  allocate: 'allocated',
  deallocate: 'available',
  remove: 'removed',
  repair: 'repair',
  restore: 'available'
};

module.exports.STATUS_SUCCESS_MESSAGE_MAP = {
  allocate: "Asset allocated successfully.",
  deallocate: "Asset deallocated successfully.",
  remove: "Asset removed successfully.",
  repair: "Asset status set to REPAIR successfully.",
  restore: "Asset restored successfully."
};

// Asset Category string responses
module.exports.CATEGORY_FETCH_FAIL = "Asset categories not found. Please create new ones.";
module.exports.CATEGORY_FETCH_SUCCESS = "Asset categories fetched successfully.";
module.exports.CATEGORY_CREATE_SUCCESS = "Asset category created successfully.";
module.exports.CATEGORY_NOT_FOUND = "Asset category not found.";
module.exports.DUPLICATE_CATEGORY_FOUND_ERROR = "A category with the same name already exists in the database.";

// Asset Type-related responses
module.exports.TYPE_ID_NOT_FOUND = "No type ID found in parameters.";
module.exports.ASSET_WITH_TYPE_NOT_FOUND = "No assets associated with the given type.";
module.exports.ASSET_TYPE_FETCH_SUCCESS = "All assets fetched successfully.";
module.exports.ASSET_TYPE_FIELDS_REQUIRED = "Some required fields are missing to create an asset type.";
module.exports.ASSET_TYPE_CREATE_SUCCESS = "Asset type created successfully.";