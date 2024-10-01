import {Card, CardContent, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from '@mui/material'
import React, {  } from 'react'
import { appuserdata, sales, salesdetails } from 'types/interfaces';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../../firebase/index';
import './focus.css'
type Props = {
    transId: number | null
    sales: sales | undefined

}

export default function Form({transId, sales}: Props) {
    
    const [orderBy] = React.useState<keyof salesdetails>('docId');
    const [order] = React.useState<'asc' | 'desc'>('asc');
    const [rows, setrow] = React.useState<salesdetails[]>([])
    const [userdetails, setuserdetails] = React.useState<appuserdata>()
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'salesdetails'));
                const newData: salesdetails[] = [];
                const itemNumbers: Set<string> = new Set(); // Set to store unique item numbers
                querySnapshot.forEach((doc) => {
                    const data = doc.data() as salesdetails;
                    if (data.transId === transId && !itemNumbers.has(data.itemno)) {
                        newData.push(data);
                        itemNumbers.add(data.itemno);
                    }
                });
                setrow(newData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        fetchData();
    
    }, [transId]);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'user'));
                const newData: appuserdata[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data() as appuserdata;
                    if (data.uid === sales?.staffId) {
                        newData.push(data);
                    }
                });
                setuserdetails(newData[0]);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        fetchData();
    
    }, [sales]);

  return (
    <div style = {{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 75, flexDirection: 'column',}}>
   <TableContainer component={Paper} sx={{width: '96%', outline: 'none', '&:focus': { border: 'none' }}}>
        <Table>
            <TableHead sx={{backgroundColor: '#30BE7A'}}>
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
            </TableBody>
          </Table>
        </TableContainer>
        <Card sx={{alignSelf: 'flex-end', marginRight: '2rem', marginTop: 5, flexDirection: 'row', display: 'flex', justifyContent: 'space-between', width: '50%'}}>
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
            <CardContent style = {{}}>
                <h4>Subtotal: </h4>
                <h4>Discount: </h4>
                <h1>Total: </h1>
            </CardContent>
            <CardContent sx={{textAlign: 'right',paddingRight: 5}}>
                <h4>{sales?.subtotal}</h4>
                <h4 style={{color: 'red'}}>{sales?.discount}</h4>
                <h1>{sales?.total}</h1>
            </CardContent>
        </Card>
    </div>
  )
}