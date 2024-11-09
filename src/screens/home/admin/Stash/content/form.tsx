import { Card, CardContent, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from '@mui/material'
import React from 'react'
import { appuserdata, sales, salesdetails } from 'types/interfaces';
import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../../../../../firebase/index';
import './focus.css'
type Props = {
  transId: number | null
  sales: sales
  close: () => void

}

interface BalanceResponse {
  transId: number,
  date: string,
  paymentAmount: number
}

export default function Form({ transId, sales, close }: Props) {
  const [orderBy] = React.useState<keyof salesdetails>('docId');
  const [order] = React.useState<'asc' | 'desc'>('asc');
  const [rows, setrow] = React.useState<salesdetails[]>([])
  const [userdetails, setuserdetails] = React.useState<appuserdata>();
  const [currentBalance, setCurrentBalance] = React.useState<BalanceResponse[]>([]);
  const [allBalance, setAllBalance] = React.useState<number>(0);
  
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const salesDetailsDocRef = doc(db, 'sales1', 'salesdetails'); // Reference to the salesdetails document
        const balanceDocref = doc(db, 'sales1', 'balance');
        const salesDetailsSnapshot = await getDoc(salesDetailsDocRef);
        const docBalanceSnapshot = await getDoc(balanceDocref)

        if (docBalanceSnapshot.exists()) {
          const b = docBalanceSnapshot.data().payment as BalanceResponse[];

          const filteredBalance = b.filter(item => item.transId === transId) || [];
          const totalBalance = filteredBalance.reduce((total, item) => total + (item.paymentAmount || 0), 0);

          // Set the calculated total in `allBalance`
          setAllBalance(totalBalance);
          setCurrentBalance(filteredBalance)
        }
        if (salesDetailsSnapshot.exists()) {
          const salesDetailsData = salesDetailsSnapshot.data().details || []; // Get the details array

          const newData: salesdetails[] = [];
          const itemNumbers: Set<string> = new Set(); // Set to store unique item numbers

          salesDetailsData.forEach((data: salesdetails) => {
            if (data.transId === transId && !itemNumbers.has(data.itemno)) {
              newData.push(data);
              itemNumbers.add(data.itemno);
            }
          });

          setrow(newData);
        } else {
          console.error('Sales details document does not exist');
        }
      } catch (error) {
        console.error('Error fetching sales details data:', error);
      }
    };

    fetchData();
  }, [transId]);


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
                  Unit price
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  className='headerCell'
                  style={{
                    color: orderBy === 'sellingprice' ? '#000' : '#fff'
                  }}
                  active={orderBy === 'sellingprice'}
                  direction={orderBy === 'sellingprice' ? order : 'asc'}
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
                <TableCell>₱{row.sellingprice}</TableCell>
                <TableCell>₱{row.sellingprice * row.unit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Card sx={{ alignSelf: 'flex-end', marginRight: '3rem', marginTop: 5, flexDirection: 'row', display: 'flex', justifyContent: 'space-between', width: '20%' }}>
      {currentBalance && currentBalance.map((item) => {
        return (
      <CardContent>
         
            
              <div style={{ width: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', }}>
                  <h4>
                    {item.date}
                  </h4>
                  <h4 style={{ textAlign: 'right', marginLeft: 40 }}>₱{item.paymentAmount}</h4>
                </div>
              </div>
        </CardContent>
           )
        })}
      </Card>
      <Card sx={{ alignSelf: 'flex-end', marginRight: 5, marginTop: 5, flexDirection: 'row', display: 'flex', justifyContent: 'space-between', width: '50%' }}>
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
    </div>
  )
}