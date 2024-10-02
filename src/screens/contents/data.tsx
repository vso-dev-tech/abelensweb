/* eslint-disable jsx-a11y/alt-text */
import { collection, getDocs } from '@firebase/firestore'
import { db } from '../../firebase/index'
import React from 'react'
import Card from 'screens/components/global/card'
import { admindata, postdata } from 'types/interfaces'
import TimeAgo from 'react-timeago';
import './styles/contents.css'
type Props = {

	data: postdata

}


export default function Data({data}: Props) {

	const [userdata, setuserdata] = React.useState<admindata[]>([])
	React.useEffect(() => {
		getUserData()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[])

	const getUserData = async () => {
    const querySnapshot = await getDocs(collection(db, "user"));
    const userData: admindata[] = [];
  
    querySnapshot.forEach((doc) => {
      if (doc.data().uid === data.uid) {
        userData.push({
					uid: doc.data().uid,
					photoURL: doc.data().photoURL,
					displayName: doc.data().displayName,
					email: doc.data().email,
        });
				setuserdata(userData)
      }
    });

	}

	const formatEpochMilliseconds = (timestamp: any) => {
		const dateObject = timestamp && timestamp.toDate();
		return dateObject ? dateObject.getTime() : 0;
	};
  return (
		<>
    {data && 
			<Card>
				<div className='data-container'>
					<div className='data-header'>
						<p>
							{userdata[0]?.displayName}
							data
						</p>
						<TimeAgo style={{fontSize: 12, marginTop: -13, color: '#d9d9d9'}} date = {formatEpochMilliseconds(data.time)} />
					</div>
					<div className='data-body'>
						<p>{data.text}</p>
						{data.photo && <img draggable = {false} style={{ cursor: 'pointer' }} src={data.photo} width={'95%'} height={200}/>}
					</div>
				</div>
    	</Card>
		}
		</>
  )
}