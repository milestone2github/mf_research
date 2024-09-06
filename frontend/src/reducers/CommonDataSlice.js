import { createSlice } from '@reduxjs/toolkit'

const commonDataSlice = createSlice({
    name: 'commonData',
    initialState: {
        value: {
            transactionPreference: 'ASAP',
            panNumber: '',
            investorName: '',
            familyHead: '',
            iWellCode: '',
            relationshipManager: ''
        }
    },
    reducers: {
        handleChange: (state, action) => {
            const { name, value } = action.payload;
            // Update the specific field in the state
            state.value[name] = value;
        },
        resetCommonData: (state) => {
            state.value = {
                transactionPreference: 'ASAP',
                panNumber: '',
                investorName: '',
                familyHead: '',
                iWellCode: '',
                relationshipManager: ''
            }
        }
    }
})

export const { handleChange, resetCommonData } = commonDataSlice.actions;

export default commonDataSlice.reducer;