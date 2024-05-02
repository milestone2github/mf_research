import {configureStore} from '@reduxjs/toolkit'
import {userReducer} from './Userreducer'
export const store = configureStore({
    reducer:{
        user:userReducer
    }
})

