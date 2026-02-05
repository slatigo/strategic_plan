$(function () {
    var student_no=$("#student_no").val()
    var url="https://exams.mubs.ac.ug/student"
    adata.url=url
   var data={rq:"get-student-results",pg:"results",student_no:student_no,mubsep:1,url:url}
    ajax_go(data,function (rst) {
      $("#access-div").hide()
      load_student_results(rst)
    })
})
function ajax_go(data,callback) {
    data.ajax=1
    //var url="http://localhost:3012/student"
    var url="https://exams.mubs.ac.ug/student"
    
    $.ajax({
            url: url,
            data: data,
            dataType:'jsonp',
            "crossDomain": true,
            CORS: true ,
            contentType:'application/json',
            cache: false,
            type: "POST",secure: true,
            headers: {
            'Access-Control-Allow-Origin': '*',
             
            },
            success: function(result) {
               $(".loading-div").hide()
              //setTimeout(function() { }, 2000);
                if(result.errmsg){
                  
                  if(!data.return)
                      return 0;
                }
                callback(result)
            },
            error: function(e) {
                $(".loading-div").hide()
                if(data.return)
                  callback(0)
            },
            timeout:30000
    });
}
/*function get_results() {
  var student_no=$("#student_no").val()
  if(student_no.length==0){
    return display_err("Please enter student number")
  }
  var url="/student"
  //var url="https://exams.mubs.ac.ug/student"
  adata.url=url
 //var data={rq:"get-student-results",pg:"results",student_no:student_no,mubsep:1,url:url}
  adata.rq="get-student-results"
  adata.pg="results"
  var data=prep_data([])
 
  data.student_no=student_no;
  data.mubsep=1;
  ajax_go(data,function (rst) {
    $("#access-div").hide()
    load_student_results(rst)
  })
}/*

