import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';

import visibilityIcon from '../assets/svg/visibilityIcon.svg';

const SignUp = () => {
  // used to control the input type and visibilityIcon (eyeball)
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name:''
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

  return (
    <>
      <div className='pageContainer'>
        <header>
          <p className='pageHeader'></p>
        </header>
        <main>
          <form>
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
          {/* Google OAUTH */}
          <Link to='/sign-in' className='registerLink'>
            Sign In Instead
          </Link>
        </main>
      </div>
    </>
  );
};

export default SignUp;
