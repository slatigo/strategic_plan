adata.pg="bio"
$(function () {
	//The app loads then using ajax, requests data to fill up the page
	get_defaults()
	//get_depts()
	load_countries("nationality")
	$(".udiv").hide()
	$(".hod").show()
})
function staff_div() {
	var data={rq:"search-staff",crit:"approved",url:adata.url}

	ajax_go(data,function (rst) {
		load_staff_hod(rst)
		show_div("profile-card")
		$(".ch-div").hide()
		$("#staff-search-results-div-parent").show()
	})
}
function get_defaults() {
	var data={url:adata.url,rq:"get-defaults",crit:"approved"}
	ajax_go(data,function (rst) {
		load_staff_hod(rst)
		adata.me=rst.user;
	})
}
function search_staff_crit(crit) {
	adata.crit=crit;
	search_staff()

}
function search_staff(pager){
	if(pager=="next")
    var os=adata.os+lm;
  else if(pager=="previous")
      var os=adata.os-lm;
  else{
      var os=0;
  }
  var crit=adata.crit;

	var data={url:adata.url, rq:"search-staff",os:os}
	if(crit=="name"){
			data.firstname=$("#sb-firstname").val()
			data.surname=$("#sb-surname").val()
			data.othernames=$("#sb-othernames").val()
			if(data.firstname==""&&data.surname==""&&data.othernames==""){
				return display_err("Please enter either a firstname, surname or othernames")
			}
	}
	else if(crit=="email"){
		data.crit="email"
		data.email=$("#sb-email").val()
	}
	else{
		data.crit=crit
	}
	data.crit=crit;

	ajax_go(data, function(rst){
		//var hd=basic_info;
		adata.staff=rst.staff
		$(".modal").modal("hide")
		show_div("profile-card")
		$(".ch-div").hide()
		$("#staff-search-results-div-parent").show()
		load_staff_hod(rst)
	})
}
function show_bio_div(cont_id, ) {
	$(".ch-div").hide();//child div
	$("#profile-div").show();
	$(".profile-menu").removeClass("active")
	$('#a-basic-info').addClass("active")
	$(".ch-div-1").hide()
	$("#basic-info").show()
}
function view_profile(index) {
	$(".ch-div").hide();//child div
	$("#profile-div").show();
	$(".profile-menu").removeClass("active")
	$('#a-basic-info').addClass("active")
	$(".ch-div-1").hide()
	$("#basic-info").show()

	if(index==undefined)
		index=adata.index;
	adata.index=index;
	var status=adata.staff[index].status
	adata.status=status
	var name=adata.staff[index].firstname+" "+adata.staff[index].surname;
	$("#name").text(name)

	adata.contract_id=adata.staff[index].contract_id
	$("#profile-status").text(status)
	$(".axn-btn").hide()
	$("#cp-btn").hide()
	$("#hod-app-btn,#dec-app-btn").hide()
	if(status=="Pending Approval of Principal"){
			$("#hod-app-btn,#dec-app-btn").show()
	}
	if(status=="Declined"){
			$("#decline-msg-btn").show()
			var dm=adata.staff[index].decline_reason;
			if(dm==null)
				dm="No message added"

			$("#decline-msg").text(dm)
	}
	else{
		$("#decline-msg-btn").hide()
	}
	var hd=[{lb:"First Name",fn:"firstname",},{lb:"Surname",fn:"surname"},{lb:"Middle name",fn:"othernames"},{lb:"Maiden Name",fn:"maiden_name"},{lb:"Sex",fn:"sex",ft:"sel"},{lb:"Date of Birth",fn:"dob",ft:"date"},
	{lb:"Email",fn:"email"}

	,{lb:"Phone Line 1",fn:"phonea",ft:"phone"},{lb:"Phone Line 2",fn:"phoneb",op:1,ft:"phone"},{lb:"Phone Line 3",fn:"phonec",op:1,ft:"phone"},{lb:"Identification No.",fn:"id_no"},{lb:"NSSF.",fn:"nssf_no"},{lb:"Supplier/IFMS No.",fn:"ifms_no"},{lb:"TIN",fn:"tin"},

	{lb:"National of",fn:"nationality",ft:"sel"},{lb:"District of Origin",fn:"district_of_origin"},{lb:"Place of birth",fn:"district_of_origin"},{lb:"Permanent Address",fn:"permanent_address"},
	
	{lb:"Maritial Status",fn:"marital_status",ft:"sel"},{lb:"Name of Spouse",fn:"name_of_spouse"}]
	
	var options=[{text:"Edit Profile",method:"edit_basic_info"},{text:"Delete Profile",method:"remove_profile"}];
	adata.staff[index]
	adata.id=adata.staff[index].id
	adata.staff_id=adata.staff[index].id
	adata.userid=adata.staff[index].userid
	var staff=adata.staff
	var staff=adata.staff
	var marital_status=staff[index].marital_status;
	adata.staff_email=adata.staff[index].email;
	adata.staff_name=staff[index].firstname+" "+staff[index].surname
	if(marital_status=="Married"){
			hd.splice(19,0,{lb:"Marriage Certificate",fn:"mcert"})
			if(staff[index].mc){
				adata.staff[index].mcert="<button class='btn btn-primary btn-sm' onclick=\"download_marr_cert("+adata.id+")\"> Download</button>"
			}
	}
	 sex=staff[index].sex;
	  if(sex=="Male")
	    default_path="/images/male-ava.jpg"
	  else if(sex=="Female")
	    default_path="/images/female-ava.jpg"
	  else{
	    default_path="/images/gen-ava.jpg"
	  }
	  oc="onclick=upload_pp()";
	  dir="/images/uploads/passports/"
	  style="width:150px;border-radius:10px"
  var ts=new Date()
  path=dir+staff[index].id+"?"+ts
 
  img="<img src='"+path+"' style=\""+style+"\"  onerror=\"this.src='"+default_path+"'\" >"
	$("#profile-img").html(img)

	gen_table_mobile(hd,[adata.staff[index]],"basic-info-table-div",{ndata:"No bio data added",clms:2});
	var cat=adata.staff[index].cat;
	var cat=adata.staff[index].cat;
	if(cat=="Academic")
	{
		$(".acad").show()
	}
	else{
		$(".acad").hide()
	}
}
function show_decline_reason() {
	$("#decline-msg-modal").modal("show")
}
function change_profile_status_hod(status) {
	change_profile_status(status,function (rst) {
		$("#pending-no").text(rst.pending)
		$("#declined-no").text(rst.declined)
		$("#approved-no").text(rst.approved)
		adata.staff=rst.staff;
		var staff=rst.staff;
		load_staff(rst)
	})
}

