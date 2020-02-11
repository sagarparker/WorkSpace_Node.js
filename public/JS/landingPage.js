
// LANDING PAGE ANIMATION

$(window).on("load", function () {
 
    $("#body_main").delay(12000);
    $("#body_main").hide().fadeIn(500);
    
    
    $("#w1").delay(500); 
    $("#w1").hide().fadeIn(500);
    $("#w1").delay(1000);
    $("#w1").fadeOut(200);
    
    
    $("#w2").delay(2500);
    $("#w2").hide().fadeIn(500);
    $("#w2").delay(1000);
    $("#w2").fadeOut(200);

    $("#w3").delay(4500);
    $("#w3").hide().fadeIn(1000);
    $("#w3").delay(1000);
    $("#w3").fadeOut(200);


    $("#w4").delay(7000);
    $("#w4").hide().fadeIn(500);
    $("#w4").delay(1000);
    $("#w4").fadeOut(200);

    $("#w5").delay(9000);
    $("#w5").hide().fadeIn(500);
    $("#w5").delay(2000);
    $("#w5").fadeOut(200);

    $("footer").delay(12000);
    $("footer").hide().fadeIn(100);
    $('body').css('background-image', 'url(/Images/landingPage_images/splash_wp.png)');
  
   


    setTimeout(function() {
        $("#splash").fadeOut(300, function() {
            $(this).remove();
        });
    }, 12000);

    setTimeout(function() {
  
        $('body').css('background-image', 'url(/Images/landingPage_images/index_bg.png)');
    

    }, 100);
    
    

    $("#jumbo").addClass("animated zoomIn delay-1s");
    $("#navani").addClass("animated fadeIn delay-0.5s");   
    $("#downic").addClass("animated fadeIn delay-1s");  

    
    
});

function icrep(x){
  for(i=0;i<x;i++){
      $("#downic").animate({paddingTop: '0px'});
      $("#downic").animate({paddingTop: '10px'});
  }
}   
 
icrep(1000);






// PAGE RELOAD AND SPLASH SCREEN

var n = sessionStorage.getItem('on_load_counter');

if (n === null) {
    n = 0;
}

n++;

sessionStorage.setItem("on_load_counter", n);

if(n>1){
  $(window).on("load", function () {
      $("#splash").remove();
    
      $("#body_main").show();
      
      $('body').addClass('notransition');

      $("footer").show();

     
       $('body').css('background-image', 'url(/Images/landingPage_images/index_bg.png)');
      
     
      
      });

}





