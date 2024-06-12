import { createSlice } from "@reduxjs/toolkit";
import { hollowSystematicObj } from "../utils/initialDataObject";

const transactionSlice = createSlice({
  name: 'transaction',
  initialState: ['systematic'], // | 'purchRedemp' | 'switch' 
  reducers: {
    handleAdd: (state) => {
      state.push('systematic');
    },
    handleRemove: (state, action) => {
      const index = action.payload;
      if (index >= 0 && index < state.length) {
        state.splice(index, 1); // Remove the item at the specified index
      }
    },
    handleUpdate: (state, action) => {
      const { index, type } = action.payload;
      
      // Check if the index is within the array bounds
      if (index >= 0 && index < state.length) {
        // Create a new array with the updated item
        const updatedState = [...state];
        updatedState[index] = type;
        // Return the updated state array
        return updatedState;
      }

      // Return the original state if index is out of bounds
      return state;
    },
    resetTransactions: (state) => {
      return ['systematic'];
    }
  }
})

export const { handleAdd, handleRemove, handleUpdate, resetTransactions } = transactionSlice.actions;

export default transactionSlice.reducer;