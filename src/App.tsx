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
import Sales from 'screens/home/admin/Sales';
import Inventory from 'screens/home/admin/Inventory';
import Settings from 'screens/home/admin/settings';
import StaffSales from 'screens/home/staff/Sales';
import StaffInventory from 'screens/home/staff/Inventory';
import { StaffHeader } from 'screens/components/gen/staffheader';
import StaffNavbarmenu from 'screens/components/gen/navigator/staffnavbarmenu';


//**NOTE**(((((ONLY USE TSRFC WHEN CREATING NEW SCREENS)))))**NOTE**/

const App: React.FC = () => {
  const { currentUser } = useContext(AuthContext);
  const isAdmin = currentUser && currentUser.type === 'admin';
  const isStaff = currentUser && currentUser.type === 'staff';

  const ProtectedAdminRoute: React.FC<children> = ({ children }) => {
    if (!isAdmin) {
      return <Navigate to="/" />;
    }
    return children;
  };

  const StaffProtectedAdminRoute: React.FC<children> = ({ children }) => {
    if (!isStaff) {
      return <Navigate to="/" />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      {currentUser && isAdmin && <Header menu={Navbarmenu} />}
      {currentUser && isStaff && <StaffHeader menu={StaffNavbarmenu} />}
      <Routes>
       <Route  path="/">
       <Route path="/login" element={<Login/>} />
          <Route path='*' element={<Error/>} />
          <Route index element = {<Login/>}/>
          <Route path='logout' element = {<Logout/>} />
          
        </Route>
        <Route path = "admin">
          <Route path='sales' index element={ <ProtectedAdminRoute><Sales/></ProtectedAdminRoute>}/>
          <Route path='inventory' index element={ <ProtectedAdminRoute><Inventory/></ProtectedAdminRoute>}/>
          <Route path='settings' index element={ <ProtectedAdminRoute><Settings/></ProtectedAdminRoute>}/>

        </Route>
        <Route path = "staff">
          <Route path='sales' index element={ <StaffProtectedAdminRoute><StaffSales/></StaffProtectedAdminRoute>}/>
          <Route path='inventory' index element={ <StaffProtectedAdminRoute><StaffInventory/></StaffProtectedAdminRoute>}/>
        </Route>
      </Routes>
    
    </BrowserRouter>
  );
}

export default App;
