var ajax = {
	getData: function (url, callback) {
	  var xhr = new XMLHttpRequest();  

	  xhr.onreadystatechange = function() {
	    if (xhr.readyState === 4) {
	      if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
	        var type = xhr.getResponseHeader('Content-Type');
	        if (type.indexOf('html') !== -1 && xhr.responseXML) {
	          callback(null, xhr.responseXML);
	        } else if (type === 'application/json') {
	          callback(null, JSON.parse(xhr.responseText));
	        } else {
	          callback(null, xhr.responseText);
	        }
	      } else {
	        console.log('Request was unsuccessful: ' + xhr.status);
	        callback(xhr.status);
	      }

	    } else {
	      console.log('readyState: ' + xhr.readyState);
	    }
	  };

	  xhr.onprogress = function(event) {
	    console.log('Request Progress: Received ' + event.loaded / 1000 + 'kb, Total' + event.total / 1000 + 'kb');
	  };
	  xhr.open('GET', url);
	  xhr.send(null);
	}
};

function createElement(name, attributes) {
    var node = document.createElement(name);
    if (attributes) {
        for (var attr in attributes) {
            if (attributes.hasOwnProperty(attr)) {
                node.setAttribute(attr, attributes[attr]);
            }
        }
    }

    for (var i = 2; i < arguments.length; i++) {
        var child = arguments[i];
        if (typeof child == 'string') {
            child = document.createTextNode(child);
        }
        node.appendChild(child);
    }
    return node;
}
export {ajax, createElement};