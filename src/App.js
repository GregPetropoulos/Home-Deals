import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// https://www.npmjs.com/package/react-toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Explorer from './pages/Explorer';
import Offers from './pages/Offers';
import Profiles from './pages/Profiles';
import ForgotPassword from './pages/ForgotPassword';
import SignIn from './pages/SingIn';
import SignUp from './pages/SignUp';
import Category from './pages/Category';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Explorer />} />
          <Route path='/offers' element={<Offers />} />
          <Route path='/category/:categoryName' element={<Category />} />

          {/* nested private route */}
          <Route path='/profiles' element={<PrivateRoute />}>
            {/* This is Outlet child route */}
            <Route path='/profiles' element={<Profiles />} />
            
          </Route>
          <Route path='/sign-in' element={<SignIn />} />
          <Route path='/sign-up' element={<SignUp />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/*' element={<h1>Error Page Does Not Exist</h1>} />
        </Routes>
        <Navbar />
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
