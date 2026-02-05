adata.pg="rbs-benefits-apps"
$(function () {
	get_default()
	populate_cs_day()
})
function get_default(status) {
	data=prep_data([])
	data.rq="get-default"
	ajax_go(data,function (rst) {
		adata.me=rst.user
		load_benefits_apps(rst)
	})
}
function decline_dl() {
	$(".axn-btn").hide()
	$("#decline-btn").show()
	$(".benefits-div").hide()
	$("#remarks-div").show()
}
function load_benefits_apps(rst) {
	var benefits_apps=rst.benefits_apps;
	for(var i=0;i<benefits_apps.length;i++){
		var pdept=benefits_apps[i].pdept;

		if(pdept){
			benefits_apps[i].dept=benefits_apps[i].dept+", "+benefits_apps[i].pdept;
		}
		benefits_apps[i].frate=benefits_apps[i].rate+"%"
		benefits_apps[i].crate=benefits_apps[i].crate+"%"
	}
	adata.benefits_apps=benefits_apps
	var hd=[{lb:"Name",fn:"name"},{lb:"Dept",fn:"dept"},{lb:"Position",fn:"psn"},{lb:"Exit Date",fn:"exit_date"},{lb:"Status",fn:"status"},{lb:"Application Date",fn:"app_date"},{lb:"",ft:"btn",text:"View",oc:"view_benefits_app"}]
	gen_table(hd,benefits_apps,"benefits-apps-div","No voluntary contribution applications made")
}


function submit_benefits_app(axn) {
	adata.rq="change-benefits-app-status"
	var flds=[]
	if(axn=="declined"){
		status="Declined"
		flds=[{lb:"Remarks",fn:"remark"}]
	}
	else
		status="Approved"
	var data=prep_data(flds)
	if(!data)
		return 0;
	data.status=status
	data.appid=adata.appid
	ajax_go(data,function (rst) {
		$("#benefits-app-modal").modal("hide")
		load_benefits_apps(rst)
	})
}
function delete_benefits_app(axn) {
	
	var flds=[]
	adata.rq="delete-benefits-app"
	var data=prep_data(flds)
	if(!data)
		return 0;
	
	data.appid=adata.appid
	var cfm=confirm("Confirm Removal of the application?")
	if(!cfm){return 0}
	ajax_go(data,function (rst) {
		$("#benefits-app-modal").modal("hide")
		load_benefits_apps(rst)
	})
}

