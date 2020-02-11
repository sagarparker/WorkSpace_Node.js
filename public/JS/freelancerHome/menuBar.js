$(window).on("load",function(){
    $(".menu").hide();
    $( ".barHolder" ).click(function() {
        $(".menu").slideToggle();
    });

});

