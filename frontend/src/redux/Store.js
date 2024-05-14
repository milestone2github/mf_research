import { configureStore } from "@reduxjs/toolkit";
import systematicDataReducer from '../Reducers/SystematicDataSlice'
import purchRedempDataReducer from '../Reducers/PurchRedempDataSlice'
import switchDataReducer from '../Reducers/SwitchDataSlice'
import commonDataReducer from '../Reducers/CommonDataSlice'
import userReducer from '../Reducers/UserSlice'
import optionListsReducer from '../Reducers/OptionListsSlice'
import transactionReducer from '../Reducers/TransactionSlice'

export default configureStore({
    reducer: {
        systematicData: systematicDataReducer,
        purchRedempData: purchRedempDataReducer,
        switchData: switchDataReducer,
        commonData: commonDataReducer,
        user: userReducer,
        optionLists: optionListsReducer,
        transactions: transactionReducer
    }
})