//var host="http://localhost:3000"

//var host="https://"+window.location.host
var host=window.location.origin
var adata={}
function contact_support() {
  $("#support-modal").modal("show")
}
function renew_session() {
  try{

    var password=$("#new-session-password").val()
    var me=JSON.parse(getCookie("user-client"))
    var username=me.email;
  }
  catch(e){
    ;//alert(e)
  }
  ajax_login(username,password,function () {
    display_succ("Session renewed succesfully!",3000)
    $("#renew-session-div").modal("hide")
  })
}
function hide_alerts() {
  $(".err-msg,.success-msg,.alert-danger,.alert-success").hide(1000)
}
$(function () {
  $(".uppercase").focusout(function (el) {
    /*var code=el.keyCode
    if(code==8||code==9||code==13)
      return 0*/
    var val=$(this).val().toUpperCase()
    $(this).val(val)
  })
	$("input").on("focus",function () {

       //hide_alerts()

    })

    $(".err-msg,.success-msg,.alert-danger,.alert-success,.alert-info").click(function (argument) {

     hide_alerts()
    })
    $(".close-page").click(function () {
       
        window.close()
    })
    $(".print-now").click(function (argument) {
        window.print()
    })
})
function show_div(id) {
  $(".cd").hide()
  $("#"+id).show()
}

function display_err(msg,duration) {

    M.toast({html: msg, classes: 'red'});
}
function display_succ(msg,duration) {
    if(!duration)
      duration=5000
    M.toast({html: msg, classes: 'green',outDuration:duration});
}

function display_info(msg,duration) {
    if(!duration)
      duration=5000
    M.toast({html: msg, classes: 'blue',outDuration:duration});

}

function ajax_go(data,callback) {

    var url=host

    data.ajax=1
    data.pg=adata.pg
    if(data.url)
       url=url+data.url
    $(".loading-div").show()
    if(adata.disable_submit==1){
      display_err("There was a connection problem during your last submission. We are refreshing the current page")
      return window.location=url+"/pg="+adata.pg
    }
    hide_alerts()
    $.ajax({

            url: url,

            data: data,
            dataType:'json',
            cache: false,

            type: "GET",

            success: function(result) {

               $(".loading-div").hide()
               adata.disable_submit=0
              //setTimeout(function() { }, 2000);
                if(result.errmsg){
                  display_err(result.errmsg)
                  if(result.et=="session-expired"){
                        //display_err("Session expired. Redirecting to login page...")
                        var me=JSON.parse(getCookie("user-client"))
                        $("#new-session-username").val(me.email)
                        $("#renew-session-div").modal("show")
                        
                  }
                  if(!data.return)
                      return 0;

                }
                session_timer()
                callback(result)

            },
            error: function(e) {
                $(".loading-div").hide()
                if(data.return)
                  callback(0)
               
                display_err("There seems to be a connection problem, please try again",3000)


            },
            timeout:100000

    });

}
function prep_data(flds,meth) {
  var data={}
   var fd=new FormData()
    
  vr=check_empty(flds)
    if(!vr)
        return 0;

    for(var i=0;i<flds.length;i++){
        var eid=flds[i].fn;
        var reid=flds[i].rfn;//field name as it corresponds to database
        var fv=flds[i].vl;
        var ft=flds[i].ft;

        if(fv==undefined)
          var fv=$("#"+eid).val()
        
        if(flds[i].ft=="tinymce"){
              fv= tinymce.get(eid).getContent();
        }
        var op=flds[i].op;//optional field
        if(op&&fv=="")
          continue;//skip
        if(reid)
          eid=reid;
        if(ft=="radio"){
          fv=$("input[name='"+eid+"']:checked").val();
        }
        if(ft=="money")
          fv=fv.split(",").join("")
        
        if(meth=="post"){
            fd.append(eid,fv);
        }
        else
          data[eid]=fv;
    }
  
    if(meth=="post"){
      fd.append("url",adata.url)
      fd.append("rq",adata.rq)
      fd.append("id",adata.id)
      return fd;
    }
    else{
        data.url=adata.url;data.rq=adata.rq;data.id=adata.id;
      return data;
    }
}
function format_day(id,tp,dt) {
  //tp type of format; for submission or reset the form fields or edit
  //dt only works with edit
  
  if(!tp){
    var day=$("#"+id+"_day").val()
    var month=$("#"+id+"_month").val()
    var year=$("#"+id+"_year").val()
   
    if(day==""||month==""||year==""||day==0||month==0||year=="")
      return "";
    var dt=year+"-"+month+"-"+day;

    return dt;
  }
  else if(tp=="reset"){
    $("#"+id+"_day").val(0)
    $("#"+id+"_month").val(0)
    $("#"+id+"_year").val("")
  }
  else if(tp=="edit"){
    //load it back for editing
    if(dt==null)
    return "";
    dtx=new Date(dt);
    
    var year=dtx.getFullYear()
    var month=dtx.getMonth()+1
    var day=dtx.getDate()
    $("#"+id+"_day").val(day)
    $("#"+id+"_month").val(month)
    $("#"+id+"_year").val(year)
  }
  else if(tp=="read"){
     dtx=new Date(dt);
    var year=dtx.getFullYear()
    var month=num2month(dtx.getMonth())
    var day=dtx.getDate()

     return day+" "+month+" "+year
  }
  else if(tp=="format"){
    dtx=new Date(dt);
    var year=dtx.getFullYear()
    var month=dtx.getMonth()+1
    var day=dtx.getDate()
     var dt=year+"-"+month+"-"+day;
     return dt;
    
  }
}
function num2month(num) {
   var months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"]
   for(var i=0;i<months.length;i++){
    if(num==i){
      return months[i]
    }
   }
}
function set_as_op(flds,arr) {
  for(var i=0;i<flds.length;i++){
    for(var j=0;j<arr.length;j++){
      if(flds[i].fn==arr[j]){
        flds[i].op=1

      }
    }
  }
  return flds
}
function show_hide_fields(arr,axn) {
  if(axn=="show"){
    for(var i=0;i<arr.length;i++){
     
      $("."+arr[i]).display("flex")
    }
  }
  else{
    for(var i=0;i<arr.length;i++){
       $("."+arr[i]).hide()
    }
  }
}
function ajax_login(username,password,callback) {
        var data={username:username,password:password}
        var url=host+"/login"
        $(".msg").hide()
        $(".loading-div").show()
        $.ajax({
            type:"POST",
            data:data,
            dataType:'json',
            url:url,
            success: function(data) {

                $(".loading-div").hide()

                if(data.msg=="wrong-password"){

                    display_err("Login failed!, password entered is incorrect")
                }
                else if(data.msg=="wrong-email"){
                  display_err("Login failed!, email not linked to any user, please recheck the email or contact support")
                }
                else if(data.msg=="inactive"){
                  display_err("Login failed!, your account has been de-activated. Please contact support")
                }
                else{
                  session_timer()
                    callback(data)
                }

            },
            error  : function(err) {
            $(".loading-div").hide()
              display_err("Unable to connect to server")
            },
            timeout:100000

        });
}

