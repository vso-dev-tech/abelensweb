
import React from "react";
import { Link } from 'react-router-dom';
import '../../styles/components.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
type Props = {
    item: Items,
    active: any,
}

type Items = {
    path: string,
    id: number,
    title: string,
    icon: IconDefinition,

}

 const StaffNavBarItems: React.FC<Props> = ({ item, active}) => {

    return (
        <Link
            to={item.path} 
            className={active ? 'tab-active': 'tab-inactive'} >
            <FontAwesomeIcon icon={item.icon} width={25} height={25} style={{marginRight: 5}} />
            <span className='tab-button'>{item.title}</span>
        </Link>
    )
}

export default StaffNavBarItems;