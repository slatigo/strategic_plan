adata.pg="contracts"
$(function () {
	get_defaults()
	
})

function get_defaults() {
	var data={rq:"get-defaults",url:adata.url}
	ajax_go(data,function (rst) {
		adata.me=rst.user
		load_contracts(rst)
	})
}
function get_contracts() {
	var data={rq:"get-contracts",userid:adata.userid,url:adata.url}
	ajax_go(data,function (rst) {
		load_contracts(rst)
	})
}
