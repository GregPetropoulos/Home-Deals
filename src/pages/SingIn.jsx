import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';

// https://www.npmjs.com/package/react-toastify
import { toast } from 'react-toastify';

// https://firebase.google.com/docs/auth/web/start
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

import visibilityIcon from '../assets/svg/visibilityIcon.svg';

import OAuth from '../components/OAuth';


const SignIn = () => {
  // used to control the input type and visibilityIcon (eyeball)
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  // destructure for for use
  const { email, password } = formData;

  const navigate = useNavigate();

  const onChange = (e) => {
    e.preventDefault();
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const auth = getAuth();

      // singInWithEmailAndPassword returns a promise
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredential.user) {
        navigate('/');
      }
    } catch (error) {
      toast.error('Bad User Credentials')
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

            <div className='signInBar'>
              <p className='signInText'>Sign In</p>
              <button className='signInButton'>
                <ArrowRightIcon fill='#ffff' width='34px' height='44px' />
              </button>
            </div>
          </form>
<OAuth/>
          <Link to='/sign-up' className='registerLink'>
            Sign Up Instead
          </Link>
        </main>
      </div>
    </>
  );
};

export default SignIn;
