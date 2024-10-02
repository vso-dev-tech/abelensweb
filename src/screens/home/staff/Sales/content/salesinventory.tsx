import React, { useContext } from 'react'
import '../../admin.css'
import '../../../../../index.css'
import { getDoc, doc, Timestamp } from '@firebase/firestore';
import {db} from '../../../../../firebase/index'
import { Button, Card, CardContent, MenuItem, Modal, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField } from '@mui/material'
import { inventory } from 'types/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from 'auth';
type Props = {

  data: (e: inventory) => void,
  excess: boolean,
  returnexcess: (e: boolean) => void,

}

  export const menu: string[] = [
    'manilajd',
    'nicolasabelrdo',
    'plantationsports',
    'amor trophies',
    'isabela',
    'kenns',
  ]

export default function SalesInventory({data, excess, returnexcess}: Props) {

    
    const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
    const {currentUser} = useContext(AuthContext)
    const [searchQuery, setSearchQuery] = React.useState('');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(12); // You can adjust the number of rows per page here
    const [orderBy, setOrderBy] = React.useState<keyof inventory>('docId');
    const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
    const [rows, setrow] = React.useState<inventory[]>([])
    const [addeditem, setaddeditem] = React.useState<inventory>({
      active: true,
      date: Timestamp.fromDate(new Date()),
      docId: '',
      sellingprice: 0,
      itemname: '',
      itemno: 0,
      stocks: 0,
      unitprice: 0,
      unitsales: 0,
      branch: '',
      supplier: '',
      data: '',
    })
    const [supplier, setsupplier] = React.useState<string>('manilajd')
    const [quantity, setQuantity] = React.useState<number>(0);
    const pressTimer = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
      fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supplier]);
  
  
    const fetchData = async () => {
      try {
        const docRef = doc(db, currentUser?.branch || '', supplier);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data() as any;
            const filterActive = data.data.filter((item: inventory )=> {return item.active === true} )

            setrow(filterActive)
        } else {
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
        if(!excess){
          data(id)
        } else {
          returnexcess(false)
          return
        }
      } else {
        alert('You have no remaining stock of this item')
        return
      }
    }
    const handleMouseUp = () => {
      clearTimeout(pressTimer.current!);
    };

    const handleModalClose = () => {
      setIsModalOpen(false);
      setQuantity(0); // Reset quantity state
      clearTimeout(pressTimer.current!);
    };

    const handleItemClick = (item: inventory, stocks: number) => {
      pressTimer.current = setTimeout(() => {
        setaddeditem(item)
        setIsModalOpen(true);
      }, 1000); // Adjust the duration of the long press as needed
    };

    const handleAddItems = () => {

      if (quantity > 0) {
        if(addeditem.stocks < quantity){
          alert('Stock is lower than the added quantity')
          return
        }
        for (let i = 0; i < quantity; i++) {
          selectItem(addeditem, addeditem.stocks);
        }
        setIsModalOpen(false);
        setQuantity(0); // Reset quantity state
      }
    };
  


  return (
    <div style = {{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 30, flexDirection: 'column',}}>
        <p>SELECTED SUPPLIER: </p>
        <div style={{display:'flex', justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'row', width: '95%'}}>
          <Select 
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
                <TableCell>
                  <TableSortLabel
                   className='headerCell'
                    style={{
                    color: orderBy === 'sellingprice' ? '#000' : '#fff'
                    }}
                    active={orderBy === 'sellingprice'}
                    direction={orderBy === 'sellingprice' ? order : 'asc'}
                    onClick={() => handleRequestSort('sellingprice')}
                  >
                    Selling Price
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : sortedRows
              ).map((row, index) => (
                <TableRow onMouseUp = {handleMouseUp} onMouseDown = {() => handleItemClick(row, row.stocks)} sx={{cursor: 'pointer', height: 50, backgroundColor: row.stocks < 5 ? 'pink' : index % 2 ? '#d9d9d9' : '#fff'}} onClick = {() => {selectItem(row, row.stocks)}}key={index}>
                  
                  <TableCell>{new Date(row.date?.toDate()).toLocaleDateString() || ''}</TableCell>
                  <TableCell sx={{height: 10}}>{row.itemno}</TableCell>
                  <TableCell sx={{height: 10, width: '100%'}}>  {row.itemname.length > 25 ? `${row.itemname.substring(0, 22)}...` : row.itemname}</TableCell>
									<TableCell sx={{height: 10}}>{row.stocks}</TableCell>
                  <TableCell sx={{height: 10}}>₱{row.unitprice}</TableCell>
                  <TableCell sx={{height: 10}}>₱{row.sellingprice}</TableCell>

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
      <Modal onClose={handleModalClose} open = {isModalOpen} >
			<div style = {{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 75, width: '100%', height: 500}}>
				<Card>
					<CardContent sx = {{padding: 5, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',  height: 450}}>
            <h1>Specify Quantity</h1>
						<TextField
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
            <Button onClick={handleAddItems} >Add Quantity</Button>
					</CardContent>
				</Card>
        <FontAwesomeIcon onClick={handleModalClose} icon={faClose} style={{color: '#fff', position: 'absolute', top: 20, right: 20, cursor: 'pointer', width: 25, height: 25}} />
			</div>
		</Modal>
    </div>
  )
}