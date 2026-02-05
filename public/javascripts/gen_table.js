function show_avatar(ava,id) {
    ava=host+"/images/"+ava

    $("#"+id).attr("src",ava)
}
function gen_table(hd,rs,tid,nmsg,options){
  var w=document.body.clientWidth
  if(w<=768)
    return gen_table_mobile(hd,rs,tid,nmsg,options)
  if(!rs.length){
     $("#"+tid).show()
    if(nmsg)
      $("#"+tid).html("<article class='alert alert-info'><div class='message-body' >"+nmsg+"</div></article>")
    else
      $("#"+tid).html("<article class='alert alert-info info-2'><div class='message-body'>No results to display</div></article>")
    return 0
  }
  var th=""

  for(var i=0;i<hd.length;i++){
    var lb=hd[i].lb;
    var width=hd[i].width;

    var ft=hd[i].ft;
    var cl=hd[i].cl
    if(ft=="cb")
       var lb="<input type='checkbox'  onclick=\"check_all('"+cl+"',this)\""
     
    th+="<th style='width:'"+width+"px'>"+lb+"</th>"
  }
  var thead="<thead>"+th+"</thead>"
  var tr=""
  for(var i=0;i<rs.length;i++){
    
    var td=""
    for(var j=0;j<hd.length;j++){
      var fn=hd[j].fn;
      var lb=hd[j].lb
      var ft=hd[j].ft
      var width=hd[j].width
      var untx=hd[j].untx
      var fv=check_ft(ft,rs,hd,i,j,options,untx)
      var def=hd[j].def;

      if(fv==undefined||fv==null||fv=="null"||fv==""){
        
          if(def)
            fv=def;
          else
            var fv="-"
      }
      var cond=hd[j].cond
      var ct=0
      if(cond){
        for(var k=0;k<cond.length;k++){
          if(rs[i][cond[k].fn]==cond[k].val){
            var ct=cond[k].ct;
            var fv=cond[k].nval
            break;
          }
        }
      }
      if(ct=="skip")
        continue;
      if(width)
        style="style=\"width:"+width+"px\""
      else
        style=""
      td+="<td "+style+">"+fv+"</td>"
    }
    tr+="<tr>"+td+"</tr>"
    
  }
  var tbody="<tbody>"+tr+"</tbody>"
  var table=thead+tbody

  $("#"+tid).html("<table class='table table-stripped'>"+table+"</table>")
}

function check_all(cl,el) {
  // body...
  var v=$(el)[0].checked
  $("."+cl).prop("checked",v)
}
function gen_table_mobile(hd,rs,tid,nmsg,options){
  dclms=0

  if(typeof nmsg=="object"){
    dclms=nmsg.clms//default columns
    nmsg=nmsg.nodata;
  }
  var hdc=[];var k=0;
  
  for(var i=0;i<hd.length;i++){
    
    if(hd[i].ft=="options")
      continue
    else
        hdc[k++]=hd[i]
  }
  var hd=hdc;
  var w=document.body.clientWidth
  if(w<=600)
    clms=1
  else if(w<=700)
    clms=2;
  else
    clms=3

  if(dclms&&dclms<clms)
    clms=dclms  

  if(!rs.length){
    if(nmsg)
      $("#"+tid).html("<article class='alert alert-info'><div class='message-body' >"+nmsg+"</div></article>")
    else
      $("#"+tid).html("<article class='alert alert-info info-2'><div class='message-body'>No results to display</div></article>")
    return 0
  }
  else{
    $("#"+tid).show()
  
  }
  var div=""
  var tr=""

  for(var i=0;i<rs.length;i++){
    if(i%2!=0)
      var style="background:#eee;padding:20px;vertical-align:top;width:100%;"
    else
      style="padding:20px;border-radius:3px;vertical-align:top;width:100%;"
      
      var tr2=""
      var l=hd.length

      if(options){
        l=hd.length
        
        if(l==0)
          l=1
        op=load_options(options,i)
        op="<td align='right' style='vertical-align:top'>"+op+"</td>"
      }
      else
        op=""

      for(var j=0;j<l;j++){
        var fn=hd[j].fn;
        var lb=hd[j].lb;
        var fv=rs[i][fn]
        var ft=hd[j].ft;
        var fr=hd[j].fr;//full row
        var def=hd[j].def;
        var cond=hd[j].cond;
        fv=check_ft(ft,rs,hd,i,j,options)
        if(fv==null||fv=="null"||fv==undefined||fv==""){
          if(def)
            fv=def;
          else
            var fv="-"
          fv="-"
        }

        if(ft=="serial"){
          lb=lb;
        }
        else if(lb=="")
          lb=""
        else
          lb=lb+": "
        var bk=hd[j].bk;//break if like to be long text;
        if(bk)
          lb=lb+"<br>"
        
        if(j%clms==0){
          if(j>0)
            tr2+="</tr>"
          tr2+="<tr><td style='padding-left:10px;'><table style='width:100%'><tr style='border-width:1px;border-style:none;border-top-style:solid;border-color:#555'><td style='width:auto;vertical-align:top'><span>"+lb+"</span><span style='font-weight:bold;'>"+fv+"</span></td></tr></table></td>"
        }
        else{
           tr2+="<td style='padding-left:10px;'><table style='width:100%'><tr style='border-width:1px;border-style:none;border-top-style:solid;border-color:#555'><td style='width:auto;vertical-align:top'><span>"+lb+"</span><span style='font-weight:bold;'>"+fv+"</span></td></tr></table></td>"
        }
      }
      tr+="<tr><td style='padding:10px;padding-top:0px'><table style=\""+style+"\">"+tr2+"</table></td>"+op+"</tr>"
  }
  var table="<table style='table-layout:auto;width:100%;'>"+tr+"</table>"
  div+=table+"</div>"
  $("#"+tid).html(div)
}
function load_options(arr,index,rs,untx) {
  var op="<div class='dropdown'>"
    var mid="\""+untx+"-"+index+"\""
    var ctid=untx+"-"+index
    op+="<button class='btn btn-primary btn-sm dropdown-toggle' type='btn'   data-bs-toggle='dropdown' aria-expanded='false'><i class='fa fa-bars'></i></button>"
    op+=" <ul class='dropdown-menu'>"
    for(var i=0;i<arr.length;i++){
        index2=index
        op+="<a class='dropdown-item' style='cursor:pointer' onclick='"+arr[i].method+"("+index2+")'>"+arr[i].text+"</a>"
    }
    op+="</ul></div>"
    return op
}

