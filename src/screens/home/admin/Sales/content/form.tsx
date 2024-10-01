import { Button, Card, CardContent, CircularProgress, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from '@mui/material'
import React from 'react'
import { appuserdata, sales, salesdetails } from 'types/interfaces';
import { doc, getDoc, getDocs, collection, setDoc } from 'firebase/firestore';
import { db } from '../../../../../firebase/index';
import './focus.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
type Props = {
  transId: number | null
  sales: sales | undefined
  close: () => void

}

export default function Form({ transId, sales, close }: Props) {
  const [orderBy] = React.useState<keyof salesdetails>('docId');
  const [order] = React.useState<'asc' | 'desc'>('asc');
  const [rows, setrow] = React.useState<salesdetails[]>([])
  const [userdetails, setuserdetails] = React.useState<appuserdata>();
  const [isdeleting, setisdeleting] = React.useState(false);
  const [success, setsuccess] = React.useState(false);
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const salesDetailsDocRef = doc(db, 'sales', 'salesdetails'); // Reference to the salesdetails document
        const salesDetailsSnapshot = await getDoc(salesDetailsDocRef);

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

  const voidSales = async () => {
    setisdeleting(true)
    setsuccess(false)
    try {
      // Reference to the sales document
      const salesDocRef = doc(db, 'sales', 'sales');
      const salesDetailsDocRef = doc(db, 'sales', 'salesdetails');

      // Fetch the current sales data
      const salesSnapshot = await getDoc(salesDocRef);
      const salesDetailsSnapshot = await getDoc(salesDetailsDocRef);

      if (salesSnapshot.exists() && salesDetailsSnapshot.exists()) {
        const salesData = salesSnapshot.data().sales || [];
        const salesDetailsData = salesDetailsSnapshot.data().details || [];

        // Filter out the sales and sales details with the given transId
        const updatedSales = salesData.filter((sale: { transId: number | null; }) => sale.transId !== transId);
        const updatedSalesDetails = salesDetailsData.filter((detail: { transId: number | null; }) => detail.transId !== transId);

        // Update the sales document
        await setDoc(salesDocRef, { sales: updatedSales }, { merge: true });
        // Update the sales details document
        await setDoc(salesDetailsDocRef, { details: updatedSalesDetails }, { merge: true });

        console.log('Sales and sales details voided successfully');
        setsuccess(true)
        setTimeout(() => {
          setisdeleting(false)
          close()
        }, 2000);


      } else {
        console.error('Sales or sales details document does not exist');
      }
    } catch (error) {
      console.error('Error voiding sales:', error);
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
                <TableCell>₱{row.unitprice}</TableCell>
                <TableCell>₱{row.unitprice * row.unit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
        </CardContent>
        <CardContent sx={{ textAlign: 'right', paddingRight: 5 }}>
          <h4>{sales?.subtotal}</h4>
          <h4 style={{ color: 'red' }}>{sales?.discount}</h4>
          <h1>{sales?.total}</h1>
        </CardContent>
      </Card>
      <Button variant='contained' onClick={voidSales} sx={{ marginTop: 10, color: '#fff', fontWeight: 600, fontSize: 20, backgroundColor: '#f00' }}>VOID SALE</Button>
      <Modal open={isdeleting} >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 75, width: '100%' }}>
          <Card>
            <CardContent sx={{ padding: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>

              {success ? 
              <>
                <FontAwesomeIcon icon={faCheck} size='2xl' color='green' />
                <h1>Successfully Voided</h1>
              </>

              :
                <>
                  <CircularProgress size={50} sx={{ marginTop: 2 }} />
                  <h1>
                    Voiding Item
                  </h1>
                </>
              }
            </CardContent>
          </Card>
        </div>
      </Modal>
    </div>
  )
}