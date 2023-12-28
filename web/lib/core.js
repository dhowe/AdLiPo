
var dbug = 0, test = 0;  
var used = [], rm, historySz = 30, node = 0;

checkNode();


function makeAd(w, h, m) {

	var sent;
		
	if (!rm) rm = createModel(3);
	
	if (!(w && h)) poem = "";

	while (!isValid(sent, w, h)) {
		sent = select(rm.generateSentences(1)[0]);
	}
    
	used.push(sent);
	if (used.length > historySz) used.splice(0,1);

    // console.log(sent.length);
	return sent;
}

function isValid(q, w, h) {
	
	if (q && q.length && /_?Ad[^a-z]/.test(q)) { // check for 'Ad'
	
		var matches = q.match(/Ad/g); 
		if (matches.length > 1) { // but only one 'Ad'
		
			log("REJECT(MULTIPLE_'Ad'): "+q); 
			return false;
		}
		
		if (contains(used,q)) { // and not used recently
			
			log("REJECT(HISTORY): "+q);
			return false;
		}
        
        //Rough limitation of the length for small div
		if (w < 200 && h < 200 && q.length > 50){
			log("REJECT(COULD BE TOO LONG): " + q + ":" + w + "," + h);
		    return false;
		}
		
		return true;
	}
	return false;
}


function select(phrase) {
	
	if (phrase.indexOf('|') < 0) {
		//log('Skipping non-perm:'+phrase);
		return polish(phrase);
	}
	
	// we have multiple possibilites for the word
	var opts, endsWithPunc, last, words = phrase.split(' ');
	for (var i = 0; i < words.length; i++) {
		
		if (/\|/.test(words[i])) {
			
			endsWithPunc = false; // check if ends with punc
			last = words[i].charAt(words[i].length-1);
			if (RiTa.isPunctuation(last)) {
				
				endsWithPunc = true;
				words[i] = words[i].substring(0,words[i].length-1);
			} 
				
			opts = words[i].split('\|');	
			words[i] = RiTa.randomItem(opts);
			if (words[i] && words[i].length) {
				
				// re-append the punctuation
				endsWithPunc && (words[i] += last);
			}
			else {
				words.splice(i,1);
			}	
				
		}
	}
	
	return polish(words.join(' '));
}


function polish(q) {
	
	q = q.replace(/\_/g,' '); // underscore->spaces
	q = q.replace(/\?/g,'.'); // ? -> .   
	return q.trim();
}

function log(m) { 
	if(dbug) console.log(m); 
}

function contains(arr, obj) {
	
    var i = arr.length;
    while (i--) {
       if (arr[i] === obj) {
           return true;
       }
    }
    return false;
}

function createModel(n) { 
	
	return RiMarkov(n).loadText(text);
}

function isNode() {
	
	return (typeof module != 'undefined' && module.exports);
}


function checkNode() {
	
	if (isNode()) {
		
		node = 1;
		rita = require('../../../Documents/eclipse-workspace/RiTa/RiTaLibraryJS/src/rita.js');
		RiMarkov = rita.RiMarkov;		
		RiString = rita.RiString;
		rita = require('../../../Documents/eclipse-workspace/RiTa/RiTaLibraryJS/src/ritext.js');
		RiText = rita.RiText;
		fonts = require('./fonts/BenchNineAll');
	}
	else {
		
		fonts = BenchNine;
	}
}

//////////////////////////////////////////////////////////////////////////////////////////


chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
     
    if (request.what === 'getPoem') {

    log("Request from " + request.sel);
    
	  var w = request.width,
	      h = request.height,
	      m = request.margin;

	  var poem = makeAd(w, h, m) 
	  log('POEM: ' + poem);

	  sendResponse({
	    what: 'responsePoem',
	    target: request.sel,
	    poem: poem
	  });

    }
    return true;
  });
