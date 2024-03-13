import { AuthContext } from 'auth'
import { signOut } from 'firebase/auth'
import React, { useContext } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { auth } from '../../../firebase/index';
import { Button, Card, CardContent } from '@mui/material';
type Props = {}

export default function Logout({}: Props) {


    const {currentUser} = useContext(AuthContext)
    const navigate = useNavigate()
    // React.useEffect(() => {
    //     checkUser()
    // },[])
    // const checkUser = async() => {

    //     if (currentUser?.uid.length === 0) {
    //         return
    //     } else {
    //         try {
    //             await signOut(auth).then(() => {
    //             navigate('/')
    //             })
    //         } catch (error) {
    //             console.error("Error signing out:", error);
    //         }
    //     }
      
    // }

  return (
    <div className='container'>
			<Card sx={{margin: 1, height: '100vh', width: '50%', flexDirection: 'column', display: 'flex',}}>
				<CardContent sx={{ height: '20%', textAlign: 'center',width: '40%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
					<h1>Logout Success</h1>
					<Button onClick={() => navigate('/viqumo2024')}>
							Re-login
					</Button>
					<Button onClick={() => navigate('/')}>
							Exit
					</Button>
				</CardContent>
			</Card>
    </div>
  )
}