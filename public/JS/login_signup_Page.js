$(window).on("load",function(){
    $("#signupBtn").css("color","gray");
    $("#signupForm").hide();

   

    $("#logBtn,#innerLogin").on("click",function(){
      
        $("#logBtn").css("backgroundColor","white");
        $("#signupBtn").css("backgroundColor","rgb(231, 227, 227)");
        $("#signupBtn").css("color","gray");
        $("#logBtn").css("color","black");

       
      
     
        $("#loginForm").show();
        $("#signupForm").hide();

      

       

    });




    $("#signupBtn,#innerSignup").on("click",function(){
        $("#logBtn").css("backgroundColor","rgb(231, 227, 227)");
        $("#signupBtn").css("backgroundColor","white");
        $("#signupBtn").css("color","black");
        $("#logBtn").css("color","gray");

        $("#loginForm").hide();
        $("#signupForm").show();

        

     
        
       


    });

});