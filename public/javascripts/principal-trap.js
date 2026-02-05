adata.pg="trap"
$(function () {
	get_traps()
	populate_cs_day()
})
function get_traps(status) {
	data={url:adata.url,rq:"get-traps",status:status}

	ajax_go(data,function (rst) {
		adata.me=rst.user
		load_traps(rst)
	})
}

function submit_trap() {
	
	var hd=[{lb:"Action",ft:"sel",fn:"ps_axn"},{lb:"Remarks",fn:"psremarks"}]
	adata.rq="submit-trap"
	var data=prep_data(hd,"post")
	if(!data)
		return 0;
	data.append("trap_id",adata.trap_id)
	
	var cfm=confirm("Confirm?")
	if(!cfm){return 0}
	ajax_file(data,function (rst) {
		$("#new-trap-modal").modal("hide")
		load_traps(rst)
	})
}


function load_traps(rst) {
	var traps=rst.traps;
	adata.traps=traps
	var hd=[{lb:"Name",fn:"name"},{lb:"Application Date",fn:"app_date"},{lb:"Travel Type",fn:"travel_type"},{lb:"Destination",fn:"destination"},{lb:"Start Date",fn:"leave_start"},{lb:"End Date",fn:"leave_end"},{lb:"Sponsorship",fn:"sponsorship"},{lb:"Purpose",fn:"purpose"},{lb:"Status",fn:"status"},{lb:"",ft:"btn",text:"View",oc:"view_trap"}]
	gen_table(hd,traps,"traps-div","No travel applications made")
}
