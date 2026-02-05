adata.pg="bio"
function staff_div() {	
	var data={rq:"search-staff",crit:"all"}

	ajax_go(data,function (rst) {
		load_staff(rst)
		show_div("profile-card")
		$(".ch-div").hide()
		$("#staff-search-results-div-parent").show()
	})
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
	var acc_status=adata.staff[index].acc_status//account status;
	adata.acc_status=acc_status;
	var name=adata.staff[index].fullname
	$("#name").text(name)
	if(acc_status=="Inactive"){
			$("#activate-btn").show()
			$("#deactivate-btn").hide()

	}
	else{
		$("#deactivate-btn").show()
		$("#activate-btn").hide()
	}
	adata.status=status
	$("#profile-status").text(status)

	$(".axn-btn").hide()
	$("#cp-btn").hide()
	$("#hod-app-btn").hide()
	$("#edit-bio-btn").hide()
	if(status=="Not Submitted"&&adata.me.priv=="staff"){
		$(".axn-btn").show()
	}
	if(adata.me.priv=="hr"){
		$("#edit-bio-btn").show();
		$(".hr").show()
	}
	var hd=[{lb:"Fullname",fn:"fullname"},{lb:"Sex",fn:"sex",ft:"sel"},{lb:"Date of Birth",fn:"dob",ft:"date"},
	{lb:"Email",fn:"email"},
	{lb:"National ID No (NIN)",fn:"nin"},{lb:"NSSF.",fn:"nssf_no"},{lb:"TIN",fn:"tin"},

	{lb:"National of",fn:"nationality",ft:"sel"},{lb:"Appointment Date",fn:"appointment_date"},{lb:"",ft:"options"}]
	var options=[{text:"Edit Profile",method:"edit_basic_info"},{text:"Delete Profile",method:"remove_profile"}];
	options=0
	adata.staff[index]

	adata.id=adata.staff[index].id

	adata.pid=adata.staff[index].pid
	if(adata.pid==null)
		adata.pid=0
	adata.email=adata.staff[index].email
	adata.userid=adata.staff[index].userid
	adata.contract_id=adata.staff[index].contract_id

	var staff=adata.staff
  sex=staff[index].sex;

  if(sex=="Male")
    default_path="/images/male-ava.jpg"
  else if(sex=="Female")
    default_path="/images/female-ava.jpg"
  else{
    default_path="/images/gen-ava.png"
  }
  oc="onclick=view_pp()";
  
  if(status=="Approved")
  	oc=""
  dir="/images/uploads/passports/"
  style="width:150px;border-radius:10px"
  var ts=new Date()
 
  path=dir+staff[index].id+"?"+ts
  img="<img src='"+path+"' style=\""+style+"\" "+oc+" onerror=\"this.src='"+default_path+"'\" >"

	$(".profile-img").html(img)
	show_div("profile-card")
	$(".ch-div").hide()
	$("#staff-search-results-div-parent").show()
	$(".cd").hide()
	$("#profile-card,#profile-div").show()

	$("#staff-search-results-div-parent").hide()
	gen_table_mobile(hd,[adata.staff[index]],"basic-info-table-div",{ndata:"No bio data added",clms:2},options);
	var cat=adata.staff[index].cat;
	
}
function new_staff_profile() {
	$("#basic-info-modal").modal("show")
	adata.rq="add-basic-info"
	clear_fields()
	$("#nationality").val("Uganda")
	$(".marital_status").css("display","none")
}
function view_leave_applications(){
	var data={url:adata.url,rq:"get-leave-applications"}
	ajax_go(data,function (rst) {
		adata.projects=rst.projects;
		show_div("leave-card")
		load_leaves(rst)
	})
}


//REPORTS
function rp_main_dept_changed() {
	var depts=adata.depts;
	var pdid=$("#rp_main_dept").val();//main department
	adata.pdid=pdid
	adata.rp_dept=pdid;
	var sd=[];//sub department;
	var k=0;
	for(var i=0;i<depts.length;i++){
		if(depts[i].pdid==pdid){
			//sub-department/units within the main department
			sd[k++]=depts[i]
		}
	}
	if(sd.length){
		load_select(sd,"id","dept","#rp_dept");
		$(".rp_dept").css("display","flex");
		adata.rp_dept_lb="Unit"//contract dept label; for validation message
	}
	else{
		adata.rp_dept=pdid;
		$(".rp_dept").hide()
		adata.rp_dept_lb="Department";//contract dept label;validation message
	}
}
function rp_sub_dept_changed() {
		adata.rp_dept=$("#rp_dept").val()
}


function staff_list_dl(crit) {
	clear_fields()
	if(crit=="dept")
		$("#rp-dept-modal").modal("show")
	else if(crit=="contract-status"){
		$("#sb-contract-status-modal").modal("show")
	}
	else if(crit=="name"){
		$("#sb-name-modal").modal("show")
	}
	else if(crit=="email"){
		$("#sb-email-modal").modal("show")
	}

	adata.crit=crit;
}
function add_staff() {
	var dob=format_day('dob')
	var contract_starts=format_day("contract_starts")

	if(!adata.contract_dept_lb)
		adata.contract_dept_lb="Department"
	var contract_end_day=format_day("contract_ends")
	var appointment_date=format_day("appointment")
	flds=[{lb:"Full Name",fn:"fullname",},{lb:"Email",fn:"email"},{lb:"Sex",fn:"sex",ft:"sel"},{lb:"Date of Birth",fn:"dob",ft:"date",vl:dob,op:1},
	{lb:"National of",fn:"nationality",ft:"sel"},{lb:"NSSF.",fn:"nssf_no"},{lb:"TIN",fn:"tin"},{lb:"NIN",fn:"nin"},{lb:"Appointment Date",fn:"appointment_date",vl:appointment_date,ft:"date"}]
	var country=$("#nationality").val()
	var data=prep_data(flds,"post");if(!data){return 0}
	vr=validate_start_end_dates(contract_starts,contract_end_day,"Contract end date should be a date after the contract start date");
	if(!vr){return 0}
	data.append("userid",adata.userid)
	ajax_file(data,function (rst) {
		$("#profile-div").show()
		$("#basic-info-modal").modal("hide")
		adata.staff=rst.staff;
		view_profile(0)
	})
}
function load_staff(rst) {

	adata.os=rst.os
	pager("staff",rst.os,rst.staff,rst.count)
	var staff=rst.staff;
	adata.staff=staff;
	for(var i=0;i<staff.length;i++){
		var id=staff[i].id;
		if(adata.ts)
			file=id+"?ts"+adata.ts;
		else
			file=id
		
		if(staff[i].img){
			var src="\"/images/uploads/passports/"+file+"\"";
		}
		else{
			var sex=staff[i].sex;

			if(sex=="Male")
				var src="\"/images/male-ava.jpg\""
			else if(sex=="Female")
					var src="\"/images/female-ava.jpg\""
  		else{

    		src="\"/images/gen-ava.png\""
  		}
		}

		var img="<img  style='border-radius:10px;width:70px' src="+src+"/>"
		staff[i].img=img;
		staff[i].view_btn="<button class='btn btn-primary' onclick=\"view_profile("+i+")\">View</button>"
	}
	var hd=[{lb:"",fn:"img",width:70},{lb:"Name",fn:"fullname"},{lb:"Email",fn:"email"},{lb:"Position",fn:"psn"},{lb:"Department",fn:"dept"},{lb:"",fn:"view_btn"}]
	gen_table(hd,staff,"staff-search-results-div","No staff added")
	$("#staff-search-results-div-parent").show()
	adata.ts=0;
}

function edit_basic_info() {
	index=adata.index
	clear_fields()
	if(adata.me.priv=="hr")
		var flds=[{fn:"email"},{fn:"fullname"},{fn:"sex"},{fn:"dob",ft:"date",fid:"dob"},{fn:"nationality"},{fn:"nin"},{fn:"nssf_no"},{lb:"TIN",fn:"tin"},{fn:"appointment_date",ft:"date"}]
	if(adata.me.priv=="staff"){
		var flds=[{fn:"personal_email"},{fn:"address",ft:"date",fid:"dob"},{fn:"nationality"},{fn:"nin"},{fn:"nssf_no"},{lb:"TIN",fn:"tin"},{fn:"appointment_date",ft:"date"}]
	}
	var mc=adata.staff[index].mc;//marriage certificate
	var ms=adata.staff[index].marital_status
	adata.mc=mc;

	for(var i=0;i<flds.length;i++)	{
		var id=flds[i].fn;
		var ft=flds[i].ft;
		var fid=flds[i].fid;
		var ft=flds[i].ft;
		var val=adata.staff[index][id]

		if(id=="nationality")
		{
			if(val=="Uganda")
			{
				$(".ori").css("display","flex")
			}
			else{
				$(".ori").hide()
			}
		}

		if(ft=="date")
		{
			format_day(fid,"edit",val)
		}
		else
			$("#"+id).val(val)
	}
	adata.rq="edit-basic-info"
	$("#basic-info-modal").modal("show")
	var district=adata.staff[adata.index]["district_of_origin"]
}
function remove_profile() {
	var data={url:adata.url, rq:"remove-staff",userid:adata.userid}

	ajax_go(data, function(rst){
		adata.staff=rst.staff
		$("#rp-dept-modal").modal("hide")
		load_staff(rst)
	})
}


function change_profile_status(status,cb) {
	var cfm=confirm("Confirm submission");
	if(!cfm){return 0}
	var data={rq:"change-profile-status",userid:adata.userid,id:adata.id,contract_id:adata.contract_id,status:status,url:adata.url,pid:adata.pid}
	data.staff_name=adata.staff_name;
	data.staff_email=adata.staff_email
	if(status=="Declined"){
			var dr=$("#decline_reason").val();
			if(dr.length==0){
				return display_err("Please enter a reason for declining approval of the profile")
			}
			data.decline_reason=dr
	}
	ajax_go(data,function (rst) {
		adata.staff=rst.staff
		view_profile(adata.index)
		$(".modal").modal("hide")
		if(cb){
			cb(rst)
		}
	})
}
function view_pp() {

	$("#pp-modal").modal("show")
}
function upload_pp() {
	$("#pp").val("")
	$("#pp").trigger("click")

}
$(function () {
	$("input").attr("autocomplete","off")
	$("#pp").change(function () {
      var photos=document.getElementById("pp").files
      var vi=validate_file(photos,"Image")
      if(!vi)
        return 0;
      var ndxfiles=[]
      resize_img(0,ndxfiles,photos,300,300,function (ndxfiles) {
      		after_resize(ndxfiles)
      })
      function after_resize(photos) {
		      var fd=new FormData()
		      fd.append('pp',photos[0])
		      fd.append("rq","upload-passport")
		      fd.append("pid",adata.pid)
		      ajax_file(fd,function (res) {
		        $("#pp").val("")
		        adata.staff[adata.index].img=1
		        view_profile(adata.index)
		       
		        var ts=new Date()
		        adata.ts=ts;
		      },adata.url)
		  	// body...
      }
	})
})

