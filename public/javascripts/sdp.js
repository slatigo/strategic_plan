function view_sdp(index) {

	var sdp=[adata.sdps[index]]
	adata.sdp=sdp;
	adata.cindex=index
	clear_fields()
	$("#comment-div,.hr-div,.sp-div,.axn-btn,.dean-div,#edit-btn").hide()

	adata.status=sdp[0].status
	
	if(sdp[0].status=="Pending Approval by HRD"&&adata.me.priv=="hr"&&adata.hrd){
		$("#hrd-pen-div,#submit-axn-btn").show()
	}
	if(sdp[0].status=="Approved by HRD"&&adata.me.priv=="hr"&&adata.hrr){
		//hr representative
		$("#hr-pen-div,#submit-axn-btn").show()
	}
	
	if(sdp[0].status=="Pending Approval of Supervisor"&&(adata.me.priv=="dean"||adata.me.priv=="hdm")){

		$("#sp-pen-div,#submit-axn-btn").show()

	}
	
	if(sdp[0].status=="Not Submitted"){
		$("#edit-btn").show()
	}
	
	
	if(sdp[0].spaxn){
		$("#sp-appd-div").show()
	}
	
	if(sdp[0].hraxn){
		$("#hr-appd-div").show()
	}
	$("."+adata.me.priv).show()
	
	if(sdp[0].deanaxn){

		$("#dean-appd-div").show()
	}
	adata.sdpid=sdp[0].id
	adata.cruserid=sdp[0].userid
	sdp[0].contract=sdp[0].contract_type+", "+sdp[0].contract_terms
	var spaxn=sdp[0].spaxn
	
	if(spaxn=="Declined"){

		$("#spremarks-div").show()
		$("#spdur-div").hide()
	}
	else{
		$("#spdur-div").show()
	}
	var psaxn=sdp[0].psaxn
	var flds=[{fn:"name"},{fn:"psn"},{fn:"fdept"},{fn:"sdp.id"},{fn:"study_status"},{fn:"contract_id"},{fn:"sdpno"},{fn:"qualification"},{fn:"award_year"},{fn:"award_institution"},{fn:"program"},{fn:"place_of_study"},{fn:"tuition_source"},{fn:"tuition_per_year"},{fn:"other_fees"},{fn:"start_year"},{fn:"end_year"},{fn:"sdp.status"},{fn:"spaxn"},{fn:"rdept_id"},{fn:"spaxn_date",ft:"date"},{fn:"spremarks"},{fn:"hraxn_date",ft:"date"},{fn:"hraxn"},{fn:"position"},{fn:"join_date"},{fn:"freq"},{fn:"name"},{fn:"users.id AS userid"},{fn:"users.email"},{fn:"submitted_on",ft:"date"},{fn:"hrname"},{fn:"hrremarks"},{fn:"spname"},{fn:"spaxn"},{fn:"spremarks"},{fn:"spaxn_date"},{fn:"contract_ends",ft:"date"},{fn:"contract_type"},{fn:"contract"}]
	for(var i=0;i<flds.length;i++){
		var fn=flds[i].fn;
		var id="l"+flds[i].fn;
		var val=sdp[0][fn];
		adata[fn]=val
		if(val==undefined)
			val="#N/A"
		if(fn=="tuition_per_year"||fn=="other_fees"){
			if(val!="#N/A")
				val="UGX "+cx(val)

		}
		

		$("#"+id).html("<span>"+val+"<span>")
	}

	$("#sdp-details-modal").modal("show")
}