import React,{useState} from 'react'
import { useNavigate } from 'react-router-dom';
import '../styles/components.css'
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase/index';
import NavBarItems from './navigator/navbaritems';
type Props = {
  menu: any,
}

export const Header: React.FC<Props> = ({menu}) => {
  const [active, setActive] = useState(1);
  const navigate = useNavigate()

  const __navigate = (id: number) => {
    setActive(id);
  }

  const signOutUser = async () => {
		try {
				await signOut(auth);
        navigate('/logout')
				console.log("User signed out successfully.");
			} catch (error) {
				// Handle any errors here
				console.error("Error signing out:", error);
			}
		};
  

  return (
    <div className="header">
    <a style={{textDecoration: 'none'}}  href='https://docs.google.com/spreadsheets/d/1wIp-Afc6kxsYL3LllPpq00vV68P0IHmgXXp0qYYbWL4/edit?usp=sharing'><h3>ABELENS</h3></a>
     <p>Inventory Management System</p>
      <div className="right">
        {menu.map((item: any, index: number) =>(
          <div key={index}  onClick={() => __navigate(item.id)}>
              <NavBarItems
                  onClick={() => {}}
                  active={item.id === active}
                  item={item} />
          </div>
        ))}
      </div>
      <button onClick={signOutUser}>LOG OUT</button>  
    </div>
  );
}