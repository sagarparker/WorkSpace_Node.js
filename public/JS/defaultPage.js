var pageLink=window.location.href;

$(window).on("load",function(){



        $('input,textarea').focus(function() {
            $('footer').addClass('hide-footer');
         });
         
         $('input,textarea').focusout(function() {
            $('footer').removeClass('hide-footer');
         });

        $("#loginBtn").on("click",function(){
            window.location.href = "/workspace/loginsignup";
        });
        
        $("#nav_head").on("click",function(){
            window.location.href = "/";
        });

       
    

});