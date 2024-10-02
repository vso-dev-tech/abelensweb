import React, { useState, useEffect } from 'react';
import '../admin.css';
import '../../../../index.css';
import { getDoc, doc } from '@firebase/firestore';
import { db } from '../../../../firebase/index';
import { 
    Button, MenuItem, Modal, Paper, Select, Table, 
    TableBody, TableCell, TableContainer, TableHead, 
    TablePagination, TableRow, TableSortLabel, TextField 
} from '@mui/material';
import { inventory } from 'types/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArchive, faClose, faEye } from '@fortawesome/free-solid-svg-icons';
import Form from './content/form';

export const menu: string[] = [
    'manilajd',
    'nicolasabelrdo',
    'plantationsports',
    'amor trophies',
    'isabela',
    'kenns',
];

const headerToKeyMap: Record<string, keyof inventory> = {
  'Date Added': 'date',
  'Item No.': 'itemno',
  'Item Name': 'itemname',
  'Stocks': 'stocks',
  'Unit Sales': 'unitsales',
  'Unit Price': 'unitprice',
  'Selling Price': 'sellingprice'
};

export default function Inventory() {
    const [modalData, setModalData] = useState<inventory | null>();
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [orderBy, setOrderBy] = useState<keyof inventory>('docId');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [rows, setRows] = useState<inventory[]>([]);
    const [length, setLength] = useState<number>(0);
    const [supplier, setSupplier] = useState<string>('manilajd');
    const [branch, setBranch] = useState<string>('Abelens');

    useEffect(() => {
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
                setLength(data.data.length);
                setRows(filterActive);
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

    const handleView = (item: inventory) => {
        setIsAddModalOpen(true);
        setModalData(item);
    };

    return (
        <div className='container'>
            <div style={{ flexDirection: 'column', marginLeft: 300, display: 'flex', width: '100%', height: '100vh', justifyContent: 'flex-start', alignItems: 'flex-start', backgroundColor: '#d9d9d9' }}>
                <h1>BRANCH INVENTORY</h1>
                <p>SELECTED BRANCH: </p>
                <Select 
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    sx={{ width: 200, marginBottom: 5, borderWidth: 0, backgroundColor: '#fff', fontWeight: 700 }}
                >
                    <MenuItem value={'Abelens'} key={0}>Abelens Branch</MenuItem>
                    <MenuItem value={'Nepo'} key={1}>Nepo Branch</MenuItem>
                </Select>
                <p>SELECTED SUPPLIER: </p>
                <Select 
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    sx={{ width: 200, marginBottom: 5, borderWidth: 0, backgroundColor: '#fff', fontWeight: 700 }}
                >
                    {menu.map((item, index) => (
                        <MenuItem value={item} key={index}>{item}</MenuItem>
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
                <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '95%', height: '100vh' }}>
                    <TableContainer component={Paper} elevation={3} sx={{ width: '85%', maxHeight: '95%' }}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#30BE7A' }}>
                                <TableRow>
                                    {['Date Added', 'Item No.', 'Item Name', 'Stocks', 'Unit Sales', 'Unit Price', 'Selling Price'].map((header, index) => (
                                        <TableCell key={index}>
                                        <TableSortLabel
                                            className='headerCell'
                                            style={{ color: orderBy === headerToKeyMap[header] ? '#000' : '#fff' }}
                                            active={orderBy === headerToKeyMap[header]}
                                            direction={orderBy === headerToKeyMap[header] ? order : 'asc'}
                                            onClick={() => handleRequestSort(headerToKeyMap[header])}  // Use the mapping
                                        >
                                            {header}
                                        </TableSortLabel>
                                    </TableCell>
                                    ))}
                                    <TableCell>
                                        <TableSortLabel disabled className='headerCell'>
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
                                    <TableRow key={index} sx={{ backgroundColor: row.stocks < 5 ? 'pink' : index % 2 ? '#d9d9d9' : '#fff' }}>
                                        <TableCell>{new Date(row.date?.toDate()).toLocaleDateString() || ''}</TableCell>
                                        <TableCell>{row.itemno}</TableCell>
                                        <TableCell>{row.itemname}</TableCell>
                                        <TableCell>{row.stocks}</TableCell>
                                        <TableCell>{row.unitsales}</TableCell>
                                        <TableCell>₱{row.unitprice}</TableCell>
                                        <TableCell>₱{row.sellingprice}</TableCell>
                                        <TableCell sx={{ cursor: 'pointer' }} onClick={() => handleView(row)}>
                                            <FontAwesomeIcon icon={faEye} width={50} height={50} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div style={{ justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
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
                    <Button 
                        variant='contained'  
                        onClick={() => { setIsAddModalOpen(true); setModalData(null); }}  
                        sx={{ height: 150, width: 150, background: '#fff', flexDirection: 'column', color: '#000', fontWeight: 'bold', fontSize: 12 }}
                    >
                        <FontAwesomeIcon icon={faArchive} size='4x' />
                        ADD NEW ITEM
                    </Button>
                </div>
            </div>
            <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                    <div className='modalContainer'>
                            <Button onClick={() => setIsAddModalOpen(false)} sx={{ cursor: 'pointer', padding: 2, color: '#fff', position: 'absolute', right: 0 }}>
                                <FontAwesomeIcon icon={faClose} size='xl' />
                            </Button>
                        <Form onSubmit={() => {fetchData(); setIsAddModalOpen(false)}} onClick={() =>{ setIsAddModalOpen(false); fetchData(); setModalData(null)}} modalData = {modalData} selectedBranch = {branch} length = {length} />
                    </div>
                </Modal>
        </div>
    );
}
