import React from 'react'
import Card from './card'
import {getDocs, doc, setDoc, collection} from '@firebase/firestore'
import { db } from '../../../firebase/index'

type Props = {
    isOpen: boolean,
    onClose: (e: any) => void,
}

interface poppy {
	uid: string,
	email: string,
	contact: string,
}

export default function NewsLetter ({ isOpen, onClose }: Props)  {

	const [email, setemail] = React.useState('')
	const [contact, setcontact] = React.useState('')

	 const generateRandomKey = (length: number) => {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length));
		}
		return result;
	};

	const fetchNewsLetter = async(emails: string, contacts: string,): Promise<boolean> => {
			try {
				const querySnapshot = await getDocs(collection(db, "newsletter"));
				const newsletterdata: poppy[] = [];
			
				querySnapshot.forEach((doc) => {
					if (doc.data().email === emails && doc.data().contact === contacts) {
					newsletterdata.push({
						uid: doc.data().uid,
						email: doc.data().email,
						contact: doc.data().contact
					})
			}})
			if(newsletterdata.length > 0) {
				return true
			} else {
				return false
			}
		} catch (err: any) {
			return false
		}
	}
	

	const addNewsLetter = async () => {

		const checkstatus = await fetchNewsLetter(email, contact)
		if(checkstatus) {
		alert('whoops, please check the fields')
		} else {
			if((!email && !contact) || 
					(email && !email.includes('@')) || 
					(contact && !/^\d+$/.test(contact)) ||
					(contact &&  contact.length !== 11)){ 
					alert('whoops, please check the fields')
			} else {
				try {
					const id = generateRandomKey(25)
					const userRef = doc(db, 'newsletter', id);
						
					await setDoc(userRef, {
						uid: id,
						email: email,
						contact: contact,
					}).then(() => {
						localStorage.setItem("newsletter", JSON.stringify('newsletter'));
						alert('Successfully added to newsletter')
					})
				} catch (error) {
				console.error('Error updating document:', error);
				}
			} 
		}
	};

  return (
    <div className="modal-overlay">
			<span className="modal-close" onClick={onClose}>
					&times;
			</span>
			<div className="modal-content">
				<Card className='newsletter-container'>
					<div className='newsletter-wrapper'>
						<h1>Receive Newsletter</h1>
						<h3>Want to receive updates on email, phone or both?</h3>
						<div className='newsletter-input'>
							<input
								onChange={(e) => {setemail(e.target.value)}} 
								value = {email} 
								placeholder={'example@example.com'}
								color='#d9d9d9'
								/>
						</div>
						<br/>
						<div className='newsletter-input'>
							<input
								onChange={(e) => {setcontact(e.target.value)}} 
								value = {contact} 
								placeholder={'09xxxxxxxxx'}
								color='#d9d9d9'
								/>
						</div>
						<br/>
						<button onClick={addNewsLetter}>Continue</button>
					</div>
				</Card>
			</div>
   </div>
  )
}