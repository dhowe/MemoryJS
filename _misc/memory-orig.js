// file:///Users/dhowe/Documents/javascript-workspace/MemoryJS

var para = "A raw memory. Church. A loud room with children playing, thoughtlessly. Wandering wildly. I stand small and young within a chaotic garden of little ideas and unaware, tiny minds. Colorful toys litter the ground and posters of silent saints loom. My mother rises tall and aware. She departs gracefully. I pull a blue, plastic bucket to the door and climb it. Staring through the window. Bells ringing. My mom is walking down a long hall, bright with holy light. I am trembling, abiding while the adults pray. I play, barely, with a little red ambulance, watching the empty corridor.";
var commonWords = ". , one I play pull all a an and is it about above across after against around at before behind below beneath beside besides between beyond but by each down during except for from in inside into there like my near of off on out outside over since the through throughout till to toward under until wait stand plus up upon with without according because way addition front regard instead account"; 

var text, wordnet, timeStamp=0, countHolder=0, timeMemory=0, timeBg=0;
var rts = [], arrayLists = [], commons=[], syns=[], colorVals=[];
var bgColor=0, fontColor=255, bgCycleUp=true, textNum=1;
	
function _setup(p) {
	
	RiText.defaults.fontSize = 48;
	RiText.defaultFont("LondonBetween.ttf");

	wordnet = new RiWordNet("localhost", 8080);
	wordnet.exists("dog", function(s) {
		//RiText('the dog exists='+s);
	});
	
	var theWords = RiTa.tokenize(para);
	for (var i = 0; i < theWords.length; i++) { 
		arrayLists[i] = [theWords[i]];
		colorVals[i] = 255.0;
	}

	reformat(p); //  draw initial paragraph on screen
}

function _draw(p) {
	
	if (p.millis() - timeBg > 100) 
	{
		bgColor += bgCycleUp ? .42 : -.42;			 
		bgCycleUp = (bgColor>254) ? false : (bgColor<1) ? true : bgCycleUp;
		fontColor = fontColor - 1.0;
		timeBg = p.millis();
	}
	
	changeText(p);
	
	p.background(bgColor);
	RiText.drawAll();
}

////////////////////////////////////////////////////////////////////////

function reformat(p) {
  
	RiText.disposeAll();
	rts = RiText.createWords(para, 30, 60, p.width-50, p.height-100);
	for (var i = 0; i < rts.length; i++) 
		rts[i].fill(colorVals[i]);
}

function changeText(p) {

	// once two minutes pass, 120000ms, then the text goes into
	// "remembering" state where it is more likely to remember a 
	// replacement that it has already made then to make a new replacement
	var now = p.millis(), max = (now - timeMemory > 120000) ? 10 : 5;
  	textNum  = Math.floor(p.random(1, max));
	
	// this tests for the rate of change of replacements, change for faster/slower rates
	if (now - timeStamp > 1000) {
	  	
	  	//console.log("changeText("+now/1000+")");
		var newWord = '', words = RiTa.tokenize(para);
		
		// count is set to random so loop begins randomly in paragraph
		var count = Math.floor(p.random(1, words.length));
		
		for (var i = 0; i < words.length; count++, i++) 
		{
			(count == words.length) && (count = 0);//  wrap at array end
			if (words[count].length < 2) //  skip punctuation
				continue;
			
			// switch statement which either changes verbs, nouns,
			// adverbs, or adjectives; or remembers an older word
			switch (textNum) {
				case 1:
					newWord = checkAdj(words[count]);
					break;
				case 2:
					checkNoun(words[count]);
					break;
				case 3:
					newWord = checkAdv(words[count]);
					break;
				case 4:
					if (count >= 2) 
					  newWord = checkVerb(words[count], words[count-1]);
					break;
				case 9:
					newWord = remember(count);
					count = countHolder;
					break;
		  	}

			if (newWord && newWord.length) {
			  
				// do this because I change the newWord string below if there
				// is an "a" or "an" -- so tempNewWordHolder is needed to add
				// the original newWord to the array of oldWords below
				
				if (count < 1) count = 1; // DCH: was throwing error
				var theWordToChange = words[count];
				var tempString = words[count - 1]; // to check "a" and "an" agreement
				
				// console.log("The Old W = "+theWordToChange+" The New W = "+newWord+" Count = "+count);
		      	for (var t = 0; t < RiText.instances.length; t++)
		      	{
			        var riString = RiText.instances[t].text();
			        if (equalsIgnoreCase(riString,theWordToChange)
			            || equalsIgnoreCase(riString, theWordToChange + ".")
			            || equalsIgnoreCase(riString, theWordToChange + ","))
			        {
			          //  change the color of text if needed
			          changeTextColor(textNum, t);
			        }
				}
				
				// the part which checks "a" and "an"
				// and makes appropriate changes in the text
				var regex = /([aeiou])/, regex2 = /([^aeiou])/;
				
				var chr = newWord.charAt(0), tempNewWordHolder = newWord; 
				theWordToChange = words[count - 1] + " " + words[count];
				if (equalsIgnoreCase(tempString, "a") && regex.test(chr)) {
					
				    // console.log("YES"+tempString+" "+newWord);
					if (Character.isUpperCase(tempString.charAt(0))) {
						newWord = "An " + newWord;
						// console.log("NO"+tempString + " " + newWord);
					} else {
						newWord = "an " + newWord;
						// console.log("NO"+tempString + " " + newWord);
					}
				} 
				else if (equalsIgnoreCase(tempString, "an") && regex2.test(chr)) {
					
					// console.log("YES"+tempString + " " + newWord);
					if (Character.isUpperCase(tempString.charAt(0))) {
						newWord = "A " + newWord;
						// console.log("NO"+tempString + " " + newWord);
					} else {
						newWord = "a " + newWord;
						// console.log("NO"+tempString + " " + newWord);
					}
					
				} // end the "a" and "an" agreement part
				
				// here is where the replacement is actually made
				var re = new Regex('\b' + theWordToChange + '\b'); // first-only
				para = para.replace(re, newWord);
				
				var tempArray = arrayLists[Math.min(count, arrayLists.length-1)]; //  bounds-check
				if (textNum <= 4) tempArray.push(tempNewWordHolder);
				
				reformat(); // reformat the screen
				break;
			}
		}
		
		timeStamp = p.millis(); // reset timer to make changes
	}
}

