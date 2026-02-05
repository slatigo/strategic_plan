adata.pg="sdp"
$(function () {
	get_sdp()
	populate_cs_day()
})
function get_sdp(status) {
	data={url:adata.url,rq:"get-sdps",status:status}
	ajax_go(data,function (rst) {
		adata.me=rst.user
		load_sdp(rst)
	})
}
function load_sdp(rst) {
	$("#sdp-status-hdr").text(rst.status)
	adata.aldt=rst.aldt//
	adata.eld=rst.eld;//entitled contract renewal days

	var flds=[{lb:"Name of Staff",fn:"name"},{lb:"Submission Date",fn:"submitted_on"},{lb:"Position",fn:"psn"},{lb:"Department",fn:"fdept"},{lb:"Status",fn:"status"},{lb:"Place of Study",fn:"place_of_study"},{lb:"Program",fn:"program"},{lb:"Start Year",fn:"start_year"},{lb:"",text:"View",ft:"btn",oc:"view_sdp"}]
	var sdps=rst.sdps;
	for(var i=0;i<sdps.length;i++){
		var pdept=sdps[i].pdept;
		var dept=sdps[i].dept
		if(pdept)
			pdept=", "+pdept
		else
			pdept=""
		sdps[i].fdept=dept+pdept
	}
	adata.sdps=sdps
	gen_table(flds,sdps,"sdp-div","No SDPs made")
}

function submit_sdp() {		
	var flds=[{lb:"Action",fn:"spaxn",ft:"sel"},{lb:"Remarks",fn:"spremarks"}]
	var data=prep_data(flds)
	if(!data)
		return 0;
	data.rq="act-on-sdp"
	data.sdpid=adata.sdpid;
	data.rpaccess=adata.rpaccess
	data.rptitle=adata.rptitle
	var cfm=confirm("Do you confirm this action?")
	if(!cfm){return 0}
	ajax_go(data,function (rst) {
		$("#sdp-details-modal").modal("hide")

		load_sdp(rst)
	})
}