function country_changed() {
	var ctry=$("#nationality").val()

	if(ctry=="Uganda")
	{
		$(".ori").css("display","flex")
		
	}
	else
	{
		$(".ori").hide()
	}
}
var acad_bg_fls=[{lb:"School",fn:"school"},{lb:"Award Country",fn:"award_country"},{lb:"Award Level",fn:"award_level"},{lb:"Award",fn:"award"},{lb:"Award Class",fn:"award_class"},{lb:"Start Year",fn:"start_year"},{lb:"Start Month",fn:"start_month"},{lb:"Start Day",fn:"start_day"},{lb:"End Year",fn:"end_year"},{lb:"End Month",fn:"end_month"},{lb:"End Day",fn:"end_day"}]
function get_acad_bg(el) {
	var pid=adata.pid;
	var data={url:adata.url,rq:"get-acad-bg",pid:pid}
	ajax_go(data,function (rst) {
		$(".profile-menu").removeClass("active")
		$('#a-acad-bg').addClass("active")
		$(".ch-div-1").hide()
		$("#academic-background-div").show()
		load_acad_bg(rst)
	})
}
function load_acad_bg(rst) {
	var acad_bg=rst.acad_bg;
	adata.acad_bg=acad_bg
	var acad_bg_fls=[{lb:"Started",fn:"started"},{lb:"Ended",fn:"ended"},{lb:"School",fn:"school"},{lb:"Award Level",fn:"award_level"},{lb:"Award",fn:"award"},{fn:"",lb:"",ft:"options"}]
	
	for(var i=0;i<acad_bg.length;i++){
		var start_year=acad_bg[i].start_year;
		var start_month=acad_bg[i].start_month;

		var start_day=acad_bg[i].start_day;
		var started=""; var ended=""
		if(start_day){

			started=format_month(start_month)+" "+start_day+", "+start_year;
		}
		else if(start_month){
			started=format_month(start_month)+", "+start_year
		}
		else
			started=start_year
		//ends
		var end_year=acad_bg[i].end_year;
		var end_month=acad_bg[i].end_month;
		var end_day=acad_bg[i].end_day;
		if(end_day)
			ended=format_month(end_month)+" "+end_day+", "+end_year;
		else if(end_month)
			ended=format_month(end_month)+", "+end_year
		else
			ended=end_year
		acad_bg[i].started=started
		acad_bg[i].ended=ended;
	}
	var hd=acad_bg_fls;
	var options=[{text:"View Document",method:"download_acad_doc"}]
	if(adata.me.priv=="hr"||(adata.me.priv=="staff"&&(adata.status=="Not Submitted"||(adata.status=="Declined by HOD"||adata.status=="Declined by Director"||adata.status=="Declined by Principal"||adata.status=="Declined by Dean")))){
		//options column stays intact
		//var options=[{text:"Download Document",method:"download_acad_doc",cond:[{fn:"file",val:1}]},{method:"edit_acad_bg",text:"Edit"},{method:"remove_acad_bg",text:"Remove"}]
		options[1]={method:"edit_acad_bg",text:"Edit"}
		options[2]={method:"remove_acad_bg",text:"Remove"}
	}
	gen_table(hd,acad_bg,"academic-background-table-div","No academic background added",options)
}
function download_acad_doc(index) {
	// body...
	var id=adata.acad_bg[index].id;
	adata.id=id;
	var award=adata.acad_bg[index].award
	window.open(adata.url+"?rq=download-acad-doc&id="+id+"&pg="+adata.pg+"&award="+award,"_blank")
}

function upload_acad_doc_dl(index) {
	//adata.id=adata.acad_bg[index].id;
	$("#acad_doc").val("")
	$("#acad_doc").trigger("click")
	$("#acad-doc-file-name").hide()
}

function upload_acad_doc() {

	var doc=document.getElementById("acad_doc").files
      var vi=validate_file(doc,"Document")
      if(!vi)
        return 0;
      var fd=new FormData()
      $("#acad-doc-file-name").show()
      return $("#acad-doc-file-name").text(doc[0].name)
      fd.append('acad_doc',doc[0])
      fd.append("rq","upload-acad-doc")
      fd.append("id",adata.id)
      fd.append("userid",adata.userid)
      fd.append("pid",adata.pid)
      ajax_file(fd,function (rst) {
       	load_acad_bg(rst)
      },adata.url)
}
function format_month(v) {
	// body...
	if(v==1)
		rv="Jan"
	if(v==2)
		rv="Feb";
	if(v==3)
		rv="Mar"
	if(v==4)
		rv="Apr"
	if(v==5)
		rv="May"
	if(v==6)
		rv="Jun"
	if(v==7)
		rv="Jul"
	if(v==8)
		rv="Aug"
	if(v==9)
		rv="Sep"
	if(v==10)
		rv="Oct"
	if(v=="11")
		rv="Nov"
	if(v=="12")
		rv="Dec"
	return rv;
}
function add_acad_bg_dl() {
	$("#acad-bg-modal").modal("show")	
	adata.rq="add-staff-acad-bg"
	clear_fields()
	$(".country").val("Uganda")
	$("#acad-doc-file-name").hide()
	adata.acd_op=0
}
function add_staff_acad_bg() {
	var userid=adata.userid;
	var flds=[{lb:"School",fn:"school"},{lb:"Award Country",fn:"award_country",ft:"sel"},{lb:"Award Level",fn:"award_level",ft:"sel"},{lb:"Award",fn:"award"},{cn:"Start Year",fn:"start_year",op:1},{cn:"Start Month",fn:"start_month",op:1},{cn:"Start Day",fn:"start_day",op:1},{cn:"End Year",fn:"end_year",op:1},{cn:"End Month",fn:"end_month",op:1},{cn:"End Day",fn:"end_day",op:1}]
	var data=prep_data(flds,"post"); if(!data){return 0;}

	vr=validate_edu_dates();if(!vr){return 0;}
	var file=document.getElementById("acad_doc").files
	if(adata.rq=="add-staff-acad-bg"||(adata.rq=="edit-acad-bg"&& file.length)){
		if(file.length==0){return display_err("Please select a file")}
		var vr=validate_file(file,"pdf");if(!vr){return 0;}
		data.append("acad_doc",file[0])
	}
	data.append("pid",adata.pid);
	ajax_file(data,function (rst) {
		load_acad_bg(rst)
		$("#acad-bg-modal").modal("hide")
	})
}
function curr_work_clicked() {

	var cw=$("#current-work").is(':checked');
	adata.cw=cw;

	if(cw==true){
		$("#emp_end_div").hide()
		adata.emp_end_op=1
	}
	else{
		
		$("#emp_end_div").show()
		adata.emp_end_op=0
	}
}
function edit_acad_bg(index) {
	adata.rq="edit-acad-bg"
	adata.acd_op=1
	var hd=[{fn:"school"},{fn:"award_country"},{fn:"award_level"},{fn:"award"},{fn:"award_class"},{fn:"start_year"},{fn:"start_month"},{fn:"start_day"},{fn:"end_year"},{fn:"end_month"},{fn:"end_day"}]
	var acad_bg=adata.acad_bg[index];
	for(var i=0;i<hd.length;i++){
		var fn=hd[i].fn;
		val=acad_bg[fn]
		$("#"+fn).val(val)
	}
	adata.id=acad_bg.id;
	$("#acad-bg-modal").modal("show")
	var file=acad_bg.file;
	if(file){
		$("#acad-doc-file-name").text("File Exists")
		$("#acad-doc-file-name").show()
		
	}
	else
			$("#acad-doc-file-name").hide()
}
function remove_acad_bg(index) {
	var id=adata.acad_bg[index].id;
	var data={url:adata.url,id:id,pid:adata.pid,rq:"remove-acad-bg"}
	ajax_go(data,function (rst) {

		load_acad_bg(rst)
	})
}
var award_classes=["First","Second","Third","Fourth"]
var award_classes_uni=["First","Second Upper","Second Lower","Pass"]
$(function () {
	populate_date()
})
function award_level_changed() {
	//populate_award_class()
}
function validate_edu_dates() {
	var start_year=$("#start_year").val();
	var start_month=$("#start_month").val();
	var start_day=$("#start_day").val()
	var end_year=$("#end_year").val()
	var end_month=$("#end_month").val()
	var end_day=$("#end_day").val();
	var cw=adata.cw;
	if(cw==true)
	if(start_year=="0"){
		display_err("Please select the year of start")
		return 0
	}
	if(start_month=="0"&&start_day!="0"){
		display_err("Please enter the month the study started")
		return 0;
	}
	
	if(end_year=="0"&&cw==false){
		display_err("Please select the year study ended")
		return 0
	}
	if(end_month=="0"&&end_day!="0"&&cw==false){
		display_err("Please enter the month the study ended")
		return 0;
	}
	if((start_month!="0"&&end_month=="0"&&cw==false)){
		display_err("The end month should be selected")
		return 0;
	}

	if(start_month=="0" &&end_month!="0"){
		display_err("The start month should selected")
		return 0;
	}
	if(start_day!=0&&end_day==0&&cw==false){
		display_err("End day should be selected")
		return 0;
	}
	if(start_day==0&&end_day!=0){
		 display_err("Start day should be selected")
		return 0;
	}
	if(start_day==0)
		start_day=1;
	if(end_day==0)
		end_day=1;
	return validate_start_end_dates([start_year,start_month,start_day],[end_year,end_month,end_day])
	return 1;

}



