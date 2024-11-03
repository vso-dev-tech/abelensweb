import { Button, Card, CardContent, CircularProgress, Divider, Modal, Stack, TextField } from '@mui/material'
import React from 'react'
import SalesInventory from './salesinventory'
import SalesTable from './salestable'
import { inventory, sales } from 'types/interfaces'
import { db } from '../../../../../firebase/index'
import { generateRandomKey } from '../../../../../firebase/function'
import { collection, setDoc, getDoc, doc } from 'firebase/firestore'
import { AuthContext } from 'auth'
import { faCartArrowDown, faCartPlus, faPercent } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function AddSales() {

  const [selecteditem, setselecteditem] = React.useState<inventory[]>([]);
  const { currentUser } = React.useContext(AuthContext)
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
    const updatedSelectedItems = selecteditem.filter((item) => { return item.itemno !== itemnoToRemove });
    setselecteditem(updatedSelectedItems);
  };

  const groupedItems = React.useMemo(() => {
    const groups: { [itemno: string]: inventory[] } = {};
    selecteditem.forEach(item => {
      if (!groups[item.itemno]) {
        groups[item.itemno] = [item];
      } else {
        groups[item.itemno].push(item);
      }
    });
    return groups;
  }, [selecteditem])

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
  }, [groupedItems, selecteditem]);

  const totalSum = total.reduce((acc, currentValue) => acc + currentValue, 0);
  const withDiscount = totalSum - discount


  const submit = async () => {
    const id = generateRandomKey(25); // Unique ID for the sale
    setissubmitting(true);
    setsubmittext('updating stocks');

    if (withDiscount > 0) {
      try {
        let highesttransId = 0;
        const salesRef = doc(db, 'sales1', 'sales'); // Reference to the sales document
        const salesRefSnap = await getDoc(salesRef);

        if (salesRefSnap.exists()) {
          const salesData = salesRefSnap.data().sales || []; // Get the sales array
          highesttransId = Math.max(...salesData.map((data: sales) => data.transId), 0); // Get the highest transId
        }

        let totalItemCount = 0;
        const salesDetailsData = []; // Array to collect new sales details

        for (const key in groupedItems) {
          if (groupedItems.hasOwnProperty(key)) {
            const items = groupedItems[key];
            const itemCount = items.length;
            totalItemCount += itemCount;
            const updatedStocks = items[0].stocks - itemCount;

            for (const currentItem of items) {
              const detsid = generateRandomKey(20);
              salesDetailsData.push({
                transId: highesttransId + 1,
                docId: detsid,
                unit: itemCount,
                itemno: currentItem.itemno.toString(),
                itemname: currentItem.itemname,
                unitprice: currentItem.unitprice,
                sellingprice: currentItem.sellingprice,
              });

              // Reference to the supplier document under the specific branch
              const branchDocRef = doc(collection(db, currentItem.branch || 'inventory'), currentItem.supplier);
              const docSnapshot = await getDoc(branchDocRef);

              if (docSnapshot.exists()) {
                const branchData = docSnapshot.data() as { data: inventory[] }; // Ensure the type matches your structure
                if (Array.isArray(branchData.data)) {
                  // Update the stocks in the array
                  const updatedData = branchData.data.map(dataItem => {
                    if (dataItem.docId === currentItem.docId) {
                      // Update the stocks and unitsales for the matching item
                      return {
                        ...dataItem,
                        stocks: updatedStocks, // Updated stock count
                        unitsales: (dataItem.unitsales || 0) + itemCount, // Increment unit sales
                      };
                    }
                    return dataItem; // Return the unchanged item
                  });

                  // Update the supplier document with the modified array
                  await setDoc(branchDocRef, { data: updatedData }, { merge: true });
                }
              } else {

              }
            }
          }
        }

        setsubmittext('updating sales');

        const newSalesData = { // New sales data to be added
          transId: highesttransId + 1,
          docId: id,
          branch: currentUser?.branch,
          date: new Date(),
          total: withDiscount,
          noitem: totalItemCount,
          discount: discount,
          subtotal: totalSum,
          staffId: currentUser?.uid
        };
        // Retrieve existing sales records
        const salesDocRef = doc(db, 'sales1', 'sales');
        const salesSnapshot = await getDoc(salesDocRef);
        let existingSales = [];

        if (salesSnapshot.exists()) {
          existingSales = salesSnapshot.data().sales || []; // Get existing sales if they exist
        }

        // Combine existing sales with new sales
        const updatedSales = [...existingSales, newSalesData];

        // Save the updated sales back to the document
        await setDoc(salesDocRef, {
          sales: updatedSales
        }, { merge: true }); // Merging will keep existing sales and add new ones

        // Save the sales details as before
        const salesDetailsDocRef = doc(db, 'sales1', 'salesdetails');
        const salesDetailsSnapshot = await getDoc(salesDetailsDocRef);
        let existingDetails = [];

        if (salesDetailsSnapshot.exists()) {
          existingDetails = salesDetailsSnapshot.data().details || []; // Get existing details if they exist
        }

        // Combine existing details with new details
        const updatedSalesDetails = [...existingDetails, ...salesDetailsData];

        // Save the updated sales details back to the document
        await setDoc(salesDetailsDocRef, {
          details: updatedSalesDetails
        }, { merge: true }); // Merging will keep existing details and add new ones

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


  const stashSale = async () => {
    const id = generateRandomKey(25); // Unique ID for the sale
    setissubmitting(true);
    setsubmittext('updating stocks');

    if (withDiscount > 0) {
      try {
        let highesttransId = 0;
        const salesRef = doc(db, 'sales1', 'stash'); // Reference to the sales document
        const salesRefSnap = await getDoc(salesRef);

        if (salesRefSnap.exists()) {
          const salesData = salesRefSnap.data().sales || []; // Get the sales array
          highesttransId = Math.max(...salesData.map((data: sales) => data.transId), 0); // Get the highest transId
        }

        let totalItemCount = 0;
        const salesDetailsData = []; // Array to collect new sales details

        for (const key in groupedItems) {
          if (groupedItems.hasOwnProperty(key)) {
            const items = groupedItems[key];
            const itemCount = items.length;
            totalItemCount += itemCount;
            const updatedStocks = items[0].stocks - itemCount;

            for (const currentItem of items) {
              const detsid = generateRandomKey(20);
              salesDetailsData.push({
                transId: highesttransId + 1,
                docId: detsid,
                unit: itemCount,
                itemno: currentItem.itemno.toString(),
                itemname: currentItem.itemname,
                unitprice: currentItem.unitprice,
                sellingprice: currentItem.sellingprice,
              });

              // Reference to the supplier document under the specific branch
              const branchDocRef = doc(collection(db, currentItem.branch || 'inventory'), currentItem.supplier);
              const docSnapshot = await getDoc(branchDocRef);

              if (docSnapshot.exists()) {
                const branchData = docSnapshot.data() as { data: inventory[] }; // Ensure the type matches your structure
                if (Array.isArray(branchData.data)) {
                  // Update the stocks in the array
                  const updatedData = branchData.data.map(dataItem => {
                    if (dataItem.docId === currentItem.docId) {
                      // Update the stocks and unitsales for the matching item
                      return {
                        ...dataItem,
                        stocks: updatedStocks, // Updated stock count
                        unitsales: (dataItem.unitsales || 0) + itemCount, // Increment unit sales
                      };
                    }
                    return dataItem; // Return the unchanged item
                  });

                  // Update the supplier document with the modified array
                  await setDoc(branchDocRef, { data: updatedData }, { merge: true });
                }
              } else {

              }
            }
          }
        }

        setsubmittext('updating sales');

        const newSalesData = { // New sales data to be added
          transId: highesttransId + 1,
          docId: id,
          branch: currentUser?.branch,
          date: new Date(),
          total: withDiscount,
          noitem: totalItemCount,
          discount: discount,
          subtotal: totalSum,
          staffId: currentUser?.uid
        };
        // Retrieve existing sales records
        const salesDocRef = doc(db, 'sales1', 'stash');
        const salesSnapshot = await getDoc(salesDocRef);
        let existingSales = [];

        if (salesSnapshot.exists()) {
          existingSales = salesSnapshot.data().sales || []; // Get existing sales if they exist
        }

        // Combine existing sales with new sales
        const updatedSales = [...existingSales, newSalesData];

        // Save the updated sales back to the document
        await setDoc(salesDocRef, {
          sales: updatedSales
        }, { merge: true }); // Merging will keep existing sales and add new ones

        // Save the sales details as before
        const salesDetailsDocRef = doc(db, 'sales1', 'salesdetails');
        const salesDetailsSnapshot = await getDoc(salesDetailsDocRef);
        let existingDetails = [];

        if (salesDetailsSnapshot.exists()) {
          existingDetails = salesDetailsSnapshot.data().details || []; // Get existing details if they exist
        }

        // Combine existing details with new details
        const updatedSalesDetails = [...existingDetails, ...salesDetailsData];

        // Save the updated sales details back to the document
        await setDoc(salesDetailsDocRef, {
          details: updatedSalesDetails
        }, { merge: true }); // Merging will keep existing details and add new ones

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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 75, width: '100%' }}>
      <Card sx={{ height: 1100, flexDirection: 'column', display: 'flex' }}>
        <CardContent style={{ padding: 25, flexDirection: 'row', display: 'flex' }}>
          <SalesInventory returnexcess={(e) => setexcess(e)} excess={excess} data={handleAddItem} />
          <br />
          <Divider />
          <br />
          <Stack >
            <div style={{ alignSelf: 'flex-end', marginRight: 5, marginTop: 5, flexDirection: 'column', display: 'flex', justifyContent: 'space-between', width: '100%', }}>

              <SalesTable removeAllItem={(e) => removeAllItem(e)} removeItem={(e) => removeItem(e)} data={selecteditem} />
              <Stack sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-end', flexDirection: 'row' }}>
                <Stack sx={{ flexDirection: 'row', marginRight: 0 }}>
                  <Button onClick={stashSale} variant='contained' sx={{ height: 150, width: 150, background: '#F98B88 ', flexDirection: 'column', color: '#fff', fontWeight: 'bold', fontSize: 12, marginLeft: 5, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}><FontAwesomeIcon icon={faCartArrowDown} color='#FFF' style={{ width: 65, height: 65, marginRight: 5 }} />STASH SALES</Button>
                  <Button onClick={submit} variant='contained' sx={{ height: 150, width: 150, background: '#30BE7A', flexDirection: 'column', color: '#fff', fontWeight: 'bold', fontSize: 12, marginLeft: 5 }}><FontAwesomeIcon icon={faCartPlus} color='#FFF' style={{ width: 65, height: 65 }} />ADD SALES</Button>
                  <Button onClick={() => setOpenDiscount(true)} variant='contained' sx={{ height: 150, width: 150, background: 'orange', flexDirection: 'column', color: '#fff', fontWeight: 'bold', fontSize: 12, marginLeft: 5 }}><FontAwesomeIcon icon={faPercent} color='#fff' style={{ width: 65, height: 65 }} />ADD Discount</Button>

                </Stack>
                <Stack sx={{ flexDirection: 'row', marginLeft: 5, width: '100%', justifyContent: 'space-between' }}>
                  <Stack>
                    <h4>Subtotal: </h4>
                    <h4>Discount: </h4>
                    <h1>Total: </h1>
                  </Stack>
                  <Stack sx={{ textAlign: 'right', paddingRight: 5 }}>
                    <h4>{totalSum}</h4>
                    <h4 style={{ color: 'red' }}>{discount}</h4>
                    <h1>{withDiscount > 0 ? withDiscount : totalSum}</h1>
                  </Stack>
                </Stack>
              </Stack>

            </div>
          </Stack>
        </CardContent>

      </Card>
      <Modal open={openDiscount} >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 75, width: '100%' }}>
          <Card sx={{ width: 500, height: 500, flexDirection: 'column', display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
            <CardContent sx={{ padding: 2, width: '80%', justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
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
              <Button onClick={() => setOpenDiscount(false)} variant='contained' sx={{ background: 'orange', flexDirection: 'column', color: '#fff', fontWeight: 'bold', fontSize: 12 }}>ADD DISCOUNT</Button>
              <Button onClick={() => { setOpenDiscount(false); setdiscount(0) }} variant='contained' sx={{ background: 'red', flexDirection: 'column', color: '#fff', fontWeight: 'bold', fontSize: 12, marginTop: 1 }}>CLOSE</Button>
            </CardContent>
          </Card>
        </div>
      </Modal>
      <Modal open={issubmitting} >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 75, width: '100%' }}>
          <Card>
            <CardContent sx={{ padding: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>

              <CircularProgress size={50} sx={{ marginTop: 2 }} />
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