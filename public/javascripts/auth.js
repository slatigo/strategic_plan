var adata={}

$(function () {

	$("#login-btn").click(function () {

		var username=$("#login-username").val()

		var password=$("#login-password").val()

		var data={username:username,password:password}

		var url=host+"/auth-sign"

		$(".msg").hide()

		$(".loading-div").show()

		$.ajax({

	        type:"POST",

	        data:data,

	        dataType:'json',

	        url:url,

	        success: function(data) {

	        	$(".loading-div").hide()

	        	if(data.msg=="fail"){

	        		display_err("Incorrect Username or password")

	        	}

	        	else{

	        		if(data.user.priv==0)

	        			window.location="/voter"

	        		else

	        			window.location="/admin?rq=polls"

	        	}

	        },

	        error  : function(err) {

	        	display_err("Unable to connect to server")

	        }

		});

	})

	$(".back-to-login").click(function () {

		$("#login-username,#login-password").val("")

		$("#show-numbers-div").hide()

		$("#login-div").show()

	})

	$(".req-password").click(function () {

		$("#memid").val("")



		$("#req-pw-div").modal("show")

	})

	$("#resend-reset").click(function () {

		$("#reset-number-div").show()

		$("#reset-code-div,#reset-pass-div").hide()

	})

	$("#reset-pass").click(function () {

		var memid=adata.memid

		var npass=$("#new-pass").val()

		var cpass=$("#confirm-pass").val()

		var data={rq:"reset-pass",url:"/auth",memid:memid,password:npass}

		if(npass!=cpass){

			return display_err("New Password and Confirmation Password mismatch")

		}

		if(npass.length<6){

			return display_err("Password should be more than 6 characters")

		}

		$(".loading-div").show()



		ajax_go(data,function (rst) {

			if(rst.errmsg){

				display_err(rst.errmsg)

			}

			else{



				$("#login-div").show()

				$("#reset-pass-div,#reset-code-div,#reset-number-div").hide()

				display_succ("Password changed successfully")

			}

		})



	})

	$("#check-reset-code").click(function () {

		var memid=$("#memid").val()

		var rcode=$("#rcode").val()

		var data={rq:"check-reset-code",url:"/auth",memid:memid,rcode:rcode}

		$(".loading-div").show()

		ajax_go(data,function (rst) {

			if(rst.errmsg){



			}

			else{

				$("#reset-pass-div").show()

				$("#reset-number-div,#reset-code-div").hide()

			}

		})

	})

	$("#go-to-pass").click(function () {

		$("#no-num-msg").hide()

		$("#numbers-table-div").hide()



		var memid=$("#memid").val()

		adata.memid=memid

		var data={rq:"get-numbers-admin",url:"/auth",memid:memid}

		$(".loading-div").show()

		ajax_go(data,function (rst) {



			if(rst.errmsg)

			{



			}

			else{

				

				var numbers=rst.numbers

				adata.numbers=numbers

				var tr="";var f=0

				$("#show-numbers-div").show()

				for(var i=0;i<numbers.length;i++){

					

					if(numbers[i]==""||numbers[i]==null){

						f++

						continue

					}

					num=numbers[i].substring(0,4)+"********"+numbers[i].substring(8,numbers[i].length)

					tr+="<tr style='cursor:pointer' onclick=\"show_num_check_dialog("+i+",'"+num+"')\"><td>"+num+"</td></tr>"

					

				}

				if(f==numbers.length){



					$("#no-num-msg").show()

				}

				else{

					

					$("#numbers-table").html(tr)

					$("#numbers-table-div,#reset-number-div").show()

					$("#login-div,#reset-code-div,#reset-pass-div").hide()

					$("#req-pw-div").modal("hide")

				}

			}

			

		})

	})

})

function show_num_check_dialog(i,num) {

	$("#confirm-number-div").modal("show")

	$("#cf-number").val("")

	adata.nci=i;

	$("#num-masked-hdr").text(num)

}

function check_num() {

	var numbers=adata.numbers;



	var anum=numbers[adata.nci]

	var cnum=$("#cf-number").val()

	

	if(anum!=cnum){

		display_err("Sorry!, the number does not match, re-try or contact support")

	}

	else{

		//send message

		$("#confirm-number-div").modal("hide")

		data={rq:"send-sms-admin",num:anum,memid:adata.memid,url:"/auth"}

		$(".loading-div").show()

		ajax_go(data,function (res) {

			$("#reset-code-div").show()

			$("#reset-number-div,#reset-pass-div").hide()

		})

	}

}