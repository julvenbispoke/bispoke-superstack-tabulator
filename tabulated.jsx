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
			
			 	let title = data.filter( x => x.asin != "")[0]
			 	return title.asin 
			 },
			 rowFormatter: (row) => {
			 	// console.log({row})
			 },
			 selectableRows:false,
			columns: [
				// {title: "ASIN Description", field: "asin", frozen: true, width: 180, formatter: 'html', headerSort: false	},
				// {title: "(Child) ASIN", field: "childasin", frozen: true, headerSort: false},
				{title: "Values", field: "values", frozen: true,  headerSort: false	},
				
				...(() => {
					let weeksArr = []

					weekDates.forEach( x => {
						if(!moment(x).isSameOrAfter(new Date())) {
							weeksArr.push({title: x, field: x, headerSort: false	})
						}
						
					})

					return weeksArr
				})(),
				{title: "Grand Total", field: "total",  },

				],
		
		})
		// console.log({createTableCols:initTable })
		// initTable.hideColumn("childasin") 
		// initTable.hideColumn("asin") 
		setTable(initTable)
		
	}

	const createTableData = () => {
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

			let asinHTML = () => `
				<div class="text-truncate fw-bold text-wrap"  title="${newData[x][0]['Product Name']}">
					${newData[x][0]['(Child) ASIN']} &bull; ${newData[x][0]['Product Name'] || `...`}  
				</div>`;

			let tableRow = [{
					asin: asinHTML(0),
					// values: "",
					// ...weekRows('', null)
					childasin: newData[x][0]['(Child) ASIN'],
					values: "Units",
					...unitsFormatted
				}, 

				{
					asin: null	,
					childasin: newData[x][0]['(Child) ASIN'],
					values: "Sales",
					...sales
				}, {
					asin: null,
					childasin: newData[x][0]['(Child) ASIN'],
					values: "Sessions",
					...sessionsFormatted
				}, {
					asin: null,
					childasin: newData[x][0]['(Child) ASIN'],
					values: "CVR",
					...cvrFormatted,
					total: (() => {
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
		// console.log({tableRowArr})
		tableRowArr.sort((a, b) => b[salesIndex].total - a[salesIndex].total);
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
   		let newTableData = tableData

   		newTableData = [ ...newTableData, ...createTableData()]

   		console.log({newTableData})
	   	setTableData(newTableData);


	  };

  	const setCurrentPageHandler = () => {
  		console.log("setting current page")
  		
  		page = currentPage + 1
  		setCurrentPage(page)
  		// console.log({page})
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
			console.log({newDataList})
			
			setData(newDataList)
		} catch (err) {
			console.log({err})
			// setData([])
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
		
		if(!clientsLoaded) setClients([])
		setData([])
		setTableData([])
		setCurrentPage(null)
		setScrollPosition(0)
		setResetTable(false)
		table.clearData()
	}

	const getClientList = async () => {
		console.log('getClientList')
		let list = await DOMO.getClientTitles()
		console.log({getClientList: list})
		setClients(list)
		setClientsLoaded(true)

		return

	}

	useEffect(() => {
		console.log({dataLoaded: data})
		if(data.length >= listLimit && weekDates.length > 0) {
			// console.log({data})
			createTableRows ()
			// console.log("create table rows")
			
		}

		if(noMoreData) createTableRows ()

		if(data.length < listLimit && !noMoreData) {
			console.log("list less than limit, loading more")
			console.log({dataLength: data.length})
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
		if(clients.length > 0) addData();
		
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
		<div id="table" className="my-1 border border-secondary"></div>

	)
}