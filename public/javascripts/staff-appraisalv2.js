adata.pg="appraisalv2"
$(function () {
	var pg=$("#page").val()
	if(pg=="print"){
		adata.form_id=$("#form_id").val()
		adata.appraisal_id=$("#appraisal_id").val()
		adata.userid=$("#userid").val()
		adata.rq="get-preview"
		adata.status="Completed"
		adata.me=JSON.parse($("#user").val())
		preview_appraisal()
	}
	else
		get_defaults()
})
function get_defaults() {
	var data=prep_data([])
	data.rq="get-defaults"
	ajax_go(data,function (rst) {
		adata.me=rst.user
		load_appraisals(rst)
		load_select(rst.forms,"id","form_name","#form_id")
		adata.perf_plan=rst.perf_plan
		if(rst.perf_plan.length){
			adata.plan_id=rst.perf_plan[0].id
		}
	show_contract_details()
	})
}
function get_appraisals() {
	var data=prep_data([])
	data.rq="get-appraisals"
	ajax_go(data,function (rst) {
		load_appraisals(rst)
	})
}
function load_appraisals(rst) {
	$(".app-card").hide()
	$("#appraisals-card").show()
	var appraisals=rst.appraisals;
	adata.appraisals=appraisals;
	for(var i=0;i<appraisals.length;i++){
		var msg=appraisals[i].msg;
		var status=appraisals[i].status;
		if(msg&&status=="Not Submitted"){
			appraisals[i].subject=appraisals[i].subject+"<span class='badge bg-danger' style='cursor:pointer' onclick=\"view_msg("+i+")\"><i class='fa fa-info'></i></span>"
		}
		if(status=="Not Submitted"){
			appraisals[i].app_no+="<button class='btn btn-danger btn-sm' onclick=\"remove_appraisal("+i+")\"> <i class='fa fa-trash'></i></button>"
		}

	}
	var hd=[{lb:"Appraisal Purpose",fn:"subject"},{lb:"Appraisal No: ",fn:"app_no"},{lb:"Form Category",fn:"staff_cat"},{lb:"Status",fn:"status"},{lb:"Date",fn:"recorded"},{lb:"",ft:"btn",text:"Go to Appraisal",oc:"goto_form"}]
	gen_table(hd,appraisals,"appraisals-div","No appraisals made")
}

function remove_appraisal(i) {
	var data=prep_data([])
	var appraisal=adata.appraisals[i]
	data.rq="remove-appraisal"
	var cfm=confirm("Are you sure you want to remove this appraisal?")
	if(!cfm){return 0}
	data.appraisal_id=appraisal.id
	ajax_go(data,function (rst) {
		load_appraisals(rst)
		$(".modal").modal("hide")
	})	
}
function view_msg(i) {
	var msg=adata.appraisals[i].msg;
	$("#msg-body").html(msg)
	$("#msg-modal-view").modal("show")
}

function add_appraisal_dl() {
	var ps=check_profile_status_app("the Appraisal module ")
	if(ps!=1)
		return 0

	
	if(adata.perf_plan.length==0){
		//return display_err("Please create a performance plan")
	}
	

	if(adata.me.days_left<=0){
		//return display_err("Your contract shows expired. It's likely not updated on the system, please send your latest contract or confirmation via live chat or hrms@mubs.ac.ug. If you have no current contract, contact live support",10000)
	}
	$("#appraisal-modal").modal("show")
	clear_fields()
	
}
function add_appraisal() {
	var hd=[{lb:"Appraisal Purpose",fn:"subject",ft:"sel"}]
	var data=prep_data(hd)
	if(!data){return 0}
	get_rdept()
	
	data.rq="add-appraisal"
	data.rdept_id=adata.rdept_id
	data.hdept_id=adata.hdept_id
	var subject=$("#subject").val()
	var form_id=$("#form_id").val()
	if((form_id==2||form_id==3)&&!adata.hdept_id&&!adata.me.deputy_dean){
		return display_err("The appraisal category can only be created when you have a headship role")
	}
	data.form_id=form_id

	ajax_go(data,function (rst) {
		//get_section(0)
		load_appraisals(rst)
		$("#appraisal-modal").modal("hide")

	})
}
function submit_appraisal() {
	var data=prep_data([]);
	data.rq="submit-appraisal"
	data.appraisal_id=adata.appraisal_id;
	data.form_id=adata.form_id;
	data.subject=adata.subject
	get_rdept()
	data.rdept_id=adata.rdept_id
	data.hdept_id=adata.hdept_id
	var sd=verify_section_data(); if(!sd){return 0;}
	ajax_go(data,function (rst) {
		load_appraisals(rst)
		display_succ("Appraisal sent sucessfully")
		$("#form-preview-modal").modal("hide")
	})
	
}
function verify_section_data() {
	if(adata.form_id==1){
			var loa=adata.loa;
			if(loa.length==0){
				display_err("Please add an entry in the Section B: Assessement of Level of Achievement")
				return 0
			}
			if(loa.length<5){
				display_err("Please add atleast 5 entries in Section B: Assessement of Level of Achievement")
				return 0
			}
		return 1
	}
	if(adata.form_id==2){
			var dean_targets=adata.dean_targets;
			if(dean_targets.length==0){
				display_err("Please add an entry in the section: Performance Targets and Indicators")
				return 0
			}
			if(dean_targets.length<5){
				display_err("Please add atleast 5 entries in the section: Performance Targets and Indicators")
				return 0
			}
			var fapp=adata.dean_bio.appointment_date;
			if(fapp==null||fapp==""){
				display_err("Please enter first appointment date in section one")
			}
			var duties=adata.dean_bio.duties;
			if(duties==null||duties==""){
				display_err("Please enter the duties in section one")
			}
			var acm=adata.dean_acm.acm;
			if(acm==null||acm==""){
				display_err("Please add the achievements")
			}
			var dean_enhance=adata.dean_enhance;
			if(dean_enhance.strengths==null||dean_enhance.strengths==""){
				display_err("Please fill in all the parts of performance enhancement in section 5")
			}

			var dean_ftargets=adata.dean_ftargets;
			if(dean_ftargets.length==0){
				display_err("Please add an entry in the section: Performance Targets and Indicators for coming year. Section 6")
				return 0
			}
			if(dean_ftargets.length<5){
				display_err("Please add atleast 5 entries in the section: Performance Targets and Indicators for coming year. Section 6")
				return 0
			}
		return 1
	}
	if(adata.form_id==3){
		var issues=[]
		var man_comp=adata.man_comp;
		var k=0
		for(var i=0;i<man_comp.length;i++){
			if(man_comp[i].rating==null||man_comp[i].rating==""){
				issues[k++]={section:"Managerial Competence",item:man_comp[i].competence}
			}
		}
		if(issues.length){
			return display_err("Some parts not filled")
		}
		return 1
	}
}
function complete_appraisal() {
	var data=prep_data([]);
	data.rq="complete-appraisal"
	data.appraisal_id=adata.appraisal_id;
	data.form_id=adata.form_id;
	ajax_go(data,function (rst) {
		display_succ("Appraisal completed sucessfully")
		load_appraisals(rst)
		$("#form-preview-modal").modal("hide")
	})
	
}
function download_appraisal() {
	window.location="/staff?pg=appraisal&rq=download-appraisal&appraisal_id="+adata.appraisal_id
}

