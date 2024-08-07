import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    value: [{
        switchMfAmcName: '',
        switchFromScheme: '',
        switchFromSchemeOption: '',
        switchToScheme: '',
        switchToSchemeOption: '',
        switchFolio: '',
        switchTransactionUnits_Amount: 'Amount Given in next question',
        switchTransactionAmount: 1,
    }]
}

const switchDataSlice = createSlice({
    name: 'switchData',
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
        resetSwitchData: (_) => {
            return initialState;
        }
    }
});

export const { handleChange, handleSelect, handleAdd, handleRemove, resetSwitchData } = switchDataSlice.actions;

export default switchDataSlice.reducer;
