import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    value: [{
        purch_RedempTraxType: '',
        purch_redempMfAmcName: '',
        purch_redempSchemeName: '',
        purch_redempSchemeOption: '',
        purch_redempFolio: '',
        purch_redempTransactionUnits_Amount: 'Amount in next question',
        purch_redempTransactionAmount: 1,
        purch_redempPaymentMode: '',
        purchaseChequeNumber: ''
    }]
}

const purchRedempDataSlice = createSlice({
    name: 'purchRedempData',
    initialState,
    reducers: {
        handleChange: (state, action) => {
            const { name, value, index } = action.payload;
            const nameWithoutIdx = name.split("-", 1)[0];
            const idx = parseInt(index, 10);
            
            // Update the specific field in the state
            if (idx >= 0 && idx < state.value.length) {
                state.value[idx] = { ...state.value[idx], [nameWithoutIdx]: value };
            }
        },
        handleSelect: (state, action) => {
            const { name, value, index } = action.payload;
            const idx = parseInt(index, 10);
            
            if (idx >= 0 && idx < state.value.length) {
                state.value[idx] = { ...state.value[idx], [name]: value };
            }
        },
        handleAdd: (state) => {
            state.value.push(initialState.value[0]);
        },
        handleRemove: (state, action) => {
            const index = action.payload;
            if (index >= 0 && index < state.value.length) {
                state.value.splice(index, 1); // Remove the item at the specified index
            }
        },
        // resetPurchRedempData: (_) => {
        //     return initialState;
        // }
        resetPurchRedempData: (state) => {
            state.value = [initialState.value[0]];
        },
        
        resetUnwantedFields: (state, action) => {
            const { index, transactionType } = action.payload;

            // Ensure the index is valid
            if (index < 0 || index >= state.value.length) {
                console.error(`Invalid index: ${index} in resetUnwantedFields`);
                return;
            }

            const item = state.value[index];

            // Reset fields based on the selected transaction type 
            if (transactionType === 'Redemption') {
                item.purch_redempPaymentMode = ''; // Not needed for Redemption
                item.purchaseChequeNumber = ''; // Not needed for Redemption
                item.purch_redempTransactionAmount = item.purch_redempTransactionAmount || 1; // Reset amount for Redemption
            }
        },
    }
});

export const { handleChange, handleSelect, handleAdd, handleRemove, resetPurchRedempData, resetUnwantedFields } = purchRedempDataSlice.actions;

export default purchRedempDataSlice.reducer;
