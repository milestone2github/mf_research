module.exports = {
  INTERNAL_ERROR_CONSOLE: (error) => `Internal server error ${error} the Asset.`,
  INTERNAL_SERVER_ERROR: "Internal Server Error.",
  INTERNAL_SERVER_ERROR_USER: "Internal Server Error while fetching users list.",
  ACCESS_TOKEN_NOT_FOUND: "Access Token not found in Session.",
  
  ASSET_FOUND_IN_DB: "Asset already exists in db.",
  REQUIRED_FIELDS_NOT_FOUND: "You have one or more missing required fields, try again.",
  ASSET_NOT_FOUND_IN_DB: "Asset does not exists in db, create one.",
  ASSET_FETCH_SUCCESS: "Asset fetched successfully.",
  ASSET_CREATE_SUCCESS: "Asset created successfully",
  ASSET_UPDATE_SUCCESS: "Asset updated successfully.",
  ASSET_ID_NOT_FOUND: "Asset id not found.",
  ASSET_ALLOTTED_ERROR: "Asset allocated to somebody and cannot be removed. Deallocate first before binding 'remove'.",
  ASSET_NOT_AVAILABLE_ERROR: "Asset allocated to somebody. Deallocate first before binding 'repair'.",
  // PATCH Requests in Asset
  ID_STATUS_PARAMS_REQUIRED: "Id and/or Status are required fields in params.",
  INVALID_STATUS_ACTION: "Status doesn't match any valid action.",
  VALID_STATUS_ACTIONS: [
    'allocate',
    'deallocate',
    'remove',
    'repair',
    'restore'
  ],
  STATUS_MAP: {
    allocate: 'allocated',
    deallocate: 'available',
    remove: 'removed',
    repair: 'repair',
    restore: 'available'
  },
  STATUS_SUCCESS_MESSAGE_MAP: {
    allocate: "Asset allocated successfully.",
    deallocate: "Asset deallocated successfully.",
    remove: "Asset removed successfully.",
    repair: "Asset status set to REPAIR successfully.",
    restore: "Asset restored successfully."
  },
  // Asset Category string responses
  CATEGORY_FETCH_FAIL: "Asset Categories not found. Please create new.",
  CATEGORY_FETCH_SUCCESS: "Asset Categories fetched successfully.",
  CATEGORY_CREATE_SUCCESS : "Asset Category created successfully.",
  CATEGORY_NOT_FOUND: "Asset Category not found.",
  DUPLICATE_CATEGORY_FOUND_ERROR: "Category with the same name already exists in DB.",
  // export const ASSOCIATED_PARAMS_REQUIRED = "No params found with this request.";
  TYPE_ID_NOT_FOUND: "No Type id found in params.",
  ASSET_WITH_TYPE_NOT_FOUND: "No assets associated with given type.",
  ASSET_TYPE_FETCH_SUCCESS: "All assets fetched successfully.",
  ASSET_TYPE_FIELDS_REQUIRED: "There are missing fields required to create an Asset Type.",
  ASSET_TYPE_CREATE_SUCCESS: "Asset Type created successfully.",
  
  // Users
  USER_ID_NOT_FOUND: "User id not found.",
  USER_NOT_FOUND: "Users not found in DB.",
  USER_FETCH_SUCCESS: "Users list fetched successfully.",

}
// Common string responses
