import { collection, getDocs } from '@firebase/firestore'
import { db } from '../../firebase/index'
import React from 'react'
import Card from 'screens/components/global/card'
import { admindata, logindata, postdata } from 'types/interfaces'
import TimeAgo from 'react-timeago';
import './styles/contents.css'
import Modal from 'screens/components/global/modal'
type Props = {

	data: postdata

}


export default function Data({data}: Props) {

	const [userdata, setuserdata] = React.useState<admindata[]>([])
	const [modalOpen, setModalOpen] = React.useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

	React.useEffect(() => {
		getUserData()
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
						{data.photo && <img draggable = {false} onClick={openModal} style={{ cursor: 'pointer' }} src={data.photo} width={'95%'} height={200}/>}
					</div>
				</div>
    	</Card>
		}
		</>
  )
}