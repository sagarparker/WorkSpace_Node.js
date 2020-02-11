


  $(window).on("load",function(){
    $("#downic").addClass("animated fadeIn delay-1s");  
    $("#mainText").addClass("animated zoomIn delay-1s");  
    $("#proLogo").addClass("animated fadeIn delay-1s");  

    $("#nav_head").on("click",function(){
      window.location.href = "../index.html";
    });

    function icrep(x){
        for(i=0;i<x;i++){
            $("#downic").animate({paddingTop: '0px'});
            $("#downic").animate({paddingTop: '8px'});
        }
      }   
       
      icrep(1000);
  });