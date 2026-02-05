adata.pg="advances"
$(function () {
	get_advances()
	populate_cs_day()
})
function get_advances(status) {
	data={url:adata.url,rq:"get-advances",status:status}
	ajax_go(data,function (rst) {
		load_advances(rst)
		adata.me=rst.user
	})
}

function new_advance_dl() {
	var ps=check_profile_status("application for Advance")
	if(ps!=1)
		return 0
	var advances=adata.advances;

	if(adata.me.days_left<=0){
		return display_err("You are out of contract, so you don't qualify to apply for advance")
	}
	if(adata.me.days_left<56){
		return display_err("You are soon out of contract, so you don't qualify for advance application")
	}
	for(var i=0;i<advances.length;i++){
		if(advances[i].status=="Pending Approval of Supervisor"||advances[i].status=="Pending Approval of Principal"){
			return display_err("You have a pending advance application")
		}
		
	}
	$("#new-advance-modal").modal("show")
	adata.rq="add-advance"
	clear_fields()
	adata.upload_only=0
	$("#file-name").hide()
}
function check_profile_status() {
	if(adata.me.status=="Declined by HOD"||adata.me.status=="Declined by Director"||adata.me.status=="Declined by Manager"||adata.me.status=="Declined by Principal"||adata.me.status=="Declined by Dean"){
		return display_err("Your profile status was declined")
	}
	else if(adata.me.pstatus=="Not submitted"||adata.me.pstatus=="Pending submission to HOD"){
		return display_err("Your profile has not been submitted for approval")
	}
	else if(adata.me.pstatus=="Pending Approval of HOD"||adata.me.pstatus=="Pending Approval of Manager"||adata.me.pstatus=="Pending Approval of Director"||adata.me.pstatus=="Pending Approval of Principal"||adata.me.pstatus=="Pending Approval of Dean"){
		return display_err("Your profile is still pending approval")
	}
	else
		return 1;
}
function attach_dl() {
	$("#advance_file").trigger("click")
}
function submit_advance() {
	var advance_start=format_day("ls")
	var flds=[{lb:"Advance amount",fn:"amount",ft:"money"},{lb:"Purpose",fn:"purpose"}]
	var data=prep_data(flds)
	if(!data)
		return 0;
	var hodtitle=adata.me.hodtitle
	var hodaccess=adata.me.hodaccess
	if(hodaccess=="dean"){
		status="Pending Approval of "+hodtitle
	}
	else{
		status="Pending Approval of "+hodtitle
	}
	var rdept_id=adata.me.contract_dept
	var roles=adata.me.roles;
	var rtitle=hodtitle
	for(var i=0;i<roles.length;i++){
		var role=roles[i].priv;
		
		if(role=="dean"){
			status="Pending Approval of Principal"
			rdept_id=0
			var rtitle="Principal";//reporting department head's title
			break;
		}
		if(role=="hdm"){
			role="hdm";
			hdept_id=roles[i].dept_id;//department being headed
			var phtitle=roles[i].phtitle//faculty
			var rdept_id=roles[i].pdid;	
			var paccess=roles[i].paccess
			break;
		}
	}
	if(role=="hdm"&&adata.me.contract_dept==hdept_id&&(adata.me.cat=="Administrative"||adata.me.cat=="Support")){
		status="Pending Approval of Principal"
		rtitle="Principal"
		var rdept_id=0

	}
	else if(role=="hdm"&&adata.me.contract_dept==hdept_id&&adata.me.cat=="Academic"){
		status="Pending Approval of "+phtitle;
		rtitle=phtitle
	}
	else if(role=="hdm"&&paccess=="dean"){
		//HOD of an academic dept, but contract elsewhere
		status="Pending Approval of "+phtitle;
		rtitle=phtitle
	}
	data.status=status
	data.rdept_id=rdept_id;//email department
	ajax_go(data,function (rst) {
		$("#new-advance-modal").modal("hide")
		load_advances(rst)
	},adata.url)
}
function advance_type_changed(ar) {
	$("#dur").attr("readonly",false)
	$("#dur").val("")
	var lt=$("#advance_type").val()
	if(lt=="Maternity advance"){
		$("#dur").val(60)
		$("#dur").attr("readonly",true)
	}
	if(lt=="Paternity advance"){
		$("#dur").val(4)
		$("#dur").attr("readonly",true)
	}
}
function advance_file_changed() {
	if(adata.upload_only)
	{
		var file=document.getElementById("advance_file").files
		var vi=validate_file(file,"pdf")
	    if(!vi)
	        return 0;
		var data=new FormData()
		data.append("advance_file",file[0])
		data.append("url",adata.url);
		data.append("rq","upload-file");
		data.append("id",adata.id);

		ajax_file(data,function (rst) {
			load_advances(rst)
		},adata.url)
	}
	else{
		var file=document.getElementById("advance_file").files[0]
		$("#file-name").show()
		$("#file-name").text(file.name)
	}
}
function load_advances(rst) {
	$("#advance-status-hdr").text(rst.status)
	adata.aldt=rst.aldt//
	adata.eld=rst.eld;//entitled advance days
	var flds=[{lb:"Application Date",fn:"app_date"},{lb:"Position",fn:"psn"},{lb:"Department",fn:"dept"},{lb:"Status",fn:"status"},{lb:"Amount",fn:"amount",ft:"money"},{lb:"Purpose",fn:"purpose"},{lb:"",text:"View",ft:"btn",oc:"view_advance"}]
	var advances=rst.advances;
	adata.advances=advances
	gen_table(flds,advances,"advance-div","No advance applications made")
}
function view_advance(index) {
	var advance=[adata.advances[index]]
	var flds=[{fn:"name"},{fn:"psn"},{fn:"dept"},{fn:"status"},{fn:"amount"},{fn:"amount_words"},{fn:"outstanding_advance"},{fn:"purpose"},{fn:"gross"},{rfn:"phonea"},{fn:"contract_terms"},{fn:"contract_ends"},{fn:"join_date"},{fn:"gross"}]
	for(var i=0;i<flds.length;i++){
		var fn=flds[i].fn;
		var id="l"+flds[i].fn;
		var val=advance[0][fn];
		if(val==undefined)
			val=""

		if(fn=="amount_words")
			val=n2w(advance[0].amount)
		if(fn=="amount"||fn=="gross"){
			val=cx(val)

		}
		$("#"+id).html("<b>"+val+"</b>")
	}
	var flds=["prname","spname","lcname","prdate","spdate","lcdate","prdate","spdate","lcdate","praxn","spaxn","lcaxn"]
	var advance=advance[0]
	for(var i=0;i<flds.length;i++){
		var fn=flds[i];

		var val=advance[fn]
		if(fn=="praxn"&&val=="Not authorized"){
			val+="<br> Reason: "+advance.pr_decline_reason
		}
		else if(fn=="spaxn"&&val=="Not recommended"){
			val+="<br> Reason: "+advance.sp_decline_reason
		}
		$("#"+fn).html(val)
	}

	$("#advance-details-modal").modal("show")
}
