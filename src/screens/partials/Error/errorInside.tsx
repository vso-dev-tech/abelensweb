import { Button } from '@mui/material'
import { AuthContext } from 'auth'
import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'

type Props = {}

function ErrorInside({}: Props) {
    const {currentUser} = useContext(AuthContext)
    const navigate = useNavigate()

  return (
    <div className='errorwrapper'>
        <h1 style = {{color: '#30BE7A', fontFamily: 'Montserrat', fontWeight: 'bold', fontSize: 100, textAlign: 'center', marginBottom: 0}}>ERROR 404</h1>
        <p style={{marginTop:0 }}>You are somewhere, but nowhere.</p>
        {currentUser == null &&
          (<Button onClick={() => navigate('/')}>go back to forms</Button>)
          
          }
    </div>
  )
}

export default ErrorInside