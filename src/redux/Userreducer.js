import {createReducer} from '@reduxjs/toolkit'

const initialstates = {
    userstate:null
}

export const userReducer = createReducer(initialstates , (builder)=>{
    builder.addCase("checkuserloggedin" , (state,action)=>{
          state.userstate=action.payload
    })
})