function check_empty(arr) {

    for(var i=0;i<arr.length;i++){

      var fn=arr[i].fn
      var val=arr[i].vl;
      var lb=arr[i].lb;
      var ft=arr[i].ft;
      if(lb==undefined){
        lb=$("#"+fn+"_lb").text()
      }
     
      if(val==undefined){
        var val=$("#"+fn).val()
        if(arr[i].ft=="tinymce")
          val= tinymce.get(fn).getContent();
      }
      if(ft=="radio"){
        val=$("input[name='"+fn+"']:checked").val();
      }
      var op=arr[i].op;//optional field

      if(op&&( (val==""||val==undefined)||(val=="0"&&arr[i].ft=="sel" ))){

        continue;
      }
     
      if(( (!arr[i].ft||arr[i].ft=="tinymce"||arr[i].ft=="money")&&(val==""||val==undefined))){

            var msg="\""+lb+"\" is not filled"
            display_err(msg,6000)
            return false;
      }

      else if((val=="0"||val==null||val==""||val==undefined)&&(arr[i].ft=="sel"||arr[i].ft=="radio")){

           var msg="Please select the \""+lb+"\" field"
            display_err(msg,6000)
            return false;
      }
      else if(arr[i].ft=="photo"){
          if(val.length==0&&!op){
            display_err(lb+" is required",6000)
            return false;
          }
          else if(val.length==0&&op){

          }
          else{
            var kind=val[0].type.split("/")[0]
            var type=val[0].type.split("/")[1]
            if(kind=="image"){
              if(type=="png"||type=="jpeg"||type=="jpg")
                  ;
              else{
                display_err(fn+" should be use PNG, JPG image file")
                return false
              }
            }
            else{
              display_err(fn+" should be a photo-file")
              return false
            }
          }
          
      }
      else if(arr[i].ft=="email"){
          if(val==""){
            return display_err(lb+" is not filled")
            return false
          }
         
          var vr=ValidateEmail(val)
          if(!vr){
            display_err("You entered an invalid email address")
            return false;
          }
        }
      else if(arr[i].ft=="phone"){

          if(val==""&&!op){
            return display_err(lb+" is not filled")
            return false
          }
          else if(val==""){
           
          }
          else{
            var vr=validate_phone(val)
            var msg=vr.msg;
            var res=vr.res;
            if(!res){
              display_err(lb+ " is in wrong format or invalid. "+msg)
              return false;
            }
          }
        }
      else if(arr[i].ft=="date"){

          var vr=validate_date(val)
          
          if(!vr&&!op){
            display_err("Please recheck the field \""+lb+"\"")
             return false;
          }
        }
    }
    return true;
}
function ValidateEmail(mail) 
{ 

    var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/igm;
    if (re.test(mail)) {
        return true;
    } else {
       return false;
    }
}
function validate_phone(phone) {
  if(phone[0]=="+"){
    var pl=phone[0];//plus
    phone=phone.substring(1,phone.length)
    var cn=Number(phone).toString()
    if(cn=="NaN"){
      var msg="Only numbers are accepted"
      return {msg:msg}
    }
    if(phone.length>15){
      var msg="An International number format should not have more than 15 digits"
      return {msg:msg}
    }
    else if(phone.length<7){
      var msg="An International number format should not have less than 7 digits"
      return {msg:msg}
    }
    return {res:true};

  }
  else if(phone[0]=="0"){
    //ug format
    var cn=Number(phone).toString();//check num
    if(cn=="NaN"){
      var msg="Only numbers are accepted"
      return {msg:msg}
    }
    if(phone.length!=10){
       msg="Ensure number makes 10 Digits"
      return {res:false,msg:msg};
    }
    var pref=phone.substring(0,3)
    if(pref=="076"||pref=="077"||pref=="075"||pref=="074"||pref=="071"||pref=="078"||pref=="070"||pref=="039"||pref=="074"||pref=="072"){
      //correct
      return {res:true};
    }
  }
  else{
    var cn=Number(phone).toString();//check num
    if(cn=="NaN"){
      var msg="Only numbers are accepted"
      return {msg:msg}
    }
    msg="International phone formats should start with '+' e.g. +256"
    return {msg:msg,res:false}
  }
}


function show_avatar(ava,id) {
    ava=host+"/images/"+ava

    $("#"+id).attr("src",ava)
}

function load_districts(districts,eid) {

  var op="<option></option>"

  for(var i=0;i<districts.length;i++){
    var district=districts[i].district;
    op+="<option value='"+district+"'>"+district+"</option>"
  }
  $("#"+eid).html(op)
}

function get_counties(district,ext,cb) {
  var data={rq:"get-counties",url:"/gen",district:district}
  ajax_go(data,function (rst) {
    var counties=rst.counties;
    var op="<option></option>"
    for(var i=0;i<counties.length;i++){
      var county=counties[i].county;
      op+="<option value='"+county+"'>"+county+"</option>"
    }

    $("#"+ext).html(op)
    if(cb)
      cb()
  })
}
function get_subcounties(district,county,ext,cb) {
  if(!ext)
    ext=""
  var data={rq:"get-subcounties",url:"/gen",district:district,county:county}
  ajax_go(data,function (rst) {
    var subcounties=rst.subcounties;
    var op="<option></option>"
    for(var i=0;i<subcounties.length;i++){
      var subcounty=subcounties[i].sub_county;
      op+="<option value='"+subcounty+"'>"+subcounty+"</option>"
    }
    $("#"+ext).html(op)
    if(cb)
      cb()
  })
}
function get_parishes(district,county,subcounty,ext,cb) {

  var data={rq:"get-parishes",url:"/gen",district:district,county:county,subcounty:subcounty}
  ajax_go(data,function (rst) {
    var parishes=rst.parishes;
    var op="<option></option>"
    for(var i=0;i<parishes.length;i++){
      var parish=parishes[i].parish;
      op+="<option value='"+parish+"'>"+parish+"</option>"
    }
    $("#"+ext).html(op)
   
    if(cb)
      cb()
  })
}
function district_changed(el,ext) {

  var district=$(el).val()
  adata.district=district;
  get_counties(district,ext)
}
function county_changed(el,ext) {
  var district=adata.district;
  var county=$(el).val()
  adata.county=county
  get_subcounties(district,county,ext)
}
function subcounty_changed(el,ext) {
  if(ext==0)
    ext=""
  var district=adata.district
  var county=adata.county
  var subcounty=$(el).val()
  adata.subcounty=subcounty
  get_parishes(district,county,subcounty,ext)
}
function populate_date(){
  var months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"]
  var op=""
  for(var i=2021;i>1939;i--){
    op+="<option value="+i+">"+i+"</option>"
  }
  $(".year").html(op)
  var op=""
  for(var i=0;i<months.length;i++){
    op+="<option value="+(i+1)+">"+months[i]+"</option>"
  }
  $(".month").html(op)
  var op=""
  for(var i=1;i<32;i++){
    op+="<option value="+i+">"+i+"</option>"
  }
  $(".day").html(op)
 
}

function populate_cs_day(){
  
  var months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"]
  var op="<option value='0'>Year</option>"
  for(var i=2022;i<2026;i++){
    op+="<option value="+i+">"+i+"</option>"
  }
  $(".cs-year").html(op)
  op="<option value='0'>Month</option>"
  for(var i=0;i<months.length;i++){
    op+="<option value="+(i+1)+">"+months[i]+"</option>"
  }
  $(".cs-month").html(op)
  var op="<option value='0'>Day</option>"
  for(var i=1;i<32;i++){
    op+="<option value="+i+">"+i+"</option>"
  }
  $(".cs-day").html(op)
  var op=""

}
 function populate_date(){
  var months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"]
  var op="<option value='0'>Year</option>"
  for(var i=2023;i>1939;i--){
    op+="<option value="+i+">"+i+"</option>"
  }
  $(".year").html(op)
  var op="<option value='0'>Month</option>"
  for(var i=0;i<months.length;i++){
    op+="<option value="+(i+1)+">"+months[i]+"</option>"
  }
  $(".month").html(op)
  var op="<option value='0'>Day</option>"
  for(var i=1;i<32;i++){
    op+="<option value="+i+">"+i+"</option>"
  }
  $(".day").html(op)
}


