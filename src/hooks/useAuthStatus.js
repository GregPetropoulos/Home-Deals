import { useEffect, useState, useRef } from 'react';

// getAuth returns the user object and onAuthStateChanged fires off when a logged in changes
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const useAuthStatus = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  const [loading, setLoading] = useState(true);

  // Fix memory leak with useRef
  const isMounted = useRef(true);

  useEffect(() => {
    if (isMounted) {
      const auth = getAuth();

      // takes in auth and a function that returns the user object
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setLoggedIn(true);
        }
        setLoading(false);
      });
    }

    // cleanup to fix memory leak error
    return ()=> {
        isMounted.current = false
    }
  }, [isMounted]);
  return { loggedIn, loading };
};

// Protecting routes with React18 React Router Dom V6 update
// https://stackoverflow.com/questions/65505665/protected-route-with-firebaseGoldie123119

// Fix Memory leak issue
//  https://stackoverflow.com/questions/59780268/cleanup-memory-leaks-on-an-unmounted-component-in-react-hooks
