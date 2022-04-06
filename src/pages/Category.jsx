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
import ListingItems from '../components/ListingItems';

const Category = () => {
  const [listings, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] = useState(null);

  const params = useParams();

  useEffect(() => {
    // initial 10 listings fetched
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
        // ------------
        // added this in to limit the amount of listings per category
        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        // if 10 listings called it will get the tenth one
        setLastFetchedListing(lastVisible);
        // ------------

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

  //*-----------------------------------------------
  // * PAGINATION AND LOAD MORE
  const onFetchMoreListings = async () => {
    try {
      // *GET REFERENCE TO COLLECTION NOT DOCUMENT

      const listingRef = collection(db, 'listings');

      //*CREATE A QUERY
      const q = query(
        listingRef,
        where('type', '==', params.categoryName),
        orderBy('timestamp', 'desc'),
        limit(10),
        startAfter(lastFetchedListing)
      );

      //* EXECUTE THE QUERY
      const querySnap = await getDocs(q);
      // ------------
      // added this in to limit the amount of listings per category
      const lastVisible = querySnap.docs[querySnap.docs.length - 1];
      // if 10 listings called it will get the tenth one
      setLastFetchedListing(lastVisible);
      // ------------

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

      // prev state here is the first 10 listings fetched, set to the state
      // add in the newest set of listings as they are added rather than replacing old 10 with new 10
      setListing((prevState) => [...prevState, ...listings]);
      setLoading(false);
    } catch (error) {
      toast.error('Could not fetch listings');
    }
  };
  //*-----------------------------------------------

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
                <ListingItems
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                />
              ))}
            </ul>
          </main>

          <br />
          <br />
          {lastFetchedListing && (
            <p className='loadMore' onClick={onFetchMoreListings}>
              Load More
            </p>
          )}
        </>
      ) : (
        <p>No listings for {params.categoryName}</p>
      )}
    </div>
  );
};

export default Category;
