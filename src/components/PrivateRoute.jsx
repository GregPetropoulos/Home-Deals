import React from 'react'
// Brought in Navigate the old redirect component and outlet to render to child routes (elements)
import {Navigate, Outlet} from 'react-router-dom'


// Will use a custom hook to check for logged in user
import { useAuthStatus } from '../hooks/useAuthStatus'

import Spinner from './Spinner'


const PrivateRoute = () => {
    const {loggedIn, loading}=useAuthStatus()
if(loading){
    return <Spinner/>
}

  return loggedIn? <Outlet/>:<Navigate to ='/sign-in'/>
}

export default PrivateRoute