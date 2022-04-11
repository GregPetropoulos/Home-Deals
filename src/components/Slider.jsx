import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase.config';
import Spinner from './Spinner';

// Swiper
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

const Slider = () => {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState(null);

  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
if(isMounted){


    const fetchListing = async () => {
      const listingRef = collection(db, 'listings');
      const q = query(listingRef, orderBy('timestamp', 'desc'), limit(5));
      const querySnap = await getDocs(q);

      // initialize array
      let listings = [];

      // loop through and push onto listings array `id` and `data`
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data()
        });
      });
      //   update state
      setListings(listings);
      setLoading(false);
    };
    fetchListing();
}
 //*CLEANUP
 return () => {
  isMounted.current = false;
};

  }, [isMounted]);

  if (loading) {
    return <Spinner />;
  }

  if (listings.length === 0) {
    return <></>;
  }

  return (
    listings && (
      <>
        <p className='exploreHeading'>Recommended</p>
        <Swiper slidesPerView={1} pagination={{ clickable: true }}>
          {listings.map(({ data, id }) => (
            <SwiperSlide
              key={id}
              onClick={() => navigate(`/category/${data.type}/${id}`)}>
              <div
                style={{
                  background: `url(${data.imgUrls[0]})center no-repeat`,
                  backgroundSize: 'cover'
                }}
                className='swiperSlideDiv'>
                <p className='swiperSlideText'>{data.name}</p>
                <p className='swiperSlidePrice'>
                  {data.discountedPrice ?? data.regularPrice}{' '}
                  {data.type === 'rent' && '/month'}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    )
  );
};

export default Slider;
