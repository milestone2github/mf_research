// Common string responses
exports.INTERNAL_SERVER_ERROR = "Internal Server Error.";
exports.INTERNAL_ERROR_CONSOLE = (error) => `Internal server error ${error} the Asset.`;

exports.REQUIRED_FIELDS_NOT_FOUND = "You have one or more missing required fields, try again.";
exports.ASSET_FOUND_IN_DB = "Asset already exists in db.";
exports.ASSET_NOT_FOUND_IN_DB = "Asset does not exists in db, create one.";
exports.ASSET_FETCH_SUCCESS = "Asset fetched successfully.";
exports.ASSET_CREATE_SUCCESS = "Asset created successfully";
exports.ASSET_UPDATE_SUCCESS = "Asset updated successfully.";
exports.USER_ID_NOT_FOUND = "User id not found.";
exports.ASSET_ID_NOT_FOUND = "Asset id not found.";
exports.ASSET_ALLOTTED_ERROR = "Asset allocated to somebody and cannot be removed. Deallocate first before binding 'remove'.";
exports.ASSET_NOT_AVAILABLE_ERROR = "Asset allocated to somebody. Deallocate first before binding 'repair'.";
// PATCH Requests in Asset
exports.ID_STATUS_PARAMS_REQUIRED = "Id and/or Status are required fields in params.";
exports.INVALID_STATUS_ACTION = "Status doesn't match any valid action.";
exports.VALID_STATUS_ACTIONS = [
  'allocate',
  'deallocate',
  'remove',
  'repair',
  'restore'
];
exports.STATUS_MAP = {
  allocate: 'allocated',
  deallocate: 'available',
  remove: 'removed',
  repair: 'repair',
  restore: 'available'
};
exports.STATUS_SUCCESS_MESSAGE_MAP = {
  allocate: "Asset allocated successfully.",
  deallocate: "Asset deallocated successfully.",
  remove: "Asset removed successfully.",
  repair: "Asset status set to REPAIR successfully.",
  restore: "Asset restored successfully."
}
// Asset Category string responses
exports.CATEGORY_FETCH_FAIL = "Asset Categories not found. Please create new.";
exports.CATEGORY_FETCH_SUCCESS = "Asset Categories fetched successfully.";
exports.CATEGORY_CREATE_SUCCESS = "Asset Category created successfully.";
exports.CATEGORY_NOT_FOUND = "Asset Category not found.";
exports.DUPLICATE_CATEGORY_FOUND_ERROR = "Category with the same name already exists in DB.";
// exports.ASSOCIATED_PARAMS_REQUIRED = "No params found with this request.";
exports.TYPE_ID_NOT_FOUND = "No Type id found in params.";
exports.ASSET_WITH_TYPE_NOT_FOUND = "No assets associated with given type.";
exports.ASSET_TYPE_FETCH_SUCCESS = "All assets fetched successfully.";
exports.ASSET_TYPE_FIELDS_REQUIRED = "There are missing fields required to create an Asset Type.";
exports.ASSET_TYPE_CREATE_SUCCESS = "Asset Type created successfully.";

exports.TRANSACTION_DB_NAME = "internal"; // transaction Database name
exports.FETCH_CLIENT_LIST_LIMIT = 100; // Route optimization controller fetchClientList