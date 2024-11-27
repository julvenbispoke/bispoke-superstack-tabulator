const Index = () => {

	const {useState, useEffect, useContext} = React
	const context = useContext(AppContext)
	const {
		env, setEnv,
			currency, setCurrency,
			vendor, setVendor
		
	} = context

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

	
	useEffect(() => {
		console.log(env ? 'live':'not live')
		if(env) {
			// DOMO.onFilterUpdate(setData, filterUpdates, setClientsLoaded)
			// setResetTable(true)

			DOMO.onFilterUpdate()
		}
	}, [env])


	return (
		<div className="p-1">
			<Filters />
			{/*<Tabulated />*/}
			
			<TabulatedPagination/>
			<Pagination />
		</div>
	)	
}

ReactDOM.createRoot(document.getElementById("app")).render(
	<AppContextProvider>
		<Index />
	</AppContextProvider>
)