//CONTRACTS
function view_contracts(index) {
	get_profile_contract()
	
}
function get_profile_contract() {

	var data={rq:"get-profile-contract",userid:adata.userid,url:adata.url,contract_id:adata.contract_id}
	ajax_go(data,function (rst) {
		load_contracts(rst)
			$(".ch-div").hide();//child div
			$("#profile-div").show();
			$(".profile-menu").removeClass("active")
			$('#a-contracts').addClass("active")
			$(".ch-div-1").hide()
			$("#contracts-div").show()
			
	})
}

function get_contracts() {
	var data={rq:"get-contracts",userid:adata.userid,url:adata.url}
	ajax_go(data,function (rst) {
		load_contracts(rst)
			$(".ch-div").hide();//child div
			$("#profile-div").show();
			$(".profile-menu").removeClass("active")
			$('#a-contracts').addClass("active")
			$(".ch-div-1").hide()
			$("#contracts-div").show()
			
	})
}
function load_contracts(rst) {
	var contracts=rst.contracts;
	adata.contracts=rst.contracts;
	for(var i=0;i<contracts.length;i++){

		var contract_type=contracts[i].contract_type
		contracts[i].contract_type_fm=contract_type
		var dept=contracts[i].dept
		var pdept=contracts[i].pdept;
		if(pdept==null)
			fdept=dept
		else
			fdept=pdept+" <span style='font-weight:bold;font-size:25px'>,<br></span> "+dept;
		contracts[i].fdept=fdept;
		
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
	var hd=[{lb:"Position",fn:"psn"},{lb:"Contract Status",fn:"contract_status"},{lb:"Contract Terms",fn:"contract_terms"},{lb:"Contract Start Date",fn:"contract_starts"},{lb:"End date",fn:"contract_ends"},{lb:"Department",fn:"fdept"}]
	
	gen_table_mobile(hd,contracts,"contracts-table",{nodata:"No contracts on this profile",clms:2})
}
function contract_type_changed(axn,type) {
	$("#leave_days,#contract_terms").val("")
	$(".contract-terms-div").css("display","none")
	if(axn=="edit")
		type=type;
	else
		var type=$("#contract_type").val()
	if(type=="Part-time"){
		$(".contract_hrs,.contract-terms-div").css("display","flex")
		$(".leave_days_div").css("display","none")

		adata.contract_hrs_op=0
		adata.leave_days_op=1
	}
	else if(type=="Full-time"){
		$(".contract_hrs").hide()
		adata.contract_hrs_op=1
		adata.leave_days_op=0
		$(".contract-terms-div").css("display","flex")
	}
}
function contract_terms_changed(axn,terms) {
	$("#leave_days").val("")
		$("#contract_ends_year").attr("readonly",false)
		$("#contract_ends_day").attr("disabled",false)
		$("#contract_ends_month").attr("disabled",false)
	if(axn=="edit"){
		terms=terms;
	}
	else
		var terms=$("#contract_terms").val()
	format_day("contract_ends","reset")
	var type=$("#contract_type").val()
	if(type=="Part-time"&&terms=="Permanent"){
		$("#contract_terms").val("")
		return display_err("A Part-time contract can't have permanent terms")
	}
	if(terms=="Permanent"){
			var dob=adata.staff[adata.index].dob;
			dob=new Date(dob)
			var yr=dob.getFullYear()
			var mn=dob.getMonth()+1;
			var dt=dob.getDate();
			$("#contract_ends_year").val(Number(yr+60))
			$("#contract_ends_day").val(dt)
			$("#contract_ends_month").val(mn)
			$("#contract_ends_year").attr("readonly",false)
			$("#contract_ends_day").attr("disabled",false)
			$("#contract_ends_month").attr("disabled",false)
			//fill this in with dob+60

	}
	else{
		var type=$("#contract_type").val()
		$(".contract_ends").css("display","flex")
		if(terms=="Contract"&&type=="Full-time"){
			$(".leave_days_div").css("display","flex")
			adata.leave_days_op=0
		}
		else{
			$(".leave_days_div").css("display","none")
		}
		adata.contract_ends_op=0
		adata.leave_days_op=1
	}
}

function contract_psn_changed() {
	$("#contract_main_dept").val("")
	$("#contract_dept").val("")
	$(".contract_dept").hide()
	adata.contract_dept=0;
	var mdepts=adata.mdepts;
	var acad=[];var k=0;
	for(var i=0;i<mdepts.length;i++){
		if(mdepts[i].access=="dean"){
			acad[k++]=mdepts[i]
		}
	}

	var psns=adata.psns;
	var psn=$("#contract_psn").val()
	for(var i=0;i<psns.length;i++){
		if(psns[i].id==psn){
			var cat=psns[i].cat;
		}
	}
	if(cat=="Academic")
		mdepts=acad;
	load_select(mdepts,"id","dept",".dept")
}
function contract_main_dept_changed(axn,did,pdid) {
	var depts=adata.depts;
	if(axn=="edit"){
		var pdid=pdid
	}
	else
		var pdid=$("#contract_main_dept").val();//main department
	var sd=[];//sub department;
	var k=0;
	adata.contract_dept=pdid;
	var psn=$("#contract_psn").val()
	for(var i=0;i<adata.psns.length;i++){
		var cat=adata.psns[i].cat;
		var id=adata.psns[i].id;

		if(psn==id){

			break;
		}
	}

	if(pdid){
		for(var i=0;i<depts.length;i++){
			if(depts[i].id==pdid){
				adata.access=depts[i].access.toUpperCase()
				
	
			}
			if(depts[i].pdid==pdid){
				//sub-department/units within the main department
				sd[k++]=depts[i]
			}
		}
	}
	if(sd.length){
			adata.contract_dept_lb="Unit";//contract dept label;validation message
		load_select(sd,"id","dept","#contract_dept");
		$(".contract_dept").css("display","flex");
	
		if(axn=="edit"){
			$("#contract_dept").val(did)//did department ID; unit mainly
			adata.contract_dept=did;
		}
	}
	else{
		adata.contract_dept=pdid;
		$(".contract_dept").hide()
		adata.contract_dept_lb="Department";//contract dept label;validation message
		if(axn=="edit"){
			$("#contract_main_dept").val(did)//did department ID; unit mainly
			adata.contract_dept=did;
		}
	}
}
function contract_sub_dept_changed() {
	var unit=$("#contract_dept").val();
	if(unit.length){
		adata.contract_dept_lb="Unit"//contract dept label; for validation message
		adata.contract_dept=unit;
	}
}
function change_contract_status_dl(index) {
	var contracts=adata.contracts[index];
	adata.id=contracts.id;
	adata.contract_starts=contracts.contract_reported_on
	$("#contract-status-modal").modal("show")
}
function contract_status_changed(){
	var vl=$("#contract-status").val()
	if(vl=="Terminated"){
		$("#termination-reason-div").css("display","flex")
	}
	else{
		$("#termination-reason-div").hide()
	}
}

function remove_contract(index) {
	
	var data=prep_data([]);
	data.id=adata.contracts[index].id;
	data.userid=adata.userid
	data.rq="remove-contract"
	ajax_go(data,function (rst) {
		$(".modal").modal("hide")
		load_contracts(rst)
	})
}

//OTHER TRAININGS
function view_trainings() {
	
		$(".ch-div").hide();//child div
		$("#profile-div").show();
		$(".profile-menu").removeClass("active")
		$('#a-trainings').addClass("active")
		$(".ch-div-1").hide()
		$("#trainings-div").show()
		get_trainings()
		
}

function training_dl(argument) {
	$("#training-modal").modal("show")
	adata.rq="add-training"
	clear_fields()
}
function add_training() {
	var tr_start=format_day("tr")
	var hd=[{lb:"Programme",fn:"tr_programme"},{lb:"Institution",fn:"tr_institution"},{lb:"Award",fn:"tr_award"},{lb:"Training start",fn:"tr_start",vl:tr_start,ft:"date"},{lb:"Duration",fn:"tr_dur"},{lb:"Duration type",fn:"tr_dur_type",ft:"sel"}]
	var vr=check_empty(hd); if(!vr){return 0}
	var data=prep_data(hd)
	data.rq=adata.rq;
	data.url=adata.url;
	data.pid=adata.pid
	ajax_go(data,function (rst) {
		load_trainings(rst)
		$("#training-modal").modal("hide")
	})
}
function get_trainings() {
	var data={rq:"get-trainings",pid:adata.pid,url:adata.url}
	ajax_go(data,function (rst) {

		load_trainings(rst)
	})
}
function edit_training(index) {
	var tr_start=format_day("tr")
	var training=adata.trainings[index]
	adata.id=training.id;
	var hd=[{lb:"Programme",fn:"tr_programme"},{lb:"Institution",fn:"tr_institution"},{lb:"Award",fn:"tr_award"},{lb:"Duration",fn:"tr_dur"},{lb:"Duration",fn:"tr_dur_type"}]
	for(var i=0;i<hd.length;i++){
		var fn=hd[i].fn;
		val=training[fn]
		$("#"+fn).val(val)
	}
	var dt=training.tr_start
	format_day("tr","edit",dt)
	$("#training-modal").modal("show")
	adata.rq="edit-training"

}
function load_trainings(rst) {
	var trainings=rst.trainings;
	adata.trainings=trainings
	for(var i=0;i<trainings.length;i++){
		var dur_type=trainings[i].tr_dur_type;
		dtype=dur_type;
		var dur=trainings[i].tr_dur;
		if(dur==1){
			dtype=dur_type.substring(0,dur_type.length-1)
		}
		trainings[i].tr_dur_f=dur+" "+dtype
	}
	var hd=[{lb:"Programme",fn:"tr_programme"},{lb:"Institution",fn:"tr_institution"},{lb:"Award",fn:"tr_award"},{lb:"Training start",fn:"tr_start"},{lb:"Duration",fn:"tr_dur_f"},{lb:"",ft:"options"}]
	
	if(adata.me.priv=="hr"||(adata.me.priv=="staff"&&(adata.status=="Not Submitted"||(adata.status=="Declined by HOD"||adata.status=="Declined by Director"||adata.status=="Declined by Principal"||adata.status=="Declined by Dean")))){
		//options column stays intact
		var options=[{method:"edit_training",text:"Edit"},{method:"remove_training",text:"Remove"}]
	}
	else{
		hd.pop()
	}
	gen_table(hd,trainings,"trainings-table","No trainings added",options)
}
function remove_training(index) {
	var id=adata.trainings[index].id;
	var data={id:id}
	data.rq="remove-training";
	data.url=adata.url;
	data.pid=adata.pid
	ajax_go(data,function (rst) {
		load_trainings(rst)
	})
}
//EMPLOYMENT HISTORY
function emp_dl() {
	$("#emp-modal").modal("show")
	adata.rq="add-emp"
	clear_fields()
	$("#emp_end_div").show()
	$('#current-work').prop('checked',false);
	adata.cw=false
}
function emp_div() {
		$(".ch-div").hide();//child div
		$("#profile-div").show();
		$(".profile-menu").removeClass("active")
		$('#a-emp').addClass("active")
		$(".ch-div-1").hide()
		$("#emp-div").show()
		get_emp()
}
function get_emp() {
	var data={rq:"get-emp",pid:adata.pid,url:adata.url}
	ajax_go(data,function (rst) {

		load_emp(rst)
	})
}
function add_emp() {
	var started=format_day("emp_started")
	var ended=format_day("emp_ended")
	var hd=[{lb:"Employer",fn:"emp_employer"},{lb:"Designation",fn:"emp_designation"},{lb:"Started",fn:"emp_started",vl:started,ft:"date"},{lb:"Ended",fn:"emp_ended",vl:ended,ft:"date",op:adata.emp_end_op}]
	var vr=check_empty(hd); if(!vr){return 0}

	if(adata.cw==false)
		vr=validate_start_end_dates(started,ended);if(!vr){return 0}
	var data=prep_data(hd)
	data.rq=adata.rq;
	data.url=adata.url;
	data.pid=adata.pid
	data.id=adata.id
	data.cw=adata.cw;

	ajax_go(data,function (rst) {
		load_emp(rst)
		$("#emp-modal").modal("hide")
	})
}
function edit_emp(index) {
	clear_fields()
	var emp=adata.emp[index]
	var hd=[{fn:"emp_employer"},{fn:"emp_designation"}]
	for(var i=0;i<hd.length;i++){
		var fn=hd[i].fn;
		val=emp[fn];
		$("#"+fn).val(val)
	}
	var dt=emp.emp_started
	format_day("emp_started","edit",dt)
	var dt=emp.emp_ended
	
	if(dt==null){
		$("#emp_end_div").hide()
		$("#current-work").attr("checked",true)
		adata.cw=1
	}
	else{
		format_day("emp_ended","edit",dt)
	}
	

	$("#emp-modal").modal("show")
	adata.rq="edit-emp"
	adata.id=emp.id;


}
function load_emp(rst) {
	var emp=rst.emp;
	adata.emp=emp;
	var hd=[{lb:"Employer",fn:"emp_employer"},{lb:"Designation",fn:"emp_designation"},{lb:"Started",fn:"emp_started"},{lb:"Ended",fn:"emp_ended",def:"To date"},{lb:"",ft:"options"}]
	
	if(adata.me.priv=="hr"||(adata.me.priv=="staff"&&(adata.status=="Not Submitted"||(adata.status=="Declined by HOD"||adata.status=="Declined by Director"||adata.status=="Declined by Principal"||adata.status=="Declined by Dean")))){
		//options column stays intact
	var options=[{method:"edit_emp",text:"Edit"},{method:"remove_emp",text:"Remove"}]
	}
	else{
		hd.pop()
	}
	gen_table(hd,emp,"emp-table","No employment record added",options)
}
function remove_emp(index) {
	var id=adata.emp[index].id;
	var data={id:id}
	data.rq="remove-emp";
	data.url=adata.url;
	data.pid=adata.pid
	ajax_go(data,function (rst) {
		load_emp(rst)
	})
}

//CHILDREN INFORMATION
function children_div() {
		$(".ch-div").hide();//child div
		$("#profile-div").show();
		$(".profile-menu").removeClass("active")
		$('#a-children').addClass("active")
		$(".ch-div-1").hide()
		$("#children-div").show()
		get_children()
}
function get_children() {
	var data={rq:"get-children",pid:adata.pid,url:adata.url}
	ajax_go(data,function (rst) {
		load_children(rst)
	})
}
function child_dl() {
	if(adata.no_children==8)
		return display_err("Can only list 8 children Max")
	$("#child-modal").modal("show")
	adata.rq="add-child"
	clear_fields()
}
function add_child() {
	var child_dob=format_day("child_dob")
	var a = moment(child_dob);
	var b = moment(adata.date);
	var age=(b.diff(a,"years")) 
	if(age>18)
		return display_err("The child should be 18 or less, so a "+age+" year old does not qualify")
	var hd=[{fn:"child_name", lb:"Name"},{fn:"child_dob",lb:"Date of birth",vl:child_dob,ft:"date"}]
	var vr=check_empty(hd); if(!vr){return 0}
	var data=prep_data(hd)
	data.rq=adata.rq;
	data.url=adata.url;
	data.pid=adata.pid
	data.id=adata.id
	ajax_go(data,function (rst) {
		load_children(rst)
		$("#child-modal").modal("hide")
	})
}
function remove_child(index) {
	var id=adata.children[index].id;

	var data={id:id}
	data.rq="remove-child";
	data.url=adata.url;
	data.pid=adata.pid
	ajax_go(data,function (rst) {
		load_children(rst)
	})
}
function edit_child(index) {
	var child=adata.children[index]
	var hd=[{fn:"child_name"}]
	for(var i=0;i<hd.length;i++){
		var fn=hd[i].fn;
		val=child[fn];
		$("#"+fn).val(val)
	}
	var dt=child.child_dob

	format_day("child_dob","edit",dt)
	$("#child-modal").modal("show")
	adata.rq="edit-child"
	adata.id=child.id;


}
function load_children(rst) {
	var children=rst.children;
	adata.children=children;
	adata.no_children=children.length;
	var hd=[{fn:"child_name", lb:"Name"},{fn:"child_dob",lb:"Date of birth"},{lb:"",ft:"options"}]
	
	if(adata.me.priv=="hr"||(adata.me.priv=="staff"&&(adata.status=="Not Submitted"||(adata.status=="Declined by HOD"||adata.status=="Declined by Director"||adata.status=="Declined by Principal"||adata.status=="Declined by Dean")))){
		//options column stays intact
	var options=[{method:"edit_child",text:"Edit"},{method:"remove_child",text:"Remove"}]
	}
	else{
		hd.pop()
	}
	gen_table(hd,children,"children-table","No children information added",options)
}

//CONSULTANCY WORKS DONE
function consults_div() {
		$(".ch-div").hide();//child div
		$("#profile-div").show();
		$(".profile-menu").removeClass("active")
		$('#a-consults').addClass("active")
		$(".ch-div-1").hide()
		$("#consults-div").show()
		get_consults()
}
function get_consults() {
	var data={rq:"get-consults",pid:adata.pid,url:adata.url}
	ajax_go(data,function (rst) {
		load_consults(rst)
	})
}
function consult_dl() {
	$("#consult-modal").modal("show")
	adata.rq="add-consult"
	clear_fields()
}
function add_consult() {
	var cons_started=format_day("cons_started")
	var cons_ended=format_day("cons_ended")
	var hd=[{lb:"Institution",fn:"cons_inst"},{lb:"Area of consultancy",fn:"cons_area"},{lb:"Started",fn:"cons_started",vl:cons_started,ft:"date"},{lb:"Ended",fn:"cons_ended",vl:cons_ended,ft:"date"},{lb:"Details",fn:"cons_details"}]
	var vr=check_empty(hd); if(!vr){return 0}
	var data=prep_data(hd)
	data.rq=adata.rq;
	data.url=adata.url;
	data.pid=adata.pid
	data.id=adata.id
	ajax_go(data,function (rst) {
		load_consults(rst)
		$("#consult-modal").modal("hide")
	})
}
function remove_consult(index) {
	var id=adata.consults[index].id;
	var data={id:id}
	data.rq="remove-consult";
	data.url=adata.url;
	data.pid=adata.pid
	ajax_go(data,function (rst) {
		load_consults(rst)
	})
}
function edit_consult(index) {
	var consult=adata.consults[index]
	var hd=[{fn:"cons_inst",lb:"Institution"},{fn:"cons_area",lb:"Area"},{fn:"cons_details",lb:"Details"}]
	for(var i=0;i<hd.length;i++){
		var fn=hd[i].fn;
		val=consult[fn];
		$("#"+fn).val(val)

	}
	var dt=consult.cons_started
	format_day("cons_started","edit",dt)
	var dt=consult.cons_ended
	format_day("cons_ended","edit",dt)
	$("#consult-modal").modal("show")
	adata.rq="edit-consult"
	adata.id=consult.id;


}
function load_consults(rst) {
	var consults=rst.consults;
	adata.consults=consults;
	var hd=[{fn:"cons_inst",lb:"Institution"},{fn:"cons_area",lb:"Area"},{fn:"cons_started",lb:"Started"},{fn:"cons_ended",lb:"Ended"},{fn:"cons_details",lb:"Details"},{ft:"options",lb:""}]
	
	if(adata.me.priv=="hr"||(adata.me.priv=="staff"&&(adata.status=="Not Submitted"||(adata.status=="Declined by HOD"||adata.status=="Declined by Director"||adata.status=="Declined by Principal"||adata.status=="Declined by Dean")))){
		//options column stays intact
	var options=[{method:"edit_consult",text:"Edit"},{method:"remove_consult",text:"Remove"}]
	}
	else{
		hd.pop()
	}
	gen_table(hd,consults,"consults-table","No consultancy added",options)
}

//COURSES TAUGHT
function courses_div() {
		$(".ch-div").hide();//child div
		$("#profile-div").show();
		$(".profile-menu").removeClass("active")
		$('#a-courses').addClass("active")
		$(".ch-div-1").hide()
		$("#courses-div").show()
		get_courses()
}
function get_courses() {
	var data={rq:"get-courses",pid:adata.pid,url:adata.url}
	ajax_go(data,function (rst) {
		load_courses(rst)
	})
}
function course_dl() {
	$("#course-modal").modal("show")
	adata.rq="add-course"
	clear_fields()
}
function add_course() {
	var hd=[{fn:"course",lb:"Course"}]
	var vr=check_empty(hd); if(!vr){return 0}
	var data=prep_data(hd)
	data.rq=adata.rq;
	data.url=adata.url;
	data.pid=adata.pid
	data.id=adata.id
	ajax_go(data,function (rst) {
		load_courses(rst)
		$("#course-modal").modal("hide")
	})
}
function remove_course(index) {
	var id=adata.courses[index].id;

	var data={id:id}
	data.rq="remove-course";
	data.url=adata.url;
	data.pid=adata.pid
	ajax_go(data,function (rst) {
		load_courses(rst)
	})
}
function edit_course(index) {
	var course=adata.courses[index]

	var hd=[{fn:"course"}]
	for(var i=0;i<hd.length;i++){
		var fn=hd[i].fn;
		val=course[fn];
		$("#"+fn).val(val)
	}
	adata.rq="edit-course"
	adata.id=course.id;
	$("#course-modal").modal("show")
}
function load_courses(rst) {
	var courses=rst.courses;
	adata.courses=courses;
	var hd=[{ft:"serial",lb:"#"},{fn:"course",lb:"Course"},{ft:"options",lb:""}]
	
	if(adata.me.priv=="hr"||(adata.me.priv=="staff"&&(adata.status=="Not Submitted"||(adata.status=="Declined by HOD"||adata.status=="Declined by Director"||adata.status=="Declined by Principal"||adata.status=="Declined by Dean")))){
		//options column stays intact
	var options=[{method:"edit_course",text:"Edit"},{method:"remove_course",text:"Remove"}]
	}
	else{
		hd.pop()
	}
	gen_table(hd,courses,"courses-table","No course information added",options)
}
//PUBLICATIONS

function pubs_div() {
		$(".ch-div").hide();//child div
		$("#profile-div").show();
		$(".profile-menu").removeClass("active")
		$('#a-pubs').addClass("active")
		$(".ch-div-1").hide()
		$("#pubs-div").show()
		get_pubs()
}
function get_pubs() {
	var data={rq:"get-pubs",pid:adata.pid,url:adata.url}
	ajax_go(data,function (rst) {
		load_pubs(rst)
	})
}
function pub_dl() {
	$("#pub-modal").modal("show")
	adata.rq="add-pub"
	clear_fields()
	pub_type_disp(0)
}
function pub_type_changed(){
	var type=$("#pub_type").val()
	pub_type_disp(type)
}

function pub_type_disp(type) {
	$("#pub_text").text("Publisher")
	$("#pub_url_text").text("URL")
	adata.pub_text="Publisher"
	adata.pub_url_text="URL"
	adata.publisher_op=0
	$(".pub_field").hide()

	if(type=="Book"){
		$(".pub_edition,.publisher").css("display","flex")

	}
	if(type=="Book Chapter"){
		$(".pub_edition,.publisher,.pub_chapter_title").css("display","flex")

	}
	if(type=="eBook"){
		$(".pub_url,.pub_edition,.pub_website,.publisher").css("display","flex")
	}
	if(type=="Journal"){
		$("#pub_url_text").text("DOI")
		adata.pub_url_text="DOI"
		$(".pub_edition,.pub_vol,.pub_url,.pub_issue,.publisher").css("display","flex")
		$("#pub_text").text("Journal Name")
		adata.pub_text="Journal Name"
		
	}
	if(type=="Unpublished Paper"){
			adata.publisher_op=0
				$(".pub_url,.pub_website").css("display","flex")
	}
}
function add_pub() {
	var hd=[{fn:"pub_type",lb:"Type",no:0},{fn:"pub_title",lb:"Title",no:1},{fn:"pub_year",lb:"Year",no:2},

					{fn:"pub_publisher",lb:adata.pub_text,no:3,op:1},{fn:"pub_edition",lb:"Edition",op:1,no:4},{fn:"pub_authors",lb:"Author(s)",no:5},{fn:"pub_date",lb:"Date",op:1,ft:"date",no:6},
					{fn:"pub_website",lb:"Website",op:1,no:7},{fn:"pub_url",lb:adata.pub_url_text,op:1,no:8},{fn:"pub_vol",lb:"Vol.",op:1,no:9},
					{fn:"pub_issue",lb:"Issue",op:1,no:10},{fn:"pub_chapter_title",lb:"Chapter Title",op:1,no:11}
					]
	var type=$("#pub_type").val()
	//edition-4;author-5;date-6;website-7;url-8;vol-9;issue-10
	if(type=="Book")
	{
		hd[4].op=0;	hd[3].op=0
	}
	if(type=="Book Chapter")
	{
		hd[4].op=0;	hd[3].op=0;hd[11].op=0
	}
	if(type=="Journal"){
		hd[9].op=0;hd[10].op=0;hd[3].op=0
	}
	if(type=="eBook"){
			hd[7].op=0;hd[8].op=0;hd[3].op=0
			hd[4].op=0;
	}
	if(type=="Unpublished Paper"){
			
	}
	//
	var vr=check_empty(hd); if(!vr){return 0}
	var data=prep_data(hd)
	data.rq=adata.rq;
	data.url=adata.url;
	data.pid=adata.pid
	data.id=adata.id
	ajax_go(data,function (rst) {
		load_pubs(rst)
		$("#pub-modal").modal("hide")
	})
}
function remove_pub(index) {
	var id=adata.pubs[index].id;
	var data={id:id}
	data.rq="remove-pub";
	data.url=adata.url;
	data.pid=adata.pid
	ajax_go(data,function (rst) {
		load_pubs(rst)
	})
}
function edit_pub(index) {
	var pub=adata.pubs[index]
	var hd=[{fn:"pub_type"},{fn:"pub_title"},{fn:"pub_chapter_title"},{fn:"pub_year"},{fn:"pub_date"},{fn:"pub_url"},{fn:"pub_publisher"},{fn:"pub_authors"},{fn:"pub_vol"},{fn:"pub_edition"},{fn:"pub_issue"},{fn:"pub_title"},{fn:"pub_year"},{fn:"pub_date"},{fn:"pub_url"},{fn:"pub_publisher"},{fn:"pub_authors"},{fn:"pub_vol"},{fn:"pub_edition"},{fn:"pub_issue"}]
	for(var i=0;i<hd.length;i++){
		var fn=hd[i].fn;
		val=pub[fn];
		$("#"+fn).val(val)
	}
	adata.rq="edit-pub"
	adata.id=pub.id;
	$("#pub-modal").modal("show")
	pub_type_disp(pub.pub_type)
}
function view_pub_details(index) {
	var pub1=adata.pubs[index]
	var type=pub1.pub_type;
	pub=[pub1]
	/*var hd=[{fn:"pub_type",lb:"Type"},{fn:"pub_title",lb:"Title"},{fn:"pub_year",lb:"Year"},

					{fn:"pub_publisher",lb:adata.pub_text},{fn:"pub_edition",lb:"Edition",op:1},{fn:"pub_authors",lb:"Author"},{fn:"pub_date",lb:"Date",op:1},
					{fn:"pub_website",lb:"Website",op:1},{fn:"pub_url",lb:adata.pub_url_text,op:1},{fn:"pub_vol",lb:"Vol.",op:1},
					{fn:"pub_issue",lb:"Issue",op:1}
	]*/

	if(type=="Book")
	{
		var hd=[{fn:"pub_type",lb:"Type"},{fn:"pub_title",lb:"Title"},{fn:"pub_year",lb:"Year"},

					{fn:"pub_publisher",lb:"Publisher"},{fn:"pub_edition",lb:"Edition"},{fn:"pub_authors",lb:"Author(s)"}
					]
	}
	if(type=="Book Chapter")
	{
		var hd=[{fn:"pub_type",lb:"Type"},{fn:"pub_title",lb:"Title"},{fn:"pub_chapter_title",lb:"Chapter Title"},{fn:"pub_year",lb:"Year"},

					{fn:"pub_publisher",lb:"Publisher"},{fn:"pub_edition",lb:"Edition"},{fn:"pub_authors",lb:"Author(s)"}
					]
	}
	if(type=="Journal"){
		var hd=[{fn:"pub_type",lb:"Type"},{fn:"pub_title",lb:"Title"},{fn:"pub_year",lb:"Year"},
						{fn:"pub_publisher",lb:"Journal Name"},{fn:"pub_authors",lb:"Author(s)"},
						{fn:"pub_website",lb:"Website"},{fn:"pub_url",lb:"DOI"},{fn:"pub_vol",lb:"Vol."},
						{fn:"pub_issue",lb:"Issue"}
					]
	}
	if(type=="eBook"){
		var hd=[{fn:"pub_type",lb:"Type"},{fn:"pub_title",lb:"Title"},{fn:"pub_year",lb:"Year"},
					{fn:"pub_publisher",lb:"Publisher"},{fn:"pub_edition",lb:"Edition"},{fn:"pub_authors",lb:"Author(s)"},
					{fn:"pub_website",lb:"Website"},{fn:"pub_url",lb:"URL"}]
	}

	if(type=="Unpublished Paper"){
	
		var hd=[{fn:"pub_type",lb:"Type"},{fn:"pub_title",lb:"Title"},{fn:"pub_year",lb:"Year"},{fn:"pub_authors",lb:"Author (s)"},
					{fn:"pub_website",lb:"Website"},{fn:"pub_url",lb:"DOI/URL"}]
	}

	gen_table_mobile(hd,pub,"pub-details-table",{clms:1})
	$("#pub-details-modal").modal("show")

}
function load_pubs(rst) {
	var pubs=rst.pubs;
	adata.pubs=pubs;
	var hd=[{ft:"serial",lb:"#"},{fn:"pub_type",lb:"Publication type"},{fn:"pub_year",lb:"Year"},{fn:"pub_title",lb:"Title"},{ft:"options",lb:""}]
	
	if(adata.me.priv=="hr"||(adata.me.priv=="staff"&&(adata.status=="Not Submitted"||(adata.status=="Declined by HOD"||adata.status=="Declined by Director"||adata.status=="Declined by Principal"||adata.status=="Declined by Dean")))){
		//options column stays intact
		var options=[{method:"view_pub_details",text:"Details"},{method:"edit_pub",text:"Edit"},{method:"remove_pub",text:"Remove"}]
	}
	else{
		hd.pop()
	}
	gen_table(hd,pubs,"pubs-table","No pub information added",options)
}

//FIELD OF SPECIALIZATION
function specs_div() {
  $(".ch-div").hide();//child div
  $("#profile-div").show();
  $(".profile-menu").removeClass("active")
  $('#a-specs').addClass("active")
  $(".ch-div-1").hide()
  $("#specs-div").show()
  get_specs()
}
function get_specs() {
    var data={rq:"get-specs",pid:adata.pid,url:adata.url}
    ajax_go(data,function (rst) {
        load_specs(rst)
    })
}
function spec_dl() {
    $("#spec-modal").modal("show")
    adata.rq="add-spec"
    clear_fields()
}
function add_spec() {
    var hd=[{fn:"spec_level",lb:"Level"},{fn:"spec_major",lb:"Major"},{fn:"spec_minor",lb:"Minor"},{fn:"spec_thesis",lb:"Thesis"}]

    var vr=check_empty(hd); if(!vr){return 0}
    var data=prep_data(hd)
    data.rq=adata.rq;
    data.url=adata.url;
    data.pid=adata.pid
    data.id=adata.id
    ajax_go(data,function (rst) {
        load_specs(rst)
        $("#spec-modal").modal("hide")
    })
}
function remove_spec(index) {
    var id=adata.specs[index].id;

    var data={id:id}
    data.rq="remove-spec";
    data.url=adata.url;
    data.pid=adata.pid
    ajax_go(data,function (rst) {
        load_specs(rst)
    })
}
function edit_spec(index) {
    var spec=adata.specs[index]
    var hd=[{fn:"spec_level"},{fn:"spec_major"},{fn:"spec_minor"},{fn:"spec_thesis"}]
    for(var i=0;i<hd.length;i++){
        var fn=hd[i].fn;
        val=spec[fn];
        $("#"+fn).val(val)
    }
    adata.rq="edit-spec"
    adata.id=spec.id;
    $("#spec-modal").modal("show")
}
function load_specs(rst) {
    var specs=rst.specs;
    adata.specs=specs;
     var hd=[{fn:"spec_level",lb:"Level"},{fn:"spec_major",lb:"Major"},{fn:"spec_minor",lb:"Minor"},{fn:"spec_thesis",lb:"Thesis"},{ft:"options",lb:""}]
   
    if(adata.me.priv=="hr"||(adata.me.priv=="staff"&&(adata.status=="Not Submitted"||(adata.status=="Declined by HOD"||adata.status=="Declined by Director"||adata.status=="Declined by Principal"||adata.status=="Declined by Dean")))){
		//options column stays intact
		 var options=[{method:"edit_spec",text:"Edit"},{method:"remove_spec",text:"Remove"}]
		}
		else{
			hd.pop()
		}
    gen_table(hd,specs,"specs-table","No information added",options)
}
//SALARY REVISION

function sal_rev_div() {
	$(".ch-div").hide();//child div
	$("#profile-div").show();
	$(".profile-menu").removeClass("active")
	$('#a-sal-revs').addClass("active")
	$(".ch-div-1").hide()
	$("#sal-revs-div").show()
	get_sal_revs()
}
function get_sal_revs() {

	var data={url:adata.url,rq:"get-sal-revs",pid:adata.pid}
	ajax_go(data,function (rst) {
			load_sal_revs(rst)
	})
}
function load_sal_revs(rst) {
	var sal_revs=rst.sal_revs;
	adata.sal_revs=sal_revs;
	var hd=[{lb:"From",fn:"sfrom"},{lb:"To",fn:"sto"},{lb:"Revised on",fn:"revised_on"},{lb:"",ft:"options"}]
	var sal_revs=rst.sal_revs
	if(adata.me.priv=="hr"||(adata.me.priv=="staff"&&(adata.status=="Not Submitted"||(adata.status=="Declined by HOD"||adata.status=="Declined by Director"||adata.status=="Declined by Principal"||adata.status=="Declined by Dean")))){
		//options column stays intact
		var options=[{method:"edit_sal_rev",text:"Edit"},{method:"remove_sal_rev",text:"Remove"}]
	}
	else{
		hd.pop()
	}
	gen_table(hd,sal_revs,"sal-revs-table","No salary revision added",options)
	
}
function sal_rev_dl() {
	$("#sal-rev-modal").modal("show")
	clear_fields()
	adata.rq="add-sal-rev"
}

function add_sal_rev() {
	var revised_on=format_day("sal_rev")
	var flds=[{lb:"From",fn:"sal_rev_from",rfn:"sfrom"},{lb:"To",fn:"sal_rev_to",rfn:"sto"},{lb:"Revised on",fn:"revised_on",vl:revised_on,ft:"date"}]
	var data=prep_data(flds); if(!data){return 0}
	data.url=adata.url;
	data.rq=adata.rq;
	data.id=adata.id;
	data.pid=adata.pid;
	ajax_go(data,function (rst) {
			load_sal_revs(rst)
			$("#sal-rev-modal").modal("hide")
	})
}
function edit_sal_rev(index) {
	clear_fields()
	var sal_rev=adata.sal_revs[index]
	var flds=[{fn:"sfrom",ft:"date"},{fn:"revised_on",ft:"date"}]
	$("#sal_rev_from").val(sal_rev.sfrom);	$("#sal_rev_to").val(sal_rev.sto);
	format_day("sal_rev","edit",sal_rev.revised_on)
	adata.rq="edit-sal-rev"
	adata.id=sal_rev.id;
	$("#sal-rev-modal").modal("show")
}
function remove_sal_rev(index) {
	var data={}
	data.url=adata.url;
	data.rq="remove-sal-rev"
	data.id=adata.sal_revs[index].id
	data.pid=adata.pid
	ajax_go(data,function (rst) {
			load_sal_revs(rst)
			$("#sal-rev-modal").modal("hide")
	})
}

//SCHOOL SERVICE DATES
function ss_date_div() {

	$(".ch-div").hide();//child div
	$("#profile-div").show();
	$(".profile-menu").removeClass("active")
	$('#a-ss-date').addClass("active")
	$(".ch-div-1").hide()

	$("#ss-date-div").show();
	var data={rq:"get-ss-date",url:adata.url}
	data.pid=adata.pid;
	ajax_go(data,function (rst) {
			load_ss_date(rst)
	})

}
function load_ss_date(rst) {
	var ss_date=rst.ss_date;
	adata.ss_date=ss_date

	if(ss_date.length){
		$("#ss-date").text(ss_date[0].day)
		$("#ss-date-div-1").show()
		$("#add-ss-date-btn").hide()
		$("#no-ss-date").hide()
	}
	else{
		$("#ss-date-div-1").hide()
		$("#add-ss-date-btn").show()
		$("#no-ss-date").show()
	}
	if(adata.me.priv=="hr"||(adata.me.priv=="staff"&&(adata.status=="Not Submitted"||(adata.status=="Declined by HOD"||adata.status=="Declined by Director"||adata.status=="Declined by Principal"||adata.status=="Declined by Dean")))){
		if(!ss_date.length)
			$("#add-ss-date-btn").show()

	}
	else{
		$("#add-ss-date-btn,#edit-ss-date-td,#remove-ss-date-td").hide()
	}

}
function add_ss_date_dl() {
	$("#ss-date-modal").modal("show")
	clear_fields()
	adata.rq="add-ss-date"
}

function add_ss_date() {
	var ss_date=format_day("ss")
	var flds=[{lb:"School service date",rfn:"day",vl:ss_date,ft:"date"}]
	var data=prep_data(flds); if(!data){return 0}
	data.url=adata.url;
	data.rq=adata.rq;
	data.id=adata.id;
	data.pid=adata.pid;
	ajax_go(data,function (rst) {
			load_ss_date(rst)
			$("#ss-date-modal").modal("hide")
	})
}
function edit_ss_date(index) {
	clear_fields()
	var ss_date=adata.ss_date[index]
	format_day("ss","edit",ss_date.day)
	adata.rq="edit-ss-date"
	adata.id=ss_date.id;
	$("#ss-date-modal").modal("show")
}
function remove_ss_date(index) {
	var data={}
	data.url=adata.url;
	data.rq="remove-ss-date"
	var ss_date=adata.ss_date[index]
	data.id=ss_date.id
	data.pid=adata.pid
	ajax_go(data,function (rst) {
			load_ss_date(rst)
			//$("#promotion-modal").modal("hide")
	})
}



//PROMOTIONS

function promotions_div() {
	$(".ch-div").hide();//child div
	$("#profile-div").show();
	$(".profile-menu").removeClass("active")
	$('#a-promotions').addClass("active")
	$(".ch-div-1").hide()
	$("#promotions-div").show()
	get_promotions()
}
function get_promotions() {

	var data={url:adata.url,rq:"get-promotions",pid:adata.pid}
	ajax_go(data,function (rst) {
			load_promotions(rst)
	})
}
function load_promotions(rst) {
	var promotions=rst.promotions;
	adata.promotions=promotions;
	var hd=[{lb:"From",fn:"pfrom"},{lb:"To",fn:"pto"},{lb:"Effected on",fn:"promoted_on"},{lb:"",ft:"options"}]
	var promotions=rst.promotions
	var options=[{method:"edit_promotion",text:"Edit"},{method:"remove_promotion",text:"Remove"}]
	if(adata.me.priv=="hr"||(adata.me.priv=="staff"&&(adata.status=="Not Submitted"||(adata.status=="Declined by HOD"||adata.status=="Declined by Director"||adata.status=="Declined by Principal"||adata.status=="Declined by Dean")))){
		//options column stays intact
	
	}
	else{
		hd.pop()
		options=0
	}
	gen_table(hd,promotions,"promotions-table","No promotion informaiton added",options)
	
}
function promotion_dl() {
	$("#promotion-modal").modal("show")
	clear_fields()
	adata.rq="add-promotion"
}

function add_promotion() {
	var promoted_on=format_day("promotion")
	var flds=[{lb:"From",fn:"promotion_from",rfn:"pfrom"},{lb:"To",fn:"promotion_to",rfn:"pto"},{lb:"Promoted on",fn:"promoted_on",vl:promoted_on,ft:"date"}]
	var data=prep_data(flds); if(!data){return 0}
	data.url=adata.url;
	data.rq=adata.rq;
	data.id=adata.id;
	data.pid=adata.pid;
	ajax_go(data,function (rst) {
			load_promotions(rst)
			$("#promotion-modal").modal("hide")
	})
}
function edit_promotion(index) {
	clear_fields()
	var promotion=adata.promotions[index]
	var flds=[{fn:"pfrom",ft:"date"},{fn:"promoted_on",ft:"date"}]
	$("#promotion_from").val(promotion.pfrom);	$("#promotion_to").val(promotion.pto);
	format_day("promotion","edit",promotion.promoted_on)
	adata.rq="edit-promotion"
	adata.id=promotion.id;
	$("#promotion-modal").modal("show")
}
function remove_promotion(index) {
	var data={}
	data.url=adata.url;
	data.rq="remove-promotion"
	data.id=adata.promotions[index].id
	data.pid=adata.pid
	ajax_go(data,function (rst) {
			load_promotions(rst)
			$("#promotion-modal").modal("hide")
	})
}


//transferS

function transfers_div() {
	$(".ch-div").hide();//child div
	$("#profile-div").show();
	$(".profile-menu").removeClass("active")
	$('#a-transfers').addClass("active")
	$(".ch-div-1").hide()
	$("#transfers-div").show()
	get_transfers()
}
function get_transfers() {

	var data={url:adata.url,rq:"get-transfers",pid:adata.pid}
	ajax_go(data,function (rst) {
			load_transfers(rst)
	})
}
function load_transfers(rst) {
	var transfers=rst.transfers;
	adata.transfers=transfers;
	var hd=[{lb:"From",fn:"tfrom"},{lb:"To",fn:"tto"},{lb:"Effected on",fn:"transfered_on"},{lb:"",ft:"options"}]
	var transfers=rst.transfers
	var options=[{method:"edit_transfer",text:"Edit"},{method:"remove_transfer",text:"Remove"}]
	if(adata.me.priv=="hr"||(adata.me.priv=="staff"&&(adata.status=="Not Submitted"||(adata.status=="Declined by HOD"||adata.status=="Declined by Director"||adata.status=="Declined by Principal"||adata.status=="Declined by Dean")))){
		//options column stays intact
	
	}
	else{
		hd.pop()
		options=0
	}
	gen_table(hd,transfers,"transfers-table","No transfer information added",options)
	
}
function transfer_dl() {
	$("#transfer-modal").modal("show")
	clear_fields()
	adata.rq="add-transfer"
}

function add_transfer() {
	var transfered_on=format_day("transfer")
	var flds=[{lb:"From",fn:"transfer_from",rfn:"tfrom"},{lb:"To",fn:"transfer_to",rfn:"tto"},{lb:"Promoted on",fn:"transfered_on",vl:transfered_on,ft:"date"}]
	var data=prep_data(flds); if(!data){return 0}
	data.url=adata.url;
	data.rq=adata.rq;
	data.id=adata.id;
	data.pid=adata.pid;
	ajax_go(data,function (rst) {
			load_transfers(rst)
			$("#transfer-modal").modal("hide")
	})
}
function edit_transfer(index) {
	clear_fields()
	var transfer=adata.transfers[index]
	var flds=[{fn:"tfrom",ft:"date"},{fn:"transfered_on",ft:"date"}]
	$("#transfer_from").val(transfer.tfrom);	$("#transfer_to").val(transfer.tto);
	format_day("transfer","edit",transfer.transfered_on)
	adata.rq="edit-transfer"
	adata.id=transfer.id;
	$("#transfer-modal").modal("show")
}
function remove_transfer(index) {
	var data={}
	data.url=adata.url;
	data.rq="remove-transfer"
	data.id=adata.transfers[index].id
	data.pid=adata.pid
	ajax_go(data,function (rst) {
			load_transfers(rst)
			$("#transfer-modal").modal("hide")
	})
}
//SALARY GRADES

function grades_div() {
	
	get_grades()
}
function get_grades() {
	var data={url:adata.url,rq:"get-grades",pid:adata.pid}
	ajax_go(data,function (rst) {
			$(".ch-div").hide();//child div
			$("#profile-div").show();
			$(".profile-menu").removeClass("active")
			$('#a-grades').addClass("active")
			$(".ch-div-1").hide()
			$("#grades-div").show()
			load_grades(rst)
	})
}
function load_grades(rst) {
	var grades=rst.grades;
	adata.grades=grades;
	var hd=[{lb:"Grade",fn:"grade"},{lb:"",ft:"options"}]
	var grades=rst.grades
	var options=[{method:"edit_grade",text:"Edit"},{method:"remove_grade",text:"Remove"}]
	if(adata.me.priv=="hr"||(adata.me.priv=="staff"&&(adata.status=="Not Submitted"||(adata.status=="Declined by HOD"||adata.status=="Declined by Director"||adata.status=="Declined by Principal"||adata.status=="Declined by Dean")))){
		//options column stays intact
	
	}
	else{
		hd.pop()
		options=0
	}
	gen_table(hd,grades,"grades-table","No grade information added",options)
	
}
function grade_dl() {
	$("#grade-modal").modal("show")
	clear_fields()
	adata.rq="add-grade"
}

function add_grade() {
	var gradeed_on=format_day("grade")
	var flds=[{lb:"Grade",fn:"grade"}]
	var data=prep_data(flds); if(!data){return 0}
	data.url=adata.url;
	data.rq=adata.rq;
	data.id=adata.id;
	data.pid=adata.pid;
	ajax_go(data,function (rst) {
			load_grades(rst)
			$("#grade-modal").modal("hide")
	})
}
function edit_grade(index) {
	clear_fields();
	var grade=adata.grades[index]
	var flds=[{fn:"grade"}]
	$("#grade").val(grade.grade);
	adata.rq="edit-grade"
	adata.id=grade.id;
	$("#grade-modal").modal("show")
}
function remove_grade(index) {
	var data={}
	data.url=adata.url;
	data.rq="remove-grade"
	data.id=adata.grades[index].id
	data.pid=adata.pid
	ajax_go(data,function (rst) {
			load_grades(rst)
			$("#grade-modal").modal("hide")
	})
}

//NEXT OF KIN
function noks_div() {
	get_noks()
}
function get_noks() {

	var data={url:adata.url,rq:"get-noks",pid:adata.pid}
	ajax_go(data,function (rst) {
			load_noks(rst)
			$(".ch-div").hide();//child div
			$("#profile-div").show();
			$(".profile-menu").removeClass("active")
			$('#a-nok').addClass("active")
			$(".ch-div-1").hide()
			$("#noks-div").show()
	})
}
function load_noks(rst) {
	var noks=rst.noks;
	adata.noks=noks;
	var hd=[{lb:"Name",fn:"nok_name"},{lb:"Relationship",fn:"nok_rel"},{lb:"Address",fn:"nok_address"},{lb:"Phone",fn:"nok_phone"},{lb:"",ft:"options"}]
	var noks=rst.noks
	var options=[{method:"edit_nok",text:"Edit"},{method:"remove_nok",text:"Remove"}]
	if(adata.me.priv=="hr"||(adata.me.priv=="staff"&&(adata.status=="Not Submitted"||(adata.status=="Declined by HOD"||adata.status=="Declined by Director"||adata.status=="Declined by Principal"||adata.status=="Declined by Dean"))))
		;
	else{
		hd.pop()
	}
	gen_table(hd,noks,"noks-table","No next of kin added",options)
	
}
function nok_dl() {
	$("#nok-modal").modal("show")
	clear_fields()
	adata.rq="add-nok"
}

function add_nok() {
	var flds=[{lb:"Name",fn:"nok_name"},{lb:"Relationship",fn:"nok_rel"},{lb:"Address",fn:"nok_address"},{lb:"Phone",fn:"nok_phone",ft:"phone"}]
	var data=prep_data(flds); if(!data){return 0}
	data.url=adata.url;
	data.rq=adata.rq;
	data.id=adata.id;
	data.pid=adata.pid;
	ajax_go(data,function (rst) {
			load_noks(rst)
			$("#nok-modal").modal("hide")
	})
}
function edit_nok(index) {
	clear_fields()
	var nok=adata.noks[index]

	//var flds=[{fn:"nok_name"},{fn:"nok_rel"},{fn:"nok_address"},{fn:"nok_phone"}]
	$("#nok_name").val(nok.nok_name);	$("#nok_rel").val(nok.nok_rel);$("#nok_address").val(nok.nok_address);$("#nok_phone").val(nok.nok_phone);
	adata.rq="edit-nok"
	adata.id=nok.id;
	$("#nok-modal").modal("show")
}
function remove_nok(index) {
	var data={}
	data.url=adata.url;
	data.rq="remove-nok"
	data.id=adata.noks[index].id
	data.pid=adata.pid
	ajax_go(data,function (rst) {
			load_noks(rst)
			$("#nok-modal").modal("hide")
	})
}

//staff banks

function staff_banks_div() {
	get_staff_banks()
}
function get_staff_banks() {
	var data={url:adata.url,rq:"get-staff_banks",userid:adata.userid}
	ajax_go(data,function (rst) {
			$(".ch-div").hide();//child div
			$("#profile-div").show();
			$(".profile-menu").removeClass("active")
			$('#a-staff_banks').addClass("active")
			$(".ch-div-1").hide()
			$("#staff_banks-div").show()
			load_staff_banks(rst)
	})
}
function load_staff_banks(rst) {
	var staff_banks=rst.staff_banks;
	adata.staff_banks=staff_banks;

	var hd=[{lb:"Bank",fn:"bank"},{lb:"Account No",fn:"account_no"}]
	if((adata.me.priv=="staff"&&(adata.status=="Not Submitted"||(adata.status=="Declined by HOD"||adata.status=="Declined by Director"||adata.status=="Declined by Principal"||adata.status=="Declined by Dean")))||adata.priv=="hr"){
		hd[hd.length]={lb:"",ft:"options"}
	}
	else{

	}
	var staff_banks=rst.staff_banks
	var options=[{method:"remove_staff_bank",text:"Remove"}]
	gen_table(hd,staff_banks,"staff_banks-table","No bank information added",options)
}
function staff_bank_dl() {
	$("#staff_bank-modal").modal("show")
	clear_fields()
	adata.rq="add-staff_bank"
}

function add_staff_bank() {

	var flds=[{lb:"Bank",ft:"sel",fn:"staff_bankid",rfn:"bankid"},{lb:"Account No.",fn:"account_no"}]
	var data=prep_data(flds); if(!data){return 0}
	data.url=adata.url;
	data.rq=adata.rq;
	data.id=adata.id;
	data.userid=adata.userid;

	ajax_go(data,function (rst) {
			load_staff_banks(rst)
			$("#staff_bank-modal").modal("hide")
	})
}

function remove_staff_bank(index) {
	var data={}
	data.url=adata.url;
	data.rq="remove-staff_bank"
	data.id=adata.staff_banks[index].id
	data.userid=adata.userid
	ajax_go(data,function (rst) {
			load_staff_banks(rst)
			$("#staff_bank-modal").modal("hide")
	})
}


//FIRST APPOINTMENT

function fapp_div() {
	get_fapp()
}
function get_fapp() {
	var data={url:adata.url,rq:"get-fapp",pid:adata.pid,userid:adata.userid}
	ajax_go(data,function (rst) {
			load_fapp(rst)
			$(".ch-div").hide();//child div
			$("#profile-div").show();
			$(".profile-menu").removeClass("active")
			$('#a-fapp').addClass("active")
			$(".ch-div-1").hide()
			$("#fapp-div").show()
	})
}
function load_fapp(rst) {
	var fapp=rst.fapp;
	for(var i=0;i<fapp.length;i++){
		fapp[i].fsalary=cx(fapp[i].salary)+" "+fapp[i].freq
	}
	if(fapp.length)
		$("#fapp-btn").hide()
	else
			$("#fapp-btn").show()
	adata.fapp=fapp;

	var hd=[{lb:"Position",fn:"position"},{lb:"Department",fn:"department"},{lb:"Salary",fn:"fsalary"},{lb:"Appointment Date",fn:"appointment_date"},{lb:"Date of Joining",fn:"date_of_joining"},{lb:"",ft:"options"}]
	var fapp=rst.fapp
	var options=[{method:"edit_fapp",text:"Edit"},{method:"remove_fapp",text:"Remove"}]
	if(adata.me.priv=="hr"||(adata.me.priv=="staff"&&(adata.status=="Not Submitted"||(adata.status=="Declined by HOD"||adata.status=="Declined by Director"||adata.status=="Declined by Principal"||adata.status=="Declined by Dean") )))
		;
	else{
		hd.pop()
	}
	gen_table(hd,fapp,"fapp-table","No first appointment information added",options)
	
}
function fapp_dl() {
	$("#fapp-modal").modal("show")
	clear_fields()
	adata.rq="add-fapp"
}

function add_fapp() {
	var joining_date=format_day('fapp_join')
	var app_date=format_day('fapp_app')
	var flds=[{lb:"Position",rfn:"position",fn:"fapp-position"},{lb:"Department",rfn:"department",fn:"fapp-dept"},{lb:"Salary",rfn:"salary",fn:"fapp-salary"},{lb:"Salary Frequency ",fn:"freq"},{lb:"Appointment Date",rfn:"appointment_date",vl:app_date,ft:"date"},{lb:"Date of Joining",rfn:"date_of_joining",vl:joining_date,ft:"date"},{lb:"",ft:"options"}]
	var data=prep_data(flds); if(!data){return 0}
	data.url=adata.url;
	data.rq=adata.rq;
	data.id=adata.id;
	data.pid=adata.pid;
	data.userid=adata.userid
	ajax_go(data,function (rst) {
			load_fapp(rst)
			$("#fapp-modal").modal("hide")
	})
}
function edit_fapp(index) {
	clear_fields()
	var fapp=adata.fapp[index]
	
	adata.rq="edit-fapp"
	adata.id=fapp.id;
	$("#fapp-modal").modal("show")

		var flds=[{lb:"Position",rfn:"position",fn:"fapp-position"},{lb:"Department",rfn:"department",fn:"fapp-dept"},{lb:"Salary",rfn:"salary",fn:"fapp-salary",ft:"money"},{rfn:"freq",fn:"freq"},{lb:"Appointment Date",rfn:"appointment_date",ft:"date",fn:"fapp_app"},{lb:"Date of Joining",rfn:"date_of_joining",ft:"date",fn:"fapp_join"}]
		for(var i=0;i<flds.length;i++){
			fn=flds[i].fn;
			rfn=flds[i].rfn;
			var val=fapp[rfn]
			var ft=flds[i].ft;
			if(ft=="money"){
				val=cx(val)
			}
			if(ft=="date"){
				format_day(fn,"edit",val)
			}
			else
				$("#"+fn).val(val)

		}
}
function remove_fapp(index) {
	var data={}
	data.url=adata.url;
	data.rq="remove-fapp"
	data.id=adata.fapp[index].id
	data.pid=adata.pid
	data.userid=adata.userid;
	ajax_go(data,function (rst) {
			load_fapp(rst)
			$("#fapp-modal").modal("hide")
	})
}

//PHONE
function phones_div() {
	get_phones()
}
function get_phones() {

	var data={url:adata.url,rq:"get-phones",pid:adata.pid}
	ajax_go(data,function (rst) {
			load_phones(rst)
			$(".ch-div").hide();//child div
			$("#profile-div").show();
			$(".profile-menu").removeClass("active")
			$('#a-phones').addClass("active")
			$(".ch-div-1").hide()
			$("#phones-div").show()
	})
}
function add_phone() {
	var hd=[{fn:"phone",lb:"Phone",ft:"phone"}]
	var data=prep_data(hd);if(!data){return 0}
	data.pid=adata.pid
	ajax_go(data,function (rst) {
		load_phones(rst)
		$("#.modal").modal("hide")
	})
}
function remove_phone(index) {
	var id=adata.phones[index].id;
	var data=prep_data([]);if(!data){return 0}
	data.rq="remove-phone";
	ajax_go(data,function (rst) {
		load_phones(rst)
	})
}
function edit_phone(index) {
	var phone=adata.phones[index]

	var hd=[{fn:"phone"}]
	for(var i=0;i<hd.length;i++){
		var fn=hd[i].fn;
		val=phone[fn];
		$("#"+fn).val(val)
	}
	adata.rq="edit-phone"
	adata.id=phone.id;
	$("#phone-modal").modal("show")
}
function load_phones(rst) {
	var phones=rst.phones;
	adata.phones=phones;
	var hd=[{ft:"serial",lb:"#"},{fn:"phone",lb:"Phone"},{ft:"options",lb:""}]
	
	if(adata.me.priv=="staff"&&(adata.status=="Not Submitted"||adata.status=="Declined")){
		//options column stays intact
	var options=[{method:"edit_phone",text:"Edit"},{method:"remove_phone",text:"Remove"}]
	}
	else{
		hd.pop()
	}
	gen_table(hd,phones,"phones-table","No phone added",options)
}

function phone_dl() {
	$("#phone-modal").modal("show")
	clear_fields()
	adata.rq="add-phone"
}



//MARITAL
//NEXT OF KIN
function marital_info_div() {
	get_marital_info()
}
function get_marital_info() {

	var data={url:adata.url,rq:"get-marital_info",pid:adata.pid}
	ajax_go(data,function (rst) {
			load_marital_info(rst)
			$(".ch-div").hide();//child div
			$("#profile-div").show();
			$(".profile-menu").removeClass("active")
			$('#a-marital_info').addClass("active")
			$(".ch-div-1").hide()
			$("#marital_infos-div").show()
	})
}
function load_marital_info(rst) {
	var marital_infos=rst.marital_infos;
	adata.marital_infos=marital_infos;
	var hd=[{lb:"Marital Status",fn:"marital_status"},{lb:"Spouse Name",fn:"spouse_name"},{lb:"Email",fn:"spouse_email"},{lb:"Spouse Phone",fn:"spouse_phone"},{lb:"",ft:"options"}]
	var marital_infos=rst.marital_infos
	var options=[{method:"edit_marital_info",text:"Edit"},{method:"remove_marital_info",text:"Remove"}]
	if( adata.me.priv=="staff"&&(adata.status=="Not Submitted"||adata.status=="Declined"))
		;
	else{
		hd.pop()
	}
	gen_table(hd,marital_infos,"marital_infos-table","No marital informatin added",options)
	
}
function marital_info_dl() {
	$("#marital_info-modal").modal("show")
	clear_fields()
	adata.rq="add-marital_info"
}

function add_marital_info() {
	var flds=[{lb:"Marital Status",fn:"marital_status"},{lb:"Name",fn:"spouse_name"},{lb:"Spouse Phone",fn:"spouse_phone"},{lb:"Email",fn:"spouse_email",ft:"email",op:1}]
	var data=prep_data(flds); if(!data){return 0}
	data.url=adata.url;
	data.rq=adata.rq;
	data.id=adata.id;
	data.pid=adata.pid;
	ajax_go(data,function (rst) {
			load_marital_info(rst)
			$("#marital_info-modal").modal("hide")
	})
}
function edit_marital_info(index) {
	clear_fields()
	var marital_info=adata.marital_infos[index]
	var flds=[{fn:"spouse_name"},{fn:"spouse_phone"},{fn:"spouse_email"},{fn:"marital_status"}]
	load_edit_flds(flds,marital_info)
	adata.rq="edit-marital_info"
	adata.id=marital_info.id;
	$("#marital_info-modal").modal("show")
}
function remove_marital_info(index) {
	var data={}
	data.url=adata.url;
	data.rq="remove-marital_info"
	data.id=adata.marital_info[index].id
	data.pid=adata.pid
	ajax_go(data,function (rst) {
			load_marital_info(rst)
			$("#marital_info-modal").modal("hide")
	})
}
