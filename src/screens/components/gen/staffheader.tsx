import React,{useState, useEffect, useContext} from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from 'auth';
import '../styles/components.css'
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase/index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faLocationDot, faUser } from '@fortawesome/free-solid-svg-icons';
import NavBarItems from './navigator/navbaritems';
import { educationdata, personaldata } from 'types/interfaces';
import { CustomButton } from '../global/buttons';
import { Button, ButtonBase, IconButton } from '@mui/material';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';
import StaffNavBarItems from './navigator/staffnavbaritems';
type Props = {
  menu: any,
}

export const StaffHeader: React.FC<Props> = ({menu}) => {
  const [active, setActive] = useState(1);
  const navigate = useNavigate()
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const {currentUser} = useContext(AuthContext)

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };
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
     <h3>ABELENS</h3>
     <p>Inventory Management System</p>
      <div className="right">
        {menu.map((item: any, index: number) =>(
          <div key={index}  onClick={() => __navigate(item.id)}>
              <StaffNavBarItems
              
                  onClick={() => setDropdownVisible(false)}
                  active={item.id === active}
                  item={item} />
          </div>
        ))}
      </div>
      <button onClick={signOutUser}>LOG OUT</button>  
    </div>
  );
}