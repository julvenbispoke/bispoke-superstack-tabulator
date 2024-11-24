const DOMO = {
	context: null,
	addQuery: "",
	addColumn: "",
	columns:  [
        'Ordered Units - MFG',
        'Units Ordered',
        'Shipped Units - SRC',
        'Foreign - Ordered Product Sales (OPS)',
        'Foreign - Ordered Revenue - MFG',

        'Foreign - Shipped COGS - SRC',
        'Ordered Product Sales (OPS)',
        'Ordered Revenue - MFG',
        'Product Name',
        'Sessions',
        'Glance Views',
        'Date String',
        "SKU",
        "Client SKU",
        "Client Title",
      	"Data Type ID",
      	"Product ID",
      	"(Child) ASIN"
        ],	

	getEnv: async () => {	
		let env = null

		try {
			env = domo.env 
		}catch(err) {
			
			env = false
		}
		// console.log(env)
		return env
	},
	getColumns: async () => {
		 let data = await domo.post('/sql/v1/dataset0',
	    `SELECT * from dataset0 limit 1`, 
	    {contentType: 'text/plain'})
		 console.log({getColumns: data})
		 return data
	},
	getClientTitles : async () => {



	 	let client = []
	 	
	    let sql = `SELECT "Product ID" FROM dataset0 ${DOMO.addQuery} GROUP BY "Product ID"`
	    // console.log({sql})

	    let data = await domo.post('/sql/v1/dataset0',
	    sql, 
	    {contentType: 'text/plain'})
	    console.log({getClientTitles: data})
	    data = data.rows.map( x => x[0])
	    // client = data.rows.map( x => x[2]).filter( x => x != '')	
	    client = data.filter( x => ![undefined, null, ""].includes(x))

	    console.log({client, sql})
	    return client
	},
	getYearData :async (value) => {
		
		

		// let url = `/data/v1/dataset0?fields=${DOMO.columns.join(",")}&filter='SKU'=='${value}'`
		// // let url = `/data/v1/dataset0?fields=${DOMO.columns.join(",")}&filter='Product ID'==${value}`
		// let url = `/data/v1/dataset0?fields=${DOMO.columns.join(",")}&filter=Product ID in [${value.map(x => `'${x}'`).join(",")}]`
		// console.log({url})
		// let resp = await domo.get(url)
		// console.log({clientList: value})
		let sql = `SELECT 
					${DOMO.columns.map( x => `"${x}"`).join(",")} 
					FROM 
					dataset0 
					WHERE "Product ID" IN (${value.map( x => `'${x}'`).join(",")}) 
					AND "Data Type ID" IN (1,6) `
		sql = sql.replaceAll("\n", " ").replaceAll("\t","")
		// console.log({clientList: value, query: sql})	
		 let resp = await domo.post('/sql/v1/dataset0',
	    sql, 
	    {contentType: 'text/plain'})

		 console.log({dataColumns: resp.columns})
		 let dataArr = []
		 resp.rows.forEach( (x, i) => {
		 	let dataObj = {}
		 	x.forEach( (xx, ii) => {

		 		dataObj[resp.columns[ii]] = ["DOUBLE", "LONG"].includes(resp.metadata[ii].type) && resp.columns[ii] != "Product ID"  ? Number(xx) : xx
		 	})

		 	dataArr.push(dataObj)
		 })

		 resp = dataArr

		 // resp = resp.filter( x => x["Product ID"] != "")
		  // console.log({resp})
		 return resp
		
		 // let data = []
		//  data = resp.sort(function(a,b){
        //     return new Date(b['Date String']) - new Date(a['Date String']);
        // });
		 // console.log({data})
		// return data

	},
	onFilterUpdate: async (setData, filterUpdates, setClientsLoaded) => {

		

		domo.onFiltersUpdate( e =>  {	
			setClientsLoaded(false)
			
			let operandWord = [
				"GREATER_THAN", 
				"GREAT_THAN_EQUALS_TO",
				"LESS_THAN",
				"LESS_THAN_EQUALS_TO",
				"BETWEEN",
				"EQUALS",
				"NOT_EQUALS",
				"IN"
			];

			let operandSql = [">",">=","<","<=","BETWEEN","=","<>","IN"]

			let includeList = []
			let queryList = []
			let columnList = []

			
			
			if(e.length == 0) {
				
				console.log("no filters")
				DOMO.addQuery = ""
				DOMO.addColumn = ""
				// getClientList()
				filterUpdates()
				return
			}
			
			e.forEach( x => {
				let operand = -1
				operandWord.forEach( (xx, ii) => {
					if(xx == x.operand) operand = ii
				})
				let formatValue = x.values;
				if(x.operand == "IN") {
					formatValue = `${(typeof x.values == "object") ? `(${x.values.map(xxx =>( typeof xxx) == 'string' ? `'${xxx}'`: xxx).join(",")})` : x.values}` 
				}
				if(x.operand  == "BETWEEN") {
					formatValue =  `${x.values[0]} AND ${x.values[1]}`
				}
				queryList.push(`"${x.column}" ${operandSql[operand]} ${formatValue}` )
				columnList.push(x.column)
				// console.log({operand, word: x.operand, sql: operandSql[operand], formatValue, values: x.values})
			})

			// console.log(queryList.join(" AND "), e)
			queryList = queryList.join(" AND ")
			DOMO.addQuery =  `WHERE ${queryList}`
			DOMO.addColumn = (() => {
				let columnString = "";
				if(columnList.length > 0) {
					columnString = `,${columnList.map( x => `"${x}"`).join(",")}`
				}
				return columnList
			})()
			// getClientList()
			filterUpdates()

		})
		return
	}
}
