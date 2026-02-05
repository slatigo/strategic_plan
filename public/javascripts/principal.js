var adata={url:"/principal"}
$(function () {
	get_access_res()
})

function goto_link(pg) {
	if(pg)
		window.location="/principal?pg="+pg
	else
		window.location="/principal"

}
