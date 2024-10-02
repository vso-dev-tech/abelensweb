import { AuthContext } from 'auth'
import { signOut } from 'firebase/auth'
import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../../firebase/index';
import { Button, Card, CardContent } from '@mui/material';

export default function Logout() {


    const {currentUser} = useContext(AuthContext)
    const navigate = useNavigate()
    React.useEffect(() => {
        checkUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    const checkUser = async() => {

        if (currentUser?.uid.length === 0) {
            return
        } else {
            try {
                await signOut(auth).then(() => {
                navigate('/logout')
                })
            } catch (error) {
                console.error("Error signing out:", error);
            }
        }
      
    }

  return (
    <div className='container'>
			<Card sx={{margin: 1, flexDirection: 'column', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <h1>Logout Success</h1>
				<CardContent sx={{margin: 1, flexDirection: 'row', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
					<Button onClick={() => navigate('/')}>
							Go to back to login
					</Button>
				</CardContent>
			</Card>
    </div>
  )
}