function load_contracts(rst) {
	var contracts=rst.contracts;
	
	if(contracts.length==1&&contracts[0].psn=="--"){
		contracts=[]
	}
	else{
		$("#add-contract-btn").hide()
	}
	adata.contracts=rst.contracts;
	for(var i=0;i<contracts.length;i++){
		var contract_type=contracts[i].contract_type
		contracts[i].contract_type_fm=contract_type
		var dept=contracts[i].dept
		var pdept=contracts[i].pdept;
		if(pdept==null)
			fdept=dept
		else
			fdept=pdept+"<span style='font-weight:bold;font-size:18px'>,<br></span> "+dept;
		contracts[i].fdept=fdept;

		if(contract_type=="Part-time"){
			contract_type_fm=contract_type+"<span style='font-size:10px;color:blue'></span>"
			contracts[i].contract_type_fm=contract_type_fm

		}
		var contract_status=contracts[i].contract_status
		var days_left=contracts[i].days_left;
		var days_to=contracts[i].days_to
		if(!contract_status){

			if(days_left>0||days_left==null){
				if(days_to>0)
					contracts[i].contract_status="Pending"
				else
					contracts[i].contract_status="Active"
			}
			else if(days_left<=0){
				contracts[i].contract_status="Expired"
			}
		}
	}
	

	var hd=[{lb:"Position",fn:"psn"},{lb:"Contract Status",fn:"contract_status"},{lb:"Contract Type",fn:"contract_type_fm"},{lb:"Contract Terms",fn:"contract_terms"},{lb:"Contract Start Date",fn:"contract_reported_on"},{lb:"End Date",fn:"contract_ends"},{lb:"Department",fn:"fdept"},{lb:"",ft:"options"}]
	if(adata.status=="Not submitted"){
		//options column stays intact
		var options=[{text:"Edit",method:"edit_contract"}]
	}
	else{

		hd.pop()
	}

	gen_table_mobile(hd,contracts,"contracts-table",{nodata:"No contracts on this profile",clms:2},options)
}

function load_staff_hod(rst) {

	$("#pending-no").text(rst.pending)
	$("#declined-no").text(rst.declined)
	$("#approved-no").text(rst.approved)
	load_staff(rst)
}

function decline_approval() {

	$("#decline-modal").modal("show")
}