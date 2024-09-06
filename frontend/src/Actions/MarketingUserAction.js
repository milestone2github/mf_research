import { createAsyncThunk } from "@reduxjs/toolkit"

export const createUser = createAsyncThunk('marketingUser/create',
  async (user, { rejectWithValue }) => {
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/data/marketing/user`, {
        method: "POST",
        credentials: 'include',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(user)
      })
      
      const responseData = await response.json()
      if (!response.ok) {
        const error = Array.isArray(responseData?.error) ? responseData.error[0] : responseData.error
        throw new Error(error || response.statusText)
      }
      return responseData.data
    } catch (error) {
      console.error(error.message)
      return rejectWithValue(error.message)
    }
})

export const updateUser = createAsyncThunk('marketingUser/update',
  async (user, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/data/marketing/user/${user._id}`, {
        method: "PATCH",
        credentials: 'include',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({email: user.email, phone: user.phone, company: user.company})
      })
      const responseData = await response.json()
      if (!response.ok) {
        const error = Array.isArray(responseData?.error) ? responseData.error[0] : responseData.error
        throw new Error(error || response.statusText)
      }
      return responseData.data
    } catch (error) {
      console.error(error.message)
      return rejectWithValue(error.message)
    }
}) 

export const getUser = createAsyncThunk('marketingUser/get',
  async (_, { rejectWithValue }) => {
    let status = null
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/data/marketing/user`, {
        method: "GET",
        credentials: 'include',
        headers: { 'Content-type': 'application/json' }
      })
      status = response.status
      const responseData = await response.json()

      if (!response.ok) {
        const error = Array.isArray(responseData?.error) ? responseData.error[0] : responseData.error
        throw new Error(error || response.statusText)
      }
      return responseData.data
    } catch (error) {
      console.error(error.message)
      return rejectWithValue({status, error: error.message})
    }
}) 