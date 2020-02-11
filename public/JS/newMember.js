$(window).on("load",function(){
    var freelancerCard;
    var addBtn;
    
   
    $('.infoBtn').click(function(){
       freelancerCard = $(this).attr('id'); 
       $('#'+freelancerCard).css("height","48vh");     
       $('#'+freelancerCard).css("transition","all 0.3s");  
       $('.'+freelancerCard+'divTohide').css("display","block");
       if($( window ).width()<700){
        $('#'+freelancerCard).css("height","110vh");     
       }
    });

 

    
});

