import React from 'react'
import '../admin.css'
import '../../../../index.css'
import { collection, getDocs } from '@firebase/firestore';
import {db} from '../../../../firebase/index'
import { Button, Card, CardContent, MenuItem, Modal, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField, makeStyles } from '@mui/material'
import { flightdata, inventory, sales } from 'types/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArchive, faCartPlus, faClose, faEye } from '@fortawesome/free-solid-svg-icons';
import Form from './content/form';
type Props = {}

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

export default function Inventory({}: Props) {

    
    const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
    const [modalData, setModalData] = React.useState<inventory | null | undefined>()
		const [isAddModalOpen, setisAddModalOpen] = React.useState<boolean>(false)
    const [searchQuery, setSearchQuery] = React.useState('');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5); // You can adjust the number of rows per page here
    const [orderBy, setOrderBy] = React.useState<keyof inventory>('docId');
    const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
    const [rows, setrow] = React.useState<inventory[]>([])
    const [branch, setbranch] = React.useState<string>('manilajd')
    React.useEffect(() => {
      const fetchData = async () => {
          try {
              const querySnapshot = await getDocs(collection(db, 'inventory'));
              const newData: inventory[] = [];
              const itemNumbers: Set<number> = new Set(); // Set to store unique item numbers
              querySnapshot.forEach((doc) => {
                  const data = doc.data() as inventory;
                  if (data.branch === branch && !itemNumbers.has(data.itemno)) {
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
  
  }, [branch]);
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

    const handleView = (item: inventory) => {
        setisAddModalOpen(true)
        setModalData(item)
    }


  return (
    <div className='container'>
        <div style = {{flexDirection: 'column', marginLeft: 300, display: 'flex',width: '100%', height: '100vh', justifyContent: 'flex-start', alignItems: 'flex-start', backgroundColor: '#d9d9d9'}}>
        <h1>INVENTORY</h1>
        <p>SELECTED BRANCH: </p>
        <Select 
        defaultValue={'MANILAJD'}
        value = {branch}
        onChange={(e) => setbranch(e.target.value)}
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
          style={{ marginBottom: 20, width: '30%', backgroundColor: '#fff', borderRadius: 5 }}
          placeholder='Search Table'
        />
        <div style={{overflow: 'hidden', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '95%', height: '100vh'}} >
        <TableContainer component={Paper} elevation={3} sx={{width: '85%', maxHeight: '95%'}}>
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
                      color: orderBy === 'stocks' ? '#000' : '#fff'
                    }}
                    active={orderBy === 'stocks'}
                    direction={orderBy === 'stocks' ? order : 'asc'}
                    onClick={() => handleRequestSort('stocks')}
                  >
                    Item Name
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
                    Stocks
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                   className='headerCell'
                    style={{
                      color: orderBy === 'unitsales' ? '#000' : '#fff'
                    }}
                    active={orderBy === 'unitsales'}
                    direction={orderBy === 'unitsales' ? order : 'asc'}
                    onClick={() => handleRequestSort('unitsales')}
                  >
                    Unit Sales
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
                  <TableCell>{row.itemno}</TableCell>
                  <TableCell>{row.itemname}</TableCell>
									<TableCell>{row.stocks}</TableCell>
                  <TableCell>{row.unitsales}</TableCell>
                  <TableCell>₱{row.unitprice}</TableCell>
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
				  <Button variant='contained'  onClick={() => setisAddModalOpen(true)}  sx={{height: 150, width: 150, background: '#fff', flexDirection:'column', color: '#000', fontWeight: 'bold', fontSize: 12}}><FontAwesomeIcon icon={faArchive} color='#30BE7A' style={{width: 65, height: 65}} />ADD INVENTORY</Button>
					</div>
        </div>
				<Modal
            component={'feDropShadow'}
            open = {isAddModalOpen}
            onClose={() => setModalData(null)}
            sx={{overflowY: 'scroll'}}
            
        >
					<>
						<Form onClick={() => setisAddModalOpen(false)} modalData = {modalData} />
            <FontAwesomeIcon onClick={() => setisAddModalOpen(false)} icon={faClose} style={{color: '#fff', position: 'absolute', top: 20, right: 20, cursor: 'pointer', width: 25, height: 25}} />
					</	>
        </Modal>
    </div>
  )
}