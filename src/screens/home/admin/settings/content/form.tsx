import { Button, Card, CardContent, MenuItem, Select, Stack, TextField } from '@mui/material';
import React, { useContext, useState } from 'react'
import FormHeader from 'screens/components/FormHeader';
import { appuserdata, inventory } from 'types/interfaces';
import {Timestamp} from "firebase/firestore";
import { AuthContext } from 'auth';
import { collection, onSnapshot, doc, setDoc } from '@firebase/firestore';
import { db } from '../../../../../firebase/index';
import { generateRandomKey } from '../../../../../firebase/function';
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

export default function Form({ modalData}: Props) {


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
    const id = generateRandomKey(20)
    const [form, setform] = React.useState<appuserdata>({
        active: modalData?.active || true,
        branch: modalData?.branch || '',
        email:modalData?.branch || '',
        lastLoggedIn:modalData?.lastLoggedIn || Timestamp.fromDate(new Date()),
        restrict:modalData?.restrict || false,
        staff:modalData?.staff || '',
        storeid:modalData?.storeid || '',
        uid:modalData?.uid || id,
    })
    const submit = async() => {
			try {
				
				const formRef = doc(db, 'user', form.uid)
				await setDoc(formRef, {
					active: form.restrict,
                    branch: form.branch,
                    email:form.email,
                    lastLoggedIn:form.lastLoggedIn,
                    restrict: form.restrict,
                    staff: form.staff,
                    storeid:form.storeid,
                    uid: form.uid,
			}).then((res) => {
					console.log(res)
					alert('Successfully added to Staff!')
				})
				

			} catch (err) {
				console.log(err)
			}
    }

  return (
					<Card sx={{margin: 1, width: '50%', flexDirection: 'column', display: 'flex'}}>
					<br/>
					<CardContent sx = {{display: 'flex', flexDirection: 'column'}}>
						<h1>
							ADD/EDIT STAFF
						</h1>
						<h4>USER ID: {form.uid}</h4>
							<Stack sx={{width: '100%'}}  direction="column" spacing={2} marginTop={2}>
									<FormHeader inputLabel = 'Branch' />
									<Select 
										defaultValue={'manilajd'}
										value = {form.branch}
										onChange={(e) => setform((prev: appuserdata) => ({
											...prev,
											branch: (e.target.value),
										}))}
										>
											  {menu.map((item, index) => (
													<MenuItem value = {item} key={index}>
														{item}
													</MenuItem>
												))}
												
										</Select>
							</Stack>
								<Stack sx={{width: '100%'}}  direction="column" spacing={2} marginTop={2}>
									<FormHeader inputLabel = 'Staff Name' />
									<TextField
											sx={{width: '100%'}}
											type='text'
											placeholder='Enter Staff Name'
											value={form.staff}
											onChange={(e) => setform((prev: appuserdata) => ({
                                                ...prev,
                                                staff: e.target.value,
                                              }))}
											error = {submitted && form.staff.length === 0}
											helperText = {submitted && form.staff.length === 0 && 'Field must not be empty'}
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
                                                unitprice: e.target.value,
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
							<Button sx={{backgroundColor: '#30BE7A', fontWeight: 'bold'}} onClick={submit} fullWidth variant='contained'>SUBMIT</Button>
						</Stack>
					</CardContent>
        </Card>
  )
}