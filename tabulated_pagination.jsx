const TabulatedPagination = () => {

	const {useEffect, useState, useContext} = React
	const context = useContext(AppContext)

	const {
		env,
		table, setTable,
		weekDates, setWeekDates,
		pageList, setPageList,
		pageLimit, pageNow, setPageNow,
		numberWithCommas,
		tableLoading, setTableLoading,
		clients, setClients,
		resetOnFilter, setResetOnFilter,
		currency, vendor
	} = context;

	const [clientsCount, setClientsCount] = useState(null)


	const [loadFunctions, setLoadFunctions] = useState([])
	const [clientListLoaded, setClientListLoaded] = useState(false)
	const [rawData, setRawData] = useState([])
	const [tableData, setTableData] = useState([])

	const createTableCols = () => {
		console.log("creating table")
		let initTable = new Tabulator('#table', {
			height: '75vh',
			reactiveData: true,
			data: [],
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

		// console.log(functionsArray.length)
		return
	}

	const setPagesListHandler = () => {
		console.log("setting page list")
		let pages = Math.ceil(clientsCount / pageLimit);
		setPageList(pages)
	}

	const loadRestClientList = async () => {
		console.log("load rest client data")

		Promise.all(loadFunctions.map( x => x())).then( result => {

			let restClients = result.flat(1)

			setClients([...clients, ...restClients])
			
		})
	}	

	const loadData = async () => {
		console.log("loading data")
		// console.log(table)
		let from = (pageLimit * pageNow) , to = (pageLimit * pageNow) + pageLimit;

		let list = clients.slice(from, to)

		console.log({from, to, list})
		// return
		try {
			let newData = await DOMO.getYearData(list)
			let newDataList = list.map( x => newData.filter( xx => xx['Product ID'] == x))

			newDataList = newDataList.filter( x => x.length > 0)

			

			setRawData([...rawData, ...newDataList])

		} catch (err) {
			console.log({err})
		
		}finally{


		}
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
		// let newData = rawData.filter(x => x.length > 0);


		// console.log({rawData: rawData, newData: newData})
		let newData = rawData;
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
				market = newData[x][0]['Amazon Marketplace'] || "";

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

		console.log({tableRowArr})
		setTableData(tableRowArr)
		
		return tableRowArr
	}

	const resetTable = () => {
		console.log("initialize reset table")
		if(env) {
			if(resetOnFilter) {
				setResetOnFilter(false)
			
				setClients([])
				setClientListLoaded(false)
				setPageList(null)
				getClientList()
			}
			setRawData([])
			setTableData([])
			table.setData([])
		}
		
	}

	useEffect(() => {

		if(weekDates.length > 0) createTableCols ();

	}, [weekDates])

	useEffect(() => {
		if(table && env) getClientList()
	}, [table, env])

	useEffect(() => {
			
		if(!clientListLoaded && clients.length > 0) {

			console.log({clients})
			
			setPagesListHandler()
			setClientListLoaded(true)

		}
		
	}, [clients])

	useEffect(() => {
		
		if(clientListLoaded) {
			loadRestClientList()
		} 
	}, [clientListLoaded])

	// useEffect(() => {
		
	// 	if(loadFunctions.length > 0) {

	// 		loadRestClientList()
	// 	}
	// }, [loadFunctions])

	useEffect(() => {
		console.log({pageList})
		if(pageList > 0 ) loadData ();
	}, [pageList])

	useEffect(() => {
		console.log({rawData})
		// if(rawData.length < pageLimit) {

		// }
		if(table && rawData.length > 0) {

			table.setData(createTableData())
		} 
	}, [rawData])

	useEffect(() => {
		
		// console.log("sorting table...");
		// if(table) {
		// 	table.setSort([
		// 	    {column:"total", dir:"desc"}, //sort by this first
			    
		// 	]);
		// }
		if(table && tableData.length > 0) {
			console.log("table loaded")
			setTableLoading(false)
		}
		
		
	}, [tableData])

	useEffect(() => {
		console.log({pageNow})
		if(pageNow == null) {
			setPageNow(0)
		}
		if(pageNow != null) {
			console.log("set page to "+ pageNow)
			resetTable()
			loadData()
		}
		
	}, [pageNow])

	useEffect(() => {
		if(resetOnFilter && env) {
			console.log("reseting table for filters")
			resetTable()
			
			// setResetOnFilter(false)
			// setPageNow(null)
			// setClientListLoaded(false)
			
		}
	}, [resetOnFilter])

	useEffect(() => {
		// console.log({currency, vendor})
		if(table && env) {
			
			table.setData([])
			// setRawData()
			setTimeout(() => {
				table.setData(createTableData())
				// loadData()
			}, 100)
			
		}
		
	}, [currency, vendor])

	return (
		<div>
	
			<div id="table"></div>
		</div>
	)	
}