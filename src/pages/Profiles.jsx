import{getAuth} from 'firebase/auth'
import { useState, useEffect } from 'react';


const Profiles = () => {
const [user,setUser]= useState (null)
const auth =getAuth()

useEffect(()=> {
  console.log('useEffect check', auth.currentUser);
  setUser(auth.currentUser);

},[])

  return user? <h1>{user.displayName}</h1>:'Not Logged In'
};

export default Profiles;
