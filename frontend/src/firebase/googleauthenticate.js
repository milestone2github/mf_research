import { GoogleAuthProvider ,signInWithPopup } from "firebase/auth";
import { auth } from "./setup";
const provider = new GoogleAuthProvider()

export const loginwithgoogle = ()=>{
    return signInWithPopup(auth ,provider)
}