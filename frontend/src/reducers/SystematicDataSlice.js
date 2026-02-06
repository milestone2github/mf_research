import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    value: [{
        systematicTraxType: 'SIP',
        systematicTraxFor: 'Registration',
        systematicSchemeName: '',
        systematicMfAmcName: '',
        systematicSourceScheme: '',
        systematicSchemeOption: '',
        systematicFolio: '',
        sip_swp_stpAmount: 1,
        tenureOfSip_swp_stp: 9999,
        sipPauseMonths: '',
        sip_stp_swpDate: '',
        firstTransactionAmount: 1,
        systematicChequeNumber: '',
        systematicPaymentMode: ''
      }]
}

const systematicDataSlice = createSlice({
    name: 'systematicData',
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
        // resetSystematicData: (_) => {
        //     return initialState;
        // }
        resetSystematicData: (state) => {
            state.value = [initialState.value[0]];
        },

        resetUnwantedFields: (state, action) => {
            const { index, transactionFor } = action.payload;

            // Ensure the index is valid
            if (index < 0 || index >= state.value.length) {
                console.error(`Invalid index: ${index} in resetUnwantedFields`);
                return;
            }

            const item = state.value[index];

            // Reset fields based on the selected transaction type
            if (transactionFor === 'Registration') {
                item.sipPauseMonths = ''; // Not needed for Registration
                item.systematicChequeNumber = item.systematicChequeNumber || ''; 
                item.firstTransactionAmount = item.firstTransactionAmount || 1; 
                item.tenureOfSip_swp_stp = item.tenureOfSip_swp_stp || 9999; 
                item.sip_stp_swpDate = item.sip_stp_swpDate || ''; 

            } else if (transactionFor === 'Pause') {
                item.systematicFrequency = ''; // Not needed for Pause
                item.systematicPaymentMode = ''; 
                item.systematicChequeNumber = ''; 
                item.firstTransactionAmount = ''; 
                item.sip_stp_swpDate = ''; 
                item.sipPauseMonths = item.sipPauseMonths || ''; 

            } else if (transactionFor === 'Cancellation') {
                item.sipPauseMonths = '';  // Not needed for Cancellation
                item.tenureOfSip_swp_stp = ''; 
                item.systematicFrequency = ''; 
                item.systematicPaymentMode = ''; 
                item.systematicChequeNumber = ''; 
                item.firstTransactionAmount = ''; 
                item.sip_stp_swpDate = ''; 
                item.sipPauseMonths = ''; 
            } else {
                console.warn(`Unknown transactionFor: ${transactionFor}`);
            }
        },
    }
});

export const { handleChange, handleSelect, handleAdd, handleRemove, resetSystematicData, resetUnwantedFields } = systematicDataSlice.actions;

export default systematicDataSlice.reducer;
