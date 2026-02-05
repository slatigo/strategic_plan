adata.pg="bio"
$(function () {
	//populate_cs_day()
	get_defaults()
	load_countries("nationality")
	$(".udiv").hide()
	$(".staff").show()
	adata.axn="contract-only"
})

function create_new_bio() {
	adata.rq="create-bio"
	var data=prep_data([])
	ajax_go(data,function (rst) {
		load_profiles(rst)
	})
}
function get_defaults() {
	var group_id=$("#h-group-id").val()
	var data={rq:"get-defaults",url:adata.url}
	ajax_go(data,function (rst) {
		load_profiles(rst)
		load_select(rst.districts,"district","district",".district")
		adata.depts=rst.depts
		var mdepts=rst.mdepts;
		var md=[];//container for mdepts;
		var k=0;
		for(var i=0;i<mdepts.length;i++){
			var dept=mdepts[i].dept;
			if(dept=="--"){
				continue
			}
			md[k++]=mdepts[i]
		}
		var mdepts=md;
		adata.mdepts=mdepts
		load_select(mdepts,"id","dept",".dept")
		adata.psns=rst.psns;
		adata.me=rst.user
		load_select(rst.psns,"id","psn",".psn")
		show_contract_details()
	})
}

function get_profile() {
	show_div("profile-card")
	$(".ch-div").hide()
	$("#staff-search-results-div-parent").show()
	show_div("profile-card")
	$(".ch-div").hide()
	$("#staff-search-results-div-parent").show()
	
	adata.staff=rst.staff;
	adata.me=rst.user;
	view_profile(0)

}

function load_profiles(rst) {
	var profiles=rst.profiles;
	adata.profiles=profiles;
	adata.staff=profiles
	for(var i=0;i<profiles.length;i++){
		var status=profiles[i].status;
		var id=profiles[i].pid;
		if(status=="Not Submitted"){
			profiles[i].profile_no+="<button class='btn btn-danger btn-sm' onclick=\"remove_profile("+id+")\"><i class='fa fa-trash'></i></button>"
		}
		profiles[i].view_btn="<button class='btn btn-danger btn-sm' onclick=\"view_profile("+i+")\"><i class='fa fa-eye'></i></button>"
	}
	$(".cd").hide()
	$("#profiles-card").show()
	var hd=[{lb:"Profile No.",fn:"profile_no"},{lb:"Position",fn:"psn"},{lb:"Department",fn:"dept"},{lb:"Date Created",fn:"recorded"},{lb:"Status",fn:"status"},{lb:"",fn:"view_btn"}]
	gen_table(hd,profiles,"profiles-div","No submissions")
}
function remove_profile(id) {

	var cfm=confirm("Are you sure you want to delete this biodata?")
	if(!cfm){return 0;}
	adata.rq="remove-bio"
	var data=prep_data([])
	data.profile_id=id;

	ajax_go(data,function (rst) {
		load_profiles(rst)
	})

}

function show_decline_reason() {
	$("#decline-modal").modal("show")
}

//CONTRACTS


function change_profile_status_staff(status) {
	if(adata.me.contract_dept==null){
		return display_err("No latest contract/appointment information on your profile. Please send a copy to hrms@mubs.ac.ug or attach it via the live chat platform",20000)
	}
	flds=[{lb:"Nationality",fn:"nationality",ft:"sel"},{lb:"Permanent Address",fn:"permanent_address",op:1},{lb:"District of Birth",fn:"district_of_birth",ft:"sel",op:1},{lb:"District of Origin",fn:"district_of_origin",ft:"sel",op:1},{lb:"Identification No.",fn:"id_no",op:1},{lb:"NSSF.",fn:"nssf_no",op:1},{lb:"TIN",fn:"tin",op:1},
	{lb:"Phone Line 1",fn:"phonea",ft:"phone",op:1},{lb:"Maritial Status",fn:"marital_status"}]
	var nf=[];//not filled
	var staff=adata.staff[0];
	var nfl=""
	var k=0;
	for(var i=0;i<flds.length;i++){
		var fn=flds[i].fn;
		var lb=flds[i].lb;
		if(staff[fn]==""||staff[fn]==null){
			nf[k++]=lb;
			nfl+="<li>"+lb+"</li>"
		}
	}
	nfl="<ul>"+nfl+"</ul>"
	if(!adata.pp){
		return display_err("Please upload a passport photo")
	}
	if(nf.length){
		return display_err("Please fill in the following Basic information before submission: "+nfl,6000)
	}
	change_profile_status(status)
}

function upload_pp_staff() {
	if(adata.status=="Not submitted"||adata.status=="Declined"){

		view_pp()
	}
}
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
		      ajax_file(fd,function (res) {
		        $("#pp").val("")
		        var ts=new Date()
		        adata.ts=ts;
		      })
		  	// body...
      }
	})