adata.pg="advances"
$(function () {
	//The app loads then using ajax, requests data to fill up the page
	get_advances()
})
function get_advances(status,crit){

	var data={url:adata.url,rq:"get-advances",status:status,crit:crit}
	ajax_go(data,function (rst) {
		adata.projects=rst.projects;
		show_div("advance-card")
		adata.paccess=rst.paccess
		adata.phtitle=rst.phtitle
		adata.me=rst.user
		adata.crits=rst.crits;
		load_advances(rst)
	})
}
function load_advances(rst) {
	$("#advance-status-hdr").text(rst.status)
	var advances=rst.advances;
	adata.advances=advances
	var flds=[{lb:"Applicant",fn:"name"},{lb:"Application Date",fn:"app_date"},{lb:"Position",fn:"psn"},{lb:"Department",fn:"dept"},{lb:"Status",fn:"status"},{lb:"Amount",fn:"amount",ft:"money"},{lb:"Purpose",fn:"purpose"},{lb:"",text:"View",ft:"btn",oc:"view_advance"}]
	gen_table(flds,advances,"advance-div","No advance applications")
}

function view_advance(index) {
	var data=prep_data([])
	data.rq="get-appraisal"
	adata.index=index
	data.id=adata.advances[index].id;
	load_advance_details()
	
}
function load_advance_details(rst) {
	var index=adata.index;
	var advance=adata.advances[index]
	$("#advance-details-modal").modal("show")
	$("#comment-div,.axn-btn").hide()

	if(advance.status=="Pending Approval of Principal"){
		$("#advance-details-div,#approve-btn,#decline-btn").show()

	}
		
	var has_loan=advance.has_loan;
	var loan_amount=advance.loan_amount;
	var loan_balance=advance.loan_balance;
	var loan_recovered=advance.loan_recovered;

	if(!has_loan||has_loan=="No"){
		loan_balance="-"
		loan_recovered="-"
		loan_amount="-"
		has_loan="No"
	}
	$("#has_loan_tx").text(has_loan)
	$("#loan_amount_tx").text(loan_amount)
	$("#loan_balance_tx").text(loan_balance)
	$("#loan_recovered_tx").text(loan_recovered)
	
	
	var lamount_words=n2w(advance.amount)
	law=lamount_words.substring(0,1).toUpperCase()+lamount_words.substring(1,lamount_words.length)+" shillings"
	advance.lamount_words=law
	var flds=[{rfn:"name"},{rfn:"psn"},{rfn:"dept"},{rfn:"join_date"},{rfn:"contract_terms"},{rfn:"contract_ends"},{rfn:"gross"},{rfn:"phonea"},{rfn:"amount",fn:"lamount"},{fn:"lamount-words",rfn:"lamount_words"},{rfn:"purpose",fn:"lpurpose"},{rfn:"outstanding_advance",fn:"ladvances"}]
	for(i=0;i<flds.length;i++){
		var fn=flds[i].fn;
		var rfn=flds[i].rfn
		if(!fn)
			fn=rfn;
		var val=advance[rfn]
		if(val==null)
			val="-"
		if(rfn=="gross"||rfn=="amount"){
			val=cx(val)
		}
		$("#"+fn).text(val)
	}
	adata.status=advance.status
	var flds=["prname","spname","bsname","prdate","spdate","bsdate","prdate","spdate","bsdate","praxn","spaxn","bsaxn"]
	for(var i=0;i<flds.length;i++){
		var fn=flds[i];

		var val=advance[fn]
		if(fn=="praxn"&&val=="Not Approved"){
			val+="<br> <span style='color:blue;font-size:10px'>Reason: "+advance.pr_decline_reason+"</span>"
		}
		else if(fn=="spaxn"&&val=="Not recommended"){
			val+="<br> Reason: "+advance.sp_decline_reason
		}
		$("#"+fn).html(val)
	}


}
function decline_dl() {
	
	$("#comment-div").show()
	$("#advance-details-div").hide()
	$(".axn-btn").hide()
	$("#decline-btn-2").show()
}
function change_advance_status(axn) {

	var index=adata.index
	var advance=adata.advances[index]
	var id=adata.advances[index].id;
	var data=prep_data([])
	data.axn=axn;
	data.id=id;
	if(axn=="Not Approved"){
		var comment=$("#comment").val();
		if(comment.length==0){
			return display_err("Please enter a reason for non-recommendation")
		}
		data.comment=comment;
	}
	data.rq="change-advance-status"
	ajax_go(data,function (rst) {
		show_div("advance-card")
		load_advances(rst)
		$(".modal").modal("hide")
	})
}
function back_to_view() {
	$("#comment-div,.axn-btn").hide()
	$("#advance-details-div,#decline-btn,#approve-btn").show()
}
function load_appraisal(crits) {
	var tr="<table class='table'><thead><tr><th>Criteria</th><th colspan=5>Score</th></tr><thead><tbody>"
	for(var i=0;i<crits.length;i++){
		if(adata.status!="Pending Approval of Supervisor")
			sr=crits[i].crival;
		else
			var sr=load_sr(i)
		tr+="<tr><td>"+crits[i].crit+"</td><td>"+sr+"</td></tr>"
	}
	tr+"</tbody></table>"
	$("#appraisal-div-cd").html(tr)
}

function load_sr(index) {
	var tb="<table style='width:120px'><tr>"
	for(var i=0;i<5;i++){
		tb+="<td align='center'>"+(i+1)+"</td>"
	}
	tb+="</tr><tr>"
	for(var i=0;i<5;i++){
		tb+="<td align='center'><input type='radio' style='width:25px;height:25px' value="+i+" name=\"sr-"+index+"\"></td>"
	}
	tb+="</tr></table>"
	return tb;
}


function prep_save_data() {
	var srd=[]
	var si=adata.crits;
	for(var i=0;i<si.length;i++){
		var name="\'sr-"+i+"\'"
		var val=$("input[name="+name+"]:checked").val();
		if(val==undefined){
			display_err("Please ensure appraisal all items are checked")
			return 0;
		}
 		srd[i]={id:si[i].id,ags:val}
	}
	
	return srd
}