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

function updateYear(rootEl) {
	if (!rootEl) {
		rootEl = document.body;
	} else if (!(rootEl instanceof HTMLElement)) {
		rootEl = document.querySelector(rootEl);
	}

	var year = new Date().getFullYear();
	rootEl.textContent = year;
	return year;
}

/*
 * Copy the enumerable properties of `p` to `o`, and return `o`.
 * If `o` and `p` have a property by the same name, `o`'s property is overwritten.
 */
function extend(o, p) {
	for (var prop in p) {
		o[prop] = p[prop];
	}
	return o;
}

/*
 * Copy the enumerable properties of `p` to `o`, and return `o`.
 * If `o` and `p` have a property by the same name, `o`'s property is left alone.
 */
function merge(o, p) {
	for (var prop in p) {
		if (o.hasOwnProperty(prop)) {
			continue;
		} 
		o[prop] = p[prop];
	}
	return o;
}

/*
* Remove properties from `o` if there is not a property with the same name in `p`.
* Return `o`
*/
function restrict(o, p) {
	for (var prop in o) {
		if (!(prop in p)) delete o[prop];
	}
	return o;
}

/*
* For each property of `p`, delete the property with the same name from `o`.
* Return `o`.
*/
function substract(o, p) {
	for (var prop in p) {
		delete o[prop];
	}
}

/*
* Return a new object that holds the properties of both `o` and `p`.
* If `o` and `p` have properties by the same name, the values from o are used.
*/
function union(o, p) {
	return merge(extend({}, o), p);
}

/*
*  Return an array that holds the names of the enumerable own properties of `o`
*/
function keys(o) {
	if (typeof o !== 'object') throw TypeError();
	var result = [];
	for (var prop in o) {
		if (o.hasOwnProperty(prop))
			result.push(prop);
	}
	return result;
}

export {ajax, createElement, merge, updateYear};