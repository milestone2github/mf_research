import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: 'user',
  initialState: {
    isLoading: true,
    isLoggedIn: false, //make it false while deployment
    userData: null,
  },
  reducers: {
    setLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload
    }
  }
})

export const { setLoggedIn, setLoading, setUser } = userSlice.actions;

export default userSlice.reducer;