import { useState, useEffect, useRef } from 'react';

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';

const CreateListing = () => {
  const [geolocatonEnabled, setGeolocationEnabled] = useState(true);
const [loading, setLoading]=useState(false)
  const [formData, setFormData] = useState({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0
  });

  // iNITIALIZE VARIABLES SET ISMOUNT TO TRUE TO HANDLE THE MEMORY LEAK ISSUE
  const auth = getAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    // TO HANDLE THE MEMORY LEAK WRAP EVERYTHING IN IF STATEMENT
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({...formData, userRef: user.uid });
        } else {
          navigate('/sign-in');
        }
      });
    }
    // CLEANUP
    return () => {
      isMounted.current = false
    }
  }, [isMounted]);

  if(loading){
      return <Spinner/>
  }

  return <div>Create</div>;
};

export default CreateListing;