function arr2tab(rs,id,wd,cls) {
  // body...
  if(cls=="stripped")
    var cls="class='table table-stripped'"
  else
    cls='table'
  var tr="<table style='width:100%' "+cls+">"
  for(var i=0;i<rs.length;i++){
    var clm=rs[i]
    if(i==0)
      tr+"<thead><tr>"
    else
      tr+="<tr>"

    for(var j=0;j<clm.length;j++){
      val=clm[j]
      if(val==null)
        val="-"
      if(typeof val=="object"){
        val=val.text
      }
      w="auto"
      if(wd){
        w=wd[j]
        if(w=="*")
          w="auto"
      }
      if(i==0){
        tr+="<th width=\""+w+"\">"+val+"</th>"
        
      }
      else
       tr+="<td>"+val+"</td>"
    }
    if(i==0){
      tr+="</tr></thead><tbody>"
    }
    else
      tr+="</tr>"
  }
  tr+"</tbody></table>"
  $("#"+id).html(tr)

}
function arr2ol(rs,id) {
  var li=""
  for(var i=0;i<rs.length;i++){
    li+="<li>"+rs[i]+"</li>"
  }
  $("#"+id).html("<ol>"+li+"</ol>")
 
}
$(function (argument) {
    $(".curr").each(function  () {

          
            m=$(this).val();

            

            n=m.split("")
           g="";
           t=0;
           for(var i=n.length-1;i>-1;i--){
             t++;
            if(t%3==0 &&m>=1000){
                g+=n[i]+","

            }
            else{
                g+=n[i]
            }
           }
          
           k="";

           for(var i=g.length-1;i>-1;i--){

              k+=g[i];
           }
          if(k[0]==","){
            k=k.split("")
            k[0]=""
            k=k.join("")
    
            }

           $(this).val(k);
    })
    $(".curr-td").each(function  () {

          //convert for table ; for data created using server renders
            m=$(this).html();
            n=m.split("")
           g="";
           t=0;
           for(var i=n.length-1;i>-1;i--){
             t++;
            if(t%3==0 &&m>=1000){
                g+=n[i]+","

            }
            else{
                g+=n[i]
            }
           }
          
           k="";

           for(var i=g.length-1;i>-1;i--){

              k+=g[i];
           }
          if(k[0]==","){
            k=k.split("")
            k[0]=""
            k=k.join("")
    
            }

           $(this).text(k);
   })
})

function cx(m) {
    //convert to money value; doesn't handle key up
    if(m==null)
      return "-"
    m=m.toString()
   var n=m.split(".")

    if(n.length>1)
      dp="."+n[1]
    else
      dp=""
    n=n[0].split("")
    g="";
    t=0;
    for(var i=n.length-1;i>-1;i--){
        t++;
        if(t%3==0 &&m>=1000){
            g+=n[i]+","

        }
        else{
            g+=n[i]
        }
   }
      
   k="";
    for(var i=g.length-1;i>-1;i--){

      k+=g[i];
    }
    if(k[0]==","){
        k=k.split("")
        k[0]=""
        k=k.join("")
    }
    return k+dp;
}
function dcx(m) {
   m=m.split(",").join("")
   return m;
}
function cx_ku (el) {
  //key up; formating text input for money values
       var m= el.value

        m=m.split(",").join("")
        ts=Number(m).toString()
        console.log(ts)

        if(ts=="NaN")
        {
          m=m.substring(0,m.length-1)

         
        }
        n=m.split("")
        g="";
        t=0;
        for(var i=n.length-1;i>-1;i--){
            t++;
            if(t%3==0 &&m>=1000){
                g+=n[i]+","

            }
            else{
                g+=n[i]
            }
        }

        k="";
        for(var i=g.length-1;i>-1;i--){
            k+=g[i];
        }
        if(k[0]==","){
            k=k.split("")
            k[0]=""
            k=k.join("")
    
        }
        el.value=k;
}
function check_whole_number (el,ml) {
  //key up; formating text input for money values

       var cn= Number(el.value).toString()
       var m=el.value;
        if(cn=="NaN"||(ml&&m.length>ml))
        {
          m=m.substring(0,m.length-1)
         
        }
       el.value=m;

       return m;

}




//var $table = $('#table')

  function gen_table_sticky(hd,rs,tid,nmsg,options,tap) {
    if(!rs.length){
    
    if(nmsg)
      $("#"+tid).html("<article class='alert alert-info'><div class='message-body' >"+nmsg+"</div></article>")
    else
      $("#"+tid).html("<article class='alert alert-info info-2'><div class='message-body'>No results to display</div></article>")
    return 0
  }
  else{
     $("#"+tid).html("")
    $("#"+tid).show()
  
  }
    var i
    var j
    var row
    var data = []
    var columns=hd;
    for (i = 0; i < rs.length; i++) {
      row = {}
      for (j = 0; j < columns.length; j++) {
        var fn=columns[j].field;
        var ft=columns[j].ft;
        fv=rs[i][columns[j].field]
        var fv=check_ft(ft,rs,hd,i,j,options)
        row[fn] =fv;
      }
      data.push(row)
    }
    var classes = $('.toolbar input:checked').next().text()
    $("#"+tid).bootstrapTable('destroy').bootstrapTable({
      columns: columns,
      data: data,
      showFullscreen: false,
      stickyHeader: true,
      search:false,
      stickyHeaderOffsetLeft: parseInt($('body').css('padding-left'), 10),
      stickyHeaderOffsetRight: parseInt($('body').css('padding-right'), 10),
      classes:"thead-light"
    })
  }

  function check_ft(ft,rs,hd,i,j,options,untx) {
      var fn=hd[j].fn;
      if(!fn)
        fn=hd[j].field;//caters for stick thead
      if(ft=="serial"){
        var fv=i+1
      }

      else if(ft=="options"){
        var fv=load_options(options,i,rs,untx)

      }
      else if(ft=="img"){
          var def=hd[j].default;
          var style=hd[j].style
          if(hd[j].oc)
              var oc="onclick="+hd[j].oc+"("+i+")";
          else
            oc=""
          if(def=="male-female"){
            sex=rs[i].sex;
            if(sex=="Male")
              default_path="/images/male-ava.jpg"
            else if(sex=="Female")
              default_path="/images/female-ava.jpg"
            else{
              default_path="/images/gen-ava.jpg"
            }

          }
          var ts=new Date()
          var fv=rs[i][fn]
          path=hd[j].dir+fv+"?"+ts

          fv=""
          fv="<img src='"+path+"' style=\""+style+"\" "+oc+" onerror=\"this.src='"+default_path+"'\" >"
        }
      else if(ft=="cb"){
        var cl=hd[j].cl;
        var id=rs[i][fn];
        var fv="<input type='checkbox' value=\""+id+"\" class=\""+cl+"\">"
      }
      else if(ft=="rb"){
        var cl=hd[j].cl;
        var id=rs[i][fn];
        var fv="<input type='radio' name=\""+cl+"\" value=\""+id+"\" class=\""+cl+"\">"
      }
      else if(ft=="money"){
        if(hd[j].curr)
          curr=hd[j].curr
        else
          curr=""
        curr=""
        var fv=curr+" "+cx(rs[i][fn])

      }
      else if(ft=="btn"){

            if(hd[j].oc)
                var oc="onclick="+hd[j].oc+"("+i+")";
            else
                oc=""

           var  fv="<button class='btn' "+oc+">"+hd[j].text+"</button>"
      }
      else
      {
        var fv=rs[i][fn]
        
      }
      return fv;
  }