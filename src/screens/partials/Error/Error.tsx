import React, { useContext, useEffect } from 'react'
import ErrorInside from './errorInside'
import { AuthContext } from 'auth'
import { Navigate } from 'react-router-dom'

type Props = {}

export default function Error({}: Props) {
    
  return (
    <div className='container'> 
        <ErrorInside/>
    </div>
  )
}