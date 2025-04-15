
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
// PATCH Requests in Asset
export const ID_STATUS_PARAMS_REQUIRED = "Id and/or Status are required fields in params.";
export const INVALID_STATUS_ACTION = "Status doesn't match any valid action.";
export const VALID_STATUS_ACTIONS = ['remove', 'allocate', 'deallocate', 'repair', 'restore'];
export const STATUS_MAP = {
  remove: 'removed',
  allocate: 'allocated',
  deallocate: 'available',
  repair: 'repair',
  restore: 'available'
};
export const STATUS_SUCCESS_MESSAGE_MAP = {
    remove: "Asset removed successfully.",
    allocate: "Asset allocated successfully.",
    deallocate: "Asset deallocated successfully.",
    repair: "Asset status set to REPAIR successfully.",
    restore: "Asset restored successfully."
}
// Asset Category string responses
export const CATEGORY_FETCH_FAIL = "Asset Categories not found. Please create new.";
export const CATEGORY_FETCH_SUCCESS = "Asset Categories fetched successfully.";
export const CATEGORY_CREATE_SUCCESS = "Asset Category created successfully.";
export const DUPLICATE_CATEGORY_FOUND_ERROR = "Category with the same name already exists in DB.";