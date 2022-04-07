// *----------------------------------------------------------------
// *----------------------------------------------------------------
// *EDITLISTING IS MAJORITY OF A CREATELISTING COPY OVER EXCEPT FOR ADDITIONAL  USEEFFECT
// *----------------------------------------------------------------
// *----------------------------------------------------------------


import { useState, useEffect, useRef } from 'react';

// For the image upload from storage
// *----------------------------------
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from 'firebase/storage';
import { db } from '../config/firebase.config';
import { v4 as uuidv4 } from 'uuid';
// *-------------------------------------

import {
  doc,
  updateDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { toast, ToastContainer } from 'react-toastify';

const EditListing = () => {
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState(false);
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
  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    offer,
    address,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude
  } = formData;

  // INITIALIZE VARIABLES SET ISMOUNT TO TRUE TO HANDLE THE MEMORY LEAK ISSUE
  const auth = getAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);

// Redirects if listing is not user's
useEffect(()=> {
if(listing && listing.userRef !== auth.currentUser.uid){
    toast.error('Not authorized to edit this listing')
    navigate('/')
}
},[])


  // * ==============================================================
  // * EDIT FUNCTIONALITY LOGIC
//   useEffect#1 Fetch listing to edit. A promise that updates the db and state by id and redirects accordingly
  const params = useParams();
  useEffect(() => {
    setLoading(true);
    const fetchListing = async () => {
      // get the id of listing from db
      const docRef = doc(db, 'listings', params.listingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setListing(docSnap.data());
        // without setting the form's state you just have the default form on edit page even though we clicked on a listing. Also had to add in the address
        setFormData({...docSnap.data(), address:docSnap.data().location})
        setLoading(false);
      } else {
        navigate('/');
        toast.error('Listing does not exist');
      }
    };
    fetchListing();
  }, [params.listingId, navigate]);
  // * ==============================================================

