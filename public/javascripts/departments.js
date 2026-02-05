adata.pg="units"
$(function () {
	get_depts()
	populate_cs_day()
})
function get_depts() {
	console.log(adata.url)
	var data={url:adata.url,rq:"get-depts"}
	ajax_go(data,function (rst) {
		show_div("depts-card")
		load_depts(rst)
	})
}
function new_dept_dl() {
	clear_fields()
	adata.rq="add-dept"
	$("#dept-modal").modal("show")
}

function add_dept() {
	var dept=$("#dept").val()
	if(dept.length==0)
		return 0;
	var pdid=$("#pdid").val()
	var hd=[{fn:"dept"},{fn:"pdid",op:1},{fn:"dtitle"}]
	var vr=check_empty(hd);if(!vr){return 0}
	var data=prep_data(hd)
	data.userid=adata.userid
	ajax_go(data,function (rst) {
		adata.dept=rst.dept;
		show_div("depts-card")

		load_depts(rst)
		$("#dept-modal").modal("hide")
	})
}
function hod_dl() {
	$("#hod-assign-modal").modal("show")
}
function load_depts(rst) {
	var depts=rst.depts;
	adata.depts=depts;
	var mdepts=rst.mdepts;
	adata.mdepts=mdepts;
	var flds=[{lb:"#",ft:"serial"},{lb:"Unit",fn:"dept"},{lb:"Title of head",fn:"title"},{lb:"Parent Unit",fn:"pdept"},{lb:"Head",fn:"head"},{lb:"",ft:"options"}]
	var options=[{text:"View Users",method:"get_dept_users"},{text:"Edit",method:"edit_dept"},{text:"Remove",method:"remove_dept"}]
	gen_table(flds,depts,"depts-div","No departments added",options)
	load_select(mdepts,"id","dept",".dept")
}
function edit_dept(index) {
	//clear_fields()

	var dept=adata.depts[index].dept;
	var pdid=adata.depts[index].pdid
	var email=adata.depts[index].email
	var access=adata.depts[index].access
	var title=adata.depts[index].title
	$("#dept").val(dept)
	$("#pdid").val(pdid)
	if(access)
		var access=access.toLowerCase();

	$("#access").val(access)
	$("#dtitle").val(title)
	adata.rq="edit-dept"
	adata.id=adata.depts[index].id;
	adata.userid=adata.depts[index].userid//user id associated with the department email
	$("#dept-modal").modal("show")
}
function remove_dept(index) {
	var id=adata.depts[index].id;
	var data={url:adata.url,rq:"remove-dept",id:id}
	ajax_go(data,function (rst) {
		load_depts(rst)
	})
}

function get_dept_users(index) {
	var dept_id=adata.depts[index].id
	adata.dept_id=dept_id;
	var data={dept_id:dept_id,rq:"get-dept-users",url:adata.url}
	ajax_go(data,function (rst) {
		load_dept_users(rst)
		$("#dept-users-modal").modal("show")
	})
}

function load_dept_users(rst) {
	var dept_users=rst.supervisors;
	adata.dept_users=dept_users;
	var hd=[{lb:"User",fn:"name"},{lb:"email",fn:"email"},{lb:"",text:"Remove",ft:"btn",oc:"remove_dept_user"}]
	gen_table(hd,dept_users,"dept-users-div","No users added to this department")

}

function remove_dept_user(index) {
	var id=adata.dept_users[index].id
	var data={dept_id:adata.dept_id,id:id,rq:"remove-dept-user",url:adata.url}
	ajax_go(data,function (rst) {
		load_dept_users(rst)
		load_depts(rst)
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
function add_dept_user(index) {
	var dept_users=$(".dept-user-rb");var userid=0;//userid
	dept_users.each(function () {
		var id=this.value
		var checked=$(this)[0].checked

		if(checked){
			userid=id;
		}
	})
	if(!userid)
		return display_err("Please select a user")
	
	adata.rq="add-dept-user"
	var flds=[{lb:"Department",fn:"dept_id",vl:adata.dept_id},{lb:"User",fn:"userid",vl:userid}]
	var data=prep_data(flds);if(!data){return 0;}
	if(!vr){return 0}
	ajax_go(data,function (rst) {
		load_dept_users(rst)
		clear_fields()
		$("#dept-users-footer,#dept-users-search-div").hide()
		load_depts(rst)

	})
}
