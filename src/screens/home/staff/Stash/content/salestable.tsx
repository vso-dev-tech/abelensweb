import React, { useEffect } from 'react'
import '../../admin.css'
import '../../../../../index.css'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from '@mui/material'
import { inventory } from 'types/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faTrash } from '@fortawesome/free-solid-svg-icons';
type Props = {

    data: inventory[],
    removeItem: (e: number) => void,
    removeAllItem: (e: number) => void,
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

    const [rows, setrow] = React.useState<inventory[]>(data)
		const [total, setotal] = React.useState<number[]>([])

    useEffect(() => {
        setrow(data)
    },[data])

    const groupedItems = React.useMemo(() => {
      const items: { [itemno: string]: inventory[] } = {};
      rows.forEach(item => {
        if (!items[item.itemno]) {
          items[item.itemno] = [item];
        } else {
          items[item.itemno].push(item);
        }
      });
      return items;
    }, [rows]);

	useEffect(() => {
		const newTotals = Object.keys(groupedItems).map(item => {
			const items = groupedItems[item];
			const totalPrice = items.reduce((acc, currentItem) => {
        
				return currentItem.sellingprice * items.length;
			}, 0);
			return Math.floor(totalPrice);
		});
		setotal(newTotals);
	}, [groupedItems, rows]);

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