
var dbug = 0, test = 0;  // PROBLEM: Processing JS gives different ascent/descent than Font.js !!! TODO: make issue (for ReadersJS?)s
var used = [], rm, historySz = 30, node = 0;
var fontSizes = [18,21,24,28,32,40,48,56,64,72,80];
var palette = ['#4484A4','#A2B6C0','#889D59','#CF8D2F','#C55532']; 
var cIdx = Math.floor(Math.random()*palette.length);

checkNode();

function injectAd(sel, w, h, m) {
	
	//console.log('injectAd: '+sel);
	
	var html = '', poem = makeAd(w, h, m);
	for (var i = 0, j = poem.lines.length; i < j; i++) {
		
		html += poem.lines[i];
		if (i < poem.lines.length - 1) 
			html += '<br/>';
	}
	
	html = html.replace(/^ */,"");
	
	//$.fn.textWidth

	var marginX = ((w-m*2) - poem.maxWidth)/2;

	//console.log('(w-m*2): '+(w-m*2)+' poem.maxWidth: '+poem.maxWidth+' marginX: '+marginX);
	
	if ($(sel).parent().hasClass("adlipo.a")) {
		
		$(sel).parent().css({  // anchor css
			
			'text-decoration': 'none'
		});
		
		if ($(sel).parent().parent().hasClass("adlipo.div")) {
			
			// var currentMarginX = parseInt($(sel).parent().parent().css('marginLeft'));
			// console.log('currentMarginX: '+currentMarginX);
			// marginX += currentMarginX;
			
			$(sel).parent().parent().css({ // div css
			 	//'margin': 			'0px 0px 0px '+marginX+'px',		
				'display': 			'block', 
				'width': 			w+'px', 
				'height': 			h+'px', 	
				'overflow': 		'visible',
				'background-color': palette[cIdx++]
			});
			
			(cIdx === palette.length) && (cIdx = 0); // next-color
		}
	}

	var divStyle = {
		'font-family': 		'custom', 
	 	'text-align': 		'left', 
		'overflow': 		'visible',
		'white-space': 		'nowrap',
		'letter-spacing': 	'0px',
		'margin': 			'0px',  
		'line-height':  	(poem.leading/100 * poem.fontSize)+'px', 
		'fontSize':  		poem.fontSize+'px', 
	 	//'padding': 			'0px 0px 0px '+(poem.padding+marginX)+'px',
	 	'padding': 			poem.padding+'px',
		'color': 			'#fff',
	};
	
	$(sel).css(divStyle).html(html);
	
	//var tw = parseInt( $(sel).outerWidth());//+(poem.margin * 2);
	//if (sel==='#poem1')console.log(sel+".width: "+tw);	
	
	return poem;
}

function makeAd(w, h, m) {

	var poem, sent,tries = 0, maxTries = 1000;
		
	if (!rm) rm = createModel(3);
	
	if (!(w && h)) poem = failure;
		
	//var	area = (w - m * 2) * (h - m * 2); // min=2000,max=~100000

	while (!poem && ++tries < maxTries) {
		
		while (!isValid(sent)) {
			
			sent = select(rm.generateSentences(1)[0]);
		}
	
		used.push(sent);
		
		if (used.length > historySz) used.splice(0,1);

		poem = dynamicLayout(sent, w, h, m, fontSizes);
		if (!poem) {
			
			log("REJECT(UNPLACEABLE): "+sent);
			sent = null;
		}
		else {
			
			log("RESPONSE: "+ poem.lines.join(' '));
		}
	}
	
	if (!poem) {
		
		log("FAILED: after " + maxTries + " tries");
		poem = failure;
	}

	return poem;
}