///////////////////////////////// TO GO ////////////////////////////////////


function checkNoun(testStr) {
	
	console.log('checkNoun(' + testStr + ')');

	wordnet.isNoun(testStr, function(yes) {
		
		if (yes) {
			
			var wTags = RiTa.getPosTags(testStr, true);
			
			if ((wTags && wTags.length)) {
				
				if ((checkForCommon(testStr)) && equalsIgnoreCase(wTags[0], "n")) {
	
					wordnet.getAllSynonyms(testStr, "n", function(nsyns) {
						
						if (nsyns && nsyns.length) { 
							
							var newStr = nsyns[Math.floor(RiTa.random(0, nsyns.length))];
							if (newStr.equals("repeat"))
								return null;
		
							if (isPlural(testStr)) {
		
								newStr = RiTa.pluralize(newStr);
								if (!wordnet.exists(newStr))
									return null;
							}
		
							if (newStr.endsWith("ing"))
								return null;
		
							var swap =  maintainCaseFirst(testStr, newStr);
						}
					});
				}
			}
		});
	}

	return null;
}

function checkAdj(testStr) {
	console.log('checkAdj('+testStr+')');
}

function checkAdv(testStr) {
	console.log('checkAdv('+testStr+')');
}

function checkVerb(testStr, testStrBefore) {
	console.log('checkVerb('+testStr+','+testStrBefore+')');
}

function checkForCommon(s) {
	console.log('checkForCommon('+s+')');
}

function remember(c) {
	console.log('remember('+c+')');
}	

////////////////////////////////////////////////////////////////////////

function isPlural(s) { return (!s.equals(RiTa.stem(s))); }

function endsWith(str, ending) { 
	
	if (!is(str,S)) return false;
	return str.slice(-ending.length) == ending;
}

function changeToAdverb(nStr) {

	if (endsWith(nStr, "y")) 
		return nStr.substring(0, nStr.length - 1) + "ily";
	
	return nStr + (endsWith(nStr, "ic") ? "ally" : "ly");
}

function maintainCaseFirst(testStr, newStr) {
	if (Character.isUpperCase(testStr.charAt(0)))
		newStr = RiTa.upperCaseFirst(newStr);
	return newStr;
}

function changeTextColor(textNum2, t) {

	if (textNum2 <= 4) 
		colorVals[t] < 0 ? 0 : colorVals[t] - 50;
	else 
		colorVals[t] > 255 ? 255 : colorVals[t] + 50;
}

function equalsIgnoreCase(a,b) {
	return a && b && (a.toUpperCase() === b.toUpperCase());
}
