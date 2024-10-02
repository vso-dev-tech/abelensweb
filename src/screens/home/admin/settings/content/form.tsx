import { Button, Card, CardContent, MenuItem, Select, Stack, TextField } from '@mui/material';
import React, { useContext, useState } from 'react'
import FormHeader from 'screens/components/FormHeader';
import { appuserdata, inventory } from 'types/interfaces';
import {Timestamp} from "firebase/firestore";
import {auth}  from '../../../../../firebase/index';
import { AuthContext } from 'auth';
import { collection, onSnapshot, doc, setDoc } from '@firebase/firestore';
import { db } from '../../../../../firebase/index';
import { generateRandomKey } from '../../../../../firebase/function';
import {getAuth, sendPasswordResetEmail, createUserWithEmailAndPassword } from '@firebase/auth'
type Props = {
    modalData?: appuserdata |  null | undefined
}

const menu: string[] = [
	'manilajd',
	'nicolasabelrdo',
	'plantationsports',
	'amor trophies',
	'isabela',
	'kenns',
]



export default function Form({ modalData }: Props) {


//     active: boolean,
//   branch: string,
//   email: string,
//   lastLoggedIn: firestore.Timestamp,
//   restrict: boolean,
//   staff: string,
//   storeid: string,
//   uid: string,
    const {currentUser} = useContext(AuthContext)
    const [opensuccess, setopensuccess] = React.useState<boolean>(false)
    const [submitted, setsubmitted] = React.useState<boolean>(false)
    const [form, setform] = React.useState<appuserdata>({
        active: modalData?.active || true,
        branch: modalData?.branch || 'Abelens',
        email:modalData?.email || '',
        lastLoggedIn:modalData?.lastLoggedIn || Timestamp.fromDate(new Date()),
        restrict:modalData?.restrict || false,
        username:modalData?.username || '',
        storeid:modalData?.storeid || '',
        uid:modalData?.uid || '',
		type: modalData?.type || 'staff',
    })
    const submit = async() => {
			try {
				
				
				const auth = getAuth()

				if(form.uid !== ''){
				const formRef = doc(db, 'user', form.uid)
				await setDoc(formRef, {
					active: form.active,
					branch: form.branch,
					email:form.email,
					lastLoggedIn:form.lastLoggedIn,
					restrict: form.restrict,
					username: form.username,
					storeid:form.storeid,
					uid: form.uid,
					type: form.type
			})
			alert('Successfully added to Staff!')
			} else {
					const { user } = await createUserWithEmailAndPassword(auth, form.email, 'Water@1234');
					console.log('eto ba')
					console.log(user)
					console.log('error ba')
					const formRef = doc(db, 'user', user.uid)
					await setDoc(formRef, {
						active: form.active,
						branch: form.branch,
						email:form.email,
						lastLoggedIn:form.lastLoggedIn,
						restrict: form.restrict,
						username: form.username,
						storeid:form.storeid,
						uid:  user.uid,
						type: 'staff',
				}).then(async(res) => {
						alert('Successfully added to Staff!')
					})
			}
	
			} catch (err) {
				console.log('nag error po')
				console.log(err)
				console.log('something went wrong ba')
			}
    }
		const sendResetLink = async() => {
			const auth = getAuth()
			await sendPasswordResetEmail(auth, form.email).then((res) =>{
				console.log(res)
				alert(`Successfully sent password reset link to ${form.email}`)
			})

		}

  return (
					<Card sx={{margin: 1, width: '50%', flexDirection: 'column', display: 'flex'}}>
					<br/>
					<CardContent sx = {{display: 'flex', flexDirection: 'column'}}>
						<h1>
							ADD/EDIT STAFF
						</h1>
						{form.uid != '' && <h4>USER ID: {form.uid}</h4>}
						{form.uid != '' && <Button onClick={sendResetLink} sx={{alignItems: 'center', justifyContent: 'flex-start'}} >SEND RESET PASSWORD LINK</Button>}
							<Stack sx={{width: '100%'}}  direction="column" spacing={2} marginTop={2}>
									<FormHeader inputLabel = 'Branch' />
									<Select 
										defaultValue={'Abelens'}
										value = {form.branch}
										onChange={(e) => setform((prev: appuserdata) => ({
											...prev,
											branch: (e.target.value),
										}))}
										>
											<MenuItem value = {'Abelens'} key = {0} >Abelens Branch</MenuItem>
           									<MenuItem value = {'Nepo'} key ={1}>Nepo Branch</MenuItem>
												
										</Select>
							</Stack>
								<Stack sx={{width: '100%'}}  direction="column" spacing={2} marginTop={2}>
									<FormHeader inputLabel = 'Staff Name' />
									<TextField
											sx={{width: '100%'}}
											type='text'
											placeholder='Enter Staff Name'
											value={form.username}
											onChange={(e) => setform((prev: appuserdata) => ({
                                                ...prev,
                                                username: e.target.value,
                                              }))}
											error = {submitted && form.username.length === 0}
											helperText = {submitted && form.username.length === 0 && 'Field must not be empty'}
									/>
							</Stack>
							<Stack sx={{width: '100%'}}  direction="column" spacing={2} marginTop={2}>
									<FormHeader inputLabel = 'Email' />
									<TextField
											sx={{width: '100%'}}
											type='text'
											placeholder='Enter Email'
											value={form.email}
											onChange={(e) => setform((prev: appuserdata) => ({
                                                ...prev,
                                                email: e.target.value,
                                              }))}
											error = {submitted && form.email.length === 0}
											helperText = {submitted && form.email.length === 0 && 'Field must not be empty'}
									/>
							</Stack>
							<Stack sx={{width: '100%'}}  direction="column" spacing={2} marginTop={2}>
									<FormHeader inputLabel = 'Store ID' />
									<TextField
											sx={{width: '100%'}}
											type='text'
											placeholder='Enter Store ID'
											value={form.storeid}
											onChange={(e) => setform((prev: appuserdata) => ({
                                                ...prev,
                                                storeid: e.target.value,
                                              }))}
											error = {submitted && form.storeid.length === 0}
											helperText = {submitted && form.storeid.length === 0 && 'Field must not be empty'}
									/>
							</Stack>
                            <Stack sx={{width: '100%'}}  direction="column" spacing={2} marginTop={2}>
									<FormHeader inputLabel = 'Active Status' />
									<Select 
										defaultValue={'Yes'}
										value = {form.active ? 'Yes' : 'No'}
										onChange={(e) => {
                                            const targetvalue = e.target.value
                                            setform((prev: appuserdata) => ({
											...prev,
											active: targetvalue == 'Yes' ? true : false,
										}))}}
										>
													<MenuItem value = {"Yes"} key={0}>
														Yes
													</MenuItem>
                                                    <MenuItem value = {"No"} key={0}>
														No
													</MenuItem>
										</Select>
							</Stack>
                            <Stack sx={{width: '100%'}}  direction="column" spacing={2} marginTop={2}>
									<FormHeader inputLabel = 'Restricted' />
									<Select 
										defaultValue={'Yes'}
										value = {form.restrict ? 'Yes' : 'No'}
										onChange={(e) => {
                                            const targetvalue = e.target.value
                                            setform((prev: appuserdata) => ({
											...prev,
											restrict: targetvalue == 'true' ? true: false,
										}))}}
										>
													<MenuItem value = {"Yes"} key={0}>
														Yes
													</MenuItem>
                                                    <MenuItem value = {"No"} key={0}>
														No
													</MenuItem>
										</Select>
							</Stack>
						<Stack justifyContent={'center'}  alignItems={'center'} direction="column" spacing={2} marginTop={2}>
							<Button disabled = {currentUser?.type !== 'admin'} sx={{backgroundColor: '#30BE7A', fontWeight: 'bold'}} onClick={submit} fullWidth variant='contained'>SUBMIT</Button>
						</Stack>
					</CardContent>
        </Card>
  )
}