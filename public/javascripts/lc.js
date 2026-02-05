var adata={url:"/lc"}
$(function () {
})

function goto_link(pg) {
	if(pg)
		window.location="lc?pg="+pg
	else
		window.location="/lc"
}