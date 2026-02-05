
adata.pg="cras"
$(function () {
	get_defaults()
	populate_cs_day()
	adata.default=1
})


function get_defaults() {
	var status="Pending Approval of Principal"
	data={url:adata.url,rq:"get-default",status:status}
	ajax_go(data,function (rst) {
		adata.me=rst.user
		load_cras(rst)
		load_select(rst.depts,"id","cdept",".dept")
		load_select(rst.psns,"id","psn",".psn")
	})	
}
function get_cras(status) {
	data={url:adata.url,rq:"get-cras",status:status}
	ajax_go(data,function (rst) {

		load_cras(rst)

	})
}

function get_approval_code() {
	var applicant=adata.name;
	data={url:adata.url,rq:"get-approval-code",applicant:applicant,psn:adata.psn,dept:adata.fdept}
	ajax_go(data,function (rst) {
		var code=rst.code;
		adata.code=code;

		display_succ("Approval code sent to your email")
	})
}
function load_cras(rst) {
	$("#cras-status-hdr").text(rst.status)
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
	var eff_date=format_day("ed")
	var psaxn=$("#psaxn").val()
	if(psaxn=="Approved"){
		//var flds=[{lb:"Approval action",fn:"psaxn",ft:"sel"},{lb:"Duration",fn:"psdur"},{lb:"Duration Type",fn:"psdur_type"},{lb:"Position",fn:"apsnid"},{lb:"Department",fn:"adept_id"},{lb:"Effective Date",fn:"eff_date",vl:eff_date,ft:"date"},{lb:"Contract Terms",fn:"acontract_terms"},{lb:"Contract Type",fn:"acontract_type"},{lb:"Salary",fn:"asalary"},{lb:"Salary Terms",fn:"asalary_terms"},{lb:"Remarks",fn:"psremarks",op:1},{lb:"Approval Code",fn:"approval_code"}]
		var flds=[{lb:"Approval action",fn:"psaxn",ft:"sel"},{lb:"Remarks",fn:"psremarks",ft:"tinymce"},{lb:"Approval Code",fn:"approval_code"}]
	}
	else{
		var flds=[{lb:"Approval action",fn:"psaxn",ft:"sel"},{lb:"Remarks",fn:"psremarks",ft:"tinymce"},{lb:"Approval Code",fn:"approval_code"}]
	}
	var data=prep_data(flds)
	if(!data)
		return 0;
	var code=$("#approval_code").val()
	if(code!=adata.code){
		return display_err("Approval code entered isn't the same as that sent via email")
	}
	data.rq="act-on-cra"
	data.crid=adata.crid;
	var cfm=confirm("Confirm this action?")
	if(!cfm){return 0}
	ajax_go(data,function (rst) {
		$("#cra-details-modal").modal("hide")
		load_cras(rst)
	})
}


function psaxn_changed(argument) {
	var psaxn=$("#psaxn").val()
	if(psaxn=="Approved"){
		$("#approved-axns-div,#app-code-div,#psremarks-div").show()
	}
	else if(psaxn=="Declined"){
		$("#approved-axns-div").hide()
		$("#app-code-div,#psremarks-div,#app-code-div").show()

	}
	else{
		$("#approved-axns-div").hide()
	}
}