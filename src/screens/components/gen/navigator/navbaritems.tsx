
import React, {useState} from "react";
import { Link } from 'react-router-dom';
import '../../styles/components.css'
import { Icon } from "@mui/material";
import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
type Props = {
    item: Items,
    active: any,
    onClick: (e: any) => void,
}

type Items = {
    path: string,
    id: number,
    title: string,
    icon: IconDefinition,

}

 const NavBarItems: React.FC<Props> = ({ item, active, onClick}) => {

    const [hover, setHover] = useState(false);
    return (
        <Link
            onClick={onClick}
            to={item.path} 
            className={active ? 'tab-active': 'tab-inactive'} >
            <FontAwesomeIcon icon={item.icon} width={25} height={25} style={{marginRight: 5}} />
            <span className='tab-button'>{item.title}</span>
        </Link>
    )
}

export default NavBarItems;