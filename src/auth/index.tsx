import { createContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "@firebase/auth";
import React from "react";
import { doc, getDoc } from "firebase/firestore";
import { logindata } from "types/interfaces";

type AuthContextType = {
  currentUser: logindata | null | undefined;
};

type Children = {
  children: any | null;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
});

export const AuthContextProvider: React.FC<Children> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<logindata | null>();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'user', user.uid); 
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data() as logindata; 
          setCurrentUser(data);
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
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