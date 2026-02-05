adata.pg="appraisal"
$(function () {
	get_defaults()
})

function countdown() {
	const targetDate = new Date("2025-05-27T08:59:00").getTime();

    // Update the countdown every second
    const countdown = setInterval(function() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      // Time calculations
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Display the result
      document.getElementById("appraisals-div").innerHTML ="<p align='center'>In about "+
        hours + "h " + minutes + "m " + seconds + "s</p>";

      // When the countdown is over
      if (distance < 0) {
        clearInterval(countdown);
        document.getElementById("appraisals-div").innerHTML = "EXPIRED";
      }
    }, 1000);
}
function get_defaults() {
	
	var data=prep_data([])
	data.rq="get-defaults"

	ajax_go(data,function (rst) {
		adata.me=rst.user
		load_appraisals(rst)
		load_select(rst.forms,"id","form_name","#form_id")
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
	if(adata.me.days_left<=0&&!adata.me.cras_allowed){
		return display_err("Your contract shows expired. It's likely not updated on the system, please send your latest contract or confirmation via live chat or hrms@mubs.ac.ug. If you have no current contract, contact live support",10000)
	}
	$("#appraisal-modal").modal("show")
	clear_fields()
	
}
function add_appraisal() {
	
	var hd=[{lb:"Appraisal Purpose",fn:"subject",ft:"sel"},{lb:"Form Category",fn:"form_id",ft:"sel"}]
	var data=prep_data(hd)
	if(!data){return 0}
	get_rdept()
	data.rq="add-appraisal"
	data.rdept_id=adata.rdept_id
	data.hdept_id=adata.hdept_id
	var subject=$("#subject").val()
	var mentor_userid=get_mentor();
	data.mentor_userid=mentor_userid
	var subject=$("#subject").val()
	if(!mentor_userid&&subject=="Mentorship Evaluation"){
		return display_err("Please select your mentor")
	}
	ajax_go(data,function (rst) {
		load_appraisals(rst)
		$("#appraisal-modal").modal("hide")

		goto_form(0)


	})
}
function get_mentor() {
	var dept_users=$(".dept-user-rb");var userid=0;//userid
	dept_users.each(function () {
		var id=this.value
		var checked=$(this)[0].checked

		if(checked){
			userid=id;
		}
	})
	if(!userid){
		
		return 0;
	}
	return userid
}
function purpose_changed(argument) {
	var purpose=$("#subject").val()
	
	if(purpose=="Mentorship Evaluation"){
		$("#mentor-div").show()
	}
	else{
		$("#mentor-div").hide()
	}
}
function goto_form(index) {
	if(index==undefined)
		index=adata.app_index;
	adata.nindex=0;
	var appraisal=adata.appraisals[index]
	var data=prep_data([])
	data.form_id=appraisal.form_id
	adata.form_id=appraisal.form_id
	adata.subject=appraisal.subject
	adata.app_index=index
	adata.appraisal_id=appraisal.id;
	adata.status=appraisal.status;
	data.status=appraisal.status
	adata.appraisal=appraisal
	data.rq="get-sections"
	if(adata.status=="Completed"){
		data.rq="preview-appraisal"
		data.appraisal_id=appraisal.id
		$("#download-btn").hide()
	}

	ajax_go(data,function (rst) {
		adata.sections=rst.sections
		if(adata.status=="Completed"){
			$("#form-preview-modal").modal("show")
			$("#prev-btn,#next-btn,#complete-btn,#preview-btn,#start-btn,#submit-btn").hide()
			$("#download-btn").show()
		
			load_appraisal_preview(rst)
			return 0
		}
		load_form_preview(rst.form)
	})
}
function get_section_items(index,mode) {

	var section=adata.sections[index]

	var section_name=section.section_name

	var section_type=section.section_type;
	adata.section_type=section_type
	adata.show_to=section.show_to
	var data=prep_data([],"post")
	data.append("section_id",section.id);
	adata.section_id=section.id;
	data.append("form_id",adata.form_id)
	data.append("appraisal_id",adata.appraisal_id)
	data.append("status",adata.status)
	adata.mode=mode
	if(adata.section_items){
		var srd=prep_save_data(mode);//self rate data; sd
		
		if(srd.length==0)
			data.append("srd",0)
		else
			data.append("srd",JSON.stringify(srd));
	}
	else
		data.append("srd",0)
	data.append("return",1)
	ajax_file(data,function (rst) {
		if(!rst){
			
			return 0
		}
		if(adata.rq=="get-section-items"){
			$("#prev-btn").show()
			var nindex=index+1;
			var pindex=index-1;
			adata.nindex=nindex
			adata.pindex=pindex;
			if(adata.mode=="next"){
				
				index=nindex;

			}
			else{
				index=pindex
			}

			if(index==adata.sections.length){
				$("#next-btn").hide()

				$("#preview-btn").show()
			}
			else{
				$("#next-btn").show()
				$("#preview-btn").hide()
			}
			
			if(adata.mode=="preview"){
				$("#next-btn,#prev-btn,#preview-btn,#save-btn").hide()

			}
			load_section_items_preview(rst,section_type)
			$("#form-preview-hdr").text(section_name)
		}
		else
		{
			$("#prev-btn,#preview-btn,#submit-btn,#save-btn").hide()
			$("#start-btn").show()
			if(adata.status=="Not Submitted"){
				$("#submit-btn").show()
			}
			else if(adata.status=="Evaluated by Supervisor"){
				$("#complete-btn").show()
			}
			load_appraisal_preview(rst)
		}
	})
}
function navigate_form(axn) {
	var np=adata.np
	$('.modal-body').animate({scrollTop: 0},400);
	adata.rq="get-section-items"
	adata.axn=axn;
	if(axn=="next"){
		var nindex=adata.nindex;
		if(np=="preamble"){
			adata.np="sections"
			adata.section_items=0
			get_section_items(nindex,"next")
		}
		else if(np=="sections"){
					
					if(nindex==adata.sections.length-1)
					{
						get_section_items(nindex,"next")
					}
					else{
						get_section_items(nindex,"next")
					}

		}
	}
	else{
		var pindex=adata.pindex

		if(np=="comments"){
			adata.np="sections"
			adata.section_items=0
			get_section_items(pindex,"previous")
		}
		else if(np=="sections"){
			
			if(pindex<0)
			{
				goto_form(adata.app_index,"previous")
			}
			else
				get_section_items(pindex,"previous")
		}
	}
}

function prep_save_data() {
	var si=adata.section_items;
	var srd=[]
	if(!adata.save){
		return srd
	}

	for(var i=0;i<si.length;i++){
		var name="\'sr-"+i+"\'"
		id="sr-"+i
		if(adata.type=="Table")
			var val=$("input[name="+name+"]:checked").val();
		else{
				try{
					val=tinymce.get(id).getContent();
				}
				catch(e){
					//display_err("Some sections not filled")
					
				}
		}

		//rid rating table id
		var sr=si[i].self_rate;//current self rate

		if(sr!=undefined&&sr==val)
			continue;

		if(val==undefined&&adata.type=="Table"){
		}
		if(val==""&&adata.type=="Text"){
		
		}
 		srd[i]={id:si[i].rid,sr:val}
	}
	
	return srd
}
function load_form_preview(form) {
	var text=form.text;
	var text=form.text;
	$("#form-preview").html(text)
	$("#form-preview-modal").modal("show")
	adata.np="preamble";//navigation position/value
	$("#form-preview-hdr").text("Introduction")

	$("#prev-btn,#complete-btn,#submit-btn,#preview-btn,#start-btn,#download-btn,#save-btn").hide()
	$("#next-btn").show()

}
function load_section_items_preview(rst,type) {
	adata.section_items=rst.section_items;

	adata.type=type
	show_to=adata.show_to
	if(type=="Table"){
		var si=rst.section_items;
		if(adata.status=="Evaluated by Supervisor"||adata.status=="Completed"){
			agstd="<td>Agreed Score</td>"
			show_ags=1
		}
		else{
			agstd=""
			show_ags=0
		}
		var tb="<table class='table'><thead><tr><td style='width:500px'>Item</td><td>Weight</td><td>Self Rating</td>"+agstd+"</tr></thead><tbody>"
		for(var i=0;i<si.length;i++){
			var item=si[i].section_item
			var weight=si[i].weight
			var item_text=si[i].item_text
			if(item_text==null)
				item_text=""

			if(adata.status=="Not Submitted"){
				var sr=load_sr(i,si[i].self_rate)
				adata.save=1
			}
			else{
				sr=si[i].self_rate
				adata.save=0
			}
			
			var ags=si[i].agreed_score

			if(agstd){
				agstd="<td>"+ags+"</td>"
			}

			tb+="<tr><td><b>"+item+"</b><br><span>"+item_text+"</span></td><td>"+weight+"</td><td>"+sr+"</td>"+agstd+"</tr>"
		}
		table=tb+"</tbody></table>"
	}
	else{
		var si=rst.section_items;
		var tb="<table class='table'>"
		for(var i=0;i<si.length;i++){
			var item=si[i].section_item
			var item_text=si[i].item_text
			if(item_text==null)
				item_text=""
			var val=si[i].self_rate;
			if(show_to=="eval")
				val=si[i].agreed_score
			
			if(adata.status=="Not Submitted"||(adata.status=="Evaluated by Supervisor"&&show_to=="emp-after")){
				dsb=""
				tmce="tinymce-min"
				adata.save=1
				if(val==null)
				val=""

				var valf="<p><textarea class=\"form-control "+tmce+"\" name=sr-"+i+" id=\"sr-"+i+"\">"+val+"</textarea></p>"
				adata.tmce=1;
			}
			else{
				dsb="disabled"
				adata.save=0
				tmce=""
				var valf="<div>"+val+"</div>"
			}
			tb+="<tr><td><p><span><b>"+item+"</b></span><br><span>"+item_text+"</span></p>"+valf+"</td></tr>"
		}
	}
	table=tb+"</tbody></table>"
	$("#form-preview").html(table)
	
	init_tinymce()
}

function load_comment_section() {
	var cs="<div><p>Employee's Comment</p><textarea class='form-control tinymce-min'></textarea>"
	$("#form-preview").html(cs)
}

function load_sr(index,sr) {
	var tb="<table style='width:150px'><tr>"
	for(var i=0;i<4;i++){
		tb+="<td style='text-align:center'>"+(i+1)+"</td>"
	}
	tb+="</tr><tr>"
	for(var i=0;i<4;i++){
		checked="";
		if(sr==(i+1))
			checked="checked='checked'";
		tb+="<td style='text-align:center'><input style='width:25px;height:25px;vertical-align:center' "+checked+" type='radio' value="+(i+1)+" name=\"sr-"+index+"\"></td>"
	}
	tb+="</tr></table>"
	return tb;
}
function submit_appraisal() {
	var data=prep_data([]);
	var uf=adata.uf2;

	if(uf.length){
		var tx=""
		for(var i=0;i<uf.length;i++){
			tx+="<p>"+uf[i].sn+":"+uf[i].item+"</p>"
		}
		if(uf.length>10){
			dur=80000
		}
		else{
			dur=10000
		}
		return display_err("The appraisal has some unfilled sections."+tx,dur)
	}

	data.rq="submit-appraisal"
	data.appraisal_id=adata.appraisal_id;
	data.form_id=adata.form_id;
	data.subject=adata.subject
	
	ajax_go(data,function (rst) {
		load_appraisals(rst)
		display_succ("Appraisal sent sucessfully")
		$("#form-preview-modal").modal("hide")
	})
	
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
function preview_appraisal() {
	adata.rq="preview-appraisal"

	get_section_items(0,"preview")
}


function check_profile_status_app(axn) {
	
  if(adata.me.pstatus=="Declined by HOD"||adata.me.pstatus=="Declined by Director"||adata.me.pstatus=="Declined by Manager"||adata.me.pstatus=="Declined by Principal"||adata.me.pstatus=="Declined by Dean"){

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
  else if(role=="hdm"&&subject==13){
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