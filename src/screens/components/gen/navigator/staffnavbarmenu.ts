import { faArchive, faCartArrowDown, faShoppingCart } from "@fortawesome/free-solid-svg-icons";

const StaffNavbarmenu = [
    {
        id: 1,
        title: 'Sales',
        path: '/staff/sales',
        icon: faShoppingCart,
    },
    {
        id: 2,
        title: 'Stash',
        path: '/staff/stash',
        icon: faCartArrowDown
    },
    {
        id: 3,
        title: 'Inventory',
        path: '/staff/inventory',
        icon: faArchive
    },
]

export default StaffNavbarmenu;