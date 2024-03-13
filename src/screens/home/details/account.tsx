import { faLock } from '@fortawesome/free-solid-svg-icons'
import { AuthContext } from 'auth'
import React, { useContext } from 'react'
import Card from 'screens/components/global/card'
import { LoginFields } from 'screens/components/global/fields'
import Form from 'screens/contents/forms'
import { logindata } from 'types/interfaces'
import {updateDoc, doc} from '@firebase/firestore'
import { auth, db } from '../../../firebase/index'
import { User, updatePassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
type Props = {}

export default function Account({}: Props) {
  return(<></>)
}
//     const {currentUser} = useContext(AuthContext)
//     const navigate = useNavigate()
//     const [form, setform] = React.useState<logindata[]>([
//        { uid: '',
//         username: '',
//         password: '',
//         newpassword: '',
//         confirmpassword: '',
//         type: '',
//         email: '',
//         contact: '',

//       }
//     ])

//     const updateaccount = async () => {

//         const {password, newpassword, confirmpassword} = form[0]
        
//         if(newpassword != confirmpassword){ 
//             alert('Confirm your new password')
//         } else {
//             const currentuser: User = auth?.currentUser as User;
//             try {
//                 await updatePassword(currentuser, newpassword).then(() => {
//                   alert('Password Successfully changed')
//                   setform([
//                     { uid: '',
//                      username: '',
//                      password: '',
//                      newpassword: '',
//                      confirmpassword: '',
//                      type: '',
//                      email: '',
//                      contact: '',
//                     }
//                  ])
//             })
            
//             console.log('Document successfully updated.');
//             } catch (error) {
//             console.error('Error updating document:', error);
//             if(error == 'FirebaseError: Firebase: Error (auth/requires-recent-login).'){
//               alert('You need to re-login before you may change your password')
//               navigate('/logout')
//             }
//             }
//         } 
//       };

//   return (
//     <div className='container'>
//         <img draggable = {false} src="https://i.imgur.com/mzylrqX.png" alt="Your Image"/>
//       <div className="image-overlay">
//         <Card className='form-wrapper'>
//             <div className='form-container'>

//             <h1>Account Details</h1>
//                 <LoginFields
//                     title='Current Password'
//                     type  ='password'
//                     icon = {faLock}
//                     disabled = {false}
//                     onChange={(e) => setform((prev) => [
//                         {
//                           ...prev[0],
//                           password: e.target.value,
//                         },
//                       ])}
//                     placeholder= 'Current Password' 
//                     value= {form[0].password} 
//                 />
//                 <LoginFields
//                     title='New Password'
//                     type  ='password'
//                     icon = {faLock}
//                     disabled = {false}
//                     onChange={(e) => setform((prev) => [
//                         {
//                           ...prev[0],
//                           newpassword: e.target.value,
//                         },
//                       ])}
//                     placeholder= 'confirm new password' 
//                     value= {form[0].newpassword} 
//                 />
//                 <LoginFields
//                     title = 'Confirm New Password'
//                     type  ='password'
//                     icon = {faLock}
//                     disabled = {false}
//                     onChange={(e) => setform((prev) => [
//                         {
//                           ...prev[0],
//                           confirmpassword: e.target.value,
//                         },
//                       ])}
//                     placeholder= 'New password' 
//                     value= {form[0].confirmpassword} 
//                 />
//                 <button onClick = {updateaccount} style = {{marginTop: 20}}>
//                       Update
//                 </button>
//             </div>
//         </Card>
//       </div>
//     </div>
//   )
// }