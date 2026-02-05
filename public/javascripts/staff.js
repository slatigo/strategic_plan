var adata={url:"/staff"}

$(function () {
	$(window).resize(function () {
		 var w=document.body.clientWidth		 
		 if(w<900){
		 	$("#dt-menu").hide()
		 	$("#mm-menu").show()
		 }
		 else{
		 	$("#dt-menu").show()
		 	$("#mm-menu").hide()
		 }
	})
	var w=document.body.clientWidth

	 if(w<900){
	 	$("#dt-menu").hide()
	 	$("#mm-menu").show()
	 }
	 else{
	 	$("#dt-menu").show()
	 	$("#mm-menu").hide()
	 }
})


function goto_payslips() {
	window.location="/staff?pg=payslips"
}


function check_profile_status(axn) {
 
  if(adata.me.pstatus=="Declined"){

    display_err("Your profile status was declined, so "+axn+" is disabled for you")
    return 0
  }
  else if(adata.me.pstatus=="Not submitted"){
    return display_err("Your profile has not been submitted for approval, so "+axn+" is disabled for you")
    return 0
  }
  else if(adata.me.pstatus=="Pending"){
    display_err("Your profile is still pending approval, so "+axn+" is disabled for you")
    return 0
  }
  else
    return 1;
}