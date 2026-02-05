function view_volc_app(index) {

	$(".volc-div").hide()
	$("#view-div").show()
	$("#volc-app-modal").modal("show")
	$(".axn-btn").hide()

	var volc_app=adata.volc_apps[index]
	adata.volc_app=volc_app;
	var status=volc_app.status;
	adata.appid=volc_app.id;
	adata.userid=volc_app.userid
	adata.rate=volc_app.rate;
	if(status=="Not Submitted"){
		$("#edit-btn,#delete-btn").show()
		
	}
	if(status=="Pending Approval by RBS Office"&&adata.me.priv=="rbsadmin")
	{
		$("#approve-btn,#decline-btn-dl").show()
	}

	$("#approval-view-div").hide()
	
	if(status=="Declined"||status=="Approved"){
		$("#approval-view-div").show()
	}



	var flds=[{fn:"name"},{fn:"sex"},{fn:"psn"},{fn:"contract_terms"},{fn:"dept"},{fn:"crate"},{fn:"frate"},{fn:"app_date"},{fn:"email"},{fn:"phonea"},{fn:"eff_date"},{fn:"axn_date"},{fn:"status"},{fn:"approver"},{fn:"remark"}]
	for(var i=0;i<flds.length;i++){
		var fn=flds[i].fn;
		var id="l"+flds[i].fn;
		var val=volc_app[fn];
		adata[fn]=val
		if(val==undefined)
			val="#N/A"
		
		$("#"+id).html("<span>"+val+"<span>")
	}
}

