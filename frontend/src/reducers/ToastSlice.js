import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isOn: false,
  header: '',
  message: '',
  type: 'info' // success | error | info
}

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    updateToast: (state, action) => {
      state.isOn = true
      state.message = action.payload.message
      state.type = action.payload.type
      state.header = action.payload?.header || ''
    },
    resetToast: () => {
      return initialState
    }
  }
})

export const { updateToast, resetToast } = toastSlice.actions
export default toastSlice.reducer