function check_profile_status_app(axn) {
	
  if(adata.me.pstatus=="Declined"){

    display_err("Your profile status was declined, so "+axn+" is disabled for you")
    return 0
  }
  else if(adata.me.pstatus=="Not submitted"){
    return display_err("Your profile has not been submitted for approval, so "+axn+" is disabled for you")
    return 0
  }
  else
    return 1;
}

function get_rdept() {
  //no status
  var dp=0
  var subject=$("#form_id").val()
  
  var hodtitle=adata.me.hodtitle
  var hodaccess=adata.me.hodaccess
  var rdept_id=adata.me.contract_dept
  var roles=adata.me.roles;
  var rtitle=hodtitle
  var hdept_id=0
  var role_name=0

  for(var i=0;i<roles.length;i++){
    var role=roles[i].priv;
    if(role=="dean"){
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
    rtitle="Principal"
    var rdept_id=0
  }
  else if(role=="hdm"&&adata.me.contract_dept==hdept_id&&adata.me.cat=="Academic"){
    
    rtitle=phtitle
    
  }
  else if(role=="hdm"&&paccess=="dean"){
    //HOD of an academic dept, but contract elsewhere
    rtitle=phtitle
  }
  else if(role=="hdm"&&subject==3){
    var rdept_id=0
  }

  else if(role=="hdm"){
    var rdept_id=adata.me.contract_dept
  }
  adata.lstatus=status
  adata.rdept_id=rdept_id;
  adata.hdept_id=hdept_id
  adata.role_name=role_name
  adata.rtitle=rtitle
  if(adata.me.deputy_dean){
    adata.rdept_id=adata.me.deputy_dean//ID of faculty where one is deputy dean
    
  }

}

function add_loa() {
	
	var hd=[{lb:"Output",fn:"output"},{lb:"Indicator",fn:"indicator"},{lb:"Performance Targets",fn:"target"},{lb:"Self Rating",fn:"self_rating"}]
	var data=prep_data(hd)
	if(!data){return 0}
	data.appraisal_id=adata.appraisal_id;
	data.plan_id=adata.plan_id;
	var rate=Number($("#self_rating").val())
	var max_rate=adata.max_rate;
	data.entry_id=adata.entry_id
	if(rate>max_rate){
		return display_err("Please enter a value less or equal to predetermined rating")
	}
	ajax_go(data,function (rst) {

		load_loa(rst,"loa-div")
		$("#loa-modal").modal("hide")

	})
}
function remove_loa(i) {
	var data=prep_data([])
	if(!data){return 0}
	data.appraisal_id=adata.appraisal_id;
	data.id=adata.loa[i].id;
	data.rq="remove-loa"
	ajax_go(data,function (rst) {
		load_loa(rst,"loa-div")
	})
}

function edit_loa(i) {
	$("#loa-modal").modal("show")
	var loa=adata.loa[i];
	adata.entry_id=loa.entry_id;
	adata.rq="edit-loa"
	var hd=[{lb:"Output",fn:"output"},{lb:"Indicator",fn:"indicator"},{lb:"Performance Targets",fn:"target"},{lb:"Self Rating",fn:"self_rating"}]
	for(var i=0;i<hd.length;i++){
		var fn=hd[i].fn;
		$("#"+fn).val(loa[fn])
	}

}


