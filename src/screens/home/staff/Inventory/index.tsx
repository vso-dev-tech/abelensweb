import React, { useContext } from 'react'
import '../admin.css'
import '../../../../index.css'
import { doc, getDoc } from '@firebase/firestore';
import { db } from '../../../../firebase/index'
import { MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField } from '@mui/material'
import { inventory } from 'types/interfaces';
import { AuthContext } from 'auth';

export const menu: string[] = [
  'manilajd',
  'nicolasabelrdo',
  'plantationsports',
  'amor trophies',
  'isabela',
  'kenns',
]

export default function StaffInventory() {

  const { currentUser } = useContext(AuthContext)
  const [searchQuery, setSearchQuery] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [orderBy, setOrderBy] = React.useState<keyof inventory>('docId');
  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
  const [rows, setrow] = React.useState<inventory[]>([])
  const [supplier, setsupplier] = React.useState<string>('manilajd')
  const [branch] = React.useState<string>(currentUser?.branch || 'Abelens')

  React.useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier, branch]);

  const fetchData = async () => {
      try {
          const docRef = doc(db, branch, supplier);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
              const data = docSnap.data() as any;
              const filterActive = data.data.filter((item: inventory) => item.active === true);
              setrow(filterActive);
          } else {
              alert('No data exists with selected supplier');
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

  return (
    <div className='container'>
      <div style={{ flexDirection: 'column', marginLeft: 300, display: 'flex', width: '100%', height: '100vh', justifyContent: 'flex-start', alignItems: 'flex-start', backgroundColor: '#d9d9d9' }}>
        <h1>BRANCH INVENTORY</h1>
        <p>SELECTED BRANCH: </p>
        <Select
          value={currentUser?.branch}
          sx={{ width: 200, marginBottom: 5, borderWidth: 0, backgroundColor: '#fff', fontWeight: 700 }}
        >
          <MenuItem value={currentUser?.branch} key={0} >{currentUser?.branch} Branch</MenuItem>

        </Select>
        <p>SELECTED SUPPLIER: </p>
        <Select
          defaultValue={'MANILAJD'}
          value={supplier}
          onChange={(e) => setsupplier(e.target.value)}
          sx={{ width: 200, marginBottom: 5, borderWidth: 0, backgroundColor: '#fff', fontWeight: 700 }}
        >
          {menu.map((item, index) => (<MenuItem value={item} key={index}>{item}
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
        <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '95%', height: '100vh' }} >
          <TableContainer component={Paper} elevation={3} sx={{ width: '85%', maxHeight: '95%' }}>
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
                  <TableRow key={index} sx={{ backgroundColor: row.stocks < 5 ? 'pink' : index % 2 ? '#d9d9d9' : '#fff' }}>
                    <TableCell>{new Date(row.date?.toDate()).toLocaleDateString() || ''}</TableCell>
                    <TableCell>{row.itemno}</TableCell>
                    <TableCell>{row.itemname}</TableCell>
                    <TableCell>{row.stocks}</TableCell>
                    <TableCell>{row.unitsales}</TableCell>
                    <TableCell>₱{row.unitprice}</TableCell>
                    <TableCell>₱{row.sellingprice}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div style={{ justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}> {/* Adjust margin as needed */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
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
    </div>
  )
}