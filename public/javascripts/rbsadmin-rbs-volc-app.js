adata.pg="rbs-volc-apps"
$(function () {
	get_default()
	populate_cs_day()
})
function get_default(status) {
	data=prep_data([])
	data.rq="get-default"
	ajax_go(data,function (rst) {
		adata.me=rst.user
		load_volc_apps(rst)
	})
}
function decline_dl(argument) {
	$(".axn-btn").hide()
	$("#decline-btn").show()
	$(".volc-div").hide()
	$("#remarks-div").show()
}
function load_volc_apps(rst) {
	var volc_apps=rst.volc_apps;
	for(var i=0;i<volc_apps.length;i++){
		var pdept=volc_apps[i].pdept;

		if(pdept){
			volc_apps[i].dept=volc_apps[i].dept+", "+volc_apps[i].pdept;
		}
		volc_apps[i].frate=volc_apps[i].rate+"%"
		volc_apps[i].crate=volc_apps[i].crate+"%"
	}
	adata.volc_apps=volc_apps
	var hd=[{lb:"Name",fn:"name"},{lb:"Dept",fn:"dept"},{lb:"Position",fn:"psn"},{lb:"Rate Applied",fn:"frate"},{lb:"Effective Date",fn:"eff_date"},{lb:"Status",fn:"status"},{lb:"Application Date",fn:"app_date"},{lb:"",ft:"btn",text:"View",oc:"view_volc_app"}]
	gen_table(hd,volc_apps,"volc-apps-div","No voluntary contribution applications made")
}


function submit_volc_app(axn) {
	adata.rq="change-volc-app-status"
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
	data.userid=adata.userid;
	data.rate=adata.rate;
	ajax_go(data,function (rst) {
		$("#volc-app-modal").modal("hide")
		load_volc_apps(rst)
	})
}
function delete_volc_app(axn) {
	
	var flds=[]
	adata.rq="delete-volc-app"
	var data=prep_data(flds)
	if(!data)
		return 0;
	
	data.appid=adata.appid
	var cfm=confirm("Confirm Removal of the application?")
	if(!cfm){return 0}
	ajax_go(data,function (rst) {
		$("#volc-app-modal").modal("hide")
		load_volc_apps(rst)
	})
}
