adata.pg="perf_plan"
$(function () {
	get_defaults()
})
function get_defaults() {
	var data=prep_data([])
	data.rq="get-defaults"
	ajax_go(data,function (rst) {
		adata.me=rst.user
		load_perf_plans(rst)
	})
}
function get_perf_plan_def(status) {
	
	adata.status_search=status
	get_perf_plans()
}
function get_perf_plans() {
	var data=prep_data([])
	data.rq="get-perf-plan"
	data.status=adata.status_search;

	ajax_go(data,function (rst) {
		load_perf_plans(rst)
	})
}
function load_perf_plans(rst) {
	$("#plan-entries-card").hide()
	$("#perf-plans-card").show()
	var perf_plans=rst.perf_plans;
	adata.perf_plans=perf_plans;
	for(var i=0;i<perf_plans.length;i++){
		var msg=perf_plans[i].msg;
		var status=perf_plans[i].status;
		perf_plans[i].plan_no_f=perf_plans[i].plan_no
		
	}
	
	var hd=[{lb:"Plan No: ",fn:"plan_no_f"},{lb:"Name",fn:"name"},{lb:"Position",fn:"psn"},{lb:"Plan Category",fn:"plan_cat"},{lb:"Status",fn:"status"},{lb:"Date Created",fn:"date_created"},{lb:"",ft:"btn",text:"Go to Plan",oc:"get_plan_entries"}]
	gen_table(hd,perf_plans,"perf-plans-div","No performance plans to show")
}

function take_axn_dl() {
	$("#axn-modal").modal("show")
	clear_fields()
}

function submit_perf_plan() {
	var data=prep_data([{lb:"Action",fn:"axn",ft:"sel"},{lb:"Remark",fn:"remarks"}])
	if(!data){return 0}
	data.plan_id=adata.plan_id

	if(!adata.plans_entries.length){return display_err("Please make some entries in the plan")}
	data.rq="submit-perf-plan"
	var cfm=confirm("Confirm submission?")
	if(!cfm){return 0}
	ajax_go(data,function (rst) {
		$(".modal").modal("hide")
		load_perf_plans(rst)



	})	
}
