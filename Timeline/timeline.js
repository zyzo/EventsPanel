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
        disableAPISource : false,
        currentYear : '2015',
        limit : '6',
        lazyLoadLimit : '1',
        until : '2016-01-31T23:59:59'
    };

    Timeline.prototype.insertHead = function() {
        this.elem.append('<div class="tl-header"><div class="tl-title">' + this.options.title + '</div></div>');
    };

    Timeline.prototype.insertBody = function() {
        this.elem.append('<div class="tl-body"><div class="tl-events"></div></div>');
        var eventsDiv = this.elem.find('.tl-events');

        // Escape html string 
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#x2F;'
        };

        function escapeHtml(string) {
            return String(string).replace(/[&<>"'\/]/g, function (s) {
                return entityMap[s];
            });
        }

        var self = this;

        var eventsMCBContainer = null;
        function insertRow(data) {
            var dataDate = new Date(data.start);
            var eventDiv = eventsMCBContainer.append('<div class="tl-event">').find('.tl-event').last();
            var eventHead = eventDiv.append('<div class="tl-event-head">').find('.tl-event-head');
            eventHead.append('<div class="tl-event-source">' + data.source);
            var eventDate = eventHead.append('<div class="tl-event-date">').find('.tl-event-date');
            eventDate
                .append('<div class="day">' + dataDate.getDate())
                .append('<div class="month">' + self.options.monthabbrs[dataDate.getMonth()])
            ;
            if (dataDate.getFullYear() != self.options.currentYear) {
                eventDate.append('<div class="year">' + dataDate.getFullYear());
            }
            eventDiv.append('<div class="tl-event-body">' + (data.summary ? escapeHtml(data.summary) : (data.description ? escapeHtml(data.description) : 'No description provided.')));
            return eventDiv;
        }

        function insertAllRows(data) {
            // sort events by start date
            data.sort(function(a,b) { 
                return (a.start < b.start  ? 1 : (a.start > b.start ? -1 : 0));
            });
            for (var key in data) {
                var eventDiv = insertRow(data[key]);
                if (key == data.length - 1) {
                    eventDiv.attr('data-date', data[key].start);
                }
            }
           
        }

        function prepareElems() {
             // add spinner
            self.elem.find('.tl-body').append('<i class="spinner animate-spin hidden">&#xe801;</i>');

            // add scrollbar
            var noMoreEvents = false;
            self.elem.find(' .tl-events').mCustomScrollbar({
                autoHideScrollbar:true,
                theme: "light-3",
                callbacks : {
                    onTotalScroll : function() {
                        if (self.options.disableAPISource || noMoreEvents) return;
                        self.elem.find('.spinner').removeClass('hidden');
                        var apiReq = self.options.apiUrl
                            + '?fields=start,source,summary,description'
                            + '&source=' + self.options.source
                            + '&limit=' + self.options.lazyLoadLimit
                            + '&sort=asc-start'
                            + '&to=' + eventsDiv.find('.tl-event').last().data('date');
                        console.log(apiReq);
                        $.getJSON(apiReq, function (apiResult) {
                                if (apiResult.error) {
                                    console.error('API error : ' + apiResult.error);
                                    if (apiResult.error == "No result found") {
                                        noMoreEvents = true;
                                    }
                                } else {
                                for (var key in apiResult) {
                                    if(apiResult[key].start) 
                                        apiResult[key].start = self.convertToValidDateTime(apiResult[key].start);
                                    }
                                insertAllRows(apiResult);
                            }
                            self.elem.find('.spinner').addClass('hidden');
                        });
                    }
                },
                onTotalScrollOffset:100,
                alwaysTriggerOffsets:false
            });
            eventsMCBContainer = eventsDiv.find('.mCSB_container');
            $(document).trigger($.Event('communityTimeline.ready'));
        }
        var combinedData = [];
        if (self.options.data) {
            for (var i = 0; i < self.options.data.length; i++) {
                var event = self.options.data[i];
                combinedData.push(event);
            }
        }
        if (!this.options.disableAPISource) {
            this.getData(function(data) {
                prepareElems();
                for (var key in data) {
                    data[key].start = self.convertToValidDateTime(data[key].start);
                    combinedData.push(data[key]);
                }
                insertAllRows(combinedData);
            });
        } else {
            prepareElems();
            insertAllRows(combinedData);
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
        $.getJSON(this.options.apiUrl 
            + '?fields=start,source,summary,description'
            + '&source=' + this.options.source
            + '&limit=' + this.options.limit
            + '&sort=asc-start'
            + '&to=' + this.options.until
            + '&from=now', function(apiResult) {
            if (apiResult.error) {
                 console.error('API error : ' + apiResult.error);
                 return; 
            }
            callback(apiResult);
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