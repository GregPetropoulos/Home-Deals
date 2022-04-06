// Email is difficult to change since firestore uses it as authentication
import { getAuth, updateProfile } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg';
import homeIcon from '../assets/svg/homeIcon.svg';
import ListingItem from '../components/ListingItems';

// UPDATE THE FIRESTORE
import {
  updateDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase.config';

const Profiles = () => {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  // BUTTON TO ENABLE THE FORM
  const [changeDetails, setChangeDetails] = useState(false);

  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email
  });

  const { name, email } = formData;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserListings = async () => {
      // db
      const listingRef = collection(db, 'listings');
      // query
      const q = query(
        listingRef,
        where('userRef', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc')
      );

      // query the db
      const querySnap = await getDocs(q);

      // initiliaze listings array
      const listings = [];

      // loop through and push id and data into array
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data()
        });
      });
      // set the state
      setListings(listings);
      setLoading(false);
    };
    fetchUserListings();
  }, [auth.currentUser.uid]);

  const onLogout = () => {
    auth.signOut();
    navigate('/');
  };
  const onSubmit = async () => {
    try {
      // check the current users name is not the same name entered the it will be updated and stored in the firestore db
      if (auth.currentUser.displayName !== name) {
        // *UPDATE NAME
        // takes in 2 arguments current user and the object to update, will return a promise
        await updateProfile(auth.currentUser, {
          displayName: name
        });
        // * STORE IN DB
        // find db with users collection with uid of current user and update the name
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { name });
      }
    } catch (error) {
      toast.error('Could not update profile details');
    }
  };

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value
    }));
  };

  const onDelete = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this')) {
      // finds the listing id in the db and deletes from firebase
      await deleteDoc(doc(db, 'listings', listingId));
      const updatedListings = listings.filter(
        (listing) => listing.id !== listingId
      );
      // update the ui with the listingsless the deleted listing
      setListings(updatedListings);
      toast.success('Successfully deleted the listing');
    }
  };
  console.log("listings",listings);
  return (
    <div className='profile'>
      <header className='profileHeader'>
        <p className='pageHeader'>My Profile</p>
        <button className='logOut' type='button' onClick={onLogout}>
          Logout
        </button>
      </header>
      <main>
        <div className='profileDetailsHeader'>
          <p className='profileDetailsText'>Personal Details</p>
          <p
            className='changePersonalDetails'
            onClick={() => {
              changeDetails && onSubmit();
              setChangeDetails((prevState) => !prevState);
            }}>
            {changeDetails ? 'done' : 'change'}
          </p>
        </div>
        ˜
        <div className='profileCard'>
          <form className=''>
            <input
              type='text'
              id='name'
              className={!changeDetails ? 'profileName' : 'profileNameActive'}
              disabled={!changeDetails}
              value={name}
              onChange={onChange}
            />
            <input
              type='text'
              id='email'
              className={!changeDetails ? 'profileEmail' : 'profileEmailActive'}
              disabled={!changeDetails}
              value={email}
              onChange={onChange}
            />
          </form>
        </div>
        <Link to='/create-listing' className='createListing'>
          <img src={homeIcon} alt='home' />
          <p className=''>Sell or Rent your home</p>
          <img src={arrowRight} alt='arrow right' />
        </Link>
        {!loading && listings?.length > 0 && (
          <>
            <p className='listingText'>Your Listings</p>
            <ul className='listingsList'>
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                  onDelete={() => onDelete(listing.id)}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
};

export default Profiles;
