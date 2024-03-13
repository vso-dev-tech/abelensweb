import { Button, Card, CardContent, MenuItem, Select, Stack, TextField } from '@mui/material';
import React, { useContext, useState } from 'react'
import FormHeader from 'screens/components/FormHeader';
import { inventory } from 'types/interfaces';
import {Timestamp} from "firebase/firestore";
import { AuthContext } from 'auth';
import { collection, onSnapshot, doc, setDoc } from '@firebase/firestore';
import { db } from '../../../../../firebase/index';
import { generateRandomKey } from '../../../../../firebase/function';
type Props = {
    onClick: () => void,
		modalData: inventory|  null | undefined

}

const menu: string[] = [
	'manilajd',
	'nicolasabelrdo',
	'plantationsports',
	'amor trophies',
	'isabela',
	'kenns',
]

export default function Form({onClick, modalData}: Props) {

    const {currentUser} = useContext(AuthContext)
    const [opensuccess, setopensuccess] = React.useState<boolean>(false)
    const [submitted, setsubmitted] = React.useState<boolean>(false)
		const [csv, setcsv] = React.useState<inventory[]>([])
    const [form, setform] = React.useState<inventory>({
        active: modalData?.active || true,
        date:modalData?.date || Timestamp.fromDate(new Date()),
        docId:modalData?.docId || '',
        itemname: modalData?.itemname ||'',
        itemno:modalData?.itemno || 0,
        stocks: modalData?.stocks ||1,
        unitprice: modalData?.unitprice ||1,
        unitsales: modalData?.unitsales ||0,
				branch: modalData?.branch ||'manilajd',
    })

    const submit = async() => {
			try {
				const id = generateRandomKey(20)
				const formRef = doc(db, 'inventory', id)
				await setDoc(formRef, {
					active: true,
					date: new Date(),
					docId: id,
					itemname: form.itemname,
					itemno: form.itemno,
					stocks: form.stocks,
					unitprice: form.unitprice,
					unitsales: 0,
					branch: form.branch,
			}).then((res) => {
					console.log(res)
					alert('Successfully added to inventory!')
					setform({
						active: true,
						date: Timestamp.fromDate(new Date()),
						docId: '',
						itemname: '',
						itemno: 0,
						stocks: 1,
						unitprice: 1,
						unitsales: 0,
						branch: 'manilajd',
					})
				})
				

			} catch (err) {
				console.log(err)
			}
    }

	React.useEffect(() => {
		if(form.itemno == 0){
    const unsubscribe = onSnapshot(collection(db, 'inventory'), (snapshot) => {
        let maxItemNo: number = 0; 
        snapshot.forEach((doc) => {
            const data = doc.data() as inventory;
            if (data.itemno > maxItemNo) {
                maxItemNo = data.itemno;
            }
        });
				const newItemNo = Math.floor(maxItemNo + 1);
        setform((prev) => ({...prev, itemno: newItemNo})); 
				console.log(newItemNo);

    });

    	return () => unsubscribe();
		} else {
			return
		}
}, []);





  return (
    <div style = {{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 75}}>
    {opensuccess ? (
    <div style = {{display: 'flex',width: currentUser === null ? '90%' : '80%', marginLeft: currentUser === null ? 0: 150, height: '100vh', justifyContent: 'center', alignItems: 'center',}}>
					<Card sx={{margin: 1, height: '75%', width: '100%', flexDirection: 'column', display: 'flex',}}>
					<CardContent sx={{ height: '100%', textAlign: 'center',width: '95%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
					
							<h1>
								Successfully Added
							</h1>
							<h4 style = {{marginBlockStart: 0, marginBlockEnd: 0}}>Item</h4>
							<h3>{form.itemname}</h3>
							<Stack justifyContent={'center'}  alignItems={'center'} direction="column" spacing={2} marginTop={2}>
							<Button sx={{backgroundColor: '#d9d9d9', fontWeight: 'bold'}} onClick={onClick} variant='contained'>GO BACK</Button>
						</Stack>
						<p>Vidarsson Online</p>
						</CardContent>
					</Card>
					</div>
					) 
					: 
					(
					<div style = {{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%'}}>
					<Card sx={{margin: 1, width: '50%', flexDirection: 'column', display: 'flex'}}>
					<br/>
					<CardContent sx = {{display: 'flex', flexDirection: 'column'}}>
						<h1>
							ADD INVENTORY
						</h1>
						<h4>Item No. {form.itemno}</h4>
						<Stack sx={{width: '100%'}} direction="column" spacing={2} marginTop={2}>
							<FormHeader inputLabel = 'Date' required />
									<TextField
											sx={{width: '100%'}}
											type='text'
											value = {form.date.toDate().toLocaleDateString()}
											disabled = {true}
											
									/>
							</Stack>
							<Stack sx={{width: '100%'}}  direction="column" spacing={2} marginTop={2}>
									<FormHeader inputLabel = 'Branch' />
									<Select 
										defaultValue={'manilajd'}
										value = {form.branch}
										onChange={(e) => setform((prev: inventory) => ({
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
									<FormHeader inputLabel = 'Item Name' />
									<TextField
											sx={{width: '100%'}}
											type='text'
											placeholder='Enter Item Name'
											value={form.itemname}
											onChange={(e) => setform((prev: inventory) => ({
                                                ...prev,
                                                itemname: e.target.value,
                                              }))}
											error = {submitted && form.itemname.length === 0}
											helperText = {submitted && form.itemname.length === 0 && 'Field must not be empty'}
									/>
							</Stack>
							<Stack sx={{width: '100%'}}  direction="column" spacing={2} marginTop={2}>
									<FormHeader inputLabel = 'Stocks' />
									<TextField
											sx={{width: '100%'}}
											type='number'
											placeholder='Enter Number of stocks'
											value={form.stocks}
											onChange={(e) => setform((prev: inventory) => ({
                                                ...prev,
                                                stocks: parseInt(e.target.value),
                                              }))}
											error = {submitted && form.stocks === 0}
											helperText = {submitted && form.stocks === 0 && 'Field must not be empty'}
									/>
							</Stack>
							<Stack sx={{width: '100%'}}  direction="column" spacing={2} marginTop={2}>
									<FormHeader inputLabel = 'Unit Price' />
									<TextField
											sx={{width: '100%'}}
											type='number'
											placeholder='Enter Unit Price'
											value={form.unitprice}
											onChange={(e) => setform((prev: inventory) => ({
                                                ...prev,
                                                unitprice: parseInt(e.target.value),
                                              }))}
											error = {submitted && form.unitprice === 0}
											helperText = {submitted && form.unitprice === 0 && 'Field must not be empty'}
									/>
							</Stack>
						<Stack justifyContent={'center'}  alignItems={'center'} direction="column" spacing={2} marginTop={2}>
							<Button sx={{backgroundColor: '#30BE7A', fontWeight: 'bold'}} onClick={submit} fullWidth variant='contained'>SUBMIT</Button>
						</Stack>
					</CardContent>
        </Card>
				</div>
				)}
    </div>
  )
}