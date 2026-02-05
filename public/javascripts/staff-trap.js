adata.pg="trap"
$(function () {
	get_traps()
	populate_cs_day()
})
function get_traps(status) {
	data={url:adata.url,rq:"get-traps"}
	ajax_go(data,function (rst) {
		load_traps(rst)
		adata.cdate=rst.cdate;
		adata.me=rst.user
		adata.cyear=rst.cyear
		$("#ts_year").val(rst.cyear)
		$("#te_year").val(rst.cyear)
		show_contract_details()
	})
}

function new_trap_dl() {
	
	var traps=adata.traps;
	$("#new-trap-modal").modal("show")
	$(".user-div").hide()
	$(".staff-pen,#submit-btn").show()
	$("#submit-btn").show()
	adata.rq="add-trap"
	var ps=check_profile_status(data)
	if(ps!=1)
		return 0
	clear_fields()
	adata.trap_file=0
	$("#file-name").hide()
	adata.rdept_id=0;
	adata.hdept_id=0
	if(adata.hdept_id){
		$("#incharge-div").show()
	}
	else{
		$("#incharge-div").hide()
	}
}
function attach_dl() {

	$("#trap_file").trigger("click")
}

function submit_trap() {
	var leave_start=format_day("ls")
	var leave_end=format_day("le")
	var sp=$("#sponsorship").val();
	if(sp=="LIKANA"){
		sp_op=1
		mb_op=0//mubs budget is option? no//must fill in
		ospb_op=1//other sponsor budget optional? yes 
		pomf=0

	}
	else{
		ospb_op=0
		mb_op=1
		sp_op=0
		pomf=1;
	}

	var hd=[{lb:"Travel Type",fn:"travel_type",ft:"sel"},{lb:"Destination",fn:"destination"},{lb:"Start Date",fn:"leave_start",vl:leave_start,ft:"date"},{lb:"End Date",fn:"leave_end",ft:"date",vl:leave_end},{lb:"Sponsorship Type",fn:"sponsorship",ft:"sel"},{lb:"Other Sponsor",fn:"other_sponsor",op:sp_op},{lb:"LIKANA Sponsorship Budget",fn:"mubs_budget",ft:"money",op:mb_op},{lb:"Purpose of LIKANA Funds",fn:"purpose_of_mubs_funds",op:pomf},{lb:"Purpose",fn:"purpose"}]
	var data=prep_data(hd,"post")
	if(!data)
		return 0;
	var file=document.getElementById("trap_file").files
	var vi=validate_file(file,"pdf")
    if(!vi)
        return 0;
	if(file.length){
		data.append("trap_file",file[0])
	}
	
	if((sp=="LIKANA") && (adata.lstatus=="Pending Approval by Principal")){
		adata.lstatus="Pending Action of Bursar"
	}
	else{
		
	}

	data.append("status",adata.lstatus)

	data.append("rdept_id",adata.rdept_id)
	data.append("rtitle",adata.rtitle)
	data.append("hdept_id",adata.hdept_id)
	data.append("dp",adata.dp);//deputy principal
	if(adata.hdept_id){
		var incharge=get_incharge();
		if(!incharge){return 0}
		data.append("icuserid",incharge)
	}
	var cfm=confirm("Do you confirm the details of this travel application?")

	if(!cfm){return 0}
	ajax_file(data,function (rst) {
		$("#new-trap-modal").modal("hide")
		load_traps(rst)
	})
}
function sponsorship_changed() {
	var sp=$("#sponsorship").val();
	if(sp=="LIKANA"){
		$("#other_sponsor,#osp_budget").attr("readonly",true)
		$("#mubs_budget,#purpose_of_mubs_funds").attr("readonly",false)
		

	}
	else{
		$("#other_sponsor,#osp_budget").attr("readonly",false)
		$("#mubs_budget,#purpose_of_mubs_funds").attr("readonly",true)
	}
}

function load_traps(rst) {
	var traps=rst.traps;
	adata.traps=traps
	var hd=[{lb:"Travel Type",fn:"travel_type"},{lb:"Application Date",fn:"app_date"},{lb:"Destination",fn:"destination"},{lb:"Start Date",fn:"leave_start"},{lb:"End Date",fn:"leave_end"},{lb:"Sponsorship",fn:"sponsorship"},{lb:"Purpose",fn:"purpose"},{lb:"Status",fn:"status"},{lb:"",ft:"btn",text:"View",oc:"view_trap"}]
	gen_table(hd,traps,"traps-div","No travel applications made")
}

