adata.pg="cras"
$(function () {
	get_cras()
	populate_cs_day()
})
function get_cras(status) {
	data={url:adata.url,rq:"get-cras",status:status}
	ajax_go(data,function (rst) {
		adata.me=rst.user
		load_cras(rst)
	})
}
function load_cras(rst) {
	$("#cra-status-hdr").text(rst.status)
	adata.aldt=rst.aldt//
	adata.eld=rst.eld;//entitled contract renewal days

	var flds=[{lb:"Applicant",fn:"name"},{lb:"Application Date",fn:"app_date"},{lb:"Position",fn:"psn"},{lb:"Department",fn:"fdept"},{lb:"Status",fn:"status"},{lb:"",text:"View",ft:"btn",oc:"view_cra"}]
	var cras=rst.cras;
	for(var i=0;i<cras.length;i++){
		var pdept=cras[i].pdept;
		var dept=cras[i].dept
		if(pdept)
			pdept=", "+pdept
		else
			pdept=""
		cras[i].fdept=dept+pdept
	}
	adata.cras=cras
	gen_table(flds,cras,"cra-div","No contract renewal applications made")
}

function submit_cra() {

	if(adata.me.priv=="dean"&&(adata.status=="Pending Approval of Director"||adata.status=="Pending Approval of Dean")){
		return submit_cra_dean()
	}
	var cra_start=format_day("ls")
	var spaxn=$("#spaxn").val()
	if(spaxn=="Recommended"){
		spremarks_op=0
		spdur_op=0
	}
	else{
		spdur_op=1
		spremarks_op=0
	}
	var flds=[{lb:"Attendance Score",fn:"attendance",ft:"sel"},{lb:"Job Knowledge Score",fn:"job_knowledge",ft:"sel"},{lb:"Performance Score",fn:"performance",ft:"sel"},{lb:"Score for Abilities to get on with others",fn:"ability",ft:"sel"},{lb:"Training Required",fn:"training_required",op:1,ft:"tinymce"},{lb:"Strengths",fn:"strengths",ft:"tinymce"},{lb:"Weaknesses",fn:"weaknesses",ft:"tinymce"},{lb:"Recommendation",fn:"spaxn",ft:"sel"},{lb:"Duration",fn:"spdur",op:spdur_op},{lb:"Duration Type",fn:"spdur_type",op:spdur_op},{lb:"Remarks",fn:"spremarks",op:spremarks_op,ft:"tinymce"}]
	var data=prep_data(flds)
	if(!data)
		return 0;
	data.rq="act-on-cra"
	data.crid=adata.crid;
	data.rpaccess=adata.rpaccess
	data.rptitle=adata.rptitle
	var cfm=confirm("Do you confirm this action?")
	if(!cfm){return 0}
	ajax_go(data,function (rst) {
		$("#cra-details-modal").modal("hide")
		load_cras(rst)
	})
}
function submit_cra_dean() {

	var axn=$("#deanaxn").val()
	if(axn=="Recommended")
		dean_remarks_op=0;
	else
		dean_remarks_op=0;

	var flds=[{lb:"Action",fn:"deanaxn",ft:"sel"},{lb:"Remarks",fn:"deanremarks",op:dean_remarks_op,ft:"tinymce"}]
	var data=prep_data(flds)
	if(!data)
		return 0;
	data.rq="act-on-cra-dean"
	data.crid=adata.crid;
	var cfm=confirm("Confirm this action?")
	if(!cfm){return 0}
	ajax_go(data,function (rst) {
		$("#cra-details-modal").modal("hide")
		load_cras(rst)
	})
}
function spaxn_changed() {
	var spaxn=$("#spaxn").val()
	if(spaxn=="Recommended"){
		$(".spdur-td").show()
	}
	else{
		$(".spdur-td").hide()
	}
}