var adata={url:"/rbsadmin"}
$(function () {
})

function goto_link(pg) {
	if(pg)
		window.location="/rbsadmin?pg="+pg
	else
		window.location="/rbsadmin"
}