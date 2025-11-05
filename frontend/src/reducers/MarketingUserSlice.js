import { createUser, getUser, updateUser } from "../Actions/MarketingUserAction"
import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  user: {
    _id: '',
    email: '',
    name: '',
    phone: ''
  },
  fetchStatus: '',
  status: 'idle', // pending | failed | completed
  updateStatus: 'idle', // pending | failed | completed
  error: null
}

const marketingUserSlice = createSlice({
  initialState,
  name: 'marketingUser',
  reducers: {
    // updateMarketingUser: (state, action) => {

    // }
  },
  extraReducers: builder => {
    builder.addCase(createUser.pending, (state) => {
      state.error = null
      state.status = 'pending'
    })
    builder.addCase(createUser.rejected, (state, action) => {
      state.error = action.payload
      state.status = 'failed'
    })
    builder.addCase(createUser.fulfilled, (state, action) => {
      state.status = 'completed'
      state.user = action.payload
    })

    builder.addCase(updateUser.pending, (state) => {
      state.error = null
      state.updateStatus = 'pending'
    })
    builder.addCase(updateUser.rejected, (state, action) => {
      state.error = action.payload
      state.updateStatus = 'failed'
    })
    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.updateStatus = 'completed'
      state.user = action.payload
    })
    
    builder.addCase(getUser.pending, (state) => {
      state.error = null
      state.fetchStatus = ''
      state.status = 'pending'
    })
    builder.addCase(getUser.rejected, (state, action) => {
      state.error = action.payload.error
      state.fetchStatus = action.payload.status
      state.status = 'failed'
    })
    builder.addCase(getUser.fulfilled, (state, action) => {
      state.status = 'completed'
      state.user = action.payload
    })
  }
})

// export const { updateMarketingUser } = marketingUserSlice.actions
export default marketingUserSlice.reducer