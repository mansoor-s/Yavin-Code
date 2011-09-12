$('document').ready(function() {

    $('#content-home').delegate('.action', 'click', function(event) {
        event.preventDefault();        
        $('#overlay div').html('<p>Creating Rom...</p><br/> <img src="images/loading.gif"/>');
        $('#overlay').fadeIn();
        
        setTimeout(function() {
            
            // get rid of the homepage
            $('#container-home').hide("slide", { direction: "left" }, 1000, function() {
                $(this).remove();
                // bring in the app
                $('#wrapper').load('app.struct', function(data) {
                    $('#overlay').fadeOut(function() {
                        $(this).remove();
                        document.location = 'app/TestRoom';
                        // Take care of initializing the application
                    });
                });
            });
        }, 500);
    });

});
