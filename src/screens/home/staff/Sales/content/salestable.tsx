import React, { useContext, useEffect } from 'react'
import '../../admin.css'
import '../../../../../index.css'
import { collection, getDocs, query, where, getDoc, doc } from '@firebase/firestore';
import {db} from '../../../../../firebase/index'
import { Button, Card, CardContent, MenuItem, Modal, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField, makeStyles } from '@mui/material'
import { flightdata, inventory, sales } from 'types/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArchive, faCartPlus, faClose, faDeleteLeft, faEye, faMinus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from 'auth';
import { Prev } from 'react-bootstrap/esm/PageItem';
type Props = {

    data: inventory[],
    removeItem: (e: number) => void,
    removeAllItem: (e: number) => void,
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

export default function SalesTable({data, removeItem, removeAllItem}: Props) {

    
    const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
    const [modalData, setModalData] = React.useState<inventory | null | undefined>();
    const {currentUser} = useContext(AuthContext)
		const [isAddModalOpen, setisAddModalOpen] = React.useState<boolean>(false)
    const [searchQuery, setSearchQuery] = React.useState('');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(1000); // You can adjust the number of rows per page here
    const [orderBy, setOrderBy] = React.useState<keyof inventory>('docId');
    const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
    const [rows, setrow] = React.useState<inventory[]>(data)
    const [supplier, setsupplier] = React.useState<string>('manilajd')
    const [branch, setbranch] = React.useState<string>('Abelens')
		const [discount, setdiscount] = React.useState<number>(0)
		const [total, setotal] = React.useState<number[]>([])

    useEffect(() => {
        setrow(data)
    },[data])

    const handleRequestSort = (property: keyof inventory) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrderBy(property);
      setOrder(isAsc ? 'desc' : 'asc');
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

    const groupedItems: { [itemno: string]: inventory[] } = {};
        rows.forEach(item => {
            if (!groupedItems[item.itemno]) {
                groupedItems[item.itemno] = [item];
            } else {
                groupedItems[item.itemno].push(item);
            }
	});

	useEffect(() => {
		const newTotals = Object.keys(groupedItems).map(item => {
			const items = groupedItems[item];
			const totalPrice = items.reduce((acc, currentItem) => {
        
				return currentItem.sellingprice * items.length;
			}, 0);
			return Math.floor(totalPrice);
		});
		setotal(newTotals);
	}, [rows]);

	const totalSum = total.reduce((acc, currentValue) => acc + currentValue, 0);
	const withDiscount = totalSum - discount


	const [screenHeight, setScreenHeight] = React.useState(window.innerHeight); // Initial screen width

	React.useEffect(() => {
			const handleResize = () => {
				setScreenHeight(window.innerHeight); // Update screen width on resize
			};

			window.addEventListener('resize', handleResize); // Add resize event listener

			return () => {
					window.removeEventListener('resize', handleResize); // Cleanup event listener
			};
	}, []);

	let chartHeight = 800;
	if (screenHeight <= 1140) {
		chartHeight = 700;
	}
	 if (screenHeight <= 1050) {
		chartHeight = 650;
	}

  return (
    <div style = {{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 30, flexDirection: 'column', height: chartHeight}}>
        <div style={{overflow: 'hidden', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '95%'}} >
        <TableContainer component={Paper} sx={{width: 900,outline: 'none', '&:focus': { border: 'none' }, overflowY: 'scroll', height: '100%'}}>
        <Table>
            <TableHead sx={{backgroundColor: '#fff'}}>
              <TableRow>
              <TableCell sx={{}}>
                  <TableSortLabel
                    className='headerCell'
                     style={{
                      color: '#000'
                    }}
                  >
                    Item No.
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{textAlign: 'center'}}>
                  <TableSortLabel
                    className='headerCell'
										style={{
										 color: '#000'
									 	}}
                  >
                    Item Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                   className='headerCell'
									 style={{
										color: '#000'
										}}
                  >
                    Unit
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                	<TableSortLabel
                   className='headerCell'
									 style={{
										color: '#000'
										}}
                  >
                    Total
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {
                Object.keys(groupedItems).map((item, index) => {
                const items = groupedItems[item];
                return (
                <TableRow key={index} sx={{cursor: 'pointer', height: 50, justifyContent: 'center', alignItems: 'center'}}>
                    <TableCell sx={{height: 10}}>{item}</TableCell>
                    <TableCell sx={{height: 10, width: '100%', textAlign: 'center'}}>{items.map((item, index) => index === 0 ? item.itemname : null)}</TableCell>
                    <TableCell sx={{height: 10}}>{items.length}</TableCell>
                    <TableCell sx={{height: 10}}>₱{total[index]}</TableCell>
                    <TableCell onClick={() => removeItem(items[0].itemno)} sx={{height: 10, width: '100%', textAlign: 'center'}}><FontAwesomeIcon icon={faMinus} color='grey'/></TableCell>
                    <TableCell onClick={() => removeAllItem(items[0].itemno)} sx={{height: 10, width: '100%', textAlign: 'center'}}><FontAwesomeIcon icon={faTrash} color='red'/></TableCell>
                </TableRow>
                );
                })
            }
            </TableBody>
          </Table>
        </TableContainer>
        </div>
    </div>
  )
}