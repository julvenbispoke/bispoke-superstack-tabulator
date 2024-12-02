const AppContext = React.createContext()

const AppContextProvider = ({children}) => {

	const {useState, useEffect} = React

	const [env, setEnv] = useState(null);
	const [clients, setClients] = useState([])

	const [currency, setCurrency] = useState(false)//false == local, true == usd
	const [vendor, setVendor] = useState(false)// false == ordered, true == shipped

	const [table, setTable] = useState(null)
	const [weekDates, setWeekDates] = useState([])

	const [pageList, setPageList] = useState(null)
	const [pageNow, setPageNow] = useState(0)
	const [pageLimit] = useState(100)

	const [tableLoading, setTableLoading] = useState(false)

	const [resetOnFilter, setResetOnFilter] = useState(false)

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
			env, setEnv,
			currency, setCurrency,
			vendor, setVendor,
			table, setTable,
			weekDates, setWeekDates,
			pageList, setPageList,
			pageNow, setPageNow, pageLimit, 
			numberWithCommas,
			tableLoading, setTableLoading,
			clients, setClients,
			resetOnFilter, setResetOnFilter,

		}} >
			{children}
		</AppContext.Provider>

	)
}