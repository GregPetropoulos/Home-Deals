import { useState, useEffect } from 'react';

import { useParams, useSearchParams } from 'react-router-dom';

// gets the email
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase.config';

import { toast } from 'react-toastify';

const Contact = () => {
  const [message, setMessage] = useState('');
  const [landlord, setLandlord] = useState(null);

  // State to get everything after the ? aka the querystring
  // path='/contact/:landlordId?HERE IS THE QUERY STRING'
  const [searchParams, setSearchParams] = useSearchParams();

  // State to get the params which is the  id in the url
  // path='/contact/:landlordId'
  const params = useParams();

  useEffect(() => {
    // async func
    const getLandlord = async () => {
      const docRef = doc(db, 'users', params.landlordId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        //   set the landlord
        setLandlord(docSnap.data());
      } else {
        toast.error('Could not get landlord data');
      }
    };
    getLandlord();
  }, [params.landlordId]);

  const onChange = e =>setMessage(e.target.value)

  return (
    <div className='pageContainer'>
      <header>
        <p className='pageHeader'>Contact Landlord</p>
      </header>
      {landlord !== null && (
        <main>
          <div className='contactLandlord'>
            <p className='landlordName'>Contact {landlord?.name}</p>
          </div>
          <form className='messageForm'>
            <div className='messageDiv'>
              <label htmlFor='message' className='messageLabel'>
                Message
              </label>
              <textarea
                name='message'
                id='message'
                className='textarea'
                value={message}
                onChange={onChange}></textarea>
            </div>
            <a href={`mailto:${landlord.email}?Subject=${searchParams.get('listingName')}&body=${message}` }>
                <button type='button'className='primaryButton'>Send Message</button>
            </a>
          </form>
        </main>
      )}
    </div>
  );
};

export default Contact;
