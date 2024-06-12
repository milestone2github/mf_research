import { configureStore } from "@reduxjs/toolkit";
import systematicDataReducer from '../reducers/SystematicDataSlice'
import purchRedempDataReducer from '../reducers/PurchRedempDataSlice'
import switchDataReducer from '../reducers/SwitchDataSlice'
import commonDataReducer from '../reducers/CommonDataSlice'
import userReducer from '../reducers/UserSlice'
import optionListsReducer from '../reducers/OptionListsSlice'
import transactionReducer from '../reducers/TransactionSlice'
import toastSlice from "../reducers/ToastSlice";

export default configureStore({
    reducer: {
        systematicData: systematicDataReducer,
        purchRedempData: purchRedempDataReducer,
        switchData: switchDataReducer,
        commonData: commonDataReducer,
        user: userReducer,
        optionLists: optionListsReducer,
        transactions: transactionReducer,
        toast: toastSlice 
    }
})