import { useEffect, useState } from 'react';

// This hook helps with the endpoint sell or rent
import { useParams } from 'react-router-dom';

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';

import { db } from '../config/firebase.config';

import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';

const Category = () => {
  const [listings, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  const params = useParams();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        // *GET REFERENCE TO COLLECTION NOT DOCUMENT

        const listingRef = collection(db, 'listings');

        //*CREATE A QUERY
        const q = query(
          listingRef,
          where('type', '==', params.categoryName),
          orderBy('timestamp', 'desc'),
          limit(10)
        );

        //* EXECUTE THE QUERY
        const querySnap = await getDocs(q);
        // use loop
        let listings = [];
        querySnap.forEach((doc) => {
          // console.log(doc.data());
          // Since there is no id,  set id and data and add to listings array in return statement
          return listings.push({
            id: doc.id,
            data: doc.data()
          });
        });
        // set the state
        setListing(listings);
        setLoading(false);
      } catch (error) {
        toast.error('Could not fetch listings');
      }
    };
    fetchListing();
  }, [params.categoryName]);

  return (
    <div className='category'>
      <header>
        <p className='pageHeader'>
          {params.categoryName === 'rent'
            ? 'Places For Rent'
            : 'Places For Sale'}
        </p>
      </header>
      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className='categoryListings'>
              {listings.map((listing) => (
                <h3 key={listing.id}>{listing.data.name}</h3>
              ))}
            </ul>
          </main>
        </>
      ) : (
        <p>No listings for {params.categoryName}</p>
      )}
    </div>
  );
};

export default Category;
