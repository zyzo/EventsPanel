/** 
  Convert result from Calendar API result to Calendario format
 */



var api2Rio = function(json) {
	var eventDate = '';
	var event = {};

	var extractDate = function(datetime) {
		return datetime.substr(4,2) + '-' + datetime.substr(6,2) + '-' + datetime.substr(0,4);
	}
	var extractDateTime = function(datetime) {
		return datetime.substr(9,2) + ':' + datetime.substr(11,2);
	}

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

	$.each(json, function(key, val) {
		val = escapeHtml(val);
		if (key == 'start') {
			eventDate = extractDate(val);
			event.startTime = extractDateTime(val);
		} else if (key == 'summary') {
			event.content = val;
		} else if (key == 'description') {
			event.note = val;
			if (!event.content) {
				event.content = val;
			}
		}
		if (!event.content) {
			event.content = 'No description provided';
		}
	});
	event.endTime = '23:59';
	return [eventDate, event];
}

