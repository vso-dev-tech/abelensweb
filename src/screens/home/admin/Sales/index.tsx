import React from 'react'
import '../admin.css'
import '../../../../index.css'
import { collection, onSnapshot, query, where, limit, startAfter, orderBy } from '@firebase/firestore';
import {db} from '../../../../firebase/index'
import { Card, CardContent, MenuItem, Modal, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField } from '@mui/material'
import { sales } from 'types/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faEye } from '@fortawesome/free-solid-svg-icons';
import { BarChart } from '@mui/x-charts';
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

export default function Sales() {

    
    const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
    const [transid, settransid] = React.useState<number | null>(null)
    const [searchQuery, setSearchQuery] = React.useState('');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [ordersBy, setOrderBy] = React.useState<keyof Row>('transId');
    const [order, setOrder] = React.useState<'asc' | 'desc'>('desc');
    const [rows, setrow] = React.useState<sales[]>([])
    const [sales, setsales] = React.useState<sales>()
    const [branch, setbranch] = React.useState<string>('Nepo')
    const [branchsales, setbranchsales] = React.useState<string>('All')
    const [branchinventory, setbranchinventory] = React.useState<sales[]>([])
    const [weeklytotalsales, setweeklytotalsales] = React.useState<sales[]>([])
    React.useEffect(() => {
      const baseQuery = branchsales !== 'All'
          ? query(collection(db, 'sales'), where('branch', '==', branchsales))
          : collection(db, 'sales');
  
      const paginatedQuery = query(
          baseQuery,
          orderBy(ordersBy),
          limit(rowsPerPage),
          startAfter(page * rowsPerPage)
      );
  
      const unsubscribe = onSnapshot(paginatedQuery, (snapshot) => {
          const newData: sales[] = [];
          const branchinventorysales: sales[] = [];
          snapshot.forEach((doc) => {
              const data = doc.data() as sales;
              if (data.branch === branch) {
                  branchinventorysales.push(data);
              }
              newData.push(data);
          });
          setrow(newData);
          setbranchinventory(branchinventorysales);
      });
  
      return () => unsubscribe();
  }, [branchsales, branch, page, rowsPerPage, ordersBy]);

  React.useEffect(() => {
    const currentDate = new Date();
    const sixDaysAgo = new Date(new Date().setDate(currentDate.getDate() - 6));

    const baseQuery = branchsales !== 'All'
        ? query(collection(db, 'sales'), where('branch', '==', branchsales))
        : collection(db, 'sales');

    const paginatedQuery = query(
        baseQuery,
        where('date', '>=', sixDaysAgo),
        where('date', '<=', currentDate),
        orderBy('date')
    );

    const unsubscribe = onSnapshot(paginatedQuery, (snapshot) => {
        const weeklydata: sales[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data() as sales;
            weeklydata.push(data);
        });
        setweeklytotalsales(weeklydata);
    });

    return () => unsubscribe();
}, [branchsales]);

    const handleRequestSort = (property: keyof Row) => {
      const isAsc = ordersBy === property && order === 'asc';
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
      if (a[ordersBy] < b[ordersBy]) return isAsc ? -1 : 1;
      if (a[ordersBy] > b[ordersBy]) return isAsc ? 1 : -1;
      return 0;
    });

    const handleView = (item: sales) => {
        setIsModalOpen(true)
        settransid(item.transId)
        setsales(item)
        console.log(transid)
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
        <div style = {{ overflowY: 'auto', flexDirection: 'column', marginLeft: 300, display: 'flex',width: '100%', height: '100%', justifyContent: 'center', alignItems: 'flex-start'}}>
        
        <div style={{ width: '96%', minHeight: '100%', marginTop: 200}}>
        <div style={{flexDirection: 'row', display: 'flex', justifyContent: 'flex-start'}} >
        
        <Card sx = {{marginRight: 10}}>
          <CardContent>
          <h1 style = {{paddingLeft: 10}}>WEEKLY OVERALL SALES</h1>
          <BarChart
            xAxis={[{ scaleType: 'band', 
            data: dates
            }]}
            width={750}
            height={300}
            slotProps={{
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'middle' },
              },
            }}
            series={[
              { data: totalSales, color: '#30BE7A'},
            ]}
          />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
          <h1 style = {{paddingLeft: 10}}>WEEKLY BRANCH SALES</h1>
          <p style = {{paddingLeft: 40}}>SELECTED BRANCH: </p>
          <Select 
            defaultValue={'Nepo Branch'}
            value = {branch}
            onChange={(e) => setbranch(e.target.value)}
            sx={{width: 200, marginBottom: 5, borderWidth: 0, backgroundColor: '#fff', fontWeight: 700, marginLeft: 5}}
            >
              <MenuItem value = {'Nepo'} key={1}>Nepo Branch</MenuItem>
              <MenuItem value = {'Abelens'}  key={2}>Abelens Branch</MenuItem>
          </Select>
          <BarChart
            xAxis={[{ scaleType: 'band', 
            data: branchdates
            }]}
            
            width={750}
            height={200}
            slotProps={{
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'middle' },
              },
            }}
            series={[
              { data: branchtotalSales, color: '#30BE7A'},
            ]}
          />
          </CardContent>
        </Card>
        </div>
        <h1>REAL-TIME SALE</h1>
        <Select 
            defaultValue={'All'}
            value = {branchsales}
            onChange={(e) => setbranchsales(e.target.value)}
            sx={{width: 200, marginBottom: 5, borderWidth: 0, backgroundColor: '#fff', fontWeight: 700, marginRight: 1}}
            >
            <MenuItem value = {'All'} key = {0} >All</MenuItem>
            
            <MenuItem value = {'Abelens'}  key={2}>Abelens Branch</MenuItem>
            <MenuItem value = {'Nepo'} key={1}>Nepo Branch</MenuItem>
        </Select>
        <TextField
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: 20, width: '30%', backgroundColor: '#fff', borderRadius: 5 }}
          placeholder='Search Table'
        />
        <TableContainer component={Paper} elevation={3} style={{maxWidth: 1650}}>
        <Table>
            <TableHead sx={{backgroundColor: '#30BE7A'}}>
              <TableRow>
              <TableCell>
                  <TableSortLabel
                    className='headerCell'
                     style={{
                      color: ordersBy === 'date' ? '#000' : '#fff'
                    }}
                    active={ordersBy === 'date'}
                    direction={ordersBy === 'date' ? order : 'asc'}
                    onClick={() => handleRequestSort('date')}
                  >
                    Date
                  </TableSortLabel>
            </TableCell>
              <TableCell>
                  <TableSortLabel
                    className='headerCell'
                     style={{
                      color: ordersBy === 'transId' ? '#000' : '#fff'
                    }}
                    active={ordersBy === 'transId'}
                    direction={ordersBy === 'transId' ? order : 'asc'}
                    onClick={() => handleRequestSort('transId')}
                    
                  >
                    Transaction No.
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    className='headerCell'
                    style={{
                      color: ordersBy === 'noitem' ? '#000' : '#fff'
                    }}
                    active={ordersBy === 'noitem'}
                    direction={ordersBy === 'noitem' ? order : 'asc'}
                    onClick={() => handleRequestSort('noitem')}
                  >
                    No. of Items
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                   className='headerCell'
                    style={{
                      color: ordersBy === 'branch' ? '#000' : '#fff'
                    }}
                    active={ordersBy === 'branch'}
                    direction={ordersBy === 'branch' ? order : 'asc'}
                    onClick={() => handleRequestSort('branch')}
                  >
                    Branch
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                   className='headerCell'
                    style={{
                    color: ordersBy === 'total' ? '#000' : '#fff'
                    }}
                    active={ordersBy === 'total'}
                    direction={ordersBy === 'total' ? order : 'asc'}
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
                  <TableCell sx={{cursor: 'pointer'}} onClick={() => handleView(row)}>
                  <FontAwesomeIcon icon={faEye} width={50} height={50} />
                  </TableCell> 
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div style={{justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}> {/* Adjust margin as needed */}
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
        <br/>
        <br/>
        </div>
       
        </div>
        <Modal
            open = {isModalOpen}
            onClose={() => {settransid(null); setIsModalOpen(false)}}
            sx={{overflowY: 'scroll'}}
            
        >
            <>
                <Form transId={transid} sales={sales}/>
            <FontAwesomeIcon onClick={() => setIsModalOpen(false)} icon={faClose} style={{color: '#fff', position: 'absolute', top: 20, right: 20, cursor: 'pointer', width: 25, height: 25}} />
            </>
        </Modal>
    </div>
  )
}