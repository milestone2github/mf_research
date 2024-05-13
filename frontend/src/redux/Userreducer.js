import {createReducer} from '@reduxjs/toolkit'

const initialstates = {
    userstate: 'Kishan' //test
}

export const userReducer = createReducer(initialstates , (builder)=>{
    builder.addCase("checkuserloggedin" , (state,action)=>{
          state.userstate=action.payload
    })
})