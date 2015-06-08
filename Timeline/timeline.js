+function($) {
	'use strict';

	var Timeline = function(elem, options) {

        $(window).load(function(){
            elem.find(' .tl-events').mCustomScrollbar({
            	autoHideScrollbar:true,
            	theme: "light-3"
            });
        });
        this.options = $.extend({}, Timeline.DEFAULT_OPTIONS, options);
        this.elem = elem;
        this.elem.addClass('tl-container');
        this.insertHead();
        this.insertBody();
	};

    Timeline.DEFAULT_OPTIONS = {
        title : "Community timeline",
        monthabbrs : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    };

    Timeline.prototype.insertHead = function() {
        this.elem.append('<div class="tl-header"><div class="tl-title">' + this.options.title + '</div></div>');
    }

    Timeline.prototype.insertBody = function() {
        this.elem.append('<div class="tl-body"><div class="tl-events"></div></div>');
        var eventsDiv = this.elem.find('.tl-events');
        for (var i = 0; i < this.options.data.length; i++) {
            var data = this.options.data[i];
            var dataDate = new Date(data.start);
            var eventDiv = eventsDiv.append('<div class="tl-event">').find('.tl-event').last();
            var eventHead = eventDiv.append('<div class="tl-event-head">').find('.tl-event-head');
            eventHead.append('<div class="tl-event-source">' + data.source);
            var eventDate = eventHead.append('<div class="tl-event-date">').find('.tl-event-date');
            eventDate
                .append('<div class="day">' + dataDate.getDate())
                .append('<div class="month">' + this.options.monthabbrs[dataDate.getMonth()])
            ;
            eventDiv.append('<div class="tl-event-body">' + data.content);
        }
    }

    Timeline.prototype.update = function(first_argument) {
        // body...
    };

	$.fn.communityTimeline = function(options) {
        return new Timeline(this, options);
    }
    $.fn.communityTimeline.Constructor = Timeline;
}(jQuery);