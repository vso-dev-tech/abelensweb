import React, { useContext, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link } from "react-router-dom";
import './App.css';
import { AuthContext } from 'auth';
import { ForgotPassword } from 'screens/partials/auth/forgotpassword';
import { children } from 'types/interfaces';
import Login from 'screens/partials/auth';
import { Header } from 'screens/components/gen/header';
import Navbarmenu from 'screens/components/gen/navigator/navbarmenu';
import Error from 'screens/partials/Error/Error';
import Logout from 'screens/partials/auth/logout';
import Account from 'screens/home/details/account';
import Form from 'screens/home/forms';
import Submissions from 'screens/home/admin/Sales';
import WebControl from 'screens/home/admin/webcontrol';
import Status from 'screens/home/status';
import Sales from 'screens/home/admin/Sales';
import Inventory from 'screens/home/admin/Inventory';
import Settings from 'screens/home/admin/settings';


//**NOTE**(((((ONLY USE TSRFC WHEN CREATING NEW SCREENS)))))**NOTE**/

const App: React.FC = () => {
  const { currentUser } = useContext(AuthContext);

  const ProtectedRoute: React.FC<children> = ({ children }) => {
    console.log(currentUser)
    if (currentUser?.email === '') {
      return <Navigate to="/" />;
    }

    return children
  };

  return (
    <BrowserRouter>
      {currentUser && <Header menu={Navbarmenu} />}
      <Routes>
       <Route  path="/">
       <Route path="/login" element={<Login/>} />
          <Route path='*' element={<Error/>} />
          <Route index element = {<Login/>}/>
          <Route path='logout' element = {<Logout/>} />
          
        </Route>
        <Route path = "admin">
          <Route path='sales' index element={ <ProtectedRoute><Sales/></ProtectedRoute>}/>
          <Route path='inventory' index element={ <ProtectedRoute><Inventory/></ProtectedRoute>}/>
          <Route path='settings' index element={ <ProtectedRoute><Settings/></ProtectedRoute>}/>

        </Route>
      </Routes>
    
    </BrowserRouter>
  );
}

export default App;