function get_users(pager) {
	if(pager=="next")
        var os=adata.os+lm;
    else if(pager=="previous")
        var os=adata.os-lm;
    else if(pager=="reset"){
    	adata.crit="all"
    	var os=0;
    }
    else{
        var os=0;
    }
    var crit="by-name";
	var data={rq:"get-users",url:adata.url,os:os,crit:crit}
	if(crit=="by-name"){
			var name=$("#dept-user-search-name").val()
			if(name.length==0){return display_err("Please enter a name or email before you search")}
			data.name=name;
    }
	ajax_go(data,function (rst) {

		load_users(rst)
	})
}
function load_users(rst) {
	 pager("search-users",rst.os,rst.users,rst.count)
	adata.users=rst.users;
	var users=rst.users;

	$("#dept-users-search-div").show()
	if(users.length)
			$("#dept-users-footer,#dept-users-search-div").show()
	else
			$("#dept-users-footer").hide()
	var flds=[{lb:"",ft:"rb",cl:"dept-user-rb",fn:"id"},{lb:"Name",fn:"name"},{lb:"Email",fn:"email"}]
	gen_table(flds,users,"dept-user-search-results","No results retrieved")
}



function get_rdept() {
	var dp=0
	var hodtitle=adata.me.hodtitle
	var hodaccess=adata.me.hodaccess
	status="Pending Approval by Supervisor"
	var rdept_id=adata.me.contract_dept
	var roles=adata.me.roles;
	var rtitle=hodtitle
	var hdept_id=0
	var role_name=0
	for(var i=0;i<roles.length;i++){
		var role=roles[i].priv;
		if(role=="dean"){
			status="Pending Approval by Principal"
			rdept_id=0
			var rtitle="Principal";//reporting department head's title
			hdept_id=roles[i].dept_id;
			role_name=roles[i].name
			adata.dp=roles[i].dp


			break;
		}
		if(role=="hdm"){
			role="hdm";
			hdept_id=roles[i].dept_id;//department being headed
			var phtitle=roles[i].phtitle//faculty
			var rdept_id=roles[i].pdid;
			var paccess=roles[i].paccess
			role_name=roles[i].name
			adata.dp=roles[i].dp
			break;
		}
	}

	if(role=="hdm"&&adata.me.contract_dept==hdept_id&&(adata.me.cat=="Administrative"||adata.me.cat=="Support")){
		status="Pending Approval by Principal"
		rtitle="Principal"
		var rdept_id=0
		
	}
	else if(role=="hdm"&&adata.me.contract_dept==hdept_id&&adata.me.cat=="Academic"){
		status="Pending Approval by Supervisor"
		rtitle=phtitle
		
	}
	else if(role=="hdm"&&paccess=="dean"){
		//HOD of an academic dept, but contract elsewhere
		status="Pending Approval by Supervisor"
		rtitle=phtitle
		
	}
	else if(role=="hdm"){
		var rdept_id=adata.me.contract_dept
		status="Pending Approval by Principal"

	}
	
	adata.lstatus=status
	adata.rdept_id=rdept_id;
	adata.hdept_id=hdept_id
	adata.role_name=role_name
	adata.rtitle=rtitle
	
	if(adata.me.deputy_dean){
		adata.lstatus="Pending Approval of Supervisor"
		adata.rdept_id=adata.me.deputy_dean//ID of faculty where one is deputy dean


	}

	$("#role-name").text(role_name)
}
function get_incharge() {
	var dept_users=$(".dept-user-rb");var userid=0;//userid
	dept_users.each(function () {
		var id=this.value
		var checked=$(this)[0].checked

		if(checked){
			userid=id;
		}
	})
	if(!userid){
		display_err("Please select one who will be incharge of your department")
		return 0;
	}
	return userid
}

function trap_file_changed() {
	if(adata.upload_only)
	{
		var file=document.getElementById("trap_file").files
		var vi=validate_file(file,"pdf")
	    if(!vi)
	        return 0;
		var data=new FormData()
		data.append("trap_file",file[0])
		data.append("url",adata.url);
		data.append("rq","upload-file");
		data.append("id",adata.id);

		ajax_file(data,function (rst) {
			load_traps(rst)
		},adata.url)
	}
	else{
		var file=document.getElementById("trap_file").files[0]
		$("#file-name").show()
		$("#file-name").text(file.name)
	}
}

