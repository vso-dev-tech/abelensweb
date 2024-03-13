import { Alert, Button, Card, CardContent, Stack, TextField } from '@mui/material'
import { AuthContext } from 'auth'
import {collection, getDocs } from '@firebase/firestore'
import { db } from '../../../firebase/index'
import currentUser from 'global/redux/reducers/userReducer'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import FormHeader from 'screens/components/FormHeader'

type Props = {}

interface status {
	approved: boolean,
	approvaldate: string,
	id: string,
}

export default function Status({}: Props) {

	const {currentUser} = React.useContext(AuthContext)
	const [id, setid] = React.useState<string>('')
	const [submitted, setsubmitted] = React.useState<boolean>(false)
	const [data, setdata] = React.useState<status[]>([{
		id: '',
		approvaldate: 'for review',
		approved: false,
	}])
	const [nodata, setnodata] = React.useState<boolean>(false)
	const navigate = useNavigate()

	React.useEffect(() => {

		const checkUser = () => {
			if(currentUser){
				navigate('/')
				return 
			}
		}
		checkUser()
	},[currentUser])

	const submit = async() => {

		try {
			setsubmitted(true)
			if(id.length === 0){
				return
			}
			const collectionRef = await getDocs(collection(db, 'submission'))
			const thisdata: status[] = []
			collectionRef.forEach((doc) => {
				const data = doc.data()
				if(data.id == id){
				thisdata.push({
					id: data.id,
					approved: data.approved,
					approvaldate: data.approvaldate,
				})
					setdata(thisdata)
				}

				console.log(thisdata)
			})

		} catch(error) {
			console.log(error)
		}

	}

  return (
    <div className='container'>
			<div style = {{display: 'flex',width: '100%', marginLeft: 0, height: '100vh', justifyContent: 'center', alignItems: 'center',}}>
    		<Card sx={{margin: 3, width: '100%', flexDirection: 'column', display: 'flex',}}>
					<CardContent>
						<Stack sx={{width: '100%', justifyContent: 'center', alignItems: 'center'}} direction="column" spacing={2} marginTop={2}>
								<h1>Check Submission Status</h1>
								<p>Please enter your Reference ID to check your submission status</p>
								<br/>
								<TextField
										sx={{width: '50%'}}
										type='text'
										label = 'Reference ID'
										value = {id}
										variant='outlined'
										onChange={(e) => setid(e.target.value)}
										error = {submitted && id.length === 0}
										helperText = {submitted && id.length === 0 && 'Field must not be empty'}
								/>
								<Button onClick={submit} variant='contained' >Check Status</Button>

							{submitted && data[0].id === '' && id.length !== 0 && <Alert severity='warning'>Reference ID not found</Alert>}
							{submitted  && data[0].approvaldate !== 'for review' && data[0].approved === true && <Alert severity='success'>Submission Approved</Alert>}
							{submitted   && data[0].approvaldate == 'for review' && data[0].approved === false && <Alert severity='info'>Submission under Review</Alert>}
							{submitted && data[0] && data[0].approvaldate !== 'for review' && data[0].approved === false && <Alert severity='error'>Submission Denied</Alert>}
							{submitted && data[0].approvaldate !== 'for review' && <p>Reviewed on {data[0].approvaldate}</p>}
						</Stack>
					</CardContent>
				</Card>
    	</div>
    </div>
  )
}