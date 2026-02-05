adata.pg="loans"
$(function () {
	//The app loads then using ajax, requests data to fill up the page
	get_loans()
})
function get_loans(status,crit){

	var data={url:adata.url,rq:"get-loans",status:status,crit:crit}
	ajax_go(data,function (rst) {
		adata.projects=rst.projects;
		show_div("loan-card")
		adata.paccess=rst.paccess
		adata.phtitle=rst.phtitle
		adata.me=rst.user
		adata.crits=rst.crits;
		load_loans(rst)
	})
}
function load_loans(rst) {
	$("#loan-status-hdr").text(rst.status)
	var loans=rst.loans;
	adata.loans=loans
	var flds=[{lb:"Applicant",fn:"name"},{lb:"Application Date",fn:"app_date"},{lb:"Position",fn:"psn"},{lb:"Department",fn:"dept"},{lb:"Status",fn:"status"},{lb:"Amount",fn:"amount",ft:"money"},{lb:"Purpose",fn:"purpose"},{lb:"",text:"View",ft:"btn",oc:"view_loan"}]
	gen_table(flds,loans,"loan-div","No loan applications")
}

function function_name(argument) {
	// body...
}
function view_loan(index) {
	var data=prep_data([])
	data.rq="get-appraisal"
	adata.index=index;
	data.id=adata.loans[index].id;
	ajax_go(data,function (rst) {
		load_loan_details(rst)
	})
	
}
function load_loan_details(rst) {
	var index=adata.index;
	var loan=adata.loans[index]
	$("#loan-details-modal").modal("show")
	$("#comment-div,.axn-btn").hide()
	if(loan.status=="Pending Authorization of Principal"){
		$("#loan-details-div,#decline-btn,#recommend-btn").show()
	}
	
	var lamount_words=n2w(loan.amount)
	law=lamount_words.substring(0,1).toUpperCase()+lamount_words.substring(1,lamount_words.length)+" shillings"
	loan.lamount_words=law
	var flds=[{rfn:"name"},{rfn:"psn"},{rfn:"dept"},{rfn:"join_date"},{rfn:"contract_terms"},{rfn:"contract_ends"},{rfn:"gross"},{rfn:"phonea"},{rfn:"amount",fn:"lamount"},{fn:"lamount-words",rfn:"lamount_words"},{rfn:"purpose",fn:"lpurpose"},{rfn:"outstanding_loan",fn:"ladvances"}]
	for(i=0;i<flds.length;i++){
		var fn=flds[i].fn;
		var rfn=flds[i].rfn
		if(!fn)
			fn=rfn;
		var val=loan[rfn]
		if(val==null)
			val="-"
		if(rfn=="gross"||rfn=="amount"){
			val=cx(val)
		}
		$("#"+fn).text(val)
	}
	adata.status=loan.status
	load_appraisal(rst.crits)

	
	var flds=["prname","spname","lcname","prdate","spdate","lcdate","prdate","spdate","lcdate","praxn","spaxn","lcaxn"]
	for(var i=0;i<flds.length;i++){
		var fn=flds[i];

		var val=loan[fn]
		if(fn=="praxn"&&val=="Not authorized"){
			val+="<br> Reason: "+loan.pr_decline_reason
		}
		else if(fn=="spaxn"&&val=="Not recommended"){
			val+="<br> Reason: "+loan.sp_decline_reason
		}
		else if(fn=="lcaxn"&&val=="Not approved"){
			val+="<br> Reason: "+loan.lc_decline_reason
		}
		$("#"+fn).html(val)
	}


}
function decline_dl() {
	
	$("#comment-div").show()
	$("#loan-details-div").hide()
	$(".axn-btn").hide()
	$("#confirm-decline").show()
}
function change_loan_status(axn) {

	var index=adata.index
	var loan=adata.loans[index]
	var id=adata.loans[index].id;
	var data=prep_data([])
	data.axn=axn;
	data.id=id;
	if(axn=="Not recommended by supervisor"){
		var comment=$("#comment").val();
		if(comment.length==0){
			return display_err("Please enter a reason for non-recommendation")
		}
		data.comment=comment;
	}
	data.rq="change-loan-status"
	ajax_go(data,function (rst) {
		show_div("loan-card")
		load_loans(rst)
		$(".modal").modal("hide")
	})
}
function back_to_view() {
	$("#comment-div,.axn-btn").hide()
	$("#loan-details-div,#decline-btn,#recommend-btn").show()
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