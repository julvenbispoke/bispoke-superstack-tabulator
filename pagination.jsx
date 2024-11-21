const Pagination = () => {

	const {useState, useEffect, useContext} = React
	const context = useContext(AppContext)
	const { setPageNow, pageNow, pages} = context

	const setPageNowHandler = (page) => {

		console.log({page})

		setPageNow(page)
	}


	return (
		<ul className="pagination pagination-sm">
			{[...new Array(pages)].map( (x, i) => (
				<li 
				onClick={e => setPageNowHandler(i + 1)}
				className={"page-item " + (pageNow == (i + 1) ? 'active':'')}><span className="page-link">{i + 1}</span></li>
			))

			}
		</ul>
	)
}