function create_new_bio() {
	adata.rq="create-bio"
	var data=prep_data([])
	ajax_go(data,function (rst) {
		load_profiles(rst)
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
