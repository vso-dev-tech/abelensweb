import { faArchive, faCartArrowDown, faCogs, faShoppingCart } from "@fortawesome/free-solid-svg-icons";

const Navbarmenu = [
    {
        id: 1,
        title: 'Sales',
        path: '/admin/sales',
        icon: faShoppingCart,
    },
    {
        id: 2,
        title: 'Sales Stash',
        path: '/admin/sales stash',
        icon: faCartArrowDown,
    },
    {
        id: 3,
        title: 'Inventory',
        path: '/admin/inventory',
        icon: faArchive
    },
    {
        id: 4,
        title: 'Settings',
        path: '/admin/settings',
        icon: faCogs
    },
]

export default Navbarmenu;