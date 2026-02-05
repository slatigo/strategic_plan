var pg="deputy_deans"
adata.pg=pg
$(function(){
	get_default()
})
function get_default() {
	var data=prep_data([])
	data.rq="get-default"
	ajax_go(data,function (rst) {
		load_deputy_deans(rst)
		console.log(rst.faculties)
		load_select(rst.faculties,"id","dept","#facid")
	})
}
function get_deputy_deans() {
	var data=prep_data([])
	data.rq="get-deputy_deans"
	ajax_go(data,function (rst) {
		load_deputy_deans(rst)
	})
}

function add_deputy_dean_dl() {
	$("#deputy_dean-modal").modal("show")
}
function load_deputy_deans(rst) {
	var deputy_deans=rst.deputy_deans;
	adata.deputy_deans=deputy_deans;
	var hd=[{lb:"User",fn:"name"},{lb:"Email",fn:"email"},{lb:"Faculty",fn:"faculty"},{lb:"",text:"Remove",ft:"btn",oc:"remove_deputy_dean"}]
	gen_table(hd,deputy_deans,"deputy_deans-div","No deputy deans added")
}

function remove_deputy_dean(index) {
	var id=adata.deputy_deans[index].id
	var data={id:id,rq:"remove-deputy_dean",url:adata.url}
	ajax_go(data,function (rst) {
		load_deputy_deans(rst)
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
function add_deputy_dean(index) {
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
	var facid=$("#facid").val()
	
	if(facid=="0"){
		return display_err("Please select a faculty")
	}

	var data={userid:userid,rq:"add-deputy_dean",url:adata.url,facid:facid}
	console.log(data)
	ajax_go(data,function (rst) {
		load_deputy_deans(rst)
		clear_fields()
		$("#users-footer,#users-search-div").hide()
		$("#deputy_dean-modal").modal("hide")
	})
}