function validate_date(inputText)
  {
   
    if(inputText.length==0)
      return false
    var opera1 = inputText.split('/');
    var opera2 = inputText.split('-');
    lopera1 = opera1.length;
    lopera2 = opera2.length;
    // Extract the string into month, date and year
    if (lopera1>1)
    {
    var pdate = inputText.split('/');
    }
    else if (lopera2>1)
    {
     var pdate = inputText.split('-');
    }

    if(pdate[2]=="0"||pdate[1]=="0"||pdate[0]==""||pdate[0]<=0)
      return false
    var dd = parseInt(pdate[2]);
    var mm  = parseInt(pdate[1]);
    var yy = parseInt(pdate[0]);
    if(pdate[0].length!=4){
      return false;
    }


  // Create list of days of a month [assume there is no leap year by default]
    var ListofDays = [31,28,31,30,31,30,31,31,30,31,30,31];
    if (mm==1 || mm>2)
    {
      if (dd>ListofDays[mm-1])
      {
        return false;
      }
    }
    if (mm==2)
    {
      var lyear = false;
      if ( (!(yy % 4) && yy % 100) || !(yy % 400)) 
      {
        lyear = true;
      }
      if ((lyear==false) && (dd>=29))
      {
        
        return false;
      }
      if ((lyear==true) && (dd>29))
      {

     
      return false;

      }
    }

    return true;
  }

const countries = [
    {"code": "AF", "code3": "AFG", "name": "Afghanistan", "number": "004"},
    {"code": "AL", "code3": "ALB", "name": "Albania", "number": "008"},
    {"code": "DZ", "code3": "DZA", "name": "Algeria", "number": "012"},
    {"code": "AS", "code3": "ASM", "name": "American Samoa", "number": "016"},
    {"code": "AD", "code3": "AND", "name": "Andorra", "number": "020"},
    {"code": "AO", "code3": "AGO", "name": "Angola", "number": "024"},
    {"code": "AI", "code3": "AIA", "name": "Anguilla", "number": "660"},
    {"code": "AQ", "code3": "ATA", "name": "Antarctica", "number": "010"},
    {"code": "AG", "code3": "ATG", "name": "Antigua and Barbuda", "number": "028"},
    {"code": "AR", "code3": "ARG", "name": "Argentina", "number": "032"},
    {"code": "AM", "code3": "ARM", "name": "Armenia", "number": "051"},
    {"code": "AW", "code3": "ABW", "name": "Aruba", "number": "533"},
    {"code": "AU", "code3": "AUS", "name": "Australia", "number": "036"},
    {"code": "AT", "code3": "AUT", "name": "Austria", "number": "040"},
    {"code": "AZ", "code3": "AZE", "name": "Azerbaijan", "number": "031"},
    {"code": "BS", "code3": "BHS", "name": "Bahamas (the)", "number": "044"},
    {"code": "BH", "code3": "BHR", "name": "Bahrain", "number": "048"},
    {"code": "BD", "code3": "BGD", "name": "Bangladesh", "number": "050"},
    {"code": "BB", "code3": "BRB", "name": "Barbados", "number": "052"},
    {"code": "BY", "code3": "BLR", "name": "Belarus", "number": "112"},
    {"code": "BE", "code3": "BEL", "name": "Belgium", "number": "056"},
    {"code": "BZ", "code3": "BLZ", "name": "Belize", "number": "084"},
    {"code": "BJ", "code3": "BEN", "name": "Benin", "number": "204"},
    {"code": "BM", "code3": "BMU", "name": "Bermuda", "number": "060"},
    {"code": "BT", "code3": "BTN", "name": "Bhutan", "number": "064"},
    {"code": "BO", "code3": "BOL", "name": "Bolivia (Plurinational State of)", "number": "068"},
    {"code": "BQ", "code3": "BES", "name": "Bonaire, Sint Eustatius and Saba", "number": "535"},
    {"code": "BA", "code3": "BIH", "name": "Bosnia and Herzegovina", "number": "070"},
    {"code": "BW", "code3": "BWA", "name": "Botswana", "number": "072"},
    {"code": "BV", "code3": "BVT", "name": "Bouvet Island", "number": "074"},
    {"code": "BR", "code3": "BRA", "name": "Brazil", "number": "076"},
    {"code": "IO", "code3": "IOT", "name": "British Indian Ocean Territory (the)", "number": "086"},
    {"code": "BN", "code3": "BRN", "name": "Brunei Darussalam", "number": "096"},
    {"code": "BG", "code3": "BGR", "name": "Bulgaria", "number": "100"},
    {"code": "BF", "code3": "BFA", "name": "Burkina Faso", "number": "854"},
    {"code": "BI", "code3": "BDI", "name": "Burundi", "number": "108"},
    {"code": "CV", "code3": "CPV", "name": "Cabo Verde", "number": "132"},
    {"code": "KH", "code3": "KHM", "name": "Cambodia", "number": "116"},
    {"code": "CM", "code3": "CMR", "name": "Cameroon", "number": "120"},
    {"code": "CA", "code3": "CAN", "name": "Canada", "number": "124"},
    {"code": "KY", "code3": "CYM", "name": "Cayman Islands (the)", "number": "136"},
    {"code": "CF", "code3": "CAF", "name": "Central African Republic (the)", "number": "140"},
    {"code": "TD", "code3": "TCD", "name": "Chad", "number": "148"},
    {"code": "CL", "code3": "CHL", "name": "Chile", "number": "152"},
    {"code": "CN", "code3": "CHN", "name": "China", "number": "156"},
    {"code": "CX", "code3": "CXR", "name": "Christmas Island", "number": "162"},
    {"code": "CC", "code3": "CCK", "name": "Cocos (Keeling) Islands (the)", "number": "166"},
    {"code": "CO", "code3": "COL", "name": "Colombia", "number": "170"},
    {"code": "KM", "code3": "COM", "name": "Comoros (the)", "number": "174"},
    {"code": "CD", "code3": "COD", "name": "Congo (the Democratic Republic of the)", "number": "180"},
    {"code": "CG", "code3": "COG", "name": "Congo (the)", "number": "178"},
    {"code": "CK", "code3": "COK", "name": "Cook Islands (the)", "number": "184"},
    {"code": "CR", "code3": "CRI", "name": "Costa Rica", "number": "188"},
    {"code": "HR", "code3": "HRV", "name": "Croatia", "number": "191"},
    {"code": "CU", "code3": "CUB", "name": "Cuba", "number": "192"},
    {"code": "CW", "code3": "CUW", "name": "Curaçao", "number": "531"},
    {"code": "CY", "code3": "CYP", "name": "Cyprus", "number": "196"},
    {"code": "CZ", "code3": "CZE", "name": "Czechia", "number": "203"},
    {"code": "CI", "code3": "CIV", "name": "Côte d'Ivoire", "number": "384"},
    {"code": "DK", "code3": "DNK", "name": "Denmark", "number": "208"},
    {"code": "DJ", "code3": "DJI", "name": "Djibouti", "number": "262"},
    {"code": "DM", "code3": "DMA", "name": "Dominica", "number": "212"},
    {"code": "DO", "code3": "DOM", "name": "Dominican Republic (the)", "number": "214"},
    {"code": "EC", "code3": "ECU", "name": "Ecuador", "number": "218"},
    {"code": "EG", "code3": "EGY", "name": "Egypt", "number": "818"},
    {"code": "SV", "code3": "SLV", "name": "El Salvador", "number": "222"},
    {"code": "GQ", "code3": "GNQ", "name": "Equatorial Guinea", "number": "226"},
    {"code": "ER", "code3": "ERI", "name": "Eritrea", "number": "232"},
    {"code": "EE", "code3": "EST", "name": "Estonia", "number": "233"},
    {"code": "SZ", "code3": "SWZ", "name": "Eswatini", "number": "748"},
    {"code": "ET", "code3": "ETH", "name": "Ethiopia", "number": "231"},
    {"code": "FK", "code3": "FLK", "name": "Falkland Islands (the) [Malvinas]", "number": "238"},
    {"code": "FO", "code3": "FRO", "name": "Faroe Islands (the)", "number": "234"},
    {"code": "FJ", "code3": "FJI", "name": "Fiji", "number": "242"},
    {"code": "FI", "code3": "FIN", "name": "Finland", "number": "246"},
    {"code": "FR", "code3": "FRA", "name": "France", "number": "250"},
    {"code": "GF", "code3": "GUF", "name": "French Guiana", "number": "254"},
    {"code": "PF", "code3": "PYF", "name": "French Polynesia", "number": "258"},
    {"code": "TF", "code3": "ATF", "name": "French Southern Territories (the)", "number": "260"},
    {"code": "GA", "code3": "GAB", "name": "Gabon", "number": "266"},
    {"code": "GM", "code3": "GMB", "name": "Gambia (the)", "number": "270"},
    {"code": "GE", "code3": "GEO", "name": "Georgia", "number": "268"},
    {"code": "DE", "code3": "DEU", "name": "Germany", "number": "276"},
    {"code": "GH", "code3": "GHA", "name": "Ghana", "number": "288"},
    {"code": "GI", "code3": "GIB", "name": "Gibraltar", "number": "292"},
    {"code": "GR", "code3": "GRC", "name": "Greece", "number": "300"},
    {"code": "GL", "code3": "GRL", "name": "Greenland", "number": "304"},
    {"code": "GD", "code3": "GRD", "name": "Grenada", "number": "308"},
    {"code": "GP", "code3": "GLP", "name": "Guadeloupe", "number": "312"},
    {"code": "GU", "code3": "GUM", "name": "Guam", "number": "316"},
    {"code": "GT", "code3": "GTM", "name": "Guatemala", "number": "320"},
    {"code": "GG", "code3": "GGY", "name": "Guernsey", "number": "831"},
    {"code": "GN", "code3": "GIN", "name": "Guinea", "number": "324"},
    {"code": "GW", "code3": "GNB", "name": "Guinea-Bissau", "number": "624"},
    {"code": "GY", "code3": "GUY", "name": "Guyana", "number": "328"},
    {"code": "HT", "code3": "HTI", "name": "Haiti", "number": "332"},
    {"code": "HM", "code3": "HMD", "name": "Heard Island and McDonald Islands", "number": "334"},
    {"code": "VA", "code3": "VAT", "name": "Holy See (the)", "number": "336"},
    {"code": "HN", "code3": "HND", "name": "Honduras", "number": "340"},
    {"code": "HK", "code3": "HKG", "name": "Hong Kong", "number": "344"},
    {"code": "HU", "code3": "HUN", "name": "Hungary", "number": "348"},
    {"code": "IS", "code3": "ISL", "name": "Iceland", "number": "352"},
    {"code": "IN", "code3": "IND", "name": "India", "number": "356"},
    {"code": "ID", "code3": "IDN", "name": "Indonesia", "number": "360"},
    {"code": "IR", "code3": "IRN", "name": "Iran (Islamic Republic of)", "number": "364"},
    {"code": "IQ", "code3": "IRQ", "name": "Iraq", "number": "368"},
    {"code": "IE", "code3": "IRL", "name": "Ireland", "number": "372"},
    {"code": "IM", "code3": "IMN", "name": "Isle of Man", "number": "833"},
    {"code": "IL", "code3": "ISR", "name": "Israel", "number": "376"},
    {"code": "IT", "code3": "ITA", "name": "Italy", "number": "380"},
    {"code": "JM", "code3": "JAM", "name": "Jamaica", "number": "388"},
    {"code": "JP", "code3": "JPN", "name": "Japan", "number": "392"},
    {"code": "JE", "code3": "JEY", "name": "Jersey", "number": "832"},
    {"code": "JO", "code3": "JOR", "name": "Jordan", "number": "400"},
    {"code": "KZ", "code3": "KAZ", "name": "Kazakhstan", "number": "398"},
    {"code": "KE", "code3": "KEN", "name": "Kenya", "number": "404"},
    {"code": "KI", "code3": "KIR", "name": "Kiribati", "number": "296"},
    {"code": "KP", "code3": "PRK", "name": "Korea (the Democratic People's Republic of)", "number": "408"},
    {"code": "KR", "code3": "KOR", "name": "Korea (the Republic of)", "number": "410"},
    {"code": "KW", "code3": "KWT", "name": "Kuwait", "number": "414"},
    {"code": "KG", "code3": "KGZ", "name": "Kyrgyzstan", "number": "417"},
    {"code": "LA", "code3": "LAO", "name": "Lao People's Democratic Republic (the)", "number": "418"},
    {"code": "LV", "code3": "LVA", "name": "Latvia", "number": "428"},
    {"code": "LB", "code3": "LBN", "name": "Lebanon", "number": "422"},
    {"code": "LS", "code3": "LSO", "name": "Lesotho", "number": "426"},
    {"code": "LR", "code3": "LBR", "name": "Liberia", "number": "430"},
    {"code": "LY", "code3": "LBY", "name": "Libya", "number": "434"},
    {"code": "LI", "code3": "LIE", "name": "Liechtenstein", "number": "438"},
    {"code": "LT", "code3": "LTU", "name": "Lithuania", "number": "440"},
    {"code": "LU", "code3": "LUX", "name": "Luxembourg", "number": "442"},
    {"code": "MO", "code3": "MAC", "name": "Macao", "number": "446"},
    {"code": "MG", "code3": "MDG", "name": "Madagascar", "number": "450"},
    {"code": "MW", "code3": "MWI", "name": "Malawi", "number": "454"},
    {"code": "MY", "code3": "MYS", "name": "Malaysia", "number": "458"},
    {"code": "MV", "code3": "MDV", "name": "Maldives", "number": "462"},
    {"code": "ML", "code3": "MLI", "name": "Mali", "number": "466"},
    {"code": "MT", "code3": "MLT", "name": "Malta", "number": "470"},
    {"code": "MH", "code3": "MHL", "name": "Marshall Islands (the)", "number": "584"},
    {"code": "MQ", "code3": "MTQ", "name": "Martinique", "number": "474"},
    {"code": "MR", "code3": "MRT", "name": "Mauritania", "number": "478"},
    {"code": "MU", "code3": "MUS", "name": "Mauritius", "number": "480"},
    {"code": "YT", "code3": "MYT", "name": "Mayotte", "number": "175"},
    {"code": "MX", "code3": "MEX", "name": "Mexico", "number": "484"},
    {"code": "FM", "code3": "FSM", "name": "Micronesia (Federated States of)", "number": "583"},
    {"code": "MD", "code3": "MDA", "name": "Moldova (the Republic of)", "number": "498"},
    {"code": "MC", "code3": "MCO", "name": "Monaco", "number": "492"},
    {"code": "MN", "code3": "MNG", "name": "Mongolia", "number": "496"},
    {"code": "ME", "code3": "MNE", "name": "Montenegro", "number": "499"},
    {"code": "MS", "code3": "MSR", "name": "Montserrat", "number": "500"},
    {"code": "MA", "code3": "MAR", "name": "Morocco", "number": "504"},
    {"code": "MZ", "code3": "MOZ", "name": "Mozambique", "number": "508"},
    {"code": "MM", "code3": "MMR", "name": "Myanmar", "number": "104"},
    {"code": "NA", "code3": "NAM", "name": "Namibia", "number": "516"},
    {"code": "NR", "code3": "NRU", "name": "Nauru", "number": "520"},
    {"code": "NP", "code3": "NPL", "name": "Nepal", "number": "524"},
    {"code": "NL", "code3": "NLD", "name": "Netherlands (the)", "number": "528"},
    {"code": "NC", "code3": "NCL", "name": "New Caledonia", "number": "540"},
    {"code": "NZ", "code3": "NZL", "name": "New Zealand", "number": "554"},
    {"code": "NI", "code3": "NIC", "name": "Nicaragua", "number": "558"},
    {"code": "NE", "code3": "NER", "name": "Niger (the)", "number": "562"},
    {"code": "NG", "code3": "NGA", "name": "Nigeria", "number": "566"},
    {"code": "NU", "code3": "NIU", "name": "Niue", "number": "570"},
    {"code": "NF", "code3": "NFK", "name": "Norfolk Island", "number": "574"},
    {"code": "MP", "code3": "MNP", "name": "Northern Mariana Islands (the)", "number": "580"},
    {"code": "NO", "code3": "NOR", "name": "Norway", "number": "578"},
    {"code": "OM", "code3": "OMN", "name": "Oman", "number": "512"},
    {"code": "PK", "code3": "PAK", "name": "Pakistan", "number": "586"},
    {"code": "PW", "code3": "PLW", "name": "Palau", "number": "585"},
    {"code": "PS", "code3": "PSE", "name": "Palestine, State of", "number": "275"},
    {"code": "PA", "code3": "PAN", "name": "Panama", "number": "591"},
    {"code": "PG", "code3": "PNG", "name": "Papua New Guinea", "number": "598"},
    {"code": "PY", "code3": "PRY", "name": "Paraguay", "number": "600"},
    {"code": "PE", "code3": "PER", "name": "Peru", "number": "604"},
    {"code": "PH", "code3": "PHL", "name": "Philippines (the)", "number": "608"},
    {"code": "PN", "code3": "PCN", "name": "Pitcairn", "number": "612"},
    {"code": "PL", "code3": "POL", "name": "Poland", "number": "616"},
    {"code": "PT", "code3": "PRT", "name": "Portugal", "number": "620"},
    {"code": "PR", "code3": "PRI", "name": "Puerto Rico", "number": "630"},
    {"code": "QA", "code3": "QAT", "name": "Qatar", "number": "634"},
    {"code": "MK", "code3": "MKD", "name": "Republic of North Macedonia", "number": "807"},
    {"code": "RO", "code3": "ROU", "name": "Romania", "number": "642"},
    {"code": "RU", "code3": "RUS", "name": "Russian Federation (the)", "number": "643"},
    {"code": "RW", "code3": "RWA", "name": "Rwanda", "number": "646"},
    {"code": "RE", "code3": "REU", "name": "Réunion", "number": "638"},
    {"code": "BL", "code3": "BLM", "name": "Saint Barthélemy", "number": "652"},
    {"code": "SH", "code3": "SHN", "name": "Saint Helena, Ascension and Tristan da Cunha", "number": "654"},
    {"code": "KN", "code3": "KNA", "name": "Saint Kitts and Nevis", "number": "659"},
    {"code": "LC", "code3": "LCA", "name": "Saint Lucia", "number": "662"},
    {"code": "MF", "code3": "MAF", "name": "Saint Martin (French part)", "number": "663"},
    {"code": "PM", "code3": "SPM", "name": "Saint Pierre and Miquelon", "number": "666"},
    {"code": "VC", "code3": "VCT", "name": "Saint Vincent and the Grenadines", "number": "670"},
    {"code": "WS", "code3": "WSM", "name": "Samoa", "number": "882"},
    {"code": "SM", "code3": "SMR", "name": "San Marino", "number": "674"},
    {"code": "ST", "code3": "STP", "name": "Sao Tome and Principe", "number": "678"},
    {"code": "SA", "code3": "SAU", "name": "Saudi Arabia", "number": "682"},
    {"code": "SN", "code3": "SEN", "name": "Senegal", "number": "686"},
    {"code": "RS", "code3": "SRB", "name": "Serbia", "number": "688"},
    {"code": "SC", "code3": "SYC", "name": "Seychelles", "number": "690"},
    {"code": "SL", "code3": "SLE", "name": "Sierra Leone", "number": "694"},
    {"code": "SG", "code3": "SGP", "name": "Singapore", "number": "702"},
    {"code": "SX", "code3": "SXM", "name": "Sint Maarten (Dutch part)", "number": "534"},
    {"code": "SK", "code3": "SVK", "name": "Slovakia", "number": "703"},
    {"code": "SI", "code3": "SVN", "name": "Slovenia", "number": "705"},
    {"code": "SB", "code3": "SLB", "name": "Solomon Islands", "number": "090"},
    {"code": "SO", "code3": "SOM", "name": "Somalia", "number": "706"},
    {"code": "ZA", "code3": "ZAF", "name": "South Africa", "number": "710"},
    {"code": "GS", "code3": "SGS", "name": "South Georgia and the South Sandwich Islands", "number": "239"},
    {"code": "SS", "code3": "SSD", "name": "South Sudan", "number": "728"},
    {"code": "ES", "code3": "ESP", "name": "Spain", "number": "724"},
    {"code": "LK", "code3": "LKA", "name": "Sri Lanka", "number": "144"},
    {"code": "SD", "code3": "SDN", "name": "Sudan (the)", "number": "729"},
    {"code": "SR", "code3": "SUR", "name": "Suriname", "number": "740"},
    {"code": "SJ", "code3": "SJM", "name": "Svalbard and Jan Mayen", "number": "744"},
    {"code": "SE", "code3": "SWE", "name": "Sweden", "number": "752"},
    {"code": "CH", "code3": "CHE", "name": "Switzerland", "number": "756"},
    {"code": "SY", "code3": "SYR", "name": "Syrian Arab Republic", "number": "760"},
    {"code": "TW", "code3": "TWN", "name": "Taiwan", "number": "158"},
    {"code": "TJ", "code3": "TJK", "name": "Tajikistan", "number": "762"},
    {"code": "TZ", "code3": "TZA", "name": "Tanzania, United Republic of", "number": "834"},
    {"code": "TH", "code3": "THA", "name": "Thailand", "number": "764"},
    {"code": "TL", "code3": "TLS", "name": "Timor-Leste", "number": "626"},
    {"code": "TG", "code3": "TGO", "name": "Togo", "number": "768"},
    {"code": "TK", "code3": "TKL", "name": "Tokelau", "number": "772"},
    {"code": "TO", "code3": "TON", "name": "Tonga", "number": "776"},
    {"code": "TT", "code3": "TTO", "name": "Trinidad and Tobago", "number": "780"},
    {"code": "TN", "code3": "TUN", "name": "Tunisia", "number": "788"},
    {"code": "TR", "code3": "TUR", "name": "Turkey", "number": "792"},
    {"code": "TM", "code3": "TKM", "name": "Turkmenistan", "number": "795"},
    {"code": "TC", "code3": "TCA", "name": "Turks and Caicos Islands (the)", "number": "796"},
    {"code": "TV", "code3": "TUV", "name": "Tuvalu", "number": "798"},
    {"code": "UG", "code3": "UGA", "name": "Uganda", "number": "800"},
    {"code": "UA", "code3": "UKR", "name": "Ukraine", "number": "804"},
    {"code": "AE", "code3": "ARE", "name": "United Arab Emirates (the)", "number": "784"},
    {"code": "GB", "code3": "GBR", "name": "United Kingdom of Great Britain and Northern Ireland (the)", "number": "826"},
    {"code": "UM", "code3": "UMI", "name": "United States Minor Outlying Islands (the)", "number": "581"},
    {"code": "US", "code3": "USA", "name": "United States of America (the)", "number": "840"},
    {"code": "UY", "code3": "URY", "name": "Uruguay", "number": "858"},
    {"code": "UZ", "code3": "UZB", "name": "Uzbekistan", "number": "860"},
    {"code": "VU", "code3": "VUT", "name": "Vanuatu", "number": "548"},
    {"code": "VE", "code3": "VEN", "name": "Venezuela (Bolivarian Republic of)", "number": "862"},
    {"code": "VN", "code3": "VNM", "name": "Viet Nam", "number": "704"},
    {"code": "VG", "code3": "VGB", "name": "Virgin Islands (British)", "number": "092"},
    {"code": "VI", "code3": "VIR", "name": "Virgin Islands (U.S.)", "number": "850"},
    {"code": "WF", "code3": "WLF", "name": "Wallis and Futuna", "number": "876"},
    {"code": "EH", "code3": "ESH", "name": "Western Sahara", "number": "732"},
    {"code": "YE", "code3": "YEM", "name": "Yemen", "number": "887"},
    {"code": "ZM", "code3": "ZMB", "name": "Zambia", "number": "894"},
    {"code": "ZW", "code3": "ZWE", "name": "Zimbabwe", "number": "716"},
    {"code": "AX", "code3": "ALA", "name": "Åland Islands", "number": "248"}
];

function load_countries(eid) {
  var op="<option></option>"

  for(var i=0;i<countries.length;i++){
    var country=countries[i].name;

    if(country=="Uganda"){

      op+="<option  value='"+country+"'>"+country+"</option>"
    }
    else
      op+="<option value='"+country+"'>"+country+"</option>"
  }
  $(".country").html(op)

}

function pop_login(argument) {
  $("#renew-session-div").modal("show")
}
function ajax_file(data,callback,rerr) {
    url=host+adata.url
   
    data.append("pg",adata.pg)
   
    $(".loading-div,#progress-bar-div").show()
    $(".progress-bar").html('0%');

    /*if(adata.disable_submit==1){
      display_err("There was a connection problem during your last submission. We are refreshing the current page")
      return window.location=url+"?pg="+adata.pg
    }*/
   
    $.ajax({
        xhr: function() {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = Math.round(((evt.loaded / evt.total) * 100));
                        $(".progress-bar").width(percentComplete + '%');
                        $(".progress-bar").html(percentComplete+'%');
                    }
                }, false);
                return xhr;
        },
        contentType: false,
        url:url,
        type:"POST",
        data:data,
        dataType:'json',
        processData:false,
        success: function(res) {
          adata.disable_submit=0
            $(".loading-div,#progress-bar-div").hide()
            $("#dxfiles,#photo-msg").val("")
            $("#loading-text").text("Connecting...")
           
            if(res.errmsg){
              
              if(res.et=="session-expired"){
                    $("#new-session-username").val(adata.me.username)
                    //$(".modal").modal("hide")
      
                    $("#renew-session-div").modal("show")
              }
              session_timer()
              if(rerr){
                //return error
                callback(0)
              }

              return display_err(res.errmsg)
            }
            
            callback(res)
        },
        error  : function(err) {
            //console.log(err);
            display_err("There seems to be a connection problem, please try again",60000)
            $(".loading-div,#progress-bar-div").hide()
            $("#loading-text").text("Connecting...")
            $("#pp").val("")
            //console.log("Oops! looks like you offline.")
            if(rerr)
              callback(0)
        },
        timeout:100000
    });
}
function validate_file(files,format,ext){
    //ext; accepted format
    
    for(var i=0;i<files.length;i++){

        var type=files[i].type.split("/")[0]
        
        if(format=="Audio"&&type!="audio"){
            display_err("Select only audio files")
            return 0
        }
        else if(format=="Video"&&type!="video"){
            display_err("Select only video files")
            return 0
        }
        else if(format=="Document"){
            var type=files[i].type.split("/")[1]
            
            if(type=="pdf"||type=="msword"||type=="vnd.openxmlformats-officedocument.wordprocessingml.document")
                ;
            else{
                display_err("Select only PDF or MS Word files")
                return 0
            }
        }
        else if(format=="pdf"){

            var type=files[i].type.split("/")[1]

            if(type=="pdf")
                ;
            else{
                display_err("Only PDF files accepted")
                return 0
            }
        }

        else if(format=="Image"&&type!="image"){
            
            display_err("Select only image files.")
            return 0
        }
        
    }
    
    return 1;
}
function resize_img(i,ndxfiles,imgObj,swidth,sheight,callback) { 
    //sheight=set height;
    const reader = new FileReader()
    const fileName=imgObj[i].name;
    reader.readAsDataURL(imgObj[i]);
    reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function(event){
                
                  var width=img.width;
                  var height=img.height;

                  var dm=0;//dimentions modified
                  if(height>swidth){

                    if(height>1){
                        width*=(sheight/height)
                         height=sheight
                         dm=1

                    }
                  }
                  else{
                    if(width>swidth){
                        dm=1
                        height*=(swidth/width)
                        width=swidth
                    }
                  }
                
                  const elem = document.createElement('canvas');
                  elem.width = width;
                  elem.height = height;
                  const ctx = elem.getContext('2d');

                  // img.width and img.height will contain the original dimensions
                  ctx.drawImage(img, 0, 0, width, height)
                  var cm=1//compression ratio

                  /*if(dm)
                    cm=0.8*/

                ctx.canvas.toBlob(function(blob){  
                       
                    const file = new File([blob], fileName, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    ndxfiles[i]=file;

                    if(i==imgObj.length-1)
                        return callback(ndxfiles)
                    resize_img(++i,ndxfiles,imgObj,swidth,sheight,callback)
                        
                }, 'image/jpeg', cm);
            }
            
    }
    reader.onerror = function(error){alert("error");}

}

function clear_fields() {

    $('input[type="text"').val("")
    $('input[type="number"').val("")
    $('input[type="file"').val("")
    $('input[type="tel"').val("")
    $('input[type="password"').val("")
    $("select").val("0")
    $("textarea").val("")
    $('textarea').each(function(k, v) {
    try{tinyMCE.get(k).setContent('');}catch(e){}
  });
}

function load_select(rst,vf,lf,eid){
  //vf value field; lf label field, eid, element id
  var op="<option value='0'></option>"
  for(var i=0;i<rst.length;i++){
    var val=rst[i][vf];

    if(lf==0)
      lf=vf;
    var lb=rst[i][lf];
    op+="<option value=\""+val+"\">"+lb+"</option>"
  }
  $(eid).html(op)
  $('select').formSelect();
}
function img_err(sex,t) {

  if(sex=="Male")
    $(t).attr("src","/images/male-ava.JPG")
  else if(sex=="Female")
    $(t).attr("src","/images/female-ava.JPG")
  else if(sex=="nof"){
    $(t).attr("src","/images/notice.png")
  }
  else{
    $(t).attr("src","/images/gen-ava.jpg")
  }
}
function reset_password_dl(){
  $("#reset-password-div").modal("show")

}
function reset_password(){
  var old_pass=$("#old-pass").val()
  var new_pass=$("#new-pass").val()
  //Reset password for logged in uses; lg
  if(new_pass.length<6)
      return display_err("Password should be 6 characters or more")
  var data={rq:"reset-password",old_pass:old_pass,new_pass:new_pass}
  ajax_go(data,function (rst) {
    clear_fields()
    $("#reset-password-div").modal("hide")
    display_succ("Password reset succesfully")
  })

}

try{
tinymce.init({
        selector: '.tinymce',

         paste_as_text: true,
        plugins: [
          'autolink',
          'lists','link','image','charmap','preview','anchor','searchreplace','visualblocks',
          'fullscreen','insertdatetime','media','table','wordcount'
        ],
        toolbar: 'undo redo | bold italic backcolor | ' +
          'alignleft aligncenter alignright alignjustify | ' +
          'bullist numlist checklist outdent indent | removeformat | a11ycheck code'
        ,
        toolbar_mode:"wrap",
        menubar:false
});
}
catch(e){
  
}

function init_tinymce() {

 try{
    tinymce.remove('.tinymce-min');
    tinymce.init({
            selector: '.tinymce-min',
            height:200,

             paste_as_text: true,
            plugins: [
              'autolink',
              'lists','link','image','charmap','preview','anchor','searchreplace','visualblocks',
              'fullscreen','insertdatetime','media','table','wordcount'
            ],
            toolbar: 'undo redo | bold italic backcolor | ' +
              'alignleft aligncenter alignright alignjustify | ' +
              'bullist numlist checklist outdent indent | removeformat | a11ycheck code'
            ,
            toolbar_mode:"wrap",
            menubar:false
    });
  }
  catch(e){
    //console.log(e)
  }
}
init_tinymce()


var lm=20
function pager(eid,os,rs,count) {
  var page=(os+lm)/lm;
  if(count==0)
    $("#"+eid+"-os").hide()
  else
    $("#"+eid+"-os").show()
  var tpage=Math.ceil((count/lm))
  var rtxt=" records"
  if(count==1)
    rtxt=" record"
  $("#"+eid+"-os").text(page+" of "+tpage+" ("+count+rtxt+")")
  adata.os=os
  $("#"+eid+"-next").hide()
  $("#"+eid+"-prev").hide()

  if(page<tpage){
    $("#"+eid+"-next").show()

  }
  if(os){
    $("#"+eid+"-prev").show()
  }
}
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}


function validate_start_end_dates(start,end,msg,sa) {
  //sa same date allowed
  var a=moment(start)
  var b=moment(end)
  var diff=b.diff(a)
  
  if(sa&&diff<0){
      if(!msg)
       var msg="The end time should be set to a date equal to or greater than start time"
      display_err(msg)
      return 0;
  }
  else if(!sa&&diff<=0){
      if(!msg)
        var msg="The end time should be greater than start time"

      display_err(msg)
      return 0;
  }
  return 1
  
}

function show_password(id) {
  var tp=$("#"+id).attr("type");
  if(tp=="password"){
    $("#"+id).attr("type","text")
    $("#"+id+"-eye").attr("class","fa fa-eye")
  }
  else{
    $("#"+id).attr("type","password")
    $("#"+id+"-eye").attr("class","fa fa-eye-slash")
  }
  
}
function load_badges(rst) {
  // body...
  var pending_las=rst.pending_las
  if(pending_las){
    $("#pending-las").text(pending_las)
  }
  else if(pending_las==0){
    $("#pending-las").text("")
  }
  var pending=rst.pending
  if(pending){
    $("#pending-bio").text(pending)
  }
  else if(pending==0){
    $("#pending-bio").text("")
  }
}


// System for American Numbering 
var th_val = ['', 'thousand', 'million', 'billion', 'trillion'];
// System for uncomment this line for Number of English 
// var th_val = ['','thousand','million', 'milliard','billion'];
 
var dg_val = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
var tn_val = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
var tw_val = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function n2w(s) {
  s = s.toString();
    s = s.replace(/[\, ]/g, '');
    if (s != parseFloat(s))
        return 'not a number ';
    var x_val = s.indexOf('.');
    if (x_val == -1)
        x_val = s.length;
    if (x_val > 15)
        return 'too big';
    var n_val = s.split('');
    var str_val = '';
    var sk_val = 0;
    for (var i = 0; i < x_val; i++) {
        if ((x_val - i) % 3 == 2) {
            if (n_val[i] == '1') {
                str_val += tn_val[Number(n_val[i + 1])] + ' ';
                i++;
                sk_val = 1;
            } else if (n_val[i] != 0) {
                str_val += tw_val[n_val[i] - 2] + ' ';
                sk_val = 1;
            }
        } else if (n_val[i] != 0) {
            str_val += dg_val[n_val[i]] + ' ';
            if ((x_val - i) % 3 == 0)
                str_val += 'hundred ';
            sk_val = 1;
        }
        if ((x_val - i) % 3 == 1) {
            if (sk_val)
                str_val += th_val[(x_val - i - 1) / 3] + ' ';
            sk_val = 0;
        }
    }
    if (x_val != s.length) {
        var y_val = s.length;
        str_val += 'point ';
        for (var i = x_val + 1; i < y_val; i++)
            str_val += dg_val[n_val[i]] + ' ';
    }
    return str_val.replace(/\s+/g, ' ');
}



function view_roles() {
  $("#roles-modal").modal("show")
}
function switch_role(priv,dept_id) {
  if(dept_id)
    window.location="switch?priv="+priv+"&dept_id="+dept_id
  else
     window.location="switch?priv="+priv

}

function view_guide(vid) {
  if(vid=="list"){
    $("#guide-links-div").show()
     $("#iframe-div").hide()
     $("#guide-iframe").attr('src', $("#guide-iframe").attr('src'));
     $("#back-btn-td").hide()
  }
  else{
    $("#guide-links-div").hide()
    $("#iframe-div").show()
    $("#guide-iframe").attr("src","https://youtube.com/embed/"+vid)
     $("#back-btn-td").show()
  }
  $("#guide-modal").modal("show")
}

var stopVideo = function (iframe) {
  
  $("#guide-iframe").attr('src', $("#guide-iframe").attr('src'));
};


function get_access_res() {
  var data=prep_data([])
  data.rq="access-res"
  data.url="/ar";//access restrictions
  ajax_go(data,function (rst) {
    
    var ar=rst.accres;
    adata.ar=ar;//access restricts
    for(var i=0;i<ar.length;i++){
      if(ar[i].axn_text=="Contract Renewal HRD")
        adata.hrd=1
      if(ar[i].axn_text=="Contract Renewal"&&ar[i].priv=="hr")
        adata.hrr=1
      $("#"+ar[i].axn_code+"-link").show()
    }
  })
}


function load_leave_approvals(leave) {
  $("#approval-div").show()
  if(leave.hodname||leave.deanname||leave.psname)
    var tb="<hr><h5 class='bld'>Approvals</h5><table class='table'><tr><td class='bld'>Role</td><td class='bld'>Name</td><td class='bld'>Date</td></tr>"
  else
    return $("#approval-div").html("No approvals made")
  if(leave.hodname)
    tb+="<tr><td>"+leave.rtitle+"</td><td>"+leave.hodname+"</td><td>"+leave.hodaxn_date+"</td></tr>"
  if(leave.deanname&&leave.rptitle)
    tb+="<tr><td>"+leave.rptitle+"</td><td>"+leave.deanname+"</td><td>"+leave.deanaxn_date+"</td></tr>"
  if(leave.deanname&&(leave.rtitle&&!leave.rptitle))
    tb+="<tr><td>"+leave.rtitle+"</td><td>"+leave.deanname+"</td><td>"+leave.deanaxn_date+"</td></tr>"
  if(leave.psname)
    tb+="<tr><td>Principal</td><td>"+leave.psname+"</td><td>"+leave.psaxn_date+"</td></tr>"
  tb+="</table>"
  $("#approval-div").html(tb)
}


function get_rdept_ns(purpose) {
  //no status
  var dp=0
  var hodtitle=adata.me.hodtitle
  var hodaccess=adata.me.hodaccess
  var rdept_id=adata.me.contract_dept
  var roles=adata.me.roles;
  var rtitle=hodtitle
  var hdept_id=0
  var role_name=0
  for(var i=0;i<roles.length;i++){
    var role=roles[i].priv;
    if(role=="dean"){
      rdept_id=0
      var rtitle="Principal";//reporting department head's title
      hdept_id=roles[i].dept_id;
      role_name=roles[i].name
      adata.dp=roles[i].dp
      break;
    }
    if(role=="hdm"){
      role="hdm";
      hdept_id=roles[i].dept_id;//department being headed
      var phtitle=roles[i].phtitle//faculty
      var rdept_id=roles[i].pdid; 
      var paccess=roles[i].paccess
      role_name=roles[i].name
      adata.dp=roles[i].dp
      break;
    }
  }
  if(role=="hdm"&&adata.me.contract_dept==hdept_id&&(adata.me.cat=="Administrative"||adata.me.cat=="Support")){
    rtitle="Principal"
    var rdept_id=0
  }
  else if(role=="hdm"&&adata.me.contract_dept==hdept_id&&adata.me.cat=="Academic"){
    status="Pending Approval of "+phtitle;
    rtitle=phtitle
    
  }
  else if(role=="hdm"&&paccess=="dean"){
    //HOD of an academic dept, but contract elsewhere
    rtitle=phtitle
  }
  else if(role=="hdm"){
    var rdept_id=0
  }

  else if(role=="hdm"){
    var rdept_id=adata.me.contract_dept
  }
  adata.lstatus=status
  adata.rdept_id=rdept_id;
  adata.hdept_id=hdept_id
  adata.role_name=role_name
  adata.rtitle=rtitle
  if(adata.me.deputy_dean){
    adata.rdept_id=adata.me.deputy_dean//ID of faculty where one is deputy dean
  }
}


//fix array object after
function fix_arrob(arr,obj,before) {
  var narr=[]; var k=0;
  for(var i=0;i<arr.length;i++){
    if(arr[i].fn==before){
      narr[k++]=obj;
      narr[k++]=arr[i]
    }
    else
      narr[k++]=arr[i]
  }
  return narr;
}
function remove_arrob(arr,rarr) {
  var narr=[]; var k=0;
  for(var i=0;i<arr.length;i++){
    var f=0;
    for(var j=0;j<rarr.length;j++){
        if(arr[i].fn==rarr[j]){
          var f=1;
        }
    }
    if(f==0)
      narr[k++]=arr[i]

  }
  return narr;
}

function refresh_user() {
  var data={url:"/refresh"}
  ajax_go(data,function (rst) {
    var roles=rst.roles;
    adata.me=rst.user
    var li=""
    for(var i=0;i<roles.length;i++){
      rn=roles[i].name;
      dept_id=roles[i].dept_id;
      priv=roles[i].priv
      li+="<li href='#' class='list-group-item' style='cursor:pointer' onclick=\"switch_role('"+priv+"',"+dept_id+")\">"+rn+"</li>"
    }
    $("#roles-list").html(li)
    display_succ("User data refreshed")
  })
}

  function gen_we_n_hol(dt,dur,leave_type) {
  var we=[];var k=0;

  if((leave_type=="Sick Leave"||leave_type=="Compassionate Leave"||leave_type=="Leave without Pay"||leave_type=="Special Leave"))
    return we;
  var d=0;
  var hols=adata.hols

  var p=0
  while(1){

    if(d==dur){
      return we;
      break;
    }
    var result=new Date(dt)

    result.setDate(result.getDate() +p);

    var day=result.getDay()
    
    var hol=check_is_hol(result,hols)
    if(day==6||day==0){
      if(day==6)
          var day_f="Saturday"
        else if(day==0)
            var day_f="Sunday"
        var vl=result.getFullYear()+"-"+(result.getMonth()+1)+"-"+result.getDate()
        we[k++]={day:vl,lb:"Weekend, "+day_f};
    }
    else if(hol){
      
      we[k++]=hol;
    }
    else{

      d++;
    }
    p++;
    
  }

}
function check_is_hol(d1,hols) {
    var year = d1.getFullYear();

    var hl=0;
    for(var i=0;i<hols.length;i++){
      var hdate=year+"-"+hols[i].dm
      var dt=d1.getDate();
      if(dt<10)
        dt="0"+dt;
      var mt=d1.getMonth()+1
      if(mt<10)
        mt="0"+mt;
      var d1f=d1.getFullYear()+"-"+mt+"-"+dt;
      
      if(hdate==d1f)
      {
        hl={day:hdate,lb:hols[i].name}; 
        break;
      }
    }
    return hl;
}

function get_leave_end(dur,leave_start,leave_type) {
  
  var we=gen_we_n_hol(leave_start,dur,leave_type)
  var nod=we.length+Number(dur);
  
  
  var data=prep_data([])
   data.url="/gen"
   data.leave_start=leave_start;
   data.rq="get-leave-end"
  data.dur=nod;

   
  ajax_go(data,function (rst) {
      var leave_end=rst.leave_end;
      adata.leave_end=leave_end;
      leave_end_f=rst.leave_end_f
      $("#leave_end").val(leave_end_f)
  })
 
  /*var leave_end=moment(leave_start).add(nod,"day").format('YYYY-MM-DD')
  var leave_end_f=moment(leave_start).add(nod,"day").format('DD MMM YYYY')//formated end
  $("#leave_end").val(leave_end_f)*/
  
}

function show_contract_details() {
  var terms=adata.me.contract_terms;
  
  $("#curr_contract_ends").text(adata.me.psn+", "+adata.me.dept+", "+terms+" up to "+adata.me.contract_ends)
}

function load_edit_flds(flds,rst) {
  for(var i=0;i<flds.length;i++){
    var fn=flds[i].fn;
    var val=rst[fn]
    
    $("#"+fn).val(val)
  }
}
let timeoutId;
function session_timer() {
  if(timeoutId){
    clearTimeout(timeoutId)
  }
  timeoutId=setTimeout(function() {
      var me=JSON.parse(getCookie("user-client"))
      $("#new-session-username").val(me.email)
      $("#renew-session-div").modal("show")
  }, 60*60*1000);
}