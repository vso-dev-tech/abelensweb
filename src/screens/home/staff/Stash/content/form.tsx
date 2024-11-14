import { Button, Card, CardContent, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField } from '@mui/material'
import React, { } from 'react'
import { appuserdata, sales, salesdetails } from 'types/interfaces';
import { collection, getDoc, doc, query, getDocs, where, setDoc } from 'firebase/firestore';
import { db } from '../../../../../firebase/index';
import './focus.css'
type Props = {
  transId: number | null
  sales: sales

}

interface BalanceResponse {
  transId: number,
  date: string,
  paymentAmount: number
}

export default function Form({ transId, sales }: Props) {

  const [orderBy] = React.useState<keyof salesdetails>('docId');
  const [order] = React.useState<'asc' | 'desc'>('asc');
  const [rows, setrow] = React.useState<salesdetails[]>([])
  const [userdetails, setuserdetails] = React.useState<appuserdata>();
  const [openMinusBalance, setOpenMinusBalance] = React.useState<boolean>(false);
  const [payingBalance, setPayingBalance] = React.useState<number>(0);
  const [payingBalanceInput, setPayingBalanceInput] = React.useState<string>(''); // Raw input state for typing

  const [currentBalance, setCurrentBalance] = React.useState<BalanceResponse[]>([]);
  const [allBalance, setAllBalance] = React.useState<number>(0);
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const salesDocRef = doc(db, 'sales1', 'salesdetails');
        const balanceDocref = doc(db, 'sales1', 'balance');
        const docSnapshot = await getDoc(salesDocRef);
        const docBalanceSnapshot = await getDoc(balanceDocref)
        console.log(docSnapshot.exists());
        if (docBalanceSnapshot.exists()) {
          const b = docBalanceSnapshot.data().payment as BalanceResponse[];

          const filteredBalance = b.filter(item => item.transId === transId) || [];
          const totalBalance = filteredBalance.reduce((total, item) => total + (item.paymentAmount || 0), 0);

          // Set the calculated total in `allBalance`
          setAllBalance(totalBalance);
          setCurrentBalance(filteredBalance)
        }
        if (docSnapshot.exists()) {
          const data = docSnapshot.data().details as any[];
          const newData: salesdetails[] = [];
          const itemNumbers: Set<string> = new Set(); // Set to store unique item numbers

          data.forEach((data: salesdetails) => {
            if (data.transId === transId && !itemNumbers.has(data.itemno)) {
              newData.push(data);
              itemNumbers.add(data.itemno);
            }
          });
          setrow(newData);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [transId, openMinusBalance]);



  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'user'), where('uid', '==', sales?.staffId));
        const querySnapshot = await getDocs(q);
        const newData: appuserdata[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as appuserdata;
          newData.push(data);
        });

        if (newData.length > 0) {
          setuserdetails(newData[0]);
        } else {
          console.log('No user found for this staffId.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (sales?.staffId) {
      fetchData();
    }
  }, [sales]);

  const editTotal = async (transId: number, current: number): Promise<void> => {

    const totalBalance = (sales?.total || 0) - allBalance
    if (allBalance >= sales?.total) {
      alert('transaction already paid')
      return
    }
    if (totalBalance < current) {
      alert('Payment is higher than the balance')
      return
    }
    try {
      const stashDocRef = doc(db, 'sales1', 'stash');

      // Get the current sales data
      const stashSnapshot = await getDoc(stashDocRef);
      if (stashSnapshot.exists()) {
        const stashData = stashSnapshot.data().sales || []; // Retrieve existing sales array

        // Update the specific sale's total where transId matches
        const updatedstashData = stashData.map((sale: any) =>
          sale.transId === transId ? { ...sale, paid: sales.total - totalBalance === 0 } : sale
        );

        // Save the updated sales data back to Firestore
        await setDoc(stashDocRef, { sales: updatedstashData }, { merge: true });
        console.log('Total updated successfully');

        // Reference to the `balance` document
        const balanceDocRef = doc(db, 'sales1', 'balance');
        const balanceSnapshot = await getDoc(balanceDocRef);

        // Fetch the current balance data and find the highest balanceId
        const balanceData = balanceSnapshot.exists() ? balanceSnapshot.data().payment || [] : [];
        const highestBalanceId = balanceData.reduce((maxId: any, entry: any) => Math.max(maxId, entry.balanceId || 0), 0);
        const newBalanceId = highestBalanceId + 1;


        const salesDocRef = doc(db, 'sales1', 'sales');

        // Get the current sales data
        const salesSnapshot = await getDoc(salesDocRef);
        if (salesSnapshot.exists()) {
          const salesData = salesSnapshot.data().sales || []; // Retrieve existing sales array

          // Update the specific sale's total where transId matches
          const updatedSalesData = salesData.map((sale: any) =>
            sale.transId === transId ? { ...sale, paid: sales.total - totalBalance === 0 } : sale
          );

          // Save the updated sales data back to Firestore
          await setDoc(salesDocRef, { sales: updatedSalesData }, { merge: true });
          console.log('Total updated successfully');

        }
        const newPaymentData = {
          balanceId: newBalanceId,
          transId: transId,
          date: new Date().toDateString(),
          paymentAmount: current.toFixed(2)
        };

        // Update the balance data with the new entry
        const updatedBalanceData = [...balanceData, newPaymentData];
        await setDoc(balanceDocRef, { payment: updatedBalanceData }, { merge: true });

        console.log('Balance entry added successfully');
        setOpenMinusBalance(false);
      } else {
        console.error('Sales document does not exist');
      }
    } catch (error) {
      console.error('Error updating total or adding balance entry:', error);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 75, flexDirection: 'column', }}>
      <TableContainer component={Paper} sx={{ width: '96%', outline: 'none', '&:focus': { border: 'none' } }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#30BE7A' }}>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  className='headerCell'
                  style={{
                    color: orderBy === 'itemno' ? '#000' : '#fff'
                  }}
                  active={orderBy === 'itemno'}
                  direction={orderBy === 'itemno' ? order : 'asc'}
                >
                  Item No.
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  className='headerCell'
                  style={{
                    color: orderBy === 'itemname' ? '#000' : '#fff'
                  }}
                  active={orderBy === 'itemname'}
                  direction={orderBy === 'itemname' ? order : 'asc'}

                >
                  Item Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  className='headerCell'
                  style={{
                    color: orderBy === 'unit' ? '#000' : '#fff'
                  }}
                  active={orderBy === 'unit'}
                  direction={orderBy === 'unit' ? order : 'asc'}
                >
                  Unit Sold
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  className='headerCell'
                  style={{
                    color: orderBy === 'unitprice' ? '#000' : '#fff'
                  }}
                  active={orderBy === 'unitprice'}
                  direction={orderBy === 'unitprice' ? order : 'asc'}
                >
                  Unit Price
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  className='headerCell'
                  style={{
                    color: orderBy === 'unitprice' ? '#000' : '#fff'
                  }}
                  active={orderBy === 'unitprice'}
                  direction={orderBy === 'unitprice' ? order : 'asc'}
                >
                  Total
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.itemno}</TableCell>
                <TableCell>{row.itemname}</TableCell>
                <TableCell>{row.unit}</TableCell>
                <TableCell>₱{row.unitprice}</TableCell>
                <TableCell>₱{row.unitprice * row.unit}</TableCell>
              </TableRow>

            ))}
            <Button onClick={() => { setOpenMinusBalance(true); }} variant='contained' sx={{ marginTop: 2, marginBottom: 2, marginLeft: 2, height: 50, width: 150, background: '#30BE7A ', flexDirection: 'column', color: '#fff', fontWeight: 'bold', fontSize: 12, justifyContent: 'center', alignItems: 'center' }}>ADD PAYMENT</Button>
          </TableBody>
        </Table>
      </TableContainer>
      <Card sx={{ alignSelf: 'flex-end', marginRight: '3rem', marginTop: 5, flexDirection: 'row', display: 'flex', justifyContent: 'space-between', width: '20%' }}>
      <CardContent>
          {currentBalance && currentBalance.map((item) => {
            return (
              <div style={{ width: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', }}>
                  <h4>
                    {item.date}
                  </h4>
                  <h4 style={{ textAlign: 'right', marginLeft: 40 }}>₱{item.paymentAmount}</h4>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
      <Card sx={{ alignSelf: 'flex-end', marginRight: '3rem', marginTop: 5, flexDirection: 'row', display: 'flex', justifyContent: 'space-between', width: '50%' }}>
        
        <CardContent>
          <h4>StaffName: </h4>
          <h4>Date:</h4>
          <h4>Time: </h4>

        </CardContent>
        <CardContent sx={{ borderRight: '1px solid black', paddingRight: 5, textAlign: 'right' }}>
          <h4>{userdetails?.username}</h4>
          <h4>{sales?.date && new Date(sales?.date?.toDate()).toLocaleDateString()}</h4>
          <h4>{sales?.date && new Date(sales?.date?.toDate()).toLocaleTimeString()}</h4>
        </CardContent>
        <CardContent style={{}}>
          <h4>Subtotal: </h4>
          <h4>Discount: </h4>
          <h1>Total: </h1>
          <h1>Balance: </h1>
        </CardContent>
        <CardContent sx={{ textAlign: 'right', paddingRight: 5 }}>
          <h4>{sales?.subtotal}</h4>
          <h4 style={{ color: 'red' }}>{sales?.discount}</h4>
          <h1>{sales?.total}</h1>
          <h1>{sales.total - allBalance}</h1>
        </CardContent>
      </Card>
      <Modal open={openMinusBalance} >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 75, width: '100%' }}>
          <Card sx={{ width: 500, height: 500, flexDirection: 'column', display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
            <CardContent sx={{ padding: 2, width: '80%', justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
              <h1>ADD PAYMENT</h1>
              <TextField
                value={`₱${payingBalanceInput}`} // Display raw input or formatted balance
                onChange={(e) => {
                  let inputValue = e.target.value.replace(/[^0-9.]/g, ''); // Allow only numbers and a single decimal point
                  const decimalCount = (inputValue.match(/\./g) || []).length;

                  // Prevent more than one decimal point
                  if (decimalCount > 1) {
                    return;
                  }

                  setPayingBalanceInput(inputValue); // Update the raw input state
                }}
                onBlur={() => {
                  const parsedValue = parseFloat(payingBalanceInput);
                  if (!isNaN(parsedValue)) {
                    setPayingBalance(parsedValue); // Update the numeric state
                    setPayingBalanceInput(''); // Clear the raw input
                  } else {
                    setPayingBalanceInput(payingBalance.toFixed(2)); // Revert to formatted value if invalid
                  }
                }}
                size="medium"
                sx={{ width: '90%', height: 75, fontSize: 50 }}
              />
              <Button onClick={() => editTotal(sales?.transId || 0, payingBalance)} variant='contained' sx={{ background: '#30BE7A', flexDirection: 'column', color: '#fff', fontWeight: 'bold', fontSize: 12 }}>ADD PAYMENT</Button>
              <Button onClick={() => { setOpenMinusBalance(false); setPayingBalance(0) }} variant='contained' sx={{ background: 'pink', flexDirection: 'column', color: '#000', fontWeight: 'bold', fontSize: 12, marginTop: 1 }}>CLOSE</Button>
            </CardContent>
          </Card>
        </div>
      </Modal>
    </div>
  )
}