function view_cra(index) {
	var cra=[adata.cras[index]]
	adata.cra=cra;
	adata.cindex=index
	clear_fields()
	
	$("#comment-div,.ps-div,.hr-div,.hrd-div,.sp-div,.axn-btn,#file-btn,.dean-div,#download-app-btn,#edit-btn").hide()

	adata.status=cra[0].status
	if(cra[0].status=="Pending Approval of Principal"&&adata.me.priv=="principal"){
		$("#ps-pen-div,#submit-axn-btn").show()
	}
	if(cra[0].status=="Pending Approval by HRD"&&adata.me.priv=="hr"&&adata.hrd){
		$("#hrd-pen-div,#submit-axn-btn").show()
	}
	if(cra[0].status=="Approved by HRD"&&adata.me.priv=="hr"&&adata.hrr){
		//hr representative
		$("#hr-pen-div,#submit-axn-btn").show()
	}
	if((cra[0].status=="Pending Approval of Dean"||cra[0].status=="Pending Approval of Director")&&adata.me.priv=="dean"){
		$("#dean-pen-div,#submit-axn-btn").show()
	}
	if(cra[0].status=="Pending Approval of Supervisor"&&(adata.me.priv=="dean"||adata.me.priv=="hdm")){

		$("#sp-pen-div,#submit-axn-btn").show()

	}
	if((cra[0].status=="Renewed"||cra[0].status=="Pending Approval of Principal"||cra[0].status=="Approved by Principal")&&(adata.me.priv=="hr"||adata.me.priv=='principal')){
		$("#download-app-btn").show()
	}
	if(cra[0].status=="Not Submitted"){
		$("#edit-btn").show()
	}
	
	if(cra[0].psaxn)
		$("#ps-appd-div").show()
	if(cra[0].spaxn){
		$("#sp-appd-div").show()
	}
	if(cra[0].hrdaxn){
		adata.hrdaxn=1
		$("#hrd-appd-div").show()
	}
	if(cra[0].hraxn){
		$("#hr-appd-div").show()
	}
	$("."+adata.me.priv).show()
	if(adata.me.priv=="dean"&&cra[0].spaxn&&cra[0].deanaxn==null){
		$(".dean").hide()
		$(".hdm").show()

	}
	if(cra[0].deanaxn){

		$("#dean-appd-div").show()
	}
	adata.crid=cra[0].id
	adata.cruserid=cra[0].userid
	adata.userid=cra[0].userid
	adata.form_id=cra[0].form_id;


	adata.apprid=cra[0].apprid
	adata.appridv2=cra[0].appridv2
	if(adata.appridv2)
		adata.apprid=0;
	$("#appraisal-view-btn,#appraisalv2-view-btn").hide()

	if(adata.apprid){
		$("#appraisal-view-btn").show()
		adata.form_id=cra[0].form_id;
		adata.appraisal_id=adata.apprid
	}
	if(adata.appridv2){
		$("#appraisalv2-view-btn").show()
		adata.appraisal_id=adata.appridv2
		adata.form_id=cra[0].form_idv2;
	}

	var file_name=cra[0].file_name
	adata.file_name=file_name
	adata.rpaccess=cra[0].rpaccess
	adata.rptitle=cra[0].rptitle;

	if(file_name)
		$("#file-btn").show()
	cra[0].contract=cra[0].contract_type+", "+cra[0].contract_terms
	var spaxn=cra[0].spaxn
	
	if(spaxn=="Not Recommended"){

		$("#spremarks-div").show()
		$("#spdur-div").hide()
	}
	else{
		$("#spdur-div").show()
	}
	var psaxn=cra[0].psaxn
	if(psaxn=="Declined"){
		$("#psremarks-div,#psdur-div").show()
		$("#ps-appd-details-div").hide()

	}
	else{
		$("#ps-appd-details-div").show()
	}
	var flds=[{fn:"name"},{fn:"psn"},{fn:"fdept"},{fn:"asalary"},{rfn:"phonea"},{fn:"contract"},{fn:"contract_ends"},{fn:"join_date"},{fn:"salary"},{fn:"duties"},{fn:"achievements"},{fn:"challenges"},{fn:"attendance"},{fn:"job_knowledge"},{fn:"performance"},{fn:"ability"},{fn:"psaxn"},{fn:"psaxn_date"},{fn:"training_required"},{fn:"spaxn"},{fn:"spremarks"},{fn:"spaxn_date"},{fn:"strengths"},{fn:"weaknesses"},{fn:"spdur"},{fn:"spdur_type"},{fn:"spname"},{fn:"qualifications"},{fn:"psaxn"},{fn:"apdur"},{fn:"apdur_type"},{fn:"apsn"},{fn:"adept"},{fn:"acontract_terms"},{fn:"acontract_type"},{fn:"asalary_terms"},{fn:"eff_date"},{fn:"psremarks"},{fn:"psname"},{fn:"approval_code"},{fn:"hrdaxn"},{fn:"hrdaxn_date"},{fn:"hrdname"},{fn:"hrdremarks"},{fn:"hraxn"},{fn:"hraxn_date"},{fn:"hrname"},{fn:"hrremarks"},{fn:"deanaxn"},{fn:"deanaxn_date"},{fn:"deanname"},{fn:"deanremarks"}]
	//var flds=[{fn:"name"},{fn:"psn"},{fn:"fdept"},{fn:"asalary"},{rfn:"phonea"},{fn:"contract"},{fn:"contract_ends"},{fn:"join_date"},{fn:"gross"},{fn:"duties"},{fn:"achievements"},{fn:"challenges"},{fn:"attendance"},{fn:"job_knowledge"},{fn:"performance"},{fn:"ability"},{fn:"psaxn"},{fn:"psaxn_date"},{fn:"training_required"},{fn:"spaxn"},{fn:"spremarks"},{fn:"spaxn_date"},{fn:"strengths"},{fn:"weaknesses"},{fn:"spdur"},{fn:"spdur_type"},{fn:"spname"},{fn:"qualifications"},{fn:"psaxn"},{fn:"psremarks"},{fn:"psname"},{fn:"approval_code"},{fn:"hraxn"},{fn:"hraxn_date"},{fn:"hrname"},{fn:"hrremarks"},{fn:"deanaxn"},{fn:"deanaxn_date"},{fn:"deanname"},{fn:"deanremarks"}]
	for(var i=0;i<flds.length;i++){
		var fn=flds[i].fn;
		var id="l"+flds[i].fn;
		var val=cra[0][fn];
		adata[fn]=val
		if(val==undefined)
			val="#N/A"
		if(fn=="asalary"||fn=="salary"){
			if(val!="#N/A")
				val="UGX "+cx(val)

		}
		if(fn=="asalary_terms"&&val=="#N/A")
			val=""

		$("#"+id).html("<span>"+val+"<span>")
	}

	$("#cra-details-modal").modal("show")
}
function get_appraisal(index) {
	data.form_id=adata.form_id

	data.appraisal_id=adata.apprid;
	data.rq="preview-appraisal"
	if(!data.appraisal_id){

		data.appraisal_id=adata.appridv2
		data.rq="preview-appraisalv2"

	}
	data.status="Completed"
	adata.status=data.status
	ajax_go(data,function (rst) {
		$(".modal").modal("hide")
		$("#form-preview-modal").modal("show")
		adata.appraisal=rst.appraisals[0];
		if(adata)
		load_appraisal_preview(rst)
	})
}
function download_attachment() {
	var file_name=adata.file_name
	window.open(adata.url+"?pg=cras&rq=download-file&id="+adata.crid+"&file_name="+file_name,"_blank")
}
function back_to_cras() {
	index=adata.cindex;
	$(".modal").modal("hide")
	view_cra(index)
}

function download_application() {
	window.open(adata.url+"?pg=cras&rq=download-application&crid="+adata.crid,"_blank")
}
function download_appraisal() {
	window.open(adata.url+"?pg=cras&rq=download-appraisal&appraisal_id="+adata.apprid,"_blank")
}