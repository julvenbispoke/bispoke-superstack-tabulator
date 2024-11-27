const Tabulated = () => {

	const {useState, useEffect, useContext} = React
	const context = useContext(AppContext)
	const {
		env, 
		data, 
		setData, 
		weekDates, 
		vendor, 
		currency, 
		numberWithCommas, 
		table, 
		setTable, 
		clients,
		setClients,  
		setResetTable, 
		resetTable,
		clientsLoaded, 
		setClientsLoaded
	} = context


	const [tableData, setTableData] = useState([])
	const [currentPage, setCurrentPage] = useState(null)
	const [loading, setLoading] = useState(false)
	const [scrollPosition, setScrollPosition] = useState(0)
	const [noMoreData, setNoMoreData] = useState(false)

	const [loadFunctions, setLoadFunctions] = useState([])

	const [clientsCount, setClientsCount] = useState(null)


	let scroll = 0
	let load = false
	let page = 1
	let listLimit = 20

	let tableDataLocal = []

	const createTableCols = () => {

		let initTable = new Tabulator('#table', {
			height: '80vh',
			reactiveData: true,
			data: tableDataLocal,
			groupBy: "childasin" ,
			 placeholder:"Loading...",
			 groupHeader:function(value, count, data, group) {
			
			 	let title = data.filter( x => x.asin != "")[0];
			 	return title.asin ;

			 },
			
			 selectableRows:false,
			columns: [

				{title: "Values", field: "values", frozen: true,  headerSort: false, formatter: (cell) => {
					cell.getElement().classList.add("fw-bold")
					return cell.getValue()
				}},
				
				...(() => {
					let weeksArr = []

					weekDates.forEach( x => {
						if(!moment(x).isSameOrAfter(new Date())) {
							weeksArr.push({title: x, field: x, headerSort: false	})
						}
						
					})

					return weeksArr
				})(),
				{title: "Grand Total", field: "total", headerSort: false, },

				],
		
		})


		setTable(initTable)
		
	}

	const createTableData = () => {
		// console.log({createTableData: data})

		let tableRowArr = [];
		let valueFormatter = (value, field) => {
			// return value
			if (["", null, undefined, 0, NaN, Infinity].includes(value)) return "";
			let fix = ['sessions', 'units'].includes(field) ? 0 : 1;
			let displayValue = isFinite(value) ? field == 'cvr' ? (value * 100).toFixed(fix) : value.toFixed(fix) : 0;
			return `${field == 'sales' ? '$' : ''}${numberWithCommas(displayValue)}${['cvr', 'cvr_total'].includes(field) ? '%' : ''}`;
		};



		let weekRows = (field, dataset, formatted) => {


			let weeksArr = {};
			total = 0;
			for (let x in weekDates) {
				let value = valueCalculator(field, dataset, weekDates[x], context);
				let valueFormatted = valueFormatter(value, field);

				weeksArr[weekDates[x]] = formatted ? valueFormatted : value;
				total = total + value;
			}


			return {
				...weeksArr,
				total: ['cvr', ''].includes(field) ? "" : formatted ? valueFormatter(total, field) : total
			};
		
		};

		// data.forEach( x => {
		let newData = data.filter(x => x.length > 0);
		for (let x in newData) {

			// console.log({dataX: x})
			let units = weekRows('units', newData[x], false),
			unitsFormatted = weekRows('units', newData[x], true);
			let sales = weekRows('sales', newData[x], false),
			salesFormatted = weekRows('sales', newData[x], true);
			let sessions = weekRows('sessions', newData[x], false),
			sessionsFormatted = weekRows('sessions', newData[x], true);
			let cvr = weekRows('cvr', newData[x], false),
			cvrFormatted = weekRows('cvr', newData[x], true);


			let name = newData[x][0]['Product Name'] || "",
				asin = newData[x][0]['(Child) ASIN'] || "",
				market = newData[x][0]['Amazon Marketplace'] || "",

			let asinHTML = () => `
				<div class="text-truncate fw-bold text-wrap"  title="${name}">
					${asin} &bull; ${market} &bull; ${name || "...."}  
				</div>`;

			let tableRow = [
				{asin: asinHTML(0),childasin: asin ,values: "Units",...unitsFormatted}, 
				{asin: null, childasin: asin,values: "Sales",...sales,}, 
				{asin: null, childasin: asin ,values: "Sessions",...sessionsFormatted}, 
				{asin: null, childasin: asin ,values: "CVR",...cvrFormatted, total: (() => {
					let show = isFinite(sessions.total / units.total);
					let res = valueFormatter(sessions.total / units.total, 'cvr_total');
					// let res =  sessions.total/units.total
					if (!show) return "";
					return res;
				})()
			}];

			// tableRowArr = [...tableRowArr, ...tableRow]
			tableRowArr.push(tableRow);

			// })
		}
		let newTable = [];
		let salesIndex = 1
		// tableRowArr = tableRowArr.sort( (a,b) => a.total - b.total)
		tableRowArr.forEach(x => {
			// x[2].total = valueFormatter(x[2].total, 'sales')	


			Object.keys(x[salesIndex]).forEach(xx => {
				let valid = isFinite(x[salesIndex][xx]);
				x[salesIndex][xx] = !isFinite(x[salesIndex][xx]) ? x[salesIndex][xx] : valid ? valueFormatter(x[salesIndex][xx], 'sales') : 0;
			});
			newTable = [...newTable, ...x];
		});
		tableRowArr = newTable;



		return tableRowArr
	}

	const createTableRows = () => {
		
		console.log("creating table rows")

   		let newtableData = createTableData()


   		// newTableData = tableData.concat(addition)

   		console.log({newtableData})
	   	// setTableData(newTableData);
   		setTableData(newtableData);

	  };

  	const setCurrentPageHandler = () => {
  		console.log("setting current page")
  		
  		page = currentPage + 1
  		setCurrentPage(page)
  
  	}

  	const addData = async  () => { 
  		
		console.log("adding data")
		// console.log(table)
		let from = (listLimit * currentPage) - listLimit, to = listLimit * currentPage;
	
		let pageList = clients.slice(from, to)
		
		console.log({pageList, clients,currentPage, from , to})

		if(clients.length < to) {
			console.log("client list length is less than next page count")
			setNoMoreData(true)	
		}

		try {
			let newData = await DOMO.getYearData(pageList)
			let newDataList = pageList.map( x => newData.filter( xx => xx['Product ID'] == x))

			newDataList = newDataList.filter( x => x.length > 0)

			let totalData = data.concat(newDataList)

			setData(totalData)

		} catch (err) {
			console.log({err})
		
		}finally{
			setLoading(false)
			load = false

		}

	}


	const triggerLoadData = (top) => {
		let offsetHeight = document.querySelector(".tabulator-table").offsetHeight	
		let trigger = offsetHeight * .75;
		// console.log({top, trigger, loadData: top  > trigger, loading })
		if(top  > trigger && !loading) {		
			
			setScrollPosition(top - 100)
			load = true
			setLoading(true)	
			
		}
	}

	const resetTableHandler = () => {
		console.log("reseting table data")
		setNoMoreData(false)
		setClientsCount(null)
	
		if(!clientsLoaded) setClients([])
		setData([])
		setTableData([])
		setCurrentPage(null)
		setScrollPosition(0)
		setResetTable(false)
		table.clearData()
	}

	const loadRestClientList = async () => {

		Promise.all(loadFunctions.map( x => x())).then( result => {
			
			


			let restClients = result.flat(1)

			setClients([...clients, ...restClients])
			
		})
	}	

	const getClientList = async () => {

		let limit = 10000;
		let count = await DOMO.countAllClients()
		console.log({count_getClientList: count})
		setClientsCount(count)
		
		let chunks = Math.ceil(count/limit)
		// console.log(count/limit)
		console.log({chunks})
		let functionsArray = []
		for(let i = 0; i < chunks; i++) {
	
			functionsArray.push( () => DOMO.getClientTitles(limit, i))
		}

		let firstBatch = await functionsArray[0]()
		// console.log(loadFunctions.length)
		setClients(firstBatch)
		functionsArray.shift()
		setLoadFunctions(functionsArray)

		console.log(functionsArray.length)
		return
	}

	useEffect(() => {
		// console.log({clients2: clients})
		loadRestClientList()
	}, [loadFunctions])

	useEffect(() => {
		console.log({dataLoaded: data, tableData})
		
		if(data.length >= listLimit && weekDates.length > 0) {
			// console.log({data})
			createTableRows ()
			// console.log("create table rows")
			
		}

		if(noMoreData) createTableRows ()

		if(data.length < listLimit && !noMoreData) {
			console.log("list less than limit, loading more")
			console.log({dataLength: data.length})
			// setTableData(data)
			setCurrentPageHandler() 
		}

	}, [data])


	useEffect(() => {
		
		if(weekDates.length > 0) {
			console.log("create table columns")
			createTableCols()
		;}
	
	}, [weekDates])

	useEffect(() => {
		
		// let el = document.querySelector(".tabulator-tableholder")
		if(tableData.length > 0) {
			console.log('table data updated')
			console.log({tableData})
			tableDataLocal = tableData
			// console.log({tableDataLocal})
			table.setData(tableDataLocal);
			if(currentPage > 1) document.querySelector(".tabulator-tableholder").scrollTop = scrollPosition
			// el.scrollTo(0, scroll)
			
		} 
	}, [tableData])
	useEffect(() => {
		// console.log({currency, vendor})
		
		if(env && table) {

			resetTableHandler ()

			// createTableRows ();
		} 


	}, [currency, vendor])

	useEffect(() => {


		
		if(table){
	 
			

			console.log("table created")

			let addColumn = [
				{title: "ASIN Description", field: "asin", frozen: true, width: 180, formatter: 'html', headerSort: false	},
				{title: "(Child) ASIN", field: "childasin", frozen: true, headerSort: false},
				];
			Promise.all([
				table.addColumn(addColumn[0], true, "values"),
				table.addColumn(addColumn[1], true, "values")
			]).then(resp => {
				console.log("deleting columns")
				table.hideColumn("childasin") 
				table.hideColumn("asin") 
			})
			// addColumn.forEach( x => table.addColumn(x,true,"values"));



			table.on("scrollVertical", function(top){
			        //top - the current vertical scroll position
				
				let offsetHeight = document.querySelector(".tabulator-table").offsetHeight	
				let clientHeight = document.querySelector(".tabulator-table").clientHeight	
				let scrollHeight = document.querySelector(".tabulator-table").scrollHeight
				// let scrollTop = document.querySelector(".tabulator-tableholder").scrollHeight
				let trigger = (clientHeight) * .75
				// console.log({top, trigger, loading, condition: top  > trigger && !loading})
				// triggerLoadData(top, trigger)
				triggerLoadData(top)
				
			});
		}
	}, [table])

	useEffect(() => {
		console.log({clientsCount, clients})

		if(clients.length > 0 && !clientsLoaded) {
			addData();	
			setClientsLoaded(true)
		}
		
	}, [clients])

	useEffect( () => {
		console.log({currentPage})
		
		if(currentPage == null) setCurrentPage(1)
		if(env && currentPage != null && table) {

			if(!clientsLoaded) getClientList();
			else addData();	
			// 
		}
	}, [currentPage])

	useEffect( () => {
		console.log({loading})
		load = loading

		if(loading) {
			console.log("trigger load data")
			setCurrentPageHandler()
		} 
	}, [loading])
	useEffect( () => {
		// console.log({context})
		scroll = scrollPosition
	}, [scrollPosition])	

	useEffect(() => {
		if(resetTable) {
			resetTableHandler()	
		}
	}, [resetTable])

	useEffect(() => {
		console.log({noMoreData})
		// if(noMoreData) createTableRows()
	}, [noMoreData])

	useEffect(() => {
		console.log({clientsLoaded})
	}, [clientsLoaded])


	return (
		<div>
			{/*clients: {clients.length}*/}
			<div id="table" className="my-1 border border-secondary"></div>
		</div>
		

	)
}