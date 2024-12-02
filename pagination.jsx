const Pagination = () => {

	const {useState, useEffect, useContext} = React
	const context = useContext(AppContext)
	const { pageNow, setPageNow, pageList, setPageList, pageLimit,tableLoading, setTableLoading, clients } = context

	const [showSelectPage, setShowSelectPage] = useState(false)
	const [page, setPage] = useState(null)
	const [error, setError] = useState(false)


	const setPageNowHandler = (to) => {
		setTableLoading(true)
		console.log({to})
		let newPageNow = pageNow;
		if(to == 'prev') {
			if(newPageNow < 1) return;
			newPageNow --
		}
		if(to == 'next') {
			console.log({newPageNow, pageList})
			if(newPageNow + 1 >= pageList) return;
			newPageNow++
		}
		setPageNow(newPageNow)
		
	}

	const cancelSetPage = () => {
		setError(false)
		setPage(pageNow + 1)
		 setShowSelectPage(false)
	}

	const goToPage = () => {
		setError(false)
		if(page < 1) {
			console.log("page less than 1")
			setError(true)
			return;
		}
		if(page >= pageList) {
			console.log("page more than pageLimit")	
			setError(true)
			return
		}

		setPageNow(page - 1)
		setShowSelectPage(false)
	}

	useEffect(() => {
		console.log({tableLoading})
	}, [tableLoading])

	useEffect(() => {
		console.log({showSelectPage})

	}, [showSelectPage])

	useEffect(() => {
		setPage(pageNow + 1)
	}, [pageNow])


	return (
		<div className="d-flex gap-1 justify-content-between">
			<div>
				<p>clients: {clients ? clients.length : null}, pages: {pageList}</p>
			</div>
			<div className="d-flex gap-1 ">
				{/*{error && "error"}*/}
				<button disabled={tableLoading} className = "btn btn-light btn-sm my-1" onClick={() => setPageNowHandler('prev')}> {"<"} </button>
				{!showSelectPage ? <button className = "btn btn-light disabled btn-sm my-1" >{ pageNow + 1 } </button> : null}
				{showSelectPage ?
				<div className="d-flex gap-1">
					<div className="align-self-center">
						<input 
						value={page} 
						onChange={ e => setPage(e.target.value)}  
						type="number" 
						className={"form-control form-control-sm " +(error?"is-invalid":null)}
						style={{width: 80}} />
					</div>
					<button onClick={() => goToPage()} className = "btn btn-primary btn-sm my-1" >&#10003;</button>
					<button onClick={() => cancelSetPage()} className = "btn btn-secondary btn-sm  my-1" >&#10005;</button>
				</div>
				:
				<button onClick={() => setShowSelectPage(true)} title={"select page"} disabled={tableLoading} className = "btn btn-light btn-sm my-1">...</button> 
				}
				

				<span className="align-self-center"> / </span>
				<button className = "btn btn-light disabled btn-sm my-1">{pageList || "..."}</button>
				<button disabled={tableLoading} className = "btn btn-light btn-sm my-1" onClick={() => setPageNowHandler('next')}> {">"} </button>
			</div>
		</div>
	)
}