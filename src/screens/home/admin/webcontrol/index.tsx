import { Alert, Button, Card, CardContent, FormControlLabel, Radio, RadioGroup, Stack, Switch, TextField } from '@mui/material'
import { fetchDisabledForm } from '../../../../firebase/function'
import React from 'react'
import FormHeader from 'screens/components/FormHeader'
import { disabledform } from 'types/interfaces'
import {doc, updateDoc} from '@firebase/firestore'
import { db } from '../../../../firebase/index'
type Props = {}

const disable = [
	{value: true, name: 'enabled'},
	{value: false, name: 'disabled'}
]



export default function WebControl({}: Props) {

	const [control, setcontrol] = React.useState<disabledform>({
		disabled: false,
		text: '',
		id: '',
		date: '',

	})
	const [submitted, setsubmitted] = React.useState(false);
	const [success, setsuccess] = React.useState(false)
	const [currentTime, setCurrentTime] = React.useState(new Date());
	const [isDisable, setIsDisable] = React.useState(false)
	const [time, setTime] = React.useState(0)
	const [loading, setLoading] = React.useState(true); // Added loading state

  React.useEffect(() => {
    // Update the current time every second
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup function to clear the interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

	React.useEffect(() => {
   	if(time > 0){
			setTimeout(() => {
				
					setTime(time - 1)
				
			}, 1000);
		} else if(time == 0){

			setsuccess(false)
			setIsDisable(false)
		}
	return
  }, [time]);

	React.useEffect(() => {
		const fetchWebControl = async() => {
			try {
		
				const result: disabledform[] = await fetchDisabledForm() || []
				const filteredResult = result[0]
				setcontrol(filteredResult)
				console.log('yo:', filteredResult)
				setLoading(false); // Set loading to false after data is fetched

			} catch(error) {
				setLoading(false); // Set loading to false in case of error

			}
		}
		fetchWebControl()
		
	},[])



	const handleSwitchChange = async () => {
    try {
      // Assuming you want to toggle the state and update it on some action
      const updatedSwitchState = !control?.disabled;
      setcontrol((prev) => ({...prev!, disabled: updatedSwitchState}));
			console.log(updatedSwitchState)
			
    } catch (error) {
      console.error('Error updating switch state:', error);
    }
  };

	const submit = async() => {

		try {
			setsubmitted(true)

			if(control?.text.length === 0){
				return
			}
			const disableForm = doc(db, 'webcontrol', control?.id || '')
			const formData = {
				id: control?.id,
				disabled: control?.disabled,
				date: currentTime.toLocaleString(),
				text: control?.text
				
			}
			console.log(formData)
			await updateDoc(disableForm, formData).then(() => {
				setsubmitted(false)
				setIsDisable(true)
				setTime(10)
				console.log('success')
				setsuccess(true)
			})

		} catch(error){
			setsubmitted(false)
		}
	}

	if (loading) {
    return <div className='container'><div style = {{flexDirection: 'column', marginLeft: 300, display: 'flex',width: '100%', height: '100vh', justifyContent: 'center', alignItems: 'flex-start'}}></div>Loading...</div>;
  }

  return (
    <div className='container'>
        <div style = {{flexDirection: 'column', marginLeft: 300, display: 'flex',width: '100%', height: '100vh', justifyContent: 'center', alignItems: 'flex-start'}}>
				<Card sx={{margin: 1, width: '50%', flexDirection: 'column', display: 'flex'}}>
					<CardContent  sx = {{display: 'flex', flexDirection: 'column'}}>
						{success && 
							<Alert severity= {control?.disabled ? 'warning' : 'success'} variant='standard'>Sucess! form is now {control?.disabled ? 'disabled, users will not be able to submit new form': 'enabled, user will be able to submit new form'}
						</Alert>
						}
							<h1>WEB CONTROL</h1>
							<Stack>
								<h3>Date and Time</h3>
								<h4>{currentTime.toLocaleString()}</h4>
							</Stack>
							<Stack>
								<h3>Maintenance/Disable Form</h3>
								<Stack direction={'row'} sx={{justifyItems: 'center', alignItems: 'center'}}>
								<Switch
									disabled = {isDisable}
									defaultChecked = {control.disabled}
									value={control.disabled}
									onChange={handleSwitchChange}
								/>
								<p>{control.disabled ? 'Disabled': 'Enabled'}</p>
								</Stack>
								
							</Stack>
							<Stack>
								<h3>Reason</h3>
								<TextField
											disabled = {isDisable}
											sx={{width: '100%'}}
											multiline
											type='text'
											placeholder='Enter Reason'
											value={control?.text}
											onChange={(e) => {
												setcontrol((prev) => ({...prev, text: e.target.value}));
											}}
											error = {submitted && control.text.length === 0}
											helperText = {submitted && control.text.length === 0 && 'Field must not be empty'}
									/>
							</Stack>
							<br/>
							<Button disabled = {isDisable} onClick={submit} variant='contained'>{time > 0 ? time : 'Submit'}</Button>
					</CardContent>
				</Card>
				</div>
    </div>
  )
}