/* selects the largest font that fits all the content, or null if none fits */
function dynamicLayout(txt, w, h, m, fsizes, returnRiTexts) 
{	
	m = m || 5;

	var szIdx=0, rts, lines = [], tmp = [], dbug = 0,
		font = fonts['size'+fsizes[szIdx++]], 
		actualW = w-m*2,actualH = h-m*2; 
	
    if (!font) throw Error('dynamicLayout(): no font!');

//console.log('1:'+ RiText.instances.length);

	fits = layout(tmp, txt, w-m*2, h-m*2, font);

//console.log('2:'+ RiText.instances.length);

	if (dbug)log('dynamicLayout: 0,0,'+w+","+h+","+m+"\nfont-size="+tmp[0].font().size+" fits="+fits+' '+tmp[0].text());
	
	if (!fits) return null; // text is too long for all fonts
	
	while (fits) {    // remove this 'fits' crap!
		
		rts = tmp;
		
		if (szIdx == fsizes.length) break;

		RiText.dispose(tmp);
//console.log('3:'+ RiText.instances.length);

		fits = layout(tmp=[], txt, w-m*2, h-m*2, fonts['size'+fsizes[szIdx]]);
		
//console.log('4:'+ RiText.instances.length);

		
		if (dbug) log("font-size="+(tmp && tmp.length ? tmp[0].font().size : fsizes[szIdx-1])+" fits="+fits);
		
		++szIdx;			
	}

	for (var i = 0, j = rts.length; i < j; i++) {
		
		if (dbug) log(Math.floor(rts[i].y)+") "+rts[i].text());
		lines.push(rts[i].text());
	}
	
	var bb = RiText.boundingBox(rts);
	//console.log(rts[0]);
	//console.log(bb);
	
	// tmp
	/*var otxt = rts[0].text();
	rts[0].text(' ');
	var spaceW = rts[0].textWidth();
	rts[0].text(otxt);*/
	 
	var poem = {
		
		type: 'simple',
		align: 'left', 
		font:  rts[0].font().name,
		fontSize: rts[0].font().size,
		leading: RiText.defaults.leadingFactor * 100.0,
		padding: m,
		maxWidth: bb[2],
		maxHeight: bb[3],
		//spaceWidth: spaceW, // tmp
		lines: lines
	};
	
	RiText.dispose(tmp);
	
	if (returnRiTexts) {
		
		// re-add to instances list (??)
		for (var i = 0, j = rts.length; i < j; i++) 
			RiText.instances.push(rts[i]);
			
		return rts;	
	}
	
	return poem; 	
}

	
/* returns true if all lines fit inside the rect */
function layout(rlines, txt, w, h, pfont, leading) 
{	    
	//console.log("FONT: "+pfont.size+"\n========================================");
	
    if (!pfont) throw Error('no pfont!');

    RiText.defaultFont(pfont);
    
 	leading = Math.round(leading || (pfont.size * RiText.defaults.leadingFactor));

    var g = RiText.renderer, ascent, descent, leading, startX=0, SP=' ', E='', 
    	currentX=0,  yPos, currentY, sb=E, maxW=w, maxH=h, words=[], next, 
    	firstLine = true, rt, spaceW;
	
    // for ascent/descent in node renderer
    rt = RiText(SP, 0, 0, pfont); 
    spaceW = rt.textWidth();
    RiText.dispose(rt);
    
	// remove line breaks & add spaces around html
	txt = txt.replace(/&gt;/g, '>').replace(/&lt;/g, '<');
	txt = txt.replace(/ ?(<[^>]+>) ?/g, " $1 ").replace(/[\r\n]/g, SP);
	
	// split into reversed array of words
	RiText._addToStack(txt, words);
 	
    g._textFont(pfont); // for ascent & descent
    
    ascent = Math.round(g._textAscent(rt,true)); 
    descent = Math.round(g._textDescent(rt,true));
    
    currentY = ascent;

    if (RiText.defaults.indentFirstParagraph) 
    	startX += RiText.defaults.paragraphIndent;

    while (words.length > 0)
    {
      	next = select(words.pop()); // added select: 

      	if (!next.length) continue;

     	 // re-calculate our X position
      	currentX = startX + g._textWidth(pfont, sb + next);

		// check it against the line-width
		if (currentX <= maxW) {
			
			sb += next + SP; // add-word
		} 
		else {
			
			// check yPosition for line break
			if (!RiText._withinBoundsY(currentY, leading, maxH, descent, firstLine))  {
				
				if (dbug) log("return1:"+sb); 
				return !(sb.length || words.length);
			}

			yPos = firstLine ? currentY : currentY + leading;
			rt = RiText._newRiTextLine(sb, pfont, startX, yPos);
			
			if(dbug) log("adding: '"+rt.text()+ "' rt.y="+rt.y+" yPos="+yPos);
			
			rlines.push(rt);

			currentY = rt.y;
			startX = 0;
			
			if (g._textWidth(pfont, next) > maxW)  { // single-word is too wide for this font-size
				if (dbug) log("REJECT(WORD-TOO-WIDE): "+next+ "    fontSize="+rt.font().size);
				return false; // TODO: ADD TO RITA
			}
			
			sb = next + SP;
		
			// reset with next word
			firstLine = false;
		}
    }
    
    // check if leftover words can make a new line 
	if (RiText._withinBoundsY(currentY, leading, maxH, descent, firstLine)) {

		yPos = firstLine ? currentY : currentY + leading;

		rt = RiText._newRiTextLine(sb, pfont, 0, yPos);
		if (dbug) console.log("last: "+rt.text() + " y="+rt.y);
		rlines.push(rt);
				
		sb = E;
    }
    
    //if (dbug) log("return2: "+sb+" "+words.length);
    
	for (var i=0; i < rlines.length; i++) {
		
		// do extra horizontal check
		if (rlines[i].textWidth() > maxW) { // plus some slop
	 		log("TOO-WIDE: "+rlines[i].text()+ "   "+rlines[i].font().size);
	 		//return false;
	 	}
	}
	
	//console.log(rlines[0].text());
    
    return !(sb.length || words.length);
}

function withinBoundsY(currentY, leading, maxY, descent, firstLine) {
	
	if (!firstLine) 
		return currentY + leading <= maxY - descent;
	return currentY <= maxY - descent;
}

function log(m) { console.log(m); }

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

function isValid(q) {
	
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
		
		return true;
	}
	return false;
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

var failure = {
	
	type: 'simple',
	align: 'left', 
	font:  'arial',
	fontSize: 0,
	leading: RiText.defaults.leadingFactor * 100.0,
	lines: []
};


RiText.defaults.leadingFactor = 1.1;

if (node) {
	
	txt = "This age|gun|boy age|gun|boy.";	
	dumpLayout(dynamicLayout(txt, 230, 20, fontSizes));
	
//	return;
	
	dumpLayout(dynamicLayout(txt, 230, 100, fontSizes));
	dumpLayout(dynamicLayout(txt, 230, 187, fontSizes));
	dumpLayout(dynamicLayout(txt, 230, 188, fontSizes));
	dumpLayout(dynamicLayout(txt, 230, 308, fontSizes));
	dumpLayout(dynamicLayout(txt, 230, 1300, fontSizes));

	function dumpLayout(p) {
		if (p != null) { 
			log('\nFONT: '+p.font+''+p.fontSize+'/'+(p.leading/100.0 * p.fontSize)+"\n");
			for (var i=0,j=p.lines.length; i<j; i++)
	  			log(i+") "+p.lines[i]);
	  	}
	}
}
	