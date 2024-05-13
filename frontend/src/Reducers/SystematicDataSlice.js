import { createSlice } from "@reduxjs/toolkit";
import { hollowSystematicObj } from "../utils/initialDataObject";

const systematicDataSlice = createSlice({
    name: 'systematicData',
    initialState: {
        value: [hollowSystematicObj]
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
            state.value.push(hollowSystematicObj);
        },
        handleRemove: (state, action) => {
            const index = action.payload;
            if (index >= 0 && index < state.value.length) {
                state.value.splice(index, 1); // Remove the item at the specified index
            }
        },
        resetSystematicData: (state) => {
            state.value = [hollowSystematicObj];
        }
    }
});

export const { handleChange, handleSelect, handleAdd, handleRemove, resetSystematicData } = systematicDataSlice.actions;

export default systematicDataSlice.reducer;