//  useEffect #2 Sets userRef to logged in user
  useEffect(() => {
    // TO HANDLE THE MEMORY LEAK WRAP EVERYTHING IN IF STATEMENT
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid });
        } else {
          navigate('/sign-in');
        }
      });
    }
    //*CLEANUP
    return () => {
      isMounted.current = false;
    };
  }, [isMounted]);

  // * ==============================================================
  // * ==============================================================
  //  *ONSUBMIT-Image upload to firebase, geocode from lat/long into address

  const onSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    console.log(formData);
    // * ==============================================================
    //* PRICE CHECKS

    if (discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error('Discounted price must be less than regular price');
      return;
    }
    // * ==============================================================

    // * ==============================================================
    //* IMAGE CHECKS
    // images is an object by state and array by database
    if (images.length > 6) {
      setLoading(false);
      toast.error('MAX 6 images');
      return;
    }
    // * ==============================================================

    // * ==============================================================
    //*GEOCODING

    let geolocation = {};
    let location;

    if (geolocationEnabled) {
      // must fetch call a promise
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_API_KEY}`
      );

      const data = await response.json();
      // Data returned from google api, use optional chain and nullish coelescing
      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;
      location =
        data.status === 'ZERO_RESULTS'
          ? undefined
          : data.results[0]?.formatted_address;

      if (location === undefined || location.includes('undefined')) {
        setLoading(false);
        toast.error('Please enter a correct address');
        return;
      }
    } else {
      // if not geolocation is not enabled, enter manually
      geolocation.lat = latitude;
      geolocation.lng = longitude;
    }
    // * ==============================================================

    // * ==============================================================
    // *STORE LOOP THROUGH IMAGE UPLOADS AND SEND TO FIRESTORE, Uploading images, sizes must be less than 2MB
    const storeImage = async (image) => {
      // want to return new promise
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;

        const storageRef = ref(storage, 'images/' + fileName);
        const uploadTask = uploadBytesResumable(storageRef, image);

        // Register three observers:
        // 1. 'state_changed' observer, called any time the state changes
        // 2. Error observer, called on failure
        // 3. Completion observer, called on successful completion
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                break;
              case 'running':
                console.log('Upload is running');
                break;
            }
          },
          (error) => {
            // Handle unsuccessful uploads
            // if promise fails
            reject(error);
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
              console.log('File available at', downloadURL);
            });
          }
        );
      });
    };
    // End of storageImage function
    // Need to execute and get all images into an array from promises
    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      // The catch runs based off the reject(error) occurring above here
      setLoading(false);
      toast.error('Images not uploaded');
      return;
    });
    console.log(imgUrls);
    //* ==============================================================

    //* ==============================================================
    // * OBJECT SUBMITTED/SAVED TO THE DATABASE
    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp()
    };

    // For clean up in the formData we need to delete images and address
    // Since we want the imgUrls not the images uploaded
    // Since we want the `location` aka formatted address or location typed in address
    formDataCopy.location = address;
    delete formDataCopy.images;
    delete formDataCopy.address;
    // if no offer delete the discountedPrice, since discounted price is the offer.
    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    //*CHANGED THIS FOR THE EDIT FUNCTIONALITY
    // *Update listing
const docRef= doc(db, 'listings',params.listingId)
await updateDoc(docRef, formDataCopy)
    setLoading(false);
    toast.success('Listing Updated and Saved');
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);

    //* ==============================================================

    setLoading(false);
  };
  // * ==============================================================
  // * ==============================================================

  // * ==============================================================
  // * ==============================================================
  // *ON MUTATE EVENT HANDLER

  const onMutate = (e) => {
    // When input or button clicked, checking the string value={true} true and setting to actual true or false
    // set boolean null
    let boolean = null;
    // check an set true
    if (e.target.value === 'true') {
      boolean = true;
    }
    // check and set false
    if (e.target.value === 'false') {
      boolean = false;
    }

    //*FILES
    // e.target.files is an array  of files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files
      }));
    }
    //*Text/Booleans/Numbers
    // if the value={true} for any id set to true else set the provided value ex: bedrooms, rent etc
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        //*nullish coelescing operator?? if value on left is null use the number/text etc, on right of  ??
        [e.target.id]: boolean ?? e.target.value
      }));
    }
  };
  // * ==============================================================
  // * ==============================================================

  if (loading) {
    return <Spinner />;
  }
  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Edit Listing</p>
      </header>
      <main>
        <form onSubmit={onSubmit}>
          <label htmlFor='' className='formLabel'>
            Sell/Rent
          </label>
          <div className='formButtons'>
            <button
              type='button'
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='sale'
              onClick={onMutate}>
              Sell
            </button>
            <button
              type='button'
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='rent'
              onClick={onMutate}>
              Rent
            </button>
          </div>
          <label className='formLabel'>Name</label>
          <input
            className='formInputName'
            type='text'
            id='name'
            value={name}
            onChange={onMutate}
            maxLength='32'
            minLength='10'
            required
          />
          <div className='formRooms flex'>
            <div>
              <label className='formLabel'>Bedrooms</label>
              <input
                className='formInputSmall'
                type='number'
                id='bedrooms'
                value={bedrooms}
                onChange={onMutate}
                maxLength='1'
                minLength='50'
                required
              />
            </div>
            <div>
              <label className='formLabel'>Bathrooms</label>
              <input
                className='formInputSmall'
                type='number'
                id='bathrooms'
                value={bathrooms}
                onChange={onMutate}
                maxLength='1'
                minLength='50'
                required
              />
            </div>
          </div>
          <label className='formLabel'>Parking spot</label>
          <div className='formButtons'>
            <button
              className={parking ? 'formButtonActive' : 'formButton'}
              type='button'
              id='parking'
              value={true}
              onClick={onMutate}
              min='1'
              max='50'>
              Yes
            </button>
            <button
              className={
                !parking && parking !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='parking'
              value={false}
              onClick={onMutate}
              min='1'
              max='50'>
              No
            </button>
          </div>

          <label className='formLabel'>Furnished</label>
          <div className='formButtons'>
            <button
              className={furnished ? 'formButtonActive' : 'formButton'}
              type='button'
              id='furnished'
              value={true}
              onClick={onMutate}>
              Yes
            </button>
            <button
              className={
                !furnished && parking !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              type='button'
              id='furnished'
              value={false}
              onClick={onMutate}>
              No
            </button>
          </div>
          <label className='formLabel'>Address</label>
          <textarea
            className='formInputAddress'
            type='text'
            id='address'
            value={address}
            onChange={onMutate}
            required
          />
          {/* if geolocation turned off manual input for user below */}
          {!geolocationEnabled && (
            <div className='formLatLng flex'>
              <div>
                <label className='formLabel'>Latitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='latitude'
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className='formLabel'>Longitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='longitude'
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}
          <label className='formLabel'>Offer</label>
          <div className='formButtons'>
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type='button'
              id='offer'
              value={true}
              onClick={onMutate}>
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='offer'
              value={false}
              onClick={onMutate}>
              No
            </button>
          </div>
          <label className='formLabel'>Regular Price</label>
          <div className='formPriceDiv'>
            <input
              className='formInputSmall'
              type='number'
              id='regularPrice'
              value={regularPrice}
              onChange={onMutate}
              min='50'
              max='750000000'
              required
            />
            {type === 'rent' && <p className='formPriceText'>$ /Month</p>}
          </div>
          {offer && (
            <>
              <label className='formLabel'>Discounted Price</label>
              <input
                className='formInputSmall'
                type='number'
                id='discountedPrice'
                value={discountedPrice}
                onChange={onMutate}
                min='50'
                max='750000000'
                required={offer}
              />
            </>
          )}
          <label className='formLabel'>Images</label>
          <p className='imagesInfo'>
            The first image will be the cover (max 6) and must be less than 2MB
            in size.
          </p>
          <input
            className='formInputFile'
            type='file'
            id='images'
            onChange={onMutate}
            max='6'
            accept='.jpg, .png, jpeg'
            multiple
            required
          />
          <button type='submit' className='primaryButton createListingButton'>
            Edit Listing
          </button>
        </form>
      </main>
    </div>
  );
};

export default EditListing;
