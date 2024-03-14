import { Button, Card, CardContent, CircularProgress, Input, MenuItem, Modal, Select, Stack, Switch, TextField, Typography } from '@mui/material'
import { Timestamp, addDoc, collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { generateRandomKey } from '../../../../firebase/function';
import React, { useState } from 'react'
import { appuserdata, inventory } from 'types/interfaces';
import Papa from 'papaparse';
import { db } from '../../../../firebase/index';
import { menu } from '../Inventory';
import SettingTable from './content/userTable';
import Form from './content/form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

interface appcontrol {
	id: string,
	disableLogin: string,
}

export default function Settings({}) {

  const [file, setFile] = useState<any | null>(null);
	const [switched, setswitch] = useState<string>('false');
	const [initialSwitchvalue, setinitialSwitchvalue] = useState<appcontrol>()
	const [uploading, setuploading] = useState<boolean>(false);
	const [appuserdata, setuserdata] = useState<appuserdata[]>([])
	const [openUserModal, setopenUserModal] = useState<boolean>(false)
	const [opencreateaccount, setopencreateAccount] = useState<boolean>(false)
	const [modalData, setModalData] = useState<appuserdata>()
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
	const [branch, setbranch] = useState('manilajd')
  const handleFileChange = (e: any) => {
	if (e.target.files && e.target.files.length > 0) {
	  const fileData = e.target.files[0];
	  setFile(fileData);
	}
  };
  const handleSubmit = async () => {
    try {
			setuploading(true)
      if (!file) {
        console.error('No file selected.');
        return;
      }

      const csvData: any = await new Promise((resolve) => {
		Papa.parse(file, {
		  complete: (result) => resolve(result.data),
		  header: true,
		});
	  });
  
	  if (csvData.length === 0) {
		alert('CSV File empty');
		return;
	  }
	  const docRef = collection(db, 'inventory')
  
		csvData.map(async (item: inventory, index: number) => {
			const id = generateRandomKey(25);
			const newItem = {
					...item, 
					active: true, 
					date: Timestamp.fromDate(new Date()),
					docId: id,
					itemname: item.itemname as string ?? "", 
					itemno: +item.itemno ?? 0, 
					stocks: +item.stocks ?? 0, 
					unitprice: +item.unitprice ?? 0,
					unitsales: +item.unitsales ?? 0, 
					branch: item.branch as string ?? "",
			};
			await addDoc(docRef, newItem);
	});

          console.log('Data uploaded successfully');
					setuploading(false)
    } catch (error) {
      console.error('Error:', error);
			setuploading(false)
    }
  };

  React.useEffect(() => {
	const unsubscribe = onSnapshot(collection(db, 'user'), (snapshot) => {
		snapshot.forEach((doc) => {
			const userdata: appuserdata[] = []
			const data = doc.data() as appuserdata
			if (data.branch === branch) {
        userdata.push(data);
      }
			
			setuserdata(userdata)
		})
	});
	return () => unsubscribe();
  },[branch])

	React.useEffect(() => {
		const unsubscribe = onSnapshot(collection(db, 'appcontrol'), (snapshot) => {
			snapshot.forEach((doc) => {
				const appcontroldata: appcontrol[] = []
				const data = doc.data() as appcontrol
				appcontroldata.push(data)
				console.log('uyo',appcontroldata)
				if(appcontroldata.length > 0){
					setswitch(appcontroldata[0].disableLogin)
					setinitialSwitchvalue(appcontroldata[0])
				}
			})
		});
		return () => unsubscribe();
		},[])
	

	const disableLogin = async() => {
		try {
			const disableForm = doc(db, 'appcontrol', initialSwitchvalue?.id || '')
			const formData = {
				id: initialSwitchvalue?.id || '',
				disableLogin: switched
				
			}
			await updateDoc(disableForm, formData)
			alert(`App is now ${switched === 'true' ? 'Disabled': 'Enabled'}`)

		} catch(err) {
			console.log(err)
		}
	}
  

  return (
    <div className='container'>
    <div style = {{flexDirection: 'column', marginLeft: 300, display: 'flex',width: '100%', height: '100vh', justifyContent: 'flex-start', alignItems: 'flex-start', backgroundColor: '#d9d9d9'}}>
    <Card sx={{margin: 1, marginTop: 5, width: '50%', flexDirection: 'column', display: 'flex',}}>
        <CardContent sx = {{padding: 5}}>
            <h1>ADMIN SETTINGS</h1>
            <Stack>
							<h4 style = {{marginBlockEnd: 0}}>
								UPLOAD MASS INVENTORY ITEMS
							</h4>
							<p>This might replace all items in your inventory</p>
							<TextField
								type = 'file'
								inputProps={{ accept: 'text/csv' }}
								style={{width: '50%'}}
								onChange={handleFileChange}
							/>
							<br/>
							<Button onClick={handleSubmit} variant='contained' sx = {{width: '30%', backgroundColor: '#30BE7A', fontWeight: 'bolder'}} disabled = {file === null} >CONFIRM UPLOAD</Button>
            </Stack>
						<Stack>
						<h4 style = {{marginBlockEnd: 0}}>
								DISABLE APP USAGE
						</h4>
						<p>This will signout all users from the app</p>
						<Switch
								checked = {switched === 'true' ? true : false}
								onChange={() => {setswitch(prevState => prevState === 'true' ? 'false' : 'true')}}
								sx={{
									width: 100,
									height: 45,
									justifyContent: 'center',
									alignItems: 'center',
									padding: 1,
									
									'& .MuiSwitch-switchBase': {
										color: '#fff',
										marginLeft: .6,
									},
									'& .Mui-checked': {
										color: 'red', // Color when switch is checked
										width: '100%',
										'&:hover': {
											backgroundColor: '#00000000', // Hover color when switch is checked
										},
									},
									'& .Mui-checked + .MuiSwitch-track': {
										backgroundColor: '#30BE7A', // Track color when switch is checked
										borderRadius: 100,
										display: 'flex',
										justifyContent: 'flex-end',
										alignItems: 'flex-end',
									},
									'& .MuiSwitch-track': {
										backgroundColor: '#000', // Track color when switch is checked
										borderRadius: 100,
										display: 'flex',
										justifyContent: 'flex-start',
										alignItems: 'flex-start',
									},
									'& .MuiSwitch-thumb': {
										backgroundColor: '#fff', // Thumb color
										boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.16)', // Thumb shadow
										width: 20,
										height: 20,
										marginTop: .3,
										alignSelf: 'center'

									},
								}}
							/>
							<br/>
							<Button onClick={disableLogin} variant='contained' sx = {{width: '30%', backgroundColor: '#30BE7A', fontWeight: 'bolder'}} disabled = {initialSwitchvalue?.disableLogin == switched} >CONFIRM ACTION</Button>
						</Stack>
						<Stack>
							<h4 style = {{marginBlockEnd: 0}}>APP USER SETTINGS</h4>
							<p>Edit, Add, or Delete Users per branch</p>
							<Select 
								defaultValue={'manilajd'}
								sx={{width: 200, marginBottom: 3, borderWidth: 0, backgroundColor: '#fff', fontWeight: 700}}
								onChange={(e) => setbranch(e.target.value)}
							>
									{menu.map((item, index) => (<MenuItem value = {item} key={index}>{item.toUpperCase()}
									</MenuItem>
									))}
						</Select>
						<Button onClick={() => setopenUserModal(true)} variant='contained' sx = {{width: '30%', backgroundColor: '#30BE7A', fontWeight: 'bolder'}}>View Users</Button>
						</Stack>
        </CardContent>
    </Card>
    </div>
		<Modal
			 component={'feDropShadow'}
			 open = {uploading}
			 onClose={() => setuploading(false)}
			 sx={{overflowY: 'scroll'}}
		>
			<Card>
				<CardContent sx={{padding: 10}}>
					<Stack>
						<CircularProgress size={50}/>
						<h1>Uploading new Items...</h1>
					</Stack>
				</CardContent>
			</Card>
		</Modal>
		<Modal
			 component={'feDropShadow'}
			 open = {openUserModal}
			 onClose={() => setuploading(false)}
			 sx={{overflowY: 'scroll', width: '100%'}}
		>
					<Stack sx={{justifyContent: 'center', alignItems: 'center', display: 'flex', marginTop: 20}}>
					<Button onClick={() => setopencreateAccount(true)} variant='contained' sx = {{width: '10%', backgroundColor: '#30BE7A', fontWeight: 'bolder', marginTop: 10, alignSelf: 'flex-start', margin: 5}}>Create Account</Button>

						<SettingTable data = {appuserdata} handleView={(e) =>{ setModalData(e); setIsModalOpen(true); }} />
						<Button onClick={() => setopenUserModal(false)} variant='contained' sx = {{width: '30%', backgroundColor: '#30BE7A', fontWeight: 'bolder', marginTop: 10}}>GO BACK</Button>
					</Stack>
		</Modal>
		<Modal
			 component={'feDropShadow'}
			 open = {opencreateaccount}
			 onClose={() => setopencreateAccount(false)}
			 sx={{overflowY: 'scroll', width: '100%'}}
		>	
					<Stack sx={{justifyContent: 'center', alignItems: 'center', display: 'flex', marginTop: 20}}>
					<Form />
					<FontAwesomeIcon onClick={() => setopencreateAccount(false)} icon={faClose} style={{color: '#fff', position: 'absolute', top: 20, right: 20, cursor: 'pointer', width: 25, height: 25}} />

					</Stack>
		</Modal>
        <Modal
            component={'feDropShadow'}
            open = {isModalOpen}
            onClose={() => setModalData(undefined)}
            sx={{overflowY: 'scroll'}}
            
        >
           <Stack sx={{justifyContent: 'center', alignItems: 'center', display: 'flex', marginTop: 20}}>
                <Form modalData={modalData} />
                <FontAwesomeIcon onClick={() => setIsModalOpen(false)} icon={faClose} style={{color: '#fff', position: 'absolute', top: 20, right: 20, cursor: 'pointer', width: 25, height: 25}} />
           </Stack>
        </Modal>
    </div>
  )
}