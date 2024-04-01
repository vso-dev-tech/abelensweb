import { createContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "@firebase/auth";
import React from "react";
import { collection, getDoc, getDocs } from "firebase/firestore";
import { logindata } from "types/interfaces";

// Define the type for your user
type User = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null | undefined;
};

type AuthContextType = {
  currentUser: logindata | null | undefined;
};

type Children = {
  children: any | null;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
});

// AuthContextProvider component
export const AuthContextProvider: React.FC<Children> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<logindata | null>();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async(user) => {
      if (user) {
        const data = await getDocs(collection(db, 'user'));
        const thisdata: logindata[] = []
        data.forEach((doc) => {
          const data = doc.data() as logindata
          if (data.uid === user.uid) {
            thisdata.push(data)
          }
        });
        setCurrentUser(thisdata[0])
      } else {
       setCurrentUser(null)
      }
    });

    return () => {
      unsub();
    };
  }, []);


  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};