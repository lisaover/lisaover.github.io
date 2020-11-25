// Declare global variables
//declare array to store score, school, district, mean, and median
var schoolInfo = [];

//declare variables so schoolInfo can be used as an associative array
var score2013 = 0;
var lowerIndivCI = 1;
var upperIndivCI = 2;
var lowerMeanCI = 3;
var upperMeanCI = 4;
var school = 5;
var district = 6;
var mean = 7;
var median = 8;

//set scale factor to scale income
var scaleFactor = 10000; 

//probability of passing from data
var probPassData = Math.round((188/257)*100);  
//mean school performance profile
var meanData = 77.73;

//predicted variables
var predictedScore;
var probPass;
var predictedProbWord;
var actualProbWord;

//stores previous school IDs to be used to turn the visited link color off for all links visited since last refresh
var prevId = [];
//stores current school ID to be used to turn the visited link color on
var currentId;

//check for use of mobile device
var mobileDevice;
if(window.innerWidth < 500) {
	mobileDevice = true;
}
else {
	mobileDevice = false;
}

/**
	init() function sets up the initial page by hiding the school-info and prediction boxes,
	creating listeners for the dashboard elements, and fixing IE link display issues
*/
function init() {
	
	//format for mobile devices
	if(mobileDevice) {
		mobileSetup();
	}

   //hide school info, analysis selection, descriptive, and info section until user selects a school
	var schoolInfoBox = document.getElementById("school-info").style.display = 'none';
	var analysisSect = document.getElementById("analysis-section").style.display = 'none';
	var descBox = document.getElementById("descriptive").style.display = 'none';
	var infoSect = document.getElementById("info-section").style.display = 'none';
	
	//get all 'a' tags in dashboard and create event listeners to call showSchool()
	var arrayDash = [];
	var dash = document.getElementById("dashboard");
	arrayDash = dash.getElementsByTagName("a");
	for (var i = 0; i < arrayDash.length; i++)
				{
				   var id = arrayDash[i].getAttribute("id");
				   var sch = document.getElementById(id);
    				sch.addEventListener("click",processAndDisplay,false);
				}
				
	//add event listener to refresh button
	var ref = document.getElementById("refresh");
	ref.addEventListener("click",refreshApp,false);
	
	} //end init
	
function mobileSetup() {
	
		var header = document.getElementById("header");
		var footer = document.getElementById("footer");
		var section = document.getElementById("section");
		
		//display refresh button in footer; change padding of school-info to improve display
		header.innerHTML = "<h2>Select a School to Model Performance with Income</h2>";
		//change font size for tag h2
		var tagH2 = header.getElementsByTagName("h2");
		tagH2[0].style.fontSize = '75%';
		section.style.paddingTop = '80px';
		section.innerHTML = "<div class=\"wrapper\">" +
												"<div id=\"descriptive\"></div>" +
												"<div id=\"info-section\"></div>" +
												"</div>" +
												"<div class=\"wrapper clearfloat\">" +
												"<div id=\"school-info\"></div>" +
												"<div id=\"analysis-section\"></div>" +
												"</div>";
		
		footer.innerHTML = "<a id=\"refresh\" href=\"file:///Users/lisaover/Google%20Drive/CPMA%20Project/Simulation/index.html\">Refresh</a>";
												
		//change dashboard width to equal window width
		var dash = document.getElementById("dashboard");
		var dashWidth = window.innerWidth + "px";
		dash.style.width = dashWidth;
		dash.style.textAlign = 'center';
} //end mobileSetup()

/**
	processAndDisplay() function is called on any click event from any dashboard item;
	it stops the browser from following the link; keeps track of schools visited, and calls 
	showDescriptive() and showSchool() functions
*/
function processAndDisplay(evt) {
	/**
		format for mobile devices
	*/
	if(mobileDevice) {
		//set a new width
		var newWidth = window.innerWidth + "px";
		
		//hide dashboard when a school is selected
		var dash = document.getElementById("dashboard");
		dash.style.display = 'none';
		
		//change margins of section
		var sect = document.getElementById("section");
		sect.style.marginTop = '-30px';
		sect.style.marginLeft = '5px';
		sect.style.paddingLeft = 'auto';
	}
	
	/**
		navigation - keep track of schools visited plus some other 'a' tag handling
	*/
		//blur the selection rectangle for IE
		if(navigator.appName == 'Microsoft Internet Explorer') this.blur();
	
		//prevent link from being followed
		evt.preventDefault();
		evt.stopPropagation();
	
		//set currentID global variable
		currentId = evt.currentTarget.getAttribute("id");	
	
		//declare array to store children of current event target, which are the span tags with text content - score2013, school, district, mean, median
		var targetArray = evt.currentTarget.children;
	
		//for each child of current target, if child has textContent push value onto newly declared tempInfo array 
		//then copy to schoolInfo - otherwise schoolInfo will accumulate info for all schools selected in one session
		var tempInfo = [];
		for (var i = 0; i < targetArray.length; i++)
				{
				   if(targetArray[i].textContent) {
				   tempInfo.push(targetArray[i].textContent);
				   }
				}
		//copy tempInfo to schoolInfo global variable
		schoolInfo = tempInfo;
   							 
   		//set css properties for selected school to display as visited link in 'dashboard'
   		setVisited(currentId);
   	
   		//add currentId to prevId array 
   		prevId.push(currentId);
   		
   		/**
   		run the linear regression and logistic models and store in global variables
   		*/
   		//calculate the predicted score and predicted probability of passing
   		predictedScore = predictScore();
   		probPass = predictProbPass();
   	
		//convert model probability to pass or fail
		predictedProbWord = interpretValue(probPass);
		//convert actual score to pass or fail
		actualProbWord = interpretValue(schoolInfo[score2013]);
   		
   		//create and write descriptive stats and school data/prediction
   		showDescriptive();
   		showSchool();
   		
		//hide divs with class 'content-box'   		
   		hideContent();
   		//add event listeners to links of class 'content-link' to display 'content-box' when user selects link
		activateContentLinks();
} //end processAndDisplay()

/**
	showDescriptive() calculates and displays descriptive stats
*/
function showDescriptive() {
   
	/**
   		create string components for content output and write to div
   	*/
	var probDataText = "<p><a id=\"prob-pass\" class=\"content-link\" href=\"\">Probability of Passing: </a>" + probPassData + "%</p>";
    var meanDataText = "<p><a id=\"mean-score\"  class=\"content-link\" href=\"\">Mean Score 2012-2013: </a>" + meanData + "</p>";
    var descTitle = "<span class=\"highlight\"><h3>School Performance Profile <BR>Descriptive Statistics</h3></span>";
	
	var descStats = descTitle + meanDataText + probDataText;
	
	/**
   		write content in the descriptive div and display div
   	*/
	writeContent(descStats, "descriptive");
	
	var meanDataInfo = "<div class=\"content-box\" id=\"mean-score-content\"><h3 class=\"title\">Mean Score</h3>" + 
	"<div class=\"content\"><p>Without the model, the mean School Performance Profile score, " + meanData + ", is used to predict the score for individual schools. </p>" +
        "<p>This is calculated directly from the data using the score from the 257 schools in Allegheny County.</p></div></div>";
    	  
   var probPassDataInfo = "<div class=\"content-box\" id=\"prob-pass-content\"><h3 class=\"title\">Probability of Passing</h3>" + 
   "<div class=\"content\"><p>Without the model, the probability of earning a passing score is " + probPassData + "%. </p>" +
        "<p>This is calculated directly from the data. Out of 257 scores, 188 were 70 or greater.</p></div></div>";
   	
   	var descriptiveInfo = meanDataInfo + probPassDataInfo;
   	
   	/**
   		write content in the info section div and display div
   	*/
	writeContent(descriptiveInfo, "info-section");

} //end showDescriptive()
	
/**
	showSchool() displays the selected school information in the school-info box. To do this, it collects the 
	textContent of each 'span' tag child of the triggering dashboard 'a' tag, dislays the school information using 
	innerHTML, and displays the school-info box. It also uses the previous school ID to reset the dashboard link
	to inactive and sets the dashboard link for the current ID to active to orient the user.
*/
	function showSchool() {
   	
   	/**
   		format mean and median and write school information
   	*/
   	var formattedMean = formatIncome(schoolInfo[mean]);
   	var formattedMedian = formatIncome(schoolInfo[median]);
   	
   	/**
   		create string components for content output and write to div
   	*/
   	var infoSchool = 
   	"<p><span class=\"highlight2\">District: </span>" + schoolInfo[district] + "</p>" +
   	"<p><span class=\"highlight2\">Annual Income: Mean</span> $" + formattedMean + 
   			" <span class=\"highlight2\">Median:</span> $" + formattedMedian + "</p>" +
   	"<p><span class=\"highlight2\">Actual Score 2012-2013: </span>" + schoolInfo[score2013] + " (" + actualProbWord + ")</p>" +
   	"<p><a id=\"predict-score\"  class=\"content-link\" href=\"\">Score from Model: </a>" + predictedScore + "</p>" +
   	"<p><a id=\"predict-prob\" class=\"content-link\" href=\"\">Probability of Passing from Model: </a>" + probPass + "%</p>";
   	
   	var infoTitle = "<span class=\"highlight2\"><h3>Income and School Performance <BR>Profile Score for<BR><BR>" + schoolInfo[school] + "</h3></span>";
	
	var schoolContent = infoTitle + infoSchool;
	
	/**
   		write content in the school info div and display div
   	*/
	writeContent(schoolContent, "school-info");
   
	var predictedScoreModel = "<div class=\"content-box\" id=\"predict-score-content\"><h3 class=\"title\">School Score from Model</h3>" + 
	"<div class=\"content\"><p>Model Score: " + predictedScore + "</p><p>Modeled School Performance Profile score = </p><p class=\"center\">19.55 + 1.57(mean) + 11.43(median) - <BR>0.17(mean*median)</p>" +
    	  " <p>&mdash;when mean and median income are scaled by a factor of 10,000.</p><h3>95% Prediction Interval</h3>" + 
   "<p>(" + schoolInfo[lowerIndivCI] + ", " + schoolInfo[upperIndivCI] + ")</p>" + 
   "<p>We can predict with 95% certainty that the interval (" + schoolInfo[lowerIndivCI] + ", " + schoolInfo[upperIndivCI] + 
        ") will contain the true School Performance Profile score for a school with mean income $" + formatIncome(schoolInfo[mean]) + 
        " and median income $" + formatIncome(schoolInfo[median]) + ".</p><h3>95% Confidence Interval</h3>" +
	"<p>(" + schoolInfo[lowerMeanCI] + ", " + schoolInfo[upperMeanCI] + ")</p>" +
	"<p>We are 95% confident that the interval (" + schoolInfo[lowerMeanCI] + ", " + schoolInfo[upperMeanCI] + 
        ") contains the mean School Performance Profile score for schools with mean income $" + formatIncome(schoolInfo[mean]) + 
        " and median income $" + formatIncome(schoolInfo[median]) + ".</p></div></div>";
   
	var predictedProbModel = "<div class=\"content-box\" id=\"predict-prob-content\"><h3 class=\"title\">Probability of Passing from Model</h3>" +
	"<div class=\"content\"><p>Modeled Probability of Passing: " + probPass + "% (" + predictedProbWord + ")</p>" +
	"<p>Probability of Passing School Performance Profile score = </p><p class=\"center\">13.01 - 0.25(mean) - 3.23(median) + <BR>0.05(mean*median)</p>" +
	" <p>&mdash;when mean and median income are scaled by a factor of 10,000.</p></div></div>"; 	
   	
   	var schoolAnalysis = predictedScoreModel + predictedProbModel;
   	
   	/**
   		write content in the analysis section div and display div
   	*/
	writeContent(schoolAnalysis, "analysis-section");
   	
} //end showSchool

/**
	predictScore() function predicts the school performance score for the currently selected school
	using the estimated parameters from the linear model
*/
function predictScore() {
	
	//blur the selection rectangle for IE
		if(navigator.appName == 'Microsoft Internet Explorer') this.blur();
	
	//declare constants
	var intercept = 19.5537;
	var meanSlope = 1.5682;
	var medianSlope = 11.4315;
	var interactSlope = 0.1703;
	
	//scale the mean and median income
	var scaledMean = schoolInfo[mean]/scaleFactor;
	var scaledMedian = schoolInfo[median]/scaleFactor;
	
	//calculate predicted score
	predictedScore = intercept + meanSlope*scaledMean + medianSlope*scaledMedian - interactSlope*scaledMean*scaledMedian;
	//round the predicted score to the nearest tenth if not equal to 100; set scores 100 or greater equal to 100
	if(predictedScore < 100) {
		predictedScore=Math.round(predictedScore*10)/10;
	}
	else predictedScore = 100;
	
	return predictedScore;
	
} //predictScore()

/**
	predictPass() function predicts a passing or failing mark for the currently selected school
	using the estimated parameters from the logistic model (modeling failing) and assigning
	a "fail" mark if the predicted probability is greater than 0.5 and a "pass" mark otherwise
*/
function predictProbPass() {
	
	//blur the selection rectangle for IE
		if(navigator.appName == 'Microsoft Internet Explorer') this.blur();
	
	//declare constants
	var intercept = 13.0066;
	var meanSlope = 0.2499;
	var medianSlope = 3.225;
	var interactSlope = 0.0494;
	var e = 2.7183;
	
	//scale the mean and median income
	var scaledMean = schoolInfo[mean]/scaleFactor;
	var scaledMedian = schoolInfo[median]/scaleFactor;
	
	//calculate log odds (odds of failing to odds of passing)
	var logOdds = intercept - meanSlope*scaledMean - medianSlope*scaledMedian + interactSlope*scaledMean*scaledMedian;
   var logOdds = Math.round(logOdds*1000)/1000;
	
	//calculate probability of failing using model
	var probFail = Math.pow(Math.E, logOdds)/(1 + Math.pow(Math.E, logOdds));
	probFail = Math.round(probFail*100); 
	//convert to probability of passing
	var probPass = (100 - probFail);

	return probPass;
	
} //end predictProbPass

/**
	toggleContent() function closes currently open content box and opens
	the one related to the target
*/
function toggleContent(evt) {
	
	//blur the selection rectangle for IE
		if(navigator.appName == 'Microsoft Internet Explorer') this.blur();
		
	//prevent link from being followed
	evt.preventDefault();
	evt.stopPropagation();	
	
	//get id of current target, create related '-content' id, and get and display the content element
	var id = evt.currentTarget.getAttribute("id");	
	var contentId = id + "-content";
	
	//get the related '-content' and display it
	var contentEl = document.getElementById(contentId);
	contentEl.style.display = 'block';
	
	//get id of parent node; select all content-box divs under that parent
	var parentId = contentEl.parentNode.getAttribute("id");
	var parentEl = document.getElementById(parentId);
	var contentArray = [];
	contentArray = 	parentEl.getElementsByClassName("content-box");
	
	for (var j = 0; j < contentArray.length; j++)
				{
					//obtain id and check display state
					var boxId = contentArray[j].getAttribute("id");
					var boxContent = document.getElementById(boxId);
					if(boxId != contentId) {
    					if(boxContent.style.display == 'block') {
    						boxContent.style.display = 'none';
    					}
    				}
				}
	
	
} //end toggleContent()

/**
	writeContent() function writes string held in 'txt' to div specified by 'id' and displays the section
*/
function writeContent(txt, id) {
	
	//write content to section specified by 'id' 
	var contentSection = document.getElementById(id);
   	contentSection.innerHTML = txt;
   	contentSection.style.display = 'block';

} //end writeContent()

/**
	hideContent() function hides all 'content-box' divs
*/
function hideContent() {

   	//get all tags with class 'content-box' and hide them
	var array = [];
	arrayContent = document.getElementsByClassName("content-box");
	for (var i = 0; i < arrayContent.length; i++)
				{
				   var id = arrayContent[i].getAttribute("id");
				   var cnt = document.getElementById(id);
    				cnt.style.display = 'none';
				}

} //end hideContent()

/**
	activateContentLinks() function gets all 'a' tags with class content-link
	and adds event listeners
*/
function activateContentLinks() {
	
	var arrayContent = [];
	arrayContent = document.getElementsByClassName("content-link");
	for (var j = 0; j < arrayContent.length; j++)
				{
					//obtain id and add event listener
					var id = arrayContent[j].getAttribute("id");
					var contentLink = document.getElementById(id);
    				contentLink.addEventListener("click",toggleContent,false);
				}
}

/**
	interpretValue() function converts probability to pass or fail (if parameter is less than 1)
	or score to pass or fail (if parameter is greater than 1)
*/
function interpretValue(para) {
	//convert probability to pass or fail
	if(para < 1) {
		if(prob < 0.5) {
		var result = "Fail";	
		}
		else result = "Pass";
		}
	else {
		if(para < 70) {
		var result = "Fail";	
		}
		else result = "Pass";
		}

	return result;
	
} //end interpretValue()

/**
	formatIncome() function formats the income to include a comma
	assumes no more than 6 figure income and no less than 4 figure income
*/
function formatIncome(income) {
   	var incomeArray = income.split("");
   	var formatted = "";
   	for(var k = 0; k < incomeArray.length; k++)
   			{
				   		if(incomeArray.length == 6) {
				   			if(k == 3) {
				   				formatted = formatted + "," + incomeArray[k];
				   			}
				   			else {
				   				formatted = formatted + incomeArray[k];
				   			}
				   		}	
				   		else if (incomeArray.length == 5) {
				   			if(k == 2) {
				   				formatted = formatted + "," + incomeArray[k];
				   			}
				   			else {
				   				formatted = formatted + incomeArray[k];
				   			}
				   		}
				   		else if(incomeArray.length == 4) {
				   			if(k == 1) {
				   				formatted = formatted + "," + incomeArray[k];
				   			}
				   			else {
				   				formatted = formatted + incomeArray[k];
				   			}
				   		}
   			}
   			
   			return formatted;
   			
} //end formatIncome()

/**
	refreshApp() function resets the dashboard links to the original color/background settings
	and hides the information and prediction boxes and links
*/
function refreshApp(evt) {
	
	//format for mobile devices
	if(mobileDevice) {
		
		//hide dashboard when a school is selected
		var dash = document.getElementById("dashboard");
		dash.style.display = 'block';
		
	}
	
	//blur the selection rectangle for IE
		if(navigator.appName == 'Microsoft Internet Explorer') this.blur();
		
	//prevent link from being followed
	evt.preventDefault();
	evt.stopPropagation();
	
	//reset set all dashboard links
	for (var i = 0; i < prevId.length; i++)
				{
				   refreshLink(prevId[i]);
				}	
	//reset prevId array
	prevId = [];
	
	//hide section divs
	var schoolInfoBox = document.getElementById("school-info").style.display = 'none';
	var analysisSect = document.getElementById("analysis-section").style.display = 'none';
	var descBox = document.getElementById("descriptive").style.display = 'none';
	var infoSect = document.getElementById("info-section").style.display = 'none';
	
} //end refreshApp()

/**
	setVisited() function formats the visited links to help users keep track of what schools they've looked at
*/
function setVisited() {

	var link = document.getElementById(currentId);
	link.style.color = "rgb(215,255,255)";
	link.style.background = "#009999";
	
	//remove the event listener to prevent losing the visited marker on mouseover/out
	link.removeEventListener("mouseover",hoverLink);
   link.removeEventListener("mouseout",resetLink);

 }  //end setVisited

/**
	refreshLink() sets all visited links stored in prevId array back to original inactive color
	and adds event listeners for mouseover/out to take over css hover function
*/
function refreshLink(id) {
	
	var link = document.getElementById(id);
	link.style.color = "rgb(0,60,119)";
	link.style.background = "rgba(0, 204, 255, .3)";
	
	//add event listener to take over css hover functionality (lost when styles are set)
	link.addEventListener("mouseover",hoverLink,false);
   link.addEventListener("mouseout",resetLink,false);
	
} //end refreshLink()

/**
	resetLink() is called on mouseout to style the dashboard links visited since page refresh (browser refresh not refresh button)
	because the refresh button breaks the css stylesheet 'a' styling
*/
function resetLink(evt) {
	
	var id = evt.currentTarget.getAttribute("id");
	
		var link = document.getElementById(id);
		link.style.color = "rgb(0,60,119)";
		link.style.background = "rgba(0, 204, 255, .3)";

} //end resetLink()

/**
	hoverLink() is called on mouseover to style the dashboard links visited since page refresh (browser refresh not refresh button)
	because the refresh button breaks the css stylesheet 'a:hover' styling
*/
function hoverLink(evt) {

	var id = evt.currentTarget.getAttribute("id");	
	
	var link = document.getElementById(id);
	link.style.color = "rgb(215,255,255)";
	link.style.background = "rgb(0,60,119)";

} //end hoverLink()