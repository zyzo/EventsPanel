function Timeline(argument) {
	(function($){
        $(window).load(function(){
            $(argument + ' .tl-events').mCustomScrollbar({
            	autoHideScrollbar:true,
            	theme: "light-3"
            });
        });
    })(jQuery);
}