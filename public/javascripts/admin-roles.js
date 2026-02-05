var pg="roles"
adata.pg=pg
$(function(){
	get_admins()
	populate_cs_day()
})

function get_admins() {
	var data=prep_data([])
	data.rq="get-admins"
	ajax_go(data,function (rst) {
		load_admins(rst)
	})
}

function add_admin_dl(argument) {
	$("#admin-modal").modal("show")
}
function load_admins(rst) {
	var admins=rst.admins;
	adata.admins=admins;
	var hd=[{lb:"User",fn:"name"},{lb:"Email",fn:"email"},{lb:"Role",fn:"role"},{lb:"Start Date",fn:"start_datef"},{lb:"End Date",fn:"end_datef"},{lb:"",text:"Remove",ft:"btn",oc:"remove_admin"},{lb:"",text:"Rights",ft:"btn",oc:"get_rights"}]
	gen_table(hd,admins,"admins-div","No admins added")
}
function get_rights(index) {
	var admins=adata.admins
	var userid=admins[index].userid;
	var data=prep_data([])
	data.userid=userid;

	data.rq="get-rights"
	var priv=admins[index].role;
	data.priv=priv
	ajax_go(data,function (rst) {
		load_rights(rst)
		adata.priv=priv
		adata.userid=userid
	})
}
function update_rights() {
	var ad=[];var a=0;rm=[];var r=0
	var rights=adata.rights
	$(".rights-cb").each(function (i,el) {
		var ck=el.checked;
		var rid=el.value;
		for(var k=0;k<rights.length;k++){
			var rid2=rights[k].id;
			var raid=rights[k].raid;
			if(rid==rid2&&raid&&ck==false){
				rm[r++]=raid;
			}
			if(rid==rid2&&raid==null&&ck==true){
				ad[a++]=rid;
			}
		}
	})
	adata.rq="update-rights"
	data=prep_data([],"post")
	data.append("ad",JSON.stringify(ad))
	data.append("rm",JSON.stringify(rm))
	data.append("userid",adata.userid)
	data.append("priv",adata.priv)
	ajax_file(data,function () {
		display_succ("Update successful")
		load_rights(rst)
	})
}
function load_rights(rst) {
	
	var rights=rst.rights;
	adata.rights=rights;
	var tb="<table class='table'><tr><td></td><td>Rule</td></tr>"
	for(var i=0;i<rights.length;i++){
		var rule=rights[i].axn_text
		var id=rights[i].id
		var raid=rights[i].raid;
		if(raid){
			checked="checked=true"
		}
		else
			checked=""

		tb+="<tr><td><input class='rights-cb' "+checked+" value=\""+id+"\" type='checkbox' style='width:20px;height:20px'></td><td>"+rule+"</td></tr>"
	}
	tb+="</table>"
	$("#rights-list-div").html(tb)
	$("#rights-modal").modal("show")

}
function remove_admin(index) {
	var id=adata.admins[index].id
	var data={id:id,rq:"remove-admin",url:adata.url}
	ajax_go(data,function (rst) {
		load_admins(rst)
	})
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
			var name=$("#users-search-name").val()
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
	$("#users-search-div").show()
	if(users.length)
		$("#users-footer,#users-search-div").show()
	else
		$("#users-footer").hide()
	var flds=[{lb:"",ft:"rb",cl:"user-rb",fn:"id"},{lb:"Name",fn:"name"},{lb:"Email",fn:"email"}]
	gen_table(flds,users,"users-search-results","No results retrieved")
}
function add_admin(index) {
	role=$(".user-rb");var userid=0;//userid
	role.each(function () {
		var id=this.value
		var checked=$(this)[0].checked
		if(checked){
			userid=id;
		}
	})
	if(!userid)
		return display_err("Please select a user")
	var start_date=format_day("start")
	var end_date=format_day("end")
	var role=$("#role").val()
	adata.rq="add-admin"
	var flds=[{lb:"Role",fn:"role",vl:adata.dept_id},{lb:"User",fn:"userid",vl:userid},{lb:"Start date",fn:"start_date",vl:start_date,ft:"date"},{lb:"End date",fn:"end_date",vl:end_date,ft:"date"}]
	var data=prep_data(flds);if(!data){return 0;}
	var vr=validate_start_end_dates(start_date,end_date,"End date cannot be a date before start date",5000);
	if(!vr){return 0}
	ajax_go(data,function (rst) {
		load_admins(rst)
		clear_fields()
		$("#users-footer,#users-search-div").hide()
		$("#admin-modal").modal("hide")
	})
}
