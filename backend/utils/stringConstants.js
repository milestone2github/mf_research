
// Common string responses
export const INTERNAL_SERVER_ERROR = "Internal Server Error.";
export const INTERNAL_ERROR_CONSOLE = (error) => `Internal server error ${error} the Asset.`;

export const REQUIRED_FIELDS_NOT_FOUND = "You have one or more missing required fields, try again.";
export const ASSET_FOUND_IN_DB = "Asset already exists in db.";
export const ASSET_NOT_FOUND_IN_DB = "Asset does not exists in db, create one.";
export const ASSET_FETCH_SUCCESS = "Asset fetched successfully.";
export const ASSET_CREATE_SUCCESS = "Asset created successfully";
export const ASSET_UPDATE_SUCCESS = "Asset updated successfully.";
export const USER_ID_NOT_FOUND = "User id not found.";
export const ASSET_ID_NOT_FOUND = "Asset id not found.";
export const ASSET_ALLOTTED_ERROR = "Asset allocated to somebody and cannot be removed. Deallocate first before binding 'remove'.";
export const ASSET_NOT_AVAILABLE_ERROR = "Asset allocated to somebody. Deallocate first before binding 'repair'.";
// PATCH Requests in Asset
export const ID_STATUS_PARAMS_REQUIRED = "Id and/or Status are required fields in params.";
export const INVALID_STATUS_ACTION = "Status doesn't match any valid action.";
export const VALID_STATUS_ACTIONS = [
  'allocate',
  'deallocate',
  'remove',
  'repair',
  'restore'
];
export const STATUS_MAP = {
  allocate: 'allocated',
  deallocate: 'available',
  remove: 'removed',
  repair: 'repair',
  restore: 'available'
};
export const STATUS_SUCCESS_MESSAGE_MAP = {
  allocate: "Asset allocated successfully.",
  deallocate: "Asset deallocated successfully.",
  remove: "Asset removed successfully.",
  repair: "Asset status set to REPAIR successfully.",
  restore: "Asset restored successfully."
}
// Asset Category string responses
export const CATEGORY_FETCH_FAIL = "Asset Categories not found. Please create new.";
export const CATEGORY_FETCH_SUCCESS = "Asset Categories fetched successfully.";
export const CATEGORY_CREATE_SUCCESS = "Asset Category created successfully.";
export const CATEGORY_NOT_FOUND = "Asset Category not found.";
export const DUPLICATE_CATEGORY_FOUND_ERROR = "Category with the same name already exists in DB.";
// export const ASSOCIATED_PARAMS_REQUIRED = "No params found with this request.";
export const TYPE_ID_NOT_FOUND = "No Type id found in params.";
export const ASSET_WITH_TYPE_NOT_FOUND = "No assets associated with given type.";
export const ASSET_TYPE_FETCH_SUCCESS = "All assets fetched successfully.";
export const ASSET_TYPE_FIELDS_REQUIRED = "There are missing fields required to create an Asset Type.";
export const ASSET_TYPE_CREATE_SUCCESS = "Asset Type created successfully.";