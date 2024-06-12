import { createSlice } from "@reduxjs/toolkit";
import { hollowPurchRedempObj } from "../utils/initialDataObject";

const purchRedempDataSlice = createSlice({
    name: 'purchRedempData',
    initialState: {
        value: [hollowPurchRedempObj]
    },
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
            state.value.push(hollowPurchRedempObj);
        },
        handleRemove: (state, action) => {
            const index = action.payload;
            if (index >= 0 && index < state.value.length) {
                state.value.splice(index, 1); // Remove the item at the specified index
            }
        },
        resetPurchRedempData: (state) => {
            state.value = [hollowPurchRedempObj];
        }
    }
});

export const { handleChange, handleSelect, handleAdd, handleRemove, resetPurchRedempData } = purchRedempDataSlice.actions;

export default purchRedempDataSlice.reducer;
