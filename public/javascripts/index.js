$(function () {
	var rq=$("#hrq").val()
	
	var accepted=$("#haccepted").val()
	if(rq=="verify"&&accepted==1){
		$(".cd").hide()
		
		$("#create-password-div").show()
		adata.username=$("#husername").val()
	}
	if(rq=="no-account"){
		display_err("The account your signed in with doesn't exist on the HR system")

	}
})
function send_reset_code() {
	var username=$("#username-reset-pw").val()

	var arr=[{lb:"Email",fn:"username-reset-pw"}]
	if(!check_empty(arr))
		return 0;
	var data={rq:"send-reset-code",username:username}

	adata.username=username;
	ajax_go(data,function (rst) {
		
		display_succ("A password reset code has been sent to the email: \'"+username+"\'",10000)
		show_div('verify-reset-code-div')
		
	})
}
function launch_google_auth() {
	window.location="/auth/google"
}
function login() {
	var username=$("#login-username").val()
	var password=$("#login-password").val()
	adata.username=username
	var arr=[{lb:"Username/Phone",fn:"login-username"},{lb:"Password",fn:"login-password"}]
	if(!check_empty(arr))
		return 0;
	ajax_login(username,password,function (rst) {
		if(rst.user.status==0){
			$(".cd").hide()
			return $("#create-password-div").show()
		}
		var roles=rst.user.roles
		if(!rst.user.priv)
			return display_err("This account has no roles assigned to it.")
		else
			window.location=rst.user.priv
	})
}
function show_div(id) {
	$(".cd").hide()
	$("#"+id).show()
	var username=$("#login-username").val()
	if(id=="login-div")
		$("#username").val(adata.username)
	else if(id=="send-reset-code-div"){
		if(adata.username&&adata.username.length)
			username=adata.username;
		$("#username-reset-pw").val(username)

	}
	else{
		username=adata.username
	}
	adata.username=username
}
function verify_code() {
	var reset_code=$("#reset_code").val()
	var username=adata.username;
	var data={rq:"verify-code",username:username,reset_code:reset_code}
	ajax_go(data,function () {
		$(".cd").hide()
		$("#create-password-div").show()
	})

}
function create_password() {
	var username=adata.username;
	var password=$("#pw-reg").val()
	var cpassword=$("#pw-cf").val()
	if(password=="")
		return display_err("Enter a password")
	if(password.length<6)
		return display_err("Password should be more than 6 characters")
	if(cpassword=="")
		return display_err("Enter confirmation password")


	if(password!=cpassword)
	{
		return display_err("Passwords mismatch")
	}

	var data={rq:"create-password",username:username,password:password}
	
	ajax_go(data,function () {
		show_div("login-div")
		$("#login-username").val(username)
	})
}