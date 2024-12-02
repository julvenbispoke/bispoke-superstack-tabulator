
const valueCalculator =  (field, dataset, week, context) => {

	if(field == '' || dataset == null  ) {
		return ''
	}

	const { vendor, currency} = context

	// console.log({ vendor, currency})

	
	dataset =  dataset.filter( x => {

		let date = week

		let date1 = new Date(date), from = new Date(date).getTime()
		let to = new Date(date1.setDate(date1.getDate()+7)).getTime()
		let xdate = new Date(x["Date String"]).getTime() 

		if(isNaN(xdate)) return false

		// console.log({from, to, xdate, in: xdate >= from && xdate <= to})
		return from <= xdate && to >= xdate
	})

	// console.log({field, dataset, week, vendor})	

	if(field == 'units') {

		let val1 = 0, val2 = 0

		if(!vendor) { //ordered revenue
			// console.log({field, currency, vendor})
			val1 = dataset.map( x => isFinite(x['Units Ordered']) ? x['Units Ordered'] : 0)
			val2 = dataset.map( x => isFinite(x['Ordered Units - MFG']) ? x['Ordered Units - MFG'] : 0)

		}
		if(vendor) { //shipped cogs
			// console.log({field, currency, vendor})
			val1 = dataset.map( x => isFinite(x['Units Ordered']) ? x['Units Ordered'] : 0)
			val2 = dataset.map( x => isFinite(x['Ordered Units - MFG']) ? x['Shipped Units - SRC'] : 0)
		}

		
		
		val1 = val1.reduce((partialSum, a) => partialSum + a, 0)
		val2 = val2.reduce((partialSum, a) => partialSum + a, 0)

		// console.log({field,val1, val2, sum: val1+ val2, week})

		return val1+val2
	}




	if(field == 'sales') {

		let val1 = 0, val2 = 0

		if(!currency && !vendor) {
			// console.log("local and ordered")
			val1 = dataset.map( x => isFinite(x['Foreign - Ordered Product Sales (OPS)']) ? x['Foreign - Ordered Product Sales (OPS)'] : 0)
			val2 = dataset.map( x => isFinite(x['Foreign - Ordered Revenue - MFG']) ? x['Foreign - Ordered Revenue - MFG'] : 0)

		}

		if(currency && !vendor) {
			// console.log("usd and ordered")
			val1 = dataset.map( x => isFinite(x['Foreign - Ordered Product Sales (OPS)']) ? x['Foreign - Ordered Product Sales (OPS)'] : 0)
			val2 = dataset.map( x => isFinite(x['Foreign - Shipped COGS - SRC']) ? x['Foreign - Shipped COGS - SRC'] : 0)
		}

		if(currency && vendor) {
			// console.log("usd and shipped")
			val1 = dataset.map( x => isFinite(x['Ordered Product Sales (OPS)']) ? x['Ordered Product Sales (OPS)'] : 0)
			val2 = dataset.map( x => isFinite(x['Ordered Revenue - MFG']) ? x['Ordered Revenue - MFG'] : 0)

		}

		if(!currency && vendor) {
			// console.log("local and shipped")
			val1 = dataset.map( x => isFinite(x['Ordered Product Sales (OPS)']) ? x['Ordered Product Sales (OPS)'] : 0)
			val2 = dataset.map( x => isFinite(x['Shipped COGS - SRC']) ? x['Shipped COGS - SRC'] : 0)

		}

		val1 = val1.reduce((partialSum, a) => partialSum + a, 0)
		val2 = val2.reduce((partialSum, a) => partialSum + a, 0)


		// console.log({field,val1, val2, sum: val1+ val2})
		return val1 + val2

	}

	if(field == 'sessions') {


		let val1 = dataset.map( x => isFinite(x['Sessions']) ? x['Sessions'] : 0),
			val2 = dataset.map( x => isFinite(x['Glance Views']) ? x['Glance Views'] : 0)

			val1 = val1.reduce((partialSum, a) => partialSum + a, 0)
			val2 = val2.reduce((partialSum, a) => partialSum + a, 0)

			// console.log({field,val1, val2, sum: val1+ val2})
			return val1+val2	


	}

	if(field == 'cvr') {

		let dividen = {
			val1: 0, val2: 0, sum: 0
		}
		let divisor = {
			val1: 0, val2: 0, sum: 0
		}

		dividen.val1 = dataset.map( x => x['Units Ordered'] ? x['Units Ordered'] : 0)
		dividen.val2 = dataset.map( x => x['Ordered Units - MFG'] ? x['Ordered Units - MFG'] : 0)

		divisor.val1 = dataset.map( x => x['Sessions'] ? x['Sessions'] : 0)
		divisor.val2 = dataset.map( x => x['Glance Views'] ? x['Glance Views'] : 0)

		dividen.val1 = dividen.val1.reduce((partialSum, a) => partialSum + a, 0)
		dividen.val2 = dividen.val2.reduce((partialSum, a) => partialSum + a, 0)

		divisor.val1 = divisor.val1.reduce((partialSum, a) => partialSum + a, 0)
		divisor.val2 = divisor.val2.reduce((partialSum, a) => partialSum + a, 0)

		dividen.sum = dividen.val1 + dividen.val2
		divisor.sum = divisor.val1 + divisor.val2	

		// return `${dividen.sum} / ${divisor.sum}`
		// console.log({field, dividen, divisor, product: dividen.sum/divisor.sum})
		return isFinite(dividen.sum/divisor.sum) ? (dividen.sum/divisor.sum) : ""



	}

	


}

const grandTotal = (field, data) => {

	if(field == 'units') {

	}

	if(field == 'sales') {

	}

	if(field == 'sessions'){

	}

	if(field == 'cvr') {

	}

}