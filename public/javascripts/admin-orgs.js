var pg="orgs"
adata.pg=pg
$(function(){
	get_orgs()
	populate_date()
	$('.modal').modal();
	$('.tabs').tabs();
})

function get_orgs() {
	var data=prep_data([])
	data.rq="get-orgs"
	ajax_go(data,function (rst) {
		load_orgs(rst)
	})
}


function org_admin_dl() {
	$("#org_admin-modal").modal("open")
}
function get_org_admins() {
	var data=prep_data([])
	data.rq="get-admins"
	data.org_id=adata.org_id
	ajax_go(data,function (rst) {
		load_admins(rst)
	})
}
function load_admins(rst) {
	$(".cd,.2cd").hide()
	$("#view-card,#org_admins-div").show()
	var admins=rst.admins;
	adata.admins=admins;
	
	var hd=[{lb:"Name",fn:"name"},{lb:"Email",fn:"email"}]
	gen_table(hd,admins,"org_admins-div-2","No admins added")
}
function add_admin(index) {
	
	adata.rq="add-admin"
	var flds=[{lb:"Name",fn:"admin_name"},{lb:"Email",fn:"admin_email",ft:"email"}]
	var data=prep_data(flds);if(!data){return 0;}
	data.org_id=adata.org_id;
	if(!vr){return 0}
	ajax_go(data,function (rst) {
		load_admins(rst)
		clear_fields()
		
		$(".modal").modal("close")
	})
}

function org_dl() {
	$("#org_name").val("MAKERERE UNIVERSITY BUSINESS SCHOOL")
	$("#email").val("admin@mubs.ac.ug")
	$("#phone").val("0757575431")
	$("#address").val("NEW PORTBELL ROAD")

	$("#org-modal").modal("open")
}
function load_orgs(rst) {
	var orgs=rst.orgs;
	adata.orgs=orgs;
	for(var i=0;i<orgs.length;i++){
		orgs[i].btn="<a class='btn btn-primary btn-sm' href='#' onclick=\"view_org("+i+")\">View<i class='fa fa-view'></i><a>"
	}
	var hd=[{lb:"Organization",fn:"org_name"},{lb:"Vote Code",fn:"vote_code"},{lb:"Email",fn:"email"},{lb:"Phone",fn:"phone"},{lb:"Address",fn:"address"},{lb:"",fn:"btn"},]
	gen_table(hd,orgs,"orgs-div","No organizations added")
}
function view_orgs(){
	$(".cd").hide()
	$("#orgs-card").show()
}
function view_org(i) {

	if(i||i==0){
		adata.index=i;
	}
	else
		i=adata.index;

	$(".cd,.2cd").hide()
	$("#view-card,#details-div").show()
	var tb=""
	var org=adata.orgs[i];
	adata.org_id=org.id
	var hd=[{lb:"Organization/Vote",fn:"org_name"},{lb:"Vote Code",fn:"vote_code"},{lb:"Email",fn:"email"},{lb:"Phone",fn:"phone"},{lb:"Address",fn:"address"}]
	tb+="<table class='table'>"
	for(var i=0;i<hd.length;i++){
		var fn=hd[i].fn;
		var lb=hd[i].lb;
		var val=org[fn]
		tb+="<tr><td>"+lb+"</td><td>"+val+"</td></tr>"
	}
	$("#org_name-hdr").html(org.org_name)
	tb+="</table>"
	$("#details-div-2").html(tb)
}

function remove_org(index) {
	var id=adata.orgs[index].id
	var data={id:id,rq:"remove-orgs",url:adata.url}
	ajax_go(data,function (rst) {
		load_orgs(rst)
	})
}



function add_org(index) {
	var start_date=format_day("startx")
	var end_date=format_day("endx")
	var role=$("#role").val()
	adata.rq="add-org"
	var flds=[{lb:"Organization Name/Vote",fn:"org_name"},{lb:"Vote Code",fn:"vote_code"},{lb:"Email",fn:"email",ft:"email"},{lb:"Phone",fn:"phone",ft:"phone"},{lb:"Address",fn:"address"}]
	var data=prep_data(flds);if(!data){return 0;}
	if(!vr){return 0}
	ajax_go(data,function (rst) {
		load_orgs(rst)
		clear_fields()
		
		$("#org-modal").modal("close")
	})
}
