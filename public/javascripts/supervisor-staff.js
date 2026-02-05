adata.pg="staff"
$(function () {
	//The app loads then using ajax, requests data to fill up the page
	get_defaults()
	//get_depts()
	
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
	var data={url:adata.url,rq:"get-defaults"}
	ajax_go(data,function (rst) {
		load_staff(rst)
	})
}
function search_staff_crit(crit) {
	adata.crit=crit;
	search_staff()

}
function get_staff(pager){
	if(pager=="next")
    var os=adata.os+lm;
  else if(pager=="previous")
      var os=adata.os-lm;
  else{
      var os=0;
  }
  var crit=adata.crit;

	var data={url:adata.url, rq:"get-staff",os:os}
	if(crit=="name"){
			

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
		
		load_staff(rst)
	})
}






function load_staff(rst) {
	var staff=rst.staff;
	adata.staff=staff;
	var hd=[{lb:"Name",fn:"name"},{lb:"Email",fn:"email"},{lb:"Designation",fn:"psn"}]
	gen_table(hd,staff,"staff-div","No staff added in the selected unit")
}
