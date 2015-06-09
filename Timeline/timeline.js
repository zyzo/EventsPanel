+function($) {
	'use strict';

	var Timeline = function(elem, options) {
        this.options = $.extend({}, Timeline.DEFAULT_OPTIONS, options);
        this.elem = elem;
        this.elem.addClass('tl-container');
        this.insertHead();
        this.insertBody();
	};

    Timeline.DEFAULT_OPTIONS = {
        title : "Community timeline",
        monthabbrs : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        apiUrl : 'http://localhost/fossasia/common.api.fossasia.net/ics-collector/CalendarAPI.php',
        source : 'all',
        disableAPISource : false
    };

    Timeline.prototype.insertHead = function() {
        this.elem.append('<div class="tl-header"><div class="tl-title">' + this.options.title + '</div></div>');
    };

    Timeline.prototype.insertBody = function() {
        this.elem.append('<div class="tl-body"><div class="tl-events"></div></div>');
        var eventsDiv = this.elem.find('.tl-events');

        var self = this;
        function insertRow(data) {
            var dataDate = new Date(data.start);
            var eventDiv = eventsDiv.append('<div class="tl-event">').find('.tl-event').last();
            var eventHead = eventDiv.append('<div class="tl-event-head">').find('.tl-event-head');
            eventHead.append('<div class="tl-event-source">' + data.source);
            var eventDate = eventHead.append('<div class="tl-event-date">').find('.tl-event-date');
            eventDate
                .append('<div class="day">' + dataDate.getDate())
                .append('<div class="month">' + self.options.monthabbrs[dataDate.getMonth()])
            ;
            eventDiv.append('<div class="tl-event-body">' + data.summary);
        }
        if (self.options.data) {
            for (var i = 0; i < self.options.data.length; i++) {
                var event = self.options.data[i];
                insertRow(event);
            }
        }
        if (!this.options.disableAPISource) {
            this.getData(function(data) {
                for (var key in data) {
                    data[key].start = self.convertToValidDateTime(data[key].start);
                    insertRow(data[key]);
                }
                self.elem.find(' .tl-events').mCustomScrollbar({
                    autoHideScrollbar:true,
                    theme: "light-3"
                });
                $(document).trigger($.Event('communityTimeline.ready'));
            });
        }
    };

    // Convert API datetime format to valid javascript format
    // YYYYMMDDT180000(Z) -> YYYY-MM-DDT200000
    Timeline.prototype.convertToValidDateTime= function(datetime) {
        if (!datetime) return '';
        return datetime.substr(0, 4) + '-' 
             + datetime.substr(4, 2) + '-'
             + datetime.substr(6, 5) + ':'
             + datetime.substr(11, 2) + ':'
             + datetime.substr(13, 2); 
    }

    Timeline.prototype.getData = function(callback) {
        $.getJSON(this.options.apiUrl + '?source=' + this.options.source, function(data) {
            if (data.error) {
                 alert('API error : ' + data.error);
                 return; 
            }
            callback(data);
        });
    };

    Timeline.prototype.update = function(first_argument) {
        // body...
    };

	$.fn.communityTimeline = function(options) {
        return new Timeline(this, options);
    }
    $.fn.communityTimeline.Constructor = Timeline;
}(jQuery);