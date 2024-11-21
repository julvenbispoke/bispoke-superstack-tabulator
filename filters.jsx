const Filters = () => {

	const { useState, useEffect, useContext} = React
	const { currency, setCurrency, vendor, setVendor} = useContext(AppContext)


	useEffect(() => {
		// console.log({currency})
	}, [currency])
	useEffect(() => {
		// console.log({vendor})
	}, [vendor])

	return (
		<div class="container-fluid">
			<div className="row ">

				<div className="col-sm-12 col-md-6 col-lg-4 p-0">
					<div className="card m-1 text-bg-light">
					  <div className="card-body  p-1 mx-1"  style={{minHeight: 70}}>
					    <p className="fw-bold mb-1">USD / Local Currency Selector</p>
					    <select 
					    onChange={(e) => setCurrency(e.target.value == 'usd' ? true:false)}
					    class="form-select form-select-sm" 
					    defaultValue={currency ? 'usd': 'local'}>
							<option selected value="usd">USD Converted</option>
							<option value="local">Marketplace Local Currency</option>
							
						</select>
					  </div>
					</div>
				</div>
				<div className="col-sm-12 col-md-6 col-lg-4  p-0">
					<div className="card m-1 text-bg-light">
					  <div className="card-body  p-1 mx-1" style={{minHeight: 70}}>
					    <p className="fw-bold mb-1">Vendor OPS Model	</p>
					    	<div class="form-check form-check-inline">
								<input 
								defaultChecked={vendor }
								onChange={e => setVendor( true ) }
								class="form-check-input" type="radio" name="vendor" id="shipped" value="shipped"/>
								<label class="form-check-label" for="vendor">Shipped COGs</label>
							</div>
							<div class="form-check form-check-inline">
								<input 
								defaultChecked={!vendor}
								onChange={e => setVendor( false ) }
								class="form-check-input" type="radio" name="vendor" id="ordered" value="ordered"/>
								<label class="form-check-label" for="vendor">Order Revenue</label>
							</div>
							
					  </div>
					</div>
				</div>

				{/*<div className="col-sm-12 col-md-12 col-lg-4  p-0 ">
					<div class="card m-1 text-bg-light">
					  <div class="card-body  p-1 mx-1">
					    This is some text within a card body.
					  </div>
					</div>
				</div>*/}

			</div>
		</div>

	)
}