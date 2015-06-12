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
        lazyLoadLimit : '10',
        until : '2016-01-31T23:59:59',
        order : 'latest-first'
    };

    Timeline.prototype.insertHead = function() {
        this.elem.append('<div class="tl-header"><div class="tl-title">' + this.options.title + '</div></div>');
    };

    Timeline.prototype.insertBody = function() {
        this.elem.append('<div class="tl-body"><div class="tl-events"></div><div class="tl-details hidden"></div></div>');
        var tlBody = this.elem.find('.tl-body');
        var eventsDiv = this.elem.find('.tl-events');
        var detailsDiv = this.elem.find('.tl-details');
        // Escape html string & convert some special characters to equivalent html tags
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#x2F;',
            "\\n" : '<br/>'
        };

        function escapeHtml(string) {
            return String(string).replace(/[&<>"'\/]|\\n/g, function (s) {
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
            eventDiv.append('<div class="tl-event-body">' + (data.description ? escapeHtml(data.description) : (data.summary ? escapeHtml(data.summary) : 'No description provided.')));
            eventDiv.click(function() {
                updateDetail(data);
                eventsDiv.toggleClass('hidden');
                detailsDiv.toggleClass('hidden');
            });
            return eventDiv;
        }

        function insertAllRows(data) {
            for (var key in data) {
                var eventDiv = insertRow(data[key]);
                if (key == data.length - 1) {
                    eventDiv.attr('data-date', data[key].start);
                }
            }
           
        }

        function replaceAt(str, index, character) {
            return str.substr(0, index - 1) + character + str.substr(index - 1 + character.length);
        }

        function prepareElems() {
             // add spinner
            tlBody.append('<i class="spinner animate-spin hidden">&#xe801;</i>');

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
                            + '?fields=start,source,summary,description,url,end'
                            + '&source=' + self.options.source
                            + '&limit=' + self.options.lazyLoadLimit;
                        if (self.options.order === 'latest-first') {
                            apiReq += '&sort=asc-start'
                            + '&to=' + eventsDiv.find('.tl-event').last().data('date');
                        } else {
                            var from = eventsDiv.find('.tl-event').last().data('date');
                            apiReq += '&sort=desc-start' 
                            + '&from=' + replaceAt(from, from.length - 1, from[from.length - 1] + 1);
                        }
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

        (function prepareDetailsDiv() {
            detailsDiv.append('<div class="communityName">')
                .append('<div class="summary">')
                .append('<div class="description">')
                .append('<div class="start">')
                .append('<div class="end">')
                .append('<a class="url">Go to event page')
                .append('<a href="#" id="goback">Go back to timeline');
            detailsDiv.find('a#goback').click(function() {
                detailsDiv.addClass('hidden');
                eventsDiv.removeClass('hidden');
            });
        })();

        function updateDetail(data) {
            detailsDiv.find('.communityName').text(data.source);
            detailsDiv.find('.summary').text(data.summary);
            detailsDiv.find('.description').text(data.description);
            detailsDiv.find('a.url').attr('href', data.url);
            detailsDiv.find('.start').text(data.start);
            detailsDiv.find('.end').text(data.end);
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
        var apiCall = this.options.apiUrl 
            + '?fields=start,source,summary,description,url,end'
            + '&source=' + this.options.source
            + '&limit=' + this.options.limit;
        if (this.options.order == 'latest-first') {
            apiCall += '&sort=asc-start'
            + '&to=' + this.options.until
            + '&from=now';
        } else {
            apiCall += '&sort=desc-start'
            + '&from=now';
        }
        console.log(apiCall);
        $.getJSON(apiCall, function(apiResult) {
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