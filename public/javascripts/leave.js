function new_leave_dl(argument) {
	

	$("#new-leave-modal").modal("show")
	adata.rq="add-leave"

}

function submit_leave() {

	var flds=[{lb:"Leave type",fn:"leave_type"},{lb:"Leave Start day",fn:"ls_day",ft:"sel"},{lb:"Start month",fn:"ls_month",ft:"sel"},{lb:"Start year",fn:"ls_year",ft:"sel",ig:1},{lb:"Leave End Day",fn:"le_day",ft:"sel",ig:1},{lb:"Leave End Month",fn:"le_month",ft:"sel",ig:1},{lb:"Leave end year",fn:"le_year",ft:"sel",ig:1},{lb:"Address on Leave",fn:"leave_address"},{lb:"Phone on Leave",fn:"leave_phone",ft:"phone"}]
	var vr=check_empty(flds)
	if(!vr)
		return 0;
	var leave_start=$("#ls_year").val()+"-"+$("#ls_month").val()+"-"+$("#ls_day").val()
	var leave_end=$("#le_year").val()+"-"+$("#le_month").val()+"-"+$("#le_day").val()
	var data=prep_data(flds)
	data.url=adata.url;
	data.rq=adata.rq;
	data.id=adata.id;
	data.leave_start=leave_start
	data.leave_end=leave_end
	ajax_go(data,function (rst) {
		$("#new-leave-modal").modal("hide")
		adata.projects=rst.projects;
		load_leaves(rst)
	})
}

function load_leaves(rst) {
	var flds=[{lb:"Leave type",fn:"leave_type"},{lb:"Status",fn:"status"},{lb:"Leave Start",fn:"leave_start"},{lb:"Leave End",fn:"leave_end"},{lb:"Address on Leave",fn:"leave_address"},{lb:"Phone on Leave",fn:"leave_phone"},{lb:"",ft:"options"}]
	options=[{text:"View",method:"view_leave"},{text:"Cancel",method:"cancel_leave"},{text:"Change Department",method:"change_dept_dl"},{text:"Change Contract",method:"change_contract_dl"},{text:"Change Status",method:"change_status_dl"}]
	var leaves=rst.leaves;
	adata.leaves=leaves
	gen_table(flds,leaves,"leave-div","No leave applications made",options)
}
function view_leave(index) {
	var leave=[adata.leaves[index]]
	var flds=[{lb:"Leave type",fn:"leave_type"},{lb:"Status",fn:"status"},{lb:"Leave Start",fn:"leave_start"},{lb:"Leave End",fn:"leave_end"},{lb:"Address on Leave",fn:"leave_address"},{lb:"Phone on Leave",fn:"leave_phone"}]
	gen_table_mobile(flds,leave,"leave-details-div")
	$("#leave-details-modal").modal("show")
}

function cancel_leave(index) {
	var id=adata.leaves[index].id;
	var status=adata.leaves[index].status;
	if(status=="Cancellation Requested"){
		return display_err("Cancellation request already made for this leave application",6000)
	}
	if(status=="Approved"){
		return display_err("Unable to cancel, leave already approved")
	}
	var cfm=confirm("Please confirm you want to cancel this leave application")
	if(!cfm)
		return 0;
	
	var data={rq:"cancel-leave",id:id,url:adata.url}
	ajax_go(data,function (rst) {
		adata.projects=rst.projects;
		load_leaves(rst)
	})


}