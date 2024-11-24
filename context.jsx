const AppContext = React.createContext()

const AppContextProvider = ({children}) => {

	const {useState, useEffect} = React

	const [test] = useState('test')
	const [env, setEnv] = useState(null)

	const [clients, setClients]  = useState([])
	const [clientsLoaded, setClientsLoaded] = useState(false)

	const [data, setData] = useState([])
	const [dataHistory, setDataHistory] = useState([])
	const [weekDates, setWeekDates] = useState([])

	const [currency, setCurrency] = useState(false)//false == local, true == usd
	const [vendor, setVendor] = useState(false)// false == ordered, true == shipped

	const [pages, setPages] = useState(null)
	const [pageNow, setPageNow] = useState(1)

	const [table, setTable] = useState(null)

	const [resetTable, setResetTable] = useState(false)

	const numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

	useEffect(() => {
		let weeks = 52
		let day1 = moment().format("YYYY-01-01")
		let weekList = [day1]
		// console.log({day1})
		setWeekDates([day1])
		for(let i =0; i< weeks; i++) {
			
			weekList.push(moment(day1, 'YYYY-MM-DD').add(i+1, 'weeks').format('YYYY-MM-DD'))
			setWeekDates(weekList)
		}
		// console.log(weekList)
	},[])

	return (
		<AppContext.Provider value={{
			test,
			clients, setClients	,
			env, setEnv,
			data, setData,
			weekDates, setWeekDates,
			currency, setCurrency,
			vendor, setVendor,
			numberWithCommas,
			pages, setPages,
			pageNow, setPageNow,
			table, setTable,
			resetTable, setResetTable,
			dataHistory, setDataHistory,
			clientsLoaded, setClientsLoaded
		}} >
			{children}
		</AppContext.Provider>
	)
}