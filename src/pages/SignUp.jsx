import { useState } from 'react';

// https://www.npmjs.com/package/react-toastify
import { toast } from 'react-toastify';

//*Firebase Auth from docs v9
// https://firebase.google.com/docs/auth/web/start
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';

// https://firebase.google.com/docs/firestore/manage-data/add-data
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';

import { Link, useNavigate } from 'react-router-dom';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';

import visibilityIcon from '../assets/svg/visibilityIcon.svg';

import OAuth from '../components/OAuth';


const SignUp = () => {
  // used to control the input type and visibilityIcon (eyeball)
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  // destructure for for use
  const { name, email, password } = formData;

  const navigate = useNavigate();

  const onChange = (e) => {
    e.preventDefault();
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value
    }));
  };

  // *Setting up Firebase Auth,  a promise based submit with async await
  // * createUserWithEmailAndPassword returns a promise
  const onSubmit = async (e) => {
    e.preventDefault();

    //*REGISTERING THE USER WITH A PROMISE
    try {
      const auth = getAuth();

      //*Takes in auth from firebase and email and password from this form
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      //* Get the user from the userCredential
      const user = userCredential.user;

      // *This function takes in the current user and object, we are updating the display name
      // *Get the current user from auth
      // ! No const here needed,since in the trycatch
      updateProfile(auth.currentUser, { displayName: name });

      //*STORING DATA TO FIRESTORE DB
      //*Copy of state object ie name, email, password
      const formDataCopy = { ...formData };
      //*Need to delete pw from object copy so it doesn't get stored in the db
      delete formDataCopy.password;
      //*Add in timestamp to copied state object
      formDataCopy.timestamp = serverTimestamp();

      // *UPDATING THE DB WITH setDoc FOR USER NAME AND EMAIL, ID, AND TIMESTAMP
      // https://firebase.google.com/docs/firestore/manage-data/add-data
      // The first argument doc in setDoc takes in db from my config folder, and a collection name 'users' and user id from user variable.
      // The second argument takes in the data to be stored, formDataCopy
      // setDoc returns a promise
      await setDoc(doc(db, 'users', user.uid), formDataCopy);

      //Redirect to home page after submission
      navigate('/');
    } catch (error) {
toast.error('Something went wrong with registration')
    }
  };
  return (
    <>
      <div className='pageContainer'>
        <header>
          <p className='pageHeader'></p>
        </header>
        <main>
          <form onSubmit={onSubmit}>
            <input
              type='text'
              className='nameInput'
              value={name}
              onChange={onChange}
              placeholder='Name'
              id='name'
            />
            <input
              type='email'
              className='emailInput'
              value={email}
              onChange={onChange}
              placeholder='Email'
              id='email'
            />
            <div className='passwordInputDiv'>
              <input
                type={showPassword ? 'text' : 'password'}
                className='passwordInput'
                placeholder='password'
                value={password}
                id='password'
                onChange={onChange}
              />

              <img
                src={visibilityIcon}
                className='showPassword'
                alt='show password'
                onClick={() =>
                  setShowPassword((prevState) => !prevState)
                }></img>
            </div>

            <Link to='/forgot-password' className='forgotPasswordLink'>
              Forgot Password
            </Link>

            <div className='signUpBar'>
              <p className='signUpText'>Sign Up</p>
              <button className='signUpButton'>
                <ArrowRightIcon fill='#ffff' width='34px' height='44px' />
              </button>
            </div>
          </form>
          <OAuth/>

          <Link to='/sign-in' className='registerLink'>
            Sign In Instead
          </Link>
        </main>
      </div>
    </>
  );
};

export default SignUp;
