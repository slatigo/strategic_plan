var pg="tasks"
adata.pg=pg
$(function(){
	get_envelopes()
})

function get_envelopes() {
	var data=prep_data([])
	data.rq="get-envelopes"
	ajax_go(data,function (rst) {
		load_envelopes(rst)
	})
}


function envelope_dl() {
	

	$("#envelope-modal").modal("show")
}
function load_envelopes(rst) {
	$(".cd").hide()
	$("#envelopes-card").show()
	var envelopes=rst.envelopes;
	
	adata.envelopes=envelopes;
	for(var i=0;i<envelopes.length;i++){
		envelopes[i].btn="<a class='btn btn-primary btn-sm' href='#' onclick=\"get_tasks("+i+")\">View<i class='fa fa-view'></i><a>"
	}
	var hd=[{lb:"Employee Name",fn:"name"},{lb:"Envelope Name",fn:"label"},{lb:"Status",fn:"status"},{lb:"Start Date",fn:"from_date_f"},{lb:"End Date",fn:"to_date_f"},{lb:"",fn:"btn"}]
	gen_table(hd,envelopes,"envelopes-div","No envelopes added")
}
function view_envelopes(){
	$(".cd").hide()
	$("#envelopes-card").show()

}
function task_dl() {
	

	$("#task-modal").modal("show")
}
function add_task(index) {
	
	adata.rq="add-task"
	var flds=[{lb:"Task",fn:"task"}]
	var data=prep_data(flds);if(!data){return 0;}
	data.env_id=adata.env_id
	if(adata.tasks.length>8){
		return display_err("You can't add more than 8 tasks")
	}
	if(!vr){return 0}
	ajax_go(data,function (rst) {
		load_tasks(rst)
		clear_fields()
		
		$(".modal").modal("hide")
	})
}
function get_tasks(i) {
	var env_id=adata.envelopes[i].id;
	adata.label=adata.envelopes[i].label
	adata.status=adata.envelopes[i].status;
	var data=prep_data([])
	data.env_id=env_id;
	adata.env_id=env_id


	data.rq="get-tasks"
	ajax_go(data,function (rst) {

		load_tasks(rst)
	})
}
function load_tasks(rst) {
	var tasks=rst.tasks;
	adata.tasks=tasks;
	$("#envelope-status").text("Status: "+adata.status)
	if(adata.status=="Not Submitted"){
		$("#submit-btn").show()
	}
	else{
		$("#submit-btn").hide()
	}
	$("#envelope-hdr").text(adata.label)

	$(".cd").hide()
	$("#tasks-card").show()
	var hd=[{lb:"#",ft:"serial",width:50},{lb:"Task Name",fn:"task"},{lb:"Status",fn:"status"},{lb:"Score",fn:"score"}]
	gen_table(hd,tasks,"tasks-div","No tasks added")
}

function remove_envelope(index) {
	var id=adata.orgs[index].id
	var data={id:id,rq:"remove-orgs",url:adata.url}
	ajax_go(data,function (rst) {
		load_orgs(rst)
	})
}
function complete_dl(argument) {
	$("#complete-modal").modal("show")
}
function submit_envelope(index) {
	adata.rq="submit-envelope"
	var data=prep_data([lb:"Remark",fn:"remark"]);if(!data){return 0;}
	data.env_id=adata.env_id
	ajax_go(data,function (rst) {
		adata.status=rst.status;
		display_succ("Task review completed")
		load_tasks(rst)
	})
}
