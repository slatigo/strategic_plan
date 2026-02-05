var pg="tasks"
adata.pg=pg
$(function(){
	get_envelopes()
	populate_date()
})
function get_envelopes_def(status) {
	adata.status=status;
	get_envelopes()
}
function get_envelopes() {
	var data=prep_data([])

	if(!adata.status)
		data.status="Pending Supervisor Review"
	data.status=adata.status;

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
	var hd=[{lb:"Name of Staff",fn:"name"},{lb:"Task Group",fn:"label"},{lb:"Status",fn:"status"},{lb:"Start Date",fn:"from_date_f"},{lb:"End Date",fn:"to_date_f"},{lb:"",fn:"btn"}]
	gen_table(hd,envelopes,"envelopes-div","No task groups")
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
	for(var i=0;i<tasks.length;i++){
		var status=tasks[i].status
		tasks[i].status_f=status
		
		if(status=="Completed")
			score=2;
		else if(status=="In Progress")
			score=1
		else if(status=="Not Done")
			score=0
		
		else
			score="-"
		tasks[i].score=score;
		if(status==""||status==null){
			tasks[i].status_f=load_review_options()
		}
	}
	$("#envelope-status").text("Status: "+adata.status)
	if(adata.status=="Pending Supervisor Review"){
		$("#submit-btn").show()
	}
	else{
		$("#submit-btn").hide()
	}
	$("#envelope-hdr").text(adata.label)

	$(".cd").hide()
	$("#tasks-card").show()
	var hd=[{lb:"#",ft:"serial",width:50},{lb:"Task Name",fn:"task"},{lb:"Status",fn:"status_f",width:200},{lb:"Score",fn:"score"}]
	gen_table(hd,tasks,"tasks-div","No tasks added")
}
function load_review_options() {
	var options=[{lb:"Completed",fn:"Completed"},{lb:"In Progress",fn:"In Progress"},{lb:"Not Done",fn:"Not Done"}]
	var sel="<select class='form-select'>"
	for(var i=0;i<options.length;i++){
		sel+="<option>"+options[i].lb+"</options>"
	}
	sel+="</select>"
	return sel;
}

function remove_envelope(index) {
	var id=adata.orgs[index].id
	var data={id:id,rq:"remove-orgs",url:adata.url}
	ajax_go(data,function (rst) {
		load_orgs(rst)
	})
}
function complete_dl() {
	$("#complete-modal").modal("show")
}
function submit_envelope(index) {
	adata.rq="submit-envelope"
	var data=prep_data([]);if(!data){return 0;}
	data.env_id=adata.env_id
	
	ajax_go(data,function (rst) {
		adata.status=rst.status;
		display_succ("Task group review completed")
		load_tasks(rst)
	})
}
function add_envelope(index) {
	var start_date=format_day("from")
	var end_date=format_day("to")
	adata.rq="add-envelope"
	var flds=[{lb:"Task Group",fn:"label"},{lb:"Start date",fn:"from_date",vl:start_date,ft:"date"},{lb:"End date",fn:"to_date",vl:end_date,ft:"date"}]
	var data=prep_data(flds);if(!data){return 0;}
	if(!vr){return 0}
	ajax_go(data,function (rst) {
		load_envelopes(rst)
		clear_fields()
		
		$("#.modal").modal("hide")
	})
}
