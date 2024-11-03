import React from 'react'
import '../admin.css'
import '../../../../index.css'
import { doc, onSnapshot } from '@firebase/firestore';
import { db } from '../../../../firebase/index'
import { MenuItem, Modal, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField } from '@mui/material'
import { sales } from 'types/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faEye } from '@fortawesome/free-solid-svg-icons';
import Form from './content/form';

interface Row {
  branch: string,
  date: Date,
  discount: number,
  docId: string,
  noitem: number,
  staffId: string,
  subtotal: number,
  total: number,
  transId: number,
}

export default function AdminStashSales() {


  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [transid, settransid] = React.useState<number | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5); // You can adjust the number of rows per page here
  const [orderBy, setOrderBy] = React.useState<keyof Row>('transId');
  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
  const [rows, setrow] = React.useState<sales[]>([])
  const [sales, setsales] = React.useState<any>();
  const [branch] = React.useState<string>('Nepo')
  const [branchsales, setbranchsales] = React.useState<string>('All')
  const [branchinventory, setbranchinventory] = React.useState<sales[]>([])
  const [weeklytotalsales, setweeklytotalsales] = React.useState<sales[]>([])
  React.useEffect(() => {
    const salesDocRef = doc(db, 'sales1', 'stash'); // Reference to the sales document
    const unsubscribe = onSnapshot(salesDocRef, (doc) => {
      if (doc.exists()) {
        const salesData = doc.data().sales || []; // Get the sales array

        const newData: sales[] = [];
        const weeklydata: sales[] = [];
        const branchinventorysales: sales[] = [];

        salesData.forEach((data: sales) => {
          weeklydata.push(data);
          if (!data.paid) {
            if (data.branch === branch) {
              branchinventorysales.push(data);
            }

            if (branchsales !== 'All') {
              if (data.branch === branchsales) {
                newData.push(data);
              }
            } else {
              newData.push(data);
            }
          }
        });
        setrow(newData);
        setbranchinventory(branchinventorysales);
        setweeklytotalsales(weeklydata);
      } else {
        console.error('Sales document does not exist');
      }
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, [branchsales, branch]);

  const handleRequestSort = (property: keyof Row) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrderBy(property);
    setOrder(isAsc ? 'desc' : 'asc');
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredRows = rows.filter(row => {
    // Convert Firestore Timestamp to JavaScript Date object
    const date = new Date(row.date?.seconds * 1000 + row.date?.nanoseconds / 1000000);

    // Format the date as needed (e.g., toLocaleDateString)
    const dateString = date.toLocaleDateString('en-US').toLowerCase();

    // Check if the date string includes the search query
    return dateString.includes(searchQuery.toLowerCase()) ||
      (row.branch?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (row.transId?.toString().includes(searchQuery.toLowerCase()));
  });


  const sortedRows = filteredRows.sort((a, b) => {
    const isAsc = order === 'asc';
    if (a[orderBy] < b[orderBy]) return isAsc ? -1 : 1;
    if (a[orderBy] > b[orderBy]) return isAsc ? 1 : -1;
    return 0;
  });

  const handleView = (item: sales) => {
    setIsModalOpen(true)
    settransid(item.transId)
    setsales(item)
  }

  const aggregatedSales: { [key: string]: number } = {};
  weeklytotalsales.forEach(item => {
    const itemDate = new Date(item.date?.toDate()).toLocaleDateString();
    if (aggregatedSales[itemDate]) {
      aggregatedSales[itemDate] += item.total;
    } else {
      aggregatedSales[itemDate] = item.total;
    }
  });

  // Extract dates and total sales for chart
  const currentDate = new Date();
  const sixDaysAgo = new Date(currentDate);
  sixDaysAgo.setDate(currentDate.getDate() - 6);

  const dates = [];
  const totalSales = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(sixDaysAgo);
    date.setDate(sixDaysAgo.getDate() + i);
    const formattedDate = date.toLocaleDateString();
    dates.push(formattedDate);
    totalSales.push(aggregatedSales[formattedDate] || 0);
  }

  //items

  const branchaggregatedSales: { [key: string]: number } = {};
  branchinventory.forEach(item => {
    const itemDate = new Date(item.date?.toDate()).toLocaleDateString();
    if (branchaggregatedSales[itemDate]) {
      branchaggregatedSales[itemDate] += item.total;
    } else {
      branchaggregatedSales[itemDate] = item.total;
    }
  });

  // Extract dates and total sales for chart
  const branchcurrentDate = new Date();
  const branchsixDaysAgo = new Date(branchcurrentDate);
  branchsixDaysAgo.setDate(branchcurrentDate.getDate() - 6);

  const branchdates = [];
  const branchtotalSales = [];

  for (let i = 0; i < 7; i++) {
    const branchdate = new Date(branchsixDaysAgo);
    branchdate.setDate(branchsixDaysAgo.getDate() + i);
    const branchformattedDate = branchdate.toLocaleDateString();
    branchdates.push(branchformattedDate);
    branchtotalSales.push(branchaggregatedSales[branchformattedDate] || 0);
  }

  return (
    <div className='container'>
      <div style={{ overflowY: 'auto', flexDirection: 'column', marginLeft: 300, display: 'flex', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div style={{ width: '96%', minHeight: '100%', marginTop: 200 }}>
          <h1>REAL-TIME SALE</h1>
          <Select
            defaultValue={'All'}
            value={branchsales}
            onChange={(e) => setbranchsales(e.target.value)}
            sx={{ width: 200, marginBottom: 5, borderWidth: 0, backgroundColor: '#fff', fontWeight: 700, marginRight: 1 }}
          >
            <MenuItem value={'All'} key={0} >All</MenuItem>

            <MenuItem value={'Abelens'} key={2}>Abelens Branch</MenuItem>
            <MenuItem value={'Nepo'} key={1}>Nepo Branch</MenuItem>
          </Select>
          <TextField
            label="Search"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: 20, width: '30%', backgroundColor: '#fff', borderRadius: 5 }}
            placeholder='Search Table'
          />
          <TableContainer component={Paper} elevation={3} style={{ maxWidth: 1650 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#30BE7A' }}>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      className='headerCell'
                      style={{
                        color: orderBy === 'date' ? '#000' : '#fff'
                      }}
                      active={orderBy === 'date'}
                      direction={orderBy === 'date' ? order : 'asc'}
                      onClick={() => handleRequestSort('date')}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      className='headerCell'
                      style={{
                        color: orderBy === 'transId' ? '#000' : '#fff'
                      }}
                      active={orderBy === 'transId'}
                      direction={orderBy === 'transId' ? order : 'asc'}
                      onClick={() => handleRequestSort('transId')}

                    >
                      Transaction No.
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      className='headerCell'
                      style={{
                        color: orderBy === 'noitem' ? '#000' : '#fff'
                      }}
                      active={orderBy === 'noitem'}
                      direction={orderBy === 'noitem' ? order : 'asc'}
                      onClick={() => handleRequestSort('noitem')}
                    >
                      No. of Items
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      className='headerCell'
                      style={{
                        color: orderBy === 'branch' ? '#000' : '#fff'
                      }}
                      active={orderBy === 'branch'}
                      direction={orderBy === 'branch' ? order : 'asc'}
                      onClick={() => handleRequestSort('branch')}
                    >
                      Branch
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      className='headerCell'
                      style={{
                        color: orderBy === 'total' ? '#000' : '#fff'
                      }}
                      active={orderBy === 'total'}
                      direction={orderBy === 'total' ? order : 'asc'}
                      onClick={() => handleRequestSort('total')}
                    >
                      Total
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      disabled
                      className='headerCell'
                    >
                      Action
                    </TableSortLabel>

                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : sortedRows
                ).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(row.date?.toDate()).toLocaleDateString() || ''}</TableCell>
                    <TableCell>{row.transId}</TableCell>
                    <TableCell>{row.noitem}</TableCell>
                    <TableCell>{row.branch} Branch</TableCell>
                    <TableCell>₱{row.total}</TableCell>
                    <TableCell sx={{ cursor: 'pointer' }} onClick={() => handleView(row)}>
                      <FontAwesomeIcon icon={faEye} width={50} height={50} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div style={{ justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}> {/* Adjust margin as needed */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]} // You can adjust the options here
                component="div"
                count={sortedRows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </div>
          </TableContainer>
          <br />
          <br />
        </div>

      </div>
      <Modal
        open={isModalOpen}
        onClose={() => { settransid(null); setIsModalOpen(false) }}
        sx={{ overflowY: 'scroll' }}

      >
        <>
          <Form close={() => setIsModalOpen(false)} transId={transid} sales={sales} />
          <FontAwesomeIcon onClick={() => setIsModalOpen(false)} icon={faClose} style={{ color: '#fff', position: 'absolute', top: 20, right: 20, cursor: 'pointer', width: 25, height: 25 }} />
        </>
      </Modal>
    </div>
  )
}