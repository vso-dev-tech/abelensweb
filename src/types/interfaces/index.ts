import firestore from '@firebase/firestore'

export interface disabledform {
  
  disabled: boolean,
  date: string,
  id: string,
  text: string,
  
}

export interface appuserdata {
  active: boolean,
  branch: string,
  email: string,
  lastLoggedIn: firestore.Timestamp,
  restrict: boolean,
  username: string,
  storeid: string,
  uid: string,
  type: string,
}

export interface sales {
  branch: string,
  date: firestore.Timestamp,
  discount: number,
  docId: string,
  noitem: number,
  staffId: string,
  subtotal: number,
  total: number,
  transId: number,
}

export interface salesdetails {
    
  transId: number | null,
  itemno: string,
  unit: number,
  itemname: string,
  docId: string,
  unitprice: number,
  sellingprice: number,
}

export interface inventory {
  active: boolean,
  date: firestore.Timestamp,
  docId: string,
  sellingprice: number,
  itemname: string,
  itemno: number,
  stocks: number,
  unitprice: number,
  unitsales: number,
  branch: string,
  supplier: string,
  data?: any,
}

export interface flightdata {

    fullname: string,
		email: string,
		date: string,
		time: string,
		origin: string,
		//aircraft
		aircraftid: string,
		numberofaircraft: number,
		aircraftype: string,
		aircraftcolor: string,
		//flight
		flightrule: string,
		flighttype: string,
		flighttime: string,
		flightlevel: string,
		timelapse: string,
		departureaerodrome: string,
		destinationaerodrome: string,
		alternateaerodrome: string,
		alternateaerodrome2: string,
		cruising: string,
		route: string,
		piolotincommand: string,

		endurance: string,

		turbulencecat: string,
		equipments: string,
		survival: string,
		emergencyradio: string,

		persons: string,
		personsCollection: string[],
		remarks: string,

    active: boolean,
    approved: boolean,
    approvaldate: string,
    id: string,
    other: string
  
}

export interface disastercenter {

  center: string,
  evacuees: string,
  id: string,
  services: string,
  active: boolean,
  date: Date,
  disasterid: string,

  
}

export interface disasterdata {
  disaster: string,
  id: string,
  date: string,
  center: string,
  evacuees: string,
  response: string,
  agri: string,
  infra: string,
  livestock: string,
  active: boolean,
}

//NOTE:You must create new interface for each data that has different data types

//this interface is use in personaldata
//if you have any additions add comment
export interface name {
  firstname: string,
  middlename: string,
  lastname: string,
  suffix: string,

}
//---->personaldata use when pulling user's personal information<-----
//---->data usage in header navigation bar, login, and profile<------
export interface personaldata {

  uid: string,
  name: string,
  birthdate: string,
  civilstatus: string,
  contactnumber: string,
  email: string,
  social: string,
  age: string,
  sex: string,
  address: string,

}

//---> education use when pulling user's educational information <---- //
//this data can also be seen by the admin, but are only limited to them and the user //

export interface educationdata {

  uid: string,
  school: string,
  schoolid: string,
  sy: string,
  highered: boolean,
  course: string,
  exam: boolean,
  topnotcher: boolean,
  rank: string,

}

//work history, where user is currently working at, and this data is use by employmentdata history//
//this data can also be seen by the admin, but are only limited to them and the user //

interface historydetails {

  uid: string,
  work: string,
  yearstart: string,
  yearend: string,
  current: boolean,
}

// this uses the above details
//this data can also be seen by the admin, but are only limited to them and the user //

export interface employmentdata {
 
  uid: string,
  employee: string,
  currentwork: string,
  salary: string,
  history: historydetails,

}

//login data can only be use in login and change auth
//passwords are encrypted, please do not expose

export interface logindata {

  uid: string,
  email: string,
  username: string,
  type: string,
  branch: string,
  
}

export interface codedata {
  id: string,
  code: string,
  username: string,
}

//this is for alumni status
// adds new data if ever user attends last year's alumni home coming

export interface statusdata {
  status: string[],
  uid: string,
}

//chilren use in app.tsx only, to nest components for login auth

export interface children {
  children: any | null
}

//postdata used in data.tsx to show admin posts

export interface postdata {
  id: string,
  uid: string,
  time: Date,
  photo: string,
  text: string,
  active: boolean,
  type: string
  school: string,
}

export interface admindata {
  uid: string,
  photoURL: string,
  displayName: string,
  email: string,
}
export interface smsdata {
  subject: string,
  message: string,
  id: string,
}

