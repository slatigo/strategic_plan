adata.pg="users"
$(function () {
	adata.crit="all"
	get_users()
})
function add_user_dl() {
	clear_fields()
	$("#user-modal").modal("show")
	adata.rq="add-user"
	$("#reset-link-div").show()
}
function add_user() {
	var send_link=$("#send-link")[0].checked
	var flds=[{lb:"Name",fn:"name"},{lb:"Email",fn:"email",ft:"email"},{fn:"send_link",vl:send_link,op:1}]
	var data=prep_data(flds); if(!data){return 0}
	ajax_go(data,function (rst) {
		$("#user-modal").modal("hide")
		if(adata.rq=="add-user")
			display_succ("User added successfully")
		else
			display_succ("User updated successfully")
		load_users(rst)
	})
}
function edit_user(index) {
	var user=adata.users[index];
	$("#email").val(user.email)
	$("#name").val(user.name)
	$("#priv").val(user.priv)
	adata.rq="edit-user"
	adata.id=user.id
	$("#user-modal").modal("show")
	$("#reset-link-div").hide()
}
function remove_user(index) {
	var cfm=confirm("Confirm deletion of this user")
	if(!cfm){return 0}
	var data=prep_data();if(!data){return 0;}
	data.rq="remove-user"
	data.id=adata.users[index].id;
	ajax_go(data,function (rst) {
		display_succ("User removed successfully")
		load_users(rst)
	})
}

function load_users(rst,suserid) {
		//ts 
	 pager("users",rst.os,rst.users,rst.count)
	
	adata.users=rst.users;
	var users=rst.users;
	for(var i=0;i<users.length;i++){ 
		if(suserid)
			ts="vs="+new Date()
		else
			ts=""
		var sign=users[i].sign
		if(sign)
			users[i].sign="<img style='height:50px' src=\"/images/uploads/sign/"+users[i].id+".png"+ts+"\" onerror=\"user_sign_err(this)\">"
		else
			users[i].sign="<button class='btn btn-primary btn-sm' onclick=\"upload_sign_dl("+i+")\"><i class='fa fa-upload'></i> Upload</button>"
	}
	var flds=[{lb:"Name",fn:"name"},{lb:"Email",fn:"email"},{lb:"Sign",fn:"sign"},{lb:"",ft:"options"}]
	var options=[{text:"Edit",method:"edit_user"},{text:"Send password reset link",method:"send_reset_link"},{text:"Signature",method:"upload_sign_dl"},{text:"Remove",method:"remove_user"}]
	gen_table(flds,users,"users-div","No results retrieved",options)
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
    var crit=adata.crit;
	var data={rq:"get-users",url:adata.url,os:os,crit:adata.crit}
	if(crit=="by-name"){
			var name=$("#search-name").val()
			if(name.length==0){return display_err("Please enter a name or email before you search")}
			data.name=name;
			adata.name=name;
    }
	ajax_go(data,function (rst) {
		$(".modal").modal("hide")
		load_users(rst)
	})
}

function search_user_dl(crit) {
	clear_fields()
	if(crit=="by-name"){
		adata.crit="by-name"
		$("#search-user-modal").modal("show")
	}
	else if(crit=="priv"){
		adata.crit="priv"
		$("#search-user-priv-modal").modal("show")
	}
}
function send_reset_link(index) {
	var email=adata.users[index].email;
	var priv=adata.users[index].priv
	var data={rq:"send-reset-link",email:email,url:adata.url}
	ajax_go(data,function (rst) {
		display_succ("Password reset link sent successfully to email "+email)
	})
}

function upload_sign_dl(index) {
	var user=adata.users[index];
	adata.userid=user.id;
	$("#user-sign").val("");
	$("#user-sign").trigger("click")

	
}
function user_sign_err(el) {
	$(el).hide()

}
function user_sign_load() {
	$("#ps-sign-td-1").show()
	$("#ps-sign-td-2").hide()
}
$(function () {
	$("#user-sign").change(function () {
      var photos=document.getElementById("user-sign").files
      var vi=validate_file(photos,"Image")
      if(!vi)
        return 0;
      var fd=new FormData()
      fd.append('user_sign',photos[0])
      fd.append("rq","upload-user-sign")
      fd.append("userid",adata.userid)
      fd.append("os",adata.os)
      fd.append("crit",adata.crit)
      fd.append("name",adata.name)
      ajax_file(fd,function (res) {
        load_users(res)
      },adata.url)
	})

	$(".btn-close").click(function () {
		adata.crit="all"
	})
})


