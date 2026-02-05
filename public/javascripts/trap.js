function view_trap(index) {
	$(".trap-btn,.user-div").hide()
	$("#staff-div-2").show()
	var trap=adata.traps[index]
	if(trap.pdept)
	trap.dept=trap.pdept+", "+trap.dept
	adata.trap=trap;
	adata.trap_id=trap.id;
	adata.sponsorship=trap.sponsorship
	var flds=[{fn:"name"},{fn:"dept"},{fn:"pdept"},{fn:"psn"},{lb:"Travel Type",fn:"travel_type"},{lb:"Destination",fn:"destination"},{lb:"Start Date",fn:"leave_start"},{lb:"End Date",fn:"leave_end"},{lb:"Sponsorship",fn:"sponsorship"},{lb:"MUBS Sponsorship Budget",fn:"mubs_budget",ft:"money"},{fn:"purpose_of_mubs_funds"},{lb:"Other Sponsor",fn:"other_sponsor"},{lb:"Purpose",fn:"purpose"},{fn:"spname"},{fn:"spaxn_date"},{fn:"spremarks"},{fn:"bs_axn"},{fn:"bsname"},{fn:"bsaxn_date"},{fn:"bsremarks"},{fn:"psname"},{fn:"ps_axn"},{fn:"psaxn_date"},{fn:"psremarks"},{fn:"resp"}]
	var hdept=trap.hdept;

	if(hdept){
		var icemail=trap.icemail
		var incharge=trap.incharge
		trap.resp=trap.hdept_title+" "+trap.hdept+" <br><span style='color:blue;font-size:14px'>Acting: "+incharge+", "+icemail+"</span>"
	}

	if(trap.spaxn_date)
		$(".sp-done").show()
	if(trap.bsaxn_date){

		$(".bo-done").show()
	}
	if(trap.psaxn_date)
		$(".ps-done").show()
	

	if(adata.me.priv=="staff"){
		
	}
	else if((adata.me.priv=="hdm"||adata.me.priv=="dean")&&!trap.spaxn_date){
		$(".sp-pen").show()
		$("#submit-btn,#decline-btn").show()

	}
	else if(adata.me.priv=="bo"&&!trap.bsaxn_date){
		$(".bo-pen").show()
		$("#submit-btn").show()
		
	}
	else if(adata.me.priv=="principal"&&!trap.psaxn_date){
		$(".ps-pen").show()
		$("#submit-btn").show()
		
	}

	for(var i=0;i<flds.length;i++){
		var fn=flds[i].fn;
		var id="l"+flds[i].fn;
		var val=trap[fn];
		adata[fn]=val
		if(val==undefined||val==null)
			val="#N/A"
		if(fn=="mubs_budget"){
			if(val!="#N/A")
				val="UGX "+cx(val)
		}

		$("#"+id).html("<span>"+val+"<span>")
	}
	var file=trap.file;
	if(file)
		$("#download-btn").show()
	else
		$("#download-btn").hide()
	
	$("#new-trap-modal").modal("show")
}


function download_file() {
	var id=adata.trap_id;
	var trap=adata.trap

	window.open("/"+adata.me.priv+"?pg=trap&rq=download-file&trap_id="+id+"&recorded="+trap.app_date,"_blank")
}