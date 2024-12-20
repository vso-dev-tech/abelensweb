import { Button, Card, CardContent, MenuItem, Select, Stack, TextField } from '@mui/material';
import React, { useContext } from 'react'
import FormHeader from 'screens/components/FormHeader';
import { inventory } from 'types/interfaces';
import {Timestamp} from "firebase/firestore";
import { AuthContext } from 'auth';
import { doc, getDoc, updateDoc } from '@firebase/firestore';
import { db } from '../../../../../firebase/index';
import { generateRandomKey } from '../../../../../firebase/function';
type Props = {
    onClick: () => void,
	modalData: inventory|  null | undefined,
	onSubmit: () => void,
	length: number,
	selectedBranch: string,

}

const menu: string[] = [
	'manilajd',
	'nicolasabelrdo',
	'plantationsports',
	'amor trophies',
	'isabela',
	'kenns',
]

export default function Form({onClick, modalData, onSubmit, length, selectedBranch}: Props) {

    const {currentUser} = useContext(AuthContext)
    const [opensuccess] = React.useState<boolean>(false)
    const [submitted] = React.useState<boolean>(false)
    const [form, setform] = React.useState<inventory>({
        active: modalData?.active || true,
        date:modalData?.date || Timestamp.fromDate(new Date()),
        docId:modalData?.docId || '',
        itemname: modalData?.itemname ||'',
        itemno: modalData?.itemno || length + 1,
        stocks: modalData?.stocks ||1,
        unitprice: modalData?.unitprice ||1,
        unitsales: modalData?.unitsales ||0,
		branch: modalData?.branch || selectedBranch ||'Abelens',
		supplier: modalData?.supplier || 'manilajd',
		sellingprice: modalData?.sellingprice || 0
    })

    const submit = async () => {
		try {
			const id = generateRandomKey(20);
			const branchRef = doc(db, form.branch, form.supplier);
	
			// Get the current data from the 'branch' document
			const branchDoc = await getDoc(branchRef);
			if (branchDoc.exists()) {
				const data = branchDoc.data();
				const newData = {
					...data,
					data: [...(data.data || []), {
						active: true,
						date: new Date(),
						docId: id,
						itemname: form.itemname,
						itemno: form.itemno,
						stocks: form.stocks,
						unitprice: form.unitprice,
						unitsales: 0,
						sellingprice: form.sellingprice,
						branch: form.branch,
						supplier: form.supplier
					}],
				};
					await updateDoc(branchRef, newData);

				alert('Successfully added to inventory!');
				// Reset the form fields
				setform({
					active: true,
					date: Timestamp.fromDate(new Date()),
					docId: '',
					itemname: '',
					itemno: 0,
					stocks: 1,
					unitprice: 1,
					unitsales: 0,
					branch: form.branch,
					supplier: form.supplier,
					sellingprice: 0,
				});
				onSubmit()
			} else {
				console.error('Branch document does not exist.');
			}
		} catch (err) {
			console.error('Error adding document:', err);
		}
	};

	const submitedit = async () => {
		try {
			const branchRef = doc(db, form.branch, form.supplier);
	
			const branchDoc = await getDoc(branchRef);
			if (branchDoc.exists()) {
				const data = branchDoc.data();
				const existingData: inventory[]  = data.data || [];
	
				const index = existingData.findIndex(item => item.docId === form.docId);
				if (index !== -1) {
					// Update the item in the existing data array
					existingData[index] = {
						...existingData[index],
						itemname: form.itemname,
						itemno: form.itemno,
						stocks: form.stocks,
						unitprice: form.unitprice,
						sellingprice: form.sellingprice,
						active: form.active,
						branch: form.branch,
						supplier: form.supplier
					};
	
					await updateDoc(branchRef, { data: existingData });
					setform({
						active: true,
						date: Timestamp.fromDate(new Date()),
						docId: '',
						itemname: '',
						itemno: 0,
						stocks: 1,
						unitprice: 1,
						unitsales: 0,
						branch: form.branch,
						supplier: form.supplier,
						sellingprice: 0,
					});
					onSubmit()
					alert('Successfully updated inventory item!');
				} else {
					console.error('Item to update not found in data array.');
				}
			} else {
				console.error('Branch document does not exist.');
			}
		} catch (err) {
			console.error('Error updating document:', err);
		}
	};

	const deleteitem = async () => {
		try {
			const branchRef = doc(db, form.branch, form.supplier);
	
			const branchDoc = await getDoc(branchRef);
			if (branchDoc.exists()) {
				const data = branchDoc.data();
				const existingData: inventory[]  = data.data || [];
	
				const index = existingData.findIndex(item => item.docId === form.docId);
				if (index !== -1) {
					// Update the item in the existing data array
					existingData[index] = {
						...existingData[index],
						itemname: form.itemname,
						itemno: form.itemno,
						stocks: form.stocks,
						unitprice: form.unitprice,
						sellingprice: form.sellingprice,
						active: false,
						branch: form.branch,
						supplier: form.supplier
					};
					
					// Update the 'data' field in the document
					await updateDoc(branchRef, { data: existingData });
					setform({
						active: true,
						date: Timestamp.fromDate(new Date()),
						docId: '',
						itemname: '',
						itemno: 0,
						stocks: 1,
						unitprice: 1,
						unitsales: 0,
						branch: form.branch,
						supplier: form.supplier,
						sellingprice: 0,
					});
					onSubmit()
					alert('Successfully updated inventory item!');
				} else {
					console.error('Item to update not found in data array.');
				}
			} else {
				console.error('Branch document does not exist.');
			}
		} catch (err) {
			console.error('Error updating document:', err);
		}
	};






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
						<p>vsodev tech</p>
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
						{form.docId !== '' && <Button sx={{backgroundColor: 'red', fontWeight: 'bold'}} onClick={() => deleteitem()} fullWidth variant='contained'>REMOVE ITEM </Button>}

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
										defaultValue={form.branch}
										value = {form.branch}
										onChange={(e) => setform((prev: inventory) => ({
											...prev,
											branch: (e.target.value),
										}))}
										>
										    <MenuItem value = {'Abelens'} key = {0} >Abelens Branch</MenuItem>
           									<MenuItem value = {'Nepo'} key ={1}>Nepo Branch</MenuItem>	
										</Select>
							</Stack>
							<Stack sx={{width: '100%'}}  direction="column" spacing={2} marginTop={2}>
									<FormHeader inputLabel = 'Supplier' />
									<Select 
										defaultValue={'manilajd'}
										value = {form.supplier}
										onChange={(e) => setform((prev: inventory) => ({
											...prev,
											supplier: (e.target.value),
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
							<Stack sx={{width: '100%'}}  direction="column" spacing={2} marginTop={2}>
									<FormHeader inputLabel = 'Selling Price' />
									<TextField
											sx={{width: '100%'}}
											type='number'
											placeholder='Enter Selling Price'
											value={form.sellingprice}
											onChange={(e) => setform((prev: inventory) => ({
                                                ...prev,
                                                sellingprice: parseInt(e.target.value),
                                              }))}
											error = {submitted && form.sellingprice === 0}
											helperText = {submitted && form.sellingprice === 0 && 'Field must not be empty'}
									/>
							</Stack>
						<Stack justifyContent={'center'}  alignItems={'center'} direction="column" spacing={2} marginTop={2}>

							<Button sx={{backgroundColor: '#30BE7A', fontWeight: 'bold'}} onClick={() => {
								if (form.docId !== '') {
									submitedit();
									
								} else {
									submit();
								}
							}} fullWidth variant='contained'>SUBMIT</Button>
						</Stack>
					</CardContent>
        </Card>
				</div>
				)}
    </div>
  )
}