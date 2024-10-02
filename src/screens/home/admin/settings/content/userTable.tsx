import React from 'react'
import '../../admin.css'
import '../../../../../index.css'
import { Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from '@mui/material'
import { appuserdata } from 'types/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
type Props = {

    data: appuserdata[],
    handleView: (e: any) => void

}
 

export default function SettingTable({data, handleView}: Props) {

    const rows: appuserdata[] = data

    const [searchQuery] = React.useState('');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5); // You can adjust the number of rows per page here
    const [orderBy, setOrderBy] = React.useState<keyof appuserdata>('uid');
    const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
    const handleRequestSort = (property: keyof appuserdata) => {
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
  
      // Check if the date string includes the search query
      return (row.username?.toLowerCase().includes(searchQuery.toLowerCase())) || 
          (row.email?.toString().includes(searchQuery.toLowerCase()));
  });
  
  
    const sortedRows = filteredRows.sort((a, b) => {
      const isAsc = order === 'asc';
      if (a[orderBy] < b[orderBy]) return isAsc ? -1 : 1;
      if (a[orderBy] > b[orderBy]) return isAsc ? 1 : -1;
      return 0;
    });
  return (
    
    <Stack sx={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <TableContainer component={Paper} elevation={3} sx={{width: '96%'}}>
        <Table>
            <TableHead sx={{backgroundColor: '#30BE7A'}}>
              <TableRow>
              <TableCell>
                  <TableSortLabel
                    className='headerCell'
                     style={{
                      color: orderBy === 'active' ? '#000' : '#fff'
                    }}
                    active={orderBy === 'active'}
                    direction={orderBy === 'active' ? order : 'asc'}
                    onClick={() => handleRequestSort('active')}
                  >
                    Active
                  </TableSortLabel>
            </TableCell>
              <TableCell>
                  <TableSortLabel
                    className='headerCell'
                     style={{
                      color: orderBy === 'username' ? '#000' : '#fff'
                    }}
                    active={orderBy === 'username'}
                    direction={orderBy === 'username' ? order : 'asc'}
                    onClick={() => handleRequestSort('username')}
                    
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    className='headerCell'
                    style={{
                      color: orderBy === 'restrict' ? '#000' : '#fff'
                    }}
                    active={orderBy === 'restrict'}
                    direction={orderBy === 'restrict' ? order : 'asc'}
                    onClick={() => handleRequestSort('restrict')}
                  >
                    Restricted
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                   className='headerCell'
                    style={{
                      color: orderBy === 'lastLoggedIn' ? '#000' : '#fff'
                    }}
                    active={orderBy === 'lastLoggedIn'}
                    direction={orderBy === 'lastLoggedIn' ? order : 'asc'}
                    onClick={() => handleRequestSort('lastLoggedIn')}
                  >
                    Last Logged In
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
                  <TableCell>{row.active === true ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{row.username}</TableCell>
                  <TableCell>{row.restrict === true ? 'Restricted' : 'Not Restricted'}</TableCell>
                  <TableCell>{new Date(row.lastLoggedIn?.toDate()).toISOString() || ''}</TableCell>
                  <TableCell sx={{cursor: 'pointer'}} onClick={() => handleView(row)}>
                  <FontAwesomeIcon icon={faEye} width={50} height={50} />
                  
                  </TableCell> 
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div style={{justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}> {/* Adjust margin as needed */}
            <TablePagination
              rowsPerPageOptions={[5, 10]} // You can adjust the options here
              component="div"
              count={sortedRows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
          
		</TableContainer>
    </Stack>
  )
}