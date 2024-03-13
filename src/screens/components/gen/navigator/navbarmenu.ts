import { faArchive, faCartShopping, faChartColumn, faCogs, faEnvelope, faList, faListCheck, faListUl, faLocationDot, faShoppingCart, faSpaghettiMonsterFlying, faTriangleExclamation, faUser } from "@fortawesome/free-solid-svg-icons";

const Navbarmenu = [
    {
        id: 1,
        title: 'Sales',
        path: '/admin/sales',
        icon: faShoppingCart,
    },
    {
        id: 2,
        title: 'Inventory',
        path: '/admin/inventory',
        icon: faArchive
    },
    {
        id: 3,
        title: 'Settings',
        path: '/admin/settings',
        icon: faCogs
    },
]

export default Navbarmenu;