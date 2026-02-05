var pg="staff"
adata.pg=pg
$(function(){
	get_default()
	
})


function get_default() {
	var data=prep_data([])
	data.rq="get-default"
	
	ajax_go(data,function (rst) {
		load_select(rst.depts,"id","dept","#dept_id")
		load_select(rst.psns,"id","psn","#designation_id")
	})
}
function dept_id_changed() {
	adata.dept_id=$("#dept_id").val()
	

}
function staff_dl() {
	$("#staff-modal").modal("show")
}
function get_staff() {
	var data=prep_data([])
	data.rq="get-staff"
	data.dept_id=adata.dept_id

	if(data.dept_id==""||data.dept_id==0||!data.dept_id){
		return display_err("Please select a unit")
	}
	ajax_go(data,function (rst) {
		load_staff(rst)
	})
}
function back(argument) {
	//$("#staff-div-parent").show()
}
function load_staff(rst) {
	$("#staff-div-parent").show()

	var staff=rst.staff;
	adata.staff=staff;
	
	var hd=[{lb:"Name",fn:"name"},{lb:"Email",fn:"email"},{lb:"Designation",fn:"psn"}]
	gen_table(hd,staff,"staff-div","No staff added in the selected unit")
}
function add_staff(index) {
	
	adata.rq="add-staff"
	var flds=[{lb:"Name",fn:"name"},{lb:"Email",fn:"email",ft:"email"},{lb:"Designation",fn:"designation_id"}]
	var data=prep_data(flds);if(!data){return 0;}
	data.dept_id=adata.dept_id;
	if(!vr){return 0}
	ajax_go(data,function (rst) {
		load_staff(rst)
		clear_fields()
		
		$("#.modal").modal("hide")
	})
}

function staff_dl() {
	
	$("#staff-modal").modal("show")
}
