const Index = () => {

	const {useState, useEffect, useContext} = React
	const context = useContext(AppContext)
	const {
		test, 
		env, 
		setEnv,
		clients, 
		setClients, 
		data, 
		setData, 
		pages, 
		setPages,
		setPageNow, 
		pageNow, 
		table, 
		setResetTable,
		dataHistory, 
		setDataHistory
	} = context

	const [listLimit] = useState(20)

	const getClientList = async () => {
		console.log('getClientList')
		let list = await DOMO.getClientTitles()
		console.log({getClientList: list})
		setClients(list)
		setPageNow(1)

		return

	}

	// const goToPage = () => {
	// 	table.clearData();
	// 	// console.log(table)
	// 	let from = (listLimit * pageNow) - listLimit, to = listLimit * pageNow
	// 	console.log({pageNow, from , to})
	// 	let pageList = clients.slice(from, to)
	// 	getData(pageList)
	// }

	const setPagesHandler = () => {
		console.log('setPageHandler')
		let listShow = listLimit
		let pageCount = Math.ceil(clients.length/listShow)

		console.log({pageCount})	

		setPages(pageCount)


		let page1 = clients.slice(0, listShow)
		getData(page1)
	}

	const getData = async (list) => {
		// console.log({getData: list})
		let data3 = await DOMO.getYearData(list)
		// console.log({dataList: data3})

		let dataList = list
		.map( x => data3.filter(xx => xx['Product ID'] == x))
		.map( x => x.sort(function(a,b){
            return new Date(b['Date String']) - new Date(a['Date String']);
        }))
        dataList = dataList.filter( x => x.length > 0)
		// console.log({dataList})
		// if(dataList.length < listLimit) {

		// 	return
		// }
        setData(dataList)
	}

	const getEnv = async () => {
		let resp = await DOMO.getEnv()
		setEnv(resp)
	}

	const filterUpdates = () => {
		console.log("filterUpdates")
		setResetTable(true)
	}

	

	useEffect(() => {
		console.clear()
		DOMO.context = context
		getEnv()
	}, [])

	// useEffect(() => {
	// 	console.log({data})
	// }, [data])

	useEffect(() => {
		console.log(env ? 'live':'not live')
		if(env) {
			DOMO.onFilterUpdate(getClientList, setData, filterUpdates)
			// DOMO.getColumns()
			getClientList()	

		}
	}, [env])

	useEffect(() => {
		// console.log({clients})
		// if(clients.length > 0) setPagesHandler()
		
	},[clients])

	useEffect(() => {
		if(pages) console.log({pages})
	}, [pages])

	// useEffect(() => {
	// 	if(env && data.length > 0) {
	// 		goToPage()
	// 	}
		

	// }, [pageNow])




	

	return (
		<div className="p-1">
			<Filters />
			<Tabulated />
			{/*<Pagination />*/}
		</div>
	)	
}

ReactDOM.createRoot(document.getElementById("app")).render(
	<AppContextProvider>
		<Index />
	</AppContextProvider>
)