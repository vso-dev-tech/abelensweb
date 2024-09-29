import { Button, Card, CardContent, CircularProgress, Divider, Modal, Stack, TextField } from '@mui/material'
import React from 'react'
import SalesInventory from './salesinventory'
import SalesTable from './salestable'
import currentUser from 'global/redux/reducers/userReducer'
import { inventory, salesdetails } from 'types/interfaces'
import { db } from '../../../../../firebase/index'
import { generateRandomKey } from '../../../../../firebase/function'
import {addDoc, collection,getDocs, setDoc, getDoc, orderBy, query, limit, doc} from 'firebase/firestore'
import { AuthContext } from 'auth'
import { faCartPlus, faClose, faPercent } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
type Props = {}

export default function AddSales({}: Props) {

    const [selecteditem, setselecteditem] = React.useState<inventory[]>([]);
    const {currentUser} = React.useContext(AuthContext)
    const [openDiscount, setOpenDiscount] = React.useState<boolean>(false)
    const [discount, setdiscount] = React.useState<number>(0)
		const [total, setotal] = React.useState<number[]>([])
    const [submittext, setsubmittext] = React.useState<string>('')
    const [issubmitting, setissubmitting] = React.useState<boolean>(false)
    const [excess, setexcess] = React.useState(false)

    const removeItem = (itemnoToRemove: number) => {
      const indexToRemove = selecteditem.slice().reverse().findIndex(item => item.itemno === itemnoToRemove);
      if (indexToRemove !== -1) {
        const updatedSelectedItems = [...selecteditem];
        updatedSelectedItems.splice(updatedSelectedItems.length - 1 - indexToRemove, 1);
        setselecteditem(updatedSelectedItems);
      }
    }

    const removeAllItem = (itemnoToRemove: number) => {
      console.log(itemnoToRemove)
      console.log(selecteditem)
      const updatedSelectedItems = selecteditem.filter((item) => {console.log('tangina', item.itemno); return item.itemno !== itemnoToRemove});
      console.log(updatedSelectedItems)
      setselecteditem(updatedSelectedItems);
    };

    const groupedItems: { [itemno: string]: inventory[] } = {};
					selecteditem.forEach(item => {
						if (!groupedItems[item.itemno]) {
							groupedItems[item.itemno] = [item];
						} else {
							groupedItems[item.itemno].push(item);
						}
	});

    React.useEffect(() => {
		const newTotals = Object.keys(groupedItems).map(item => {
			const items = groupedItems[item];
			// Calculate the total price for all items in the group
			const totalPrice = items.reduce((acc, currentItem) => {
				return currentItem.sellingprice * items.length;
			}, 0);
			return Math.floor(totalPrice);
		});
		setotal(newTotals);
	}, [selecteditem]);

    const totalSum = total.reduce((acc, currentValue) => acc + currentValue, 0);
	const withDiscount = totalSum - discount


    const submit = async () => {
        const id = generateRandomKey(25);
        setissubmitting(true);
        setsubmittext('updating stocks');
      
        if (withDiscount > 0) {
          try {
            
            let highesttransId = 0;
            const salesQuerySnapshot = await getDocs(query(collection(db, 'sales'), orderBy('transId', 'desc'), limit(1)));
            salesQuerySnapshot.forEach(doc => {
              highesttransId = doc.data().transId;
            });
      
            let totalItemCount = 0;
      
            for (const key in groupedItems) {
              if (groupedItems.hasOwnProperty(key)) {
                const items = groupedItems[key];
                const itemCount = items.length;
                totalItemCount += itemCount;
                const updatedStocks = items[0].stocks - itemCount;
                const sold = items[0].unitsales;
      
                const salesDetailPromises = Object.values(items.reduce((acc: { [key: string]: salesdetails[] }, currentItem: inventory) => {
                  const detsid = generateRandomKey(20);
                  const key = currentItem.itemno; 
      
                  if (!acc[key]) {
                    acc[key] = [];
                  }
      
                  acc[key].push({
                    transId: highesttransId + 1,
                    docId: detsid,
                    unit: itemCount,
                    itemno: currentItem.itemno.toString(),
                    itemname: currentItem.itemname,
                    unitprice: currentItem.unitprice,
                    sellingprice: currentItem.sellingprice,
                  });
                  return acc;
                }, {} as { [key: string]: salesdetails[] })).map(async (items: salesdetails[]) => {
                  try {
                    await Promise.all(items.map(async (item) => {

                      await setDoc(doc(db, 'salesdetails', item.docId), {
                        transId: item.transId,
                        docId: item.docId,
                        unit: item.unit,
                        itemno: item.itemno,
                        itemname: item.itemname,
                        unitprice: item.unitprice
                      });
                    }));
                    console.log('Sales details added successfully');
                  } catch (error) {
                    console.error('Error adding sales details:', error);
                  }
                });
      
                await Promise.all(salesDetailPromises);
      
                await Promise.all(items.map(async (item) => {
                  const branchDocRef = doc(collection(db, item.branch || 'inventory'), item.supplier);
                  const docSnapshot = await getDoc(branchDocRef);
      
                  if (docSnapshot.exists()) {
                    const branchData = docSnapshot.data() as inventory;
      
                    if (Array.isArray(branchData.data)) {
                      const updatedData = branchData.data.map((dataItem) => {
                        console.log('Processing dataItem:', dataItem);
                        if (dataItem.docId === item.docId) {
                          console.log('Updating dataItem:', dataItem);
                          const updatedUnitsales = dataItem.unitsales + items.length;
                          console.log('New value of unitsales:', updatedUnitsales);
                          return {
                            ...dataItem,
                            stocks: updatedStocks,
                            unitsales: updatedUnitsales
                          };
                        }
                        return dataItem;
                      });
      
                      await setDoc(branchDocRef, { data: updatedData }, { merge: true });
                      console.log('Document updated successfully');
                    } else {
                      console.error('Document data is not an array or does not exist');
                    }
                  } else {
                    console.error('Document does not exist');
                  }
                }));
              }
            }
      
            setsubmittext('updating sales');
      
            // Add sales document
            await addDoc(collection(db, 'sales'), {
              transId: highesttransId + 1,
              docId: id,
              branch: currentUser?.branch,
              date: new Date(),
              total: withDiscount,
              noitem: totalItemCount,
              discount: discount,
              subtotal: totalSum,
              staffId: currentUser?.uid
            });
      
            setsubmittext('Successfully Added Sales!');
						setissubmitting(false);
            setselecteditem([]);
          } catch (error) {
            console.log(error);
            setissubmitting(false);
            alert('Something went wrong, please contact your administrator');
          }
        } else {
         alert("Please add at least 1 item");
          setissubmitting(false);
        }
      };

      const handleAddItem = (item: inventory) => {
        const existingItemCount = selecteditem.filter((selectedItem) => selectedItem.itemno === item.itemno).length;
        const availableStock = item.stocks - existingItemCount;
        if (availableStock > 0) {
          setselecteditem((prev) => [...prev, item]);
        } else {
          setexcess(true)
          alert('Selected item is out of stock or not available.');
          setexcess(false)
        }
      };


  return (
    <div style = {{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 75, width: '100%'}}>
    <Card sx={{ height: 1100, flexDirection: 'column', display:'flex'}}>
        <CardContent style = {{padding: 25, flexDirection: 'row', display:'flex'}}>
            <SalesInventory returnexcess = {(e) => setexcess(e)} excess = {excess} data = {handleAddItem}/>
            <br/>
            <Divider/>
            <br/>
            <Stack >
            <div style={{alignSelf: 'flex-end', marginRight: 5, marginTop: 5, flexDirection: 'column', display: 'flex', justifyContent: 'space-between', width: '100%',}}>
                
            <SalesTable removeAllItem={(e) => removeAllItem(e)} removeItem={(e) => removeItem(e)} data = {selecteditem}/>
            <Stack sx = {{width: '100%', justifyContent: 'space-between', alignItems: 'flex-end', flexDirection: 'row'}}>
            <Stack sx = {{flexDirection: 'row', marginRight: 0}}>
            <Button onClick={submit} variant='contained' sx={{height: 150, width: 150, background: '#30BE7A', flexDirection:'column', color: '#fff', fontWeight: 'bold', fontSize: 12, marginLeft: 5}}><FontAwesomeIcon icon={faCartPlus} color='#FFF' style={{width: 65, height: 65}} />ADD SALES</Button>
            <Button onClick={() => setOpenDiscount(true)} variant='contained' sx={{height: 150, width: 150, background: 'orange', flexDirection:'column', color: '#fff', fontWeight: 'bold', fontSize: 12, marginLeft: 5}}><FontAwesomeIcon icon={faPercent} color='#fff' style={{width: 65, height: 65}} />ADD Discount</Button>

            </Stack>
            <Stack sx = {{flexDirection: 'row', marginLeft: 5, width: '100%',justifyContent: 'space-between'}}>
            <Stack>
                <h4>Subtotal: </h4>
                <h4>Discount: </h4>
                <h1>Total: </h1>
            </Stack>
            <Stack sx={{textAlign: 'right',paddingRight: 5}}>
                <h4>{totalSum}</h4>
                <h4 style={{color: 'red'}}>{discount}</h4>
                <h1>{withDiscount > 0 ? withDiscount : totalSum}</h1>
            </Stack>
            </Stack>
            </Stack>
            
        </div>
            </Stack>
        </CardContent>
        
    </Card>
    <Modal open = {openDiscount} >
      <div style = {{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 75, width: '100%'}}>
				<Card sx={{ width: 500, height: 500, flexDirection: 'column', display:'flex', justifyContent: 'center', alignItems: 'center',}}>
					<CardContent sx={{padding: 2, width: '80%',justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
						<h1>ADD DISCOUNT</h1>
						<TextField
							value={`₱${discount.toFixed(1)}`} // Assuming you want to display up to 2 decimal places
							onChange={(e) => {
									const parsedValue = parseFloat(e.target.value.replace(/[^\d.]/g, '')); // Allow decimal points as well
									if (!isNaN(parsedValue)) {
											setdiscount(parsedValue);
									}
							}}
							size='medium'
							sx={{ width: '90%', height: 75, fontSize: 50, }}
							/>
							<Button onClick={() => setOpenDiscount(false)} variant='contained' sx={{ background: 'orange', flexDirection:'column', color: '#fff', fontWeight: 'bold', fontSize: 12}}>ADD DISCOUNT</Button>
							<Button onClick={() => {setOpenDiscount(false); setdiscount(0)}} variant='contained' sx={{ background: 'red', flexDirection:'column', color: '#fff', fontWeight: 'bold', fontSize: 12, marginTop: 1}}>CLOSE</Button>
					</CardContent>
        </Card>
			</div>
    </Modal>
		<Modal open = {issubmitting} >
			<div style = {{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 75, width: '100%'}}>
				<Card>
					<CardContent sx = {{padding: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
						
							<CircularProgress size={50} sx={{marginTop: 2}} />
							<h1>
								{submittext}
							</h1>
					</CardContent>
				</Card>
			</div>
		</Modal>
    </div>
  )
}