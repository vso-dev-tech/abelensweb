import React, { useContext } from 'react'
import '../../admin.css'
import '../../../../../index.css'
import { collection, getDocs, query, where, getDoc, doc } from '@firebase/firestore';
import {db} from '../../../../../firebase/index'
import { Button, Card, CardContent, MenuItem, Modal, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField, makeStyles } from '@mui/material'
import { flightdata, inventory, sales } from 'types/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArchive, faCartPlus, faClose, faEye } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from 'auth';
type Props = {

  data: (e: inventory) => void,

}

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
 
  export const menu: string[] = [
    'manilajd',
    'nicolasabelrdo',
    'plantationsports',
    'amor trophies',
    'isabela',
    'kenns',
  ]

export default function SalesInventory({data}: Props) {

    
    const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
    const [modalData, setModalData] = React.useState<inventory | null | undefined>();
    const {currentUser} = useContext(AuthContext)
		const [isAddModalOpen, setisAddModalOpen] = React.useState<boolean>(false)
    const [searchQuery, setSearchQuery] = React.useState('');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(12); // You can adjust the number of rows per page here
    const [orderBy, setOrderBy] = React.useState<keyof inventory>('docId');
    const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
    const [rows, setrow] = React.useState<inventory[]>([])
    const [supplier, setsupplier] = React.useState<string>('manilajd')
    const [branch, setbranch] = React.useState<string>('Abelens')
    React.useEffect(() => {
     
  
      fetchData();
    }, [supplier, branch]);
  
  
    const fetchData = async () => {
      try {
        const docRef = doc(db, currentUser?.branch || '', supplier);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data() as any;
            console.log(data.data);
            setrow(data.data)
        } else {
            console.log('Document does not exist!');
            alert('No data exists with selected supplier')
        }
      } catch (error) {
          console.error('Error fetching data:', error);
      }
  };
    const handleRequestSort = (property: keyof inventory) => {
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
  
      const dateString = date.toLocaleDateString('en-US').toLowerCase();
      const itemNameLowerCase = row.itemname?.toLowerCase();

      // Check if the date string includes the search query
      return dateString.includes(searchQuery.toLowerCase()) || 
          row.itemno?.toString().includes(searchQuery.toLowerCase()) || 
          (itemNameLowerCase && itemNameLowerCase.includes(searchQuery.toLowerCase()));
      });
  
  
  
    const sortedRows = filteredRows.sort((a, b) => {
      const isAsc = order === 'asc';
      if (a[orderBy] < b[orderBy]) return isAsc ? -1 : 1;
      if (a[orderBy] > b[orderBy]) return isAsc ? 1 : -1;
      return 0;
    });

    const selectItem = (id: inventory, stocks: number) => {
      if(stocks <= 5) {
        alert('Please inform the main office for all low stock items')
      }
      if(stocks !== 0){
        data(id)
      } else {
        alert('You have no remaining stock of this item')
        return
      }
    }
  


  return (
    <div style = {{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 30, flexDirection: 'column',}}>
        <p>SELECTED SUPPLIER: </p>
        <div style={{display:'flex', justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'row', width: '95%'}}>
          <Select 
          defaultValue={'MANILAJD'}
          value = {supplier}
          onChange={(e) => setsupplier(e.target.value)}
          sx={{width: 200, marginBottom: 5, borderWidth: 0, backgroundColor: '#fff', fontWeight: 700}}
          >
              {menu.map((item, index) => (<MenuItem value = {item} key={index}>{item}
              </MenuItem>
              ))}
          </Select>
          <TextField
            label="Search"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: 20, width: '100%', backgroundColor: '#fff', borderRadius: 5 }}
            placeholder='Search Table'
          />
        </div>
        <div style={{overflow: 'hidden', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '95%', height: '100vh'}} >
        <TableContainer component={Paper} sx={{width: 800,outline: 'none', '&:focus': { border: 'none' }}}>
        <Table>
            <TableHead sx={{backgroundColor: '#30BE7A'}}>
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
                    Date Added
                  </TableSortLabel>
            </TableCell>
              <TableCell>
                  <TableSortLabel
                    className='headerCell'
                     style={{
                      color: orderBy === 'itemno' ? '#000' : '#fff'
                    }}
                    active={orderBy === 'itemno'}
                    direction={orderBy === 'itemno' ? order : 'asc'}
                    onClick={() => handleRequestSort('itemno')}
                    
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
                    onClick={() => handleRequestSort('itemname')}
                  >
                    Item Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    className='headerCell'
                    style={{
                      color: orderBy === 'stocks' ? '#000' : '#fff'
                    }}
                    active={orderBy === 'stocks'}
                    direction={orderBy === 'stocks' ? order : 'asc'}
                    onClick={() => handleRequestSort('stocks')}
                  >
                    Stocks
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
                    onClick={() => handleRequestSort('unitprice')}
                  >
                    Unit Price
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : sortedRows
              ).map((row, index) => (
                <TableRow sx={{cursor: 'pointer', height: 50, backgroundColor: row.stocks == 0 ? 'pink' : index % 2 ? '#d9d9d9' : '#fff'}} onClick = {() => {selectItem(row, row.stocks)}}key={index}>
                  
                  <TableCell>{new Date(row.date?.toDate()).toLocaleDateString() || ''}</TableCell>
                  <TableCell sx={{height: 10}}>{row.itemno}</TableCell>
                  <TableCell sx={{height: 10, width: '100%'}}>  {row.itemname.length > 25 ? `${row.itemname.substring(0, 22)}...` : row.itemname}</TableCell>
									<TableCell sx={{height: 10}}>{row.stocks}</TableCell>
                  <TableCell sx={{height: 10}}>₱{row.unitprice}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div style={{justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}> {/* Adjust margin as needed */}
            <TablePagination
              rowsPerPageOptions={[20]} // You can adjust the options here
              component="div"
              count={sortedRows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        </TableContainer>
					</div>
    </div>
  )
}