

$(window).on("load",function(){
    var urlLink=window.location.href;

    $(".msg").hide();

    $("#pageurl").val(urlLink);
    
    $("form").submit(function(){
        sessionStorage.setItem('test',true);  
        console.log(sessionStorage);
        window.location.reload();
        
    });

    var n2 = sessionStorage.getItem('on_load_count');

    if (n2 === null) {
    n2 = 0;
    }

    n2++;
    console.log(n2);

    sessionStorage.setItem("on_load_count", n2);

    if(n2==1){
        sessionStorage.setItem('test',false);  
    }

   
    if(n2>1){
        $( function () {
            if (sessionStorage.getItem('test') != "false") {
                sessionStorage.setItem('test',false);    
                swal("Message Sent", "Please check your inbox for replies from the Ws team.", "success");
                console.log(sessionStorage);
              
            }
        } 
    );


    }

    $(".switchBtn").on("click",function(){
        $(".details").hide();
        $(".msg").fadeIn(600).show();
    });

    $("#goBack").on("click",function(){
        $(".details").fadeIn(600).show();
        $(".msg").hide();
    });




});







