var adata={url:"/bo"}
$(function () {
})

function goto_link(pg) {
	if(pg)
		window.location="/bo?pg="+pg
	else
		window.location="/bo"
}