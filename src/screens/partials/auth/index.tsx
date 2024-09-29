import { collection, getDocs } from '@firebase/firestore';
import { auth, db } from '../../../firebase';
import React, { useContext, useEffect, useState } from 'react'
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css'
import { AuthContext } from 'auth';
import { logindata } from 'types/interfaces';
import { Alert, Button, Stack, TextField } from '@mui/material';

export default function Login() {

  const [username, setusername] = useState('');
  const [forgotten] = useState(false)
  const [loginpassword, setloginPassword] = useState('');
  const { currentUser } = useContext(AuthContext);
  const [toast, settoast] = useState('');
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(false)
  const [submitted, setsubmitted] = useState<boolean>(false)
  const navigate = useNavigate()

  useEffect(() => {
    const getState = () => {
      
    if(currentUser != null){
      if(currentUser.type === 'admin') {
        navigate("/admin/sales");
      }
      if(currentUser.type === 'staff')  {
        navigate("/staff/sales");
      }
    }
    }
    getState()
   },[currentUser, navigate]);

   const checkStatus = async (e: any) => {
    e.preventDefault()
    seterror(false)
    setloading(true)
    setsubmitted(true)
    if(username.length === 0 || loginpassword.length === 0) {
      return
    }
    settoast('checking email...')
    const querySnapshot = await getDocs(collection(db, "user"));
    const userData: logindata[] = [];
  
    querySnapshot.forEach((doc) => {
      if (doc.data().username === username) {
        userData.push({
            uid: doc.data().uid,
            username: doc.data().username,
            type: doc.data().type,
            email: doc.data().email,
            branch: doc.data().branch,
            
        });
      }
    });
    console.log(userData)
    if (userData.length > 0) {
      settoast('verifying credentials...')
        const email = userData[0].email;
        const password = loginpassword;
        settoast('logging in...')
        await signInWithEmailAndPassword(auth, email, password).then((res) => {
          setloading(false)
          setsubmitted(false)
          console.log(res)
          if(userData[0].type === 'staff'){
            navigate('/staff/sales')
          }
          if(userData[0].type === 'admin'){
            navigate('/admin/sales')
          }
        }).catch((error: any) => {
          console.log(error)
          if(error === 'FirebaseError: Firebase: Error (auth/invalid-login-credentials).'){
          settoast('username and password did not matched.')
          seterror(true)
        }
        })
    } else {
      settoast('username provided have no account with us')
      seterror(true)
    }
  }
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      checkStatus(e);
    }
  }

  return (
    <div draggable = {false} className="unauthorized-container">
      {forgotten &&      
        <Alert 
          variant='filled' 
          severity='error' 
        >
          NOTE: if forgotten password, Please contact your Administrator.
        </Alert>
      }      
<div className='login-container-row img-bck'>
        <h1>ABELENS</h1>
        <p>Inventory Management System</p>
      </div>
      <div className='login-container-row'>
        <div className='login-box'>
          <h1>ADMIN LOGIN</h1>
          <Stack sx={{width: '75%'}} direction="column" spacing={2} marginTop={2}>
								<TextField
										sx={{width: '100%'}}
										type='text'
										value={username}
                    label='AUTH ID'
                    variant='outlined'
										placeholder='Enter Auth ID'
										onChange = {(e) => setusername(e.target.value)}
										error = {submitted && username.length === 0}
										helperText = {submitted && username.length === 0 && 'Auth ID must not be empty'}
								/>
						</Stack>
            <Stack  sx={{width: '75%', marginBottom: 1}} direction="column" spacing={2} marginTop={2}>
								<TextField
										sx={{width: '100%'}}
										type='password'
                    label='PASS CODE'
										value={loginpassword}
										placeholder='Enter Passcode'
										onChange = {(e) => setloginPassword(e.target.value)}
										error = {submitted && loginpassword.length === 0}
										helperText = {submitted && loginpassword.length === 0 && 'Passcode must not be empty'}
                    onKeyDown={handleKeyPress}
								/>
						</Stack>
          <Button sx={{backgroundColor: '#30BE7A'}} variant='contained' onClick={checkStatus}>Login</Button>
          {loading && <p style={{color: error ? 'red' : 'black', fontSize: 12, textAlign: 'center'}}>{toast}</p>}
        </div>
      </div>
    </div>
  )
}