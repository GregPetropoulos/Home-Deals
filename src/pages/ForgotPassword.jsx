import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'react-toastify';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const onChange = (e) => {
   setEmail(e.target.value)
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const auth=getAuth()
      await sendPasswordResetEmail(auth, email)
      toast.success('Email was sent')
    } catch (error) {
      toast.error('Could not send reset email')
    }
  };

  return (
    <div className='pageContainer'>
      <header>
        <p className='pageHeader'>Forgot Password</p>
      </header>
      <main>
        <form onSubmit={onSubmit}>
          <input
            id='email'
            type='email'
            placeholder='email'
            value={email}
            onChange={onChange}
            className='emailInput'></input>
          <Link className='forgotPassword' to='/sign-in'>
            {' '}
            Sign In
          </Link>

          <div className='signInBar'>
            <div className='signInText'>Send Request Link</div>
            <button className='signInButton'>
              <ArrowRightIcon fill='#ffff' width='34px' height='34px' />
            </button>
          </div>
        </form>
      </main>
      <ArrowRightIcon />
    </div>
  );
};

export default ForgotPassword;
