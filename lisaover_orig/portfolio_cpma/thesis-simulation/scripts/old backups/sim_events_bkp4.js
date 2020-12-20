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

//stores previous school IDs to be used to turn the visited link color off for all links visited since last refresh
var prevId = [];
//stores current school ID to be used to turn the visited link color on
var currentId;

/**
	init() function sets up the initial page by hiding the school-info and prediction boxes,
	creating listeners for the dashboard elements, and fixing IE link display issues
*/
function init() {
	
	//format for mobile devices
	if(window.innerWidth < 450) {
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
		
		//display refresh button in footer; change margin of school-info to improve display
		header.innerHTML = "<h2>Select a School to Model Performance with Income</h2>";
		section.innerHTML = "<div id=\"school-info\"></div>" +
													"<div id=\"analysis-section\"></div>" +
													"<div id=\"descriptive\"></div>" +
													"<div id=\"info-section\"></div>";
		section.style.paddingTop = '80px';
		footer.innerHTML = "<a id=\"refresh\" href=\"file:///Users/lisaover/Google%20Drive/CPMA%20Project/Simulation/index.html\">Refresh</a>";
												
		//change dashboard width to equal window width
		var dash = document.getElementById("dashboard");
		var dashWidth = window.innerWidth + "px";
		dash.style.width = dashWidth;
		dash.style.textAlign = 'center';
}

/**
	processAndDisplay() function is called on any click event from any dashboard item;
	it stops the browser from following the link; keeps track of schools visited, and calls 
	showDescriptive() and showSchool() functions
*/
function processAndDisplay(evt) {
	/**
		format for mobile devices
	*/
	if(window.innerWidth < 450) {
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
   		
   		showDescriptive();
   		showSchool();
}

/**
	showDescriptive() calculates and displays descriptive stats
*/
function showDescriptive() {
   	
	/**
		display discriptive stats
	*/
	var descDisplay = document.getElementById("descriptive");
	
	var probDataText = "<p><span class=\"highlight\">Probability of Passing: </span>" + probPassData + "%</p>";
    var meanDataText = "<p><span class=\"highlight\">Mean Score 2012-2013: </span>" + meanData + "</p>";
    var descTitle = "<span class=\"highlight\"><h3>School Performance Profile Descriptive Statistics</h3></span>";
	
	descDisplay.innerHTML = descTitle + meanDataText + probDataText;
	descDisplay.style.display = 'block';
	
	/**
		create string components for content output
	*/
	var meanDataInfo = "<div class=\"content-box\"><a id=\"mean-score\"  class=\"title\" href=\"\">Mean Score</a>" + 
	"<div class=\"content\" id=\"mean-score-desc\"><p>Without the model, the mean School Performance Profile score, " + meanData + ", is used to predict the score for individual schools. </p>" +
        "<p>This is calculated directly from the data using the score from the 257 schools in Allegheny County.</p></div></div>";
    	  
   var probPassDataInfo = "<div class=\"content-box\"><a id=\"prob-pass-data\" class=\"title\" href=\"\">Probability of Passing</a>" + 
   "<div class=\"content\" id=\"prob-pass-desc\"><p>Without the model, the probability of earning a passing score is " + probPassData + "%. </p>" +
        "<p>This is calculated directly from the data. Out of 257 scores, 188 were 70 or greater.</p></div></div>";
   	
   	var descriptiveInfo = meanDataInfo + probPassDataInfo;
   	
   	/**
   		write content in the info section
   	*/
	writeContent(descriptiveInfo, "info-section");

}
	
/**
	showSchool() displays the selected school information in the school-info box. To do this, it collects the 
	textContent of each 'span' tag child of the triggering dashboard 'a' tag, dislays the school information using 
	innerHTML, and displays the school-info box. It also uses the previous school ID to reset the dashboard link
	to inactive and sets the dashboard link for the current ID to active to orient the user.
*/
	function showSchool() {
   	
   	/**
   		format mean and median, translate score into pass/fail, and display school information
   	*/
   	var formattedMean = formatIncome(schoolInfo[mean]);
   	var formattedMedian = formatIncome(schoolInfo[median]);
   	
   	//convert the actual score to pass or fail
	var actualResult = interpretValue(schoolInfo[score2013]);
   	//display schoolInfo in 'school-info' box
   	var schoolData = 
   	"<p><span class=\"highlight2\">District: </span>" + schoolInfo[district] + "</p>" +
   	"<p><span class=\"highlight2\">Mean Annual Income: </span> $" + formattedMean + "</p>" +
   	"<p><span class=\"highlight2\">Median Annual Income: </span> $" + formattedMedian + "</p>" +
   	"<p><span class=\"highlight2\">Actual Score 2012-2013: </span>" + schoolInfo[score2013] + " (" + actualResult + ")</p>";
   	
   	var infoTitle = "<span class=\"highlight2\"><h3>Income and School Performance Profile Score for<BR><BR>" + schoolInfo[school] + "</h3></span>";
	
	var schoolInfoBox = document.getElementById("school-info");
   	schoolInfoBox.innerHTML = infoTitle + schoolData;
   	schoolInfoBox.style.display = 'block';
   	
   	/**
   		run the linear regression and logistic models and write results
   	*/
   	//calculate the predicted score and predicted probability of passing
   	var predictedScore = predictScore();
   	var probPass = predictProbPass();
   	
	//convert model probability to pass or fail
	var predictedResult = interpretValue(probPass);
   
   //create string components for content output
	var predictedScoreModel = "<div class=\"content-box\"><a id=\"predict-score\"  class=\"title\" href=\"\">School Score from Model</a>" + 
	"<div class=\"content\" id=\"predict-score-analysis\"><p>" + predictedScore + "</p><p>Predicted School Performance Profile score = 19.55 + 1.57(" + schoolInfo[mean]/scaleFactor + ") + 11.43(" + 
    	  schoolInfo[median]/scaleFactor + ") - 0.17(" + schoolInfo[mean]/scaleFactor + ")(" + schoolInfo[median]/scaleFactor + ")*.</p>" +
    	  "<p>*Mean and median income are scaled by a factor of 10,000.</p></div></div>";
    	  
   var predictInterval = "<div class=\"content-box\"><a id=\"predict-interval\" class=\"title\" href=\"\">95% Prediction Interval</a>" + 
   "<div class=\"content\" id=\"predict-interval-analysis\"><p>(" + schoolInfo[lowerIndivCI] + ", " + schoolInfo[upperIndivCI] + ")</p>" + 
   "<p>We can predict with 95% certainty that the interval (" + schoolInfo[lowerIndivCI] + ", " + schoolInfo[upperIndivCI] + 
        ") will contain the true School Performance Profile score for a school with mean income $" + formatIncome(schoolInfo[mean]) + 
        " and median income $" + formatIncome(schoolInfo[median]) + ".</p></div></div>";
	
	var confInterval = "<div class=\"content-box\"><a id=\"conf_interval\" class=\"title\" href=\"\">95% Confidence Interval</a>" +
	"<div class=\"content\" id=\"conf-interval-analysis\"><p>(" + schoolInfo[lowerMeanCI] + ", " + schoolInfo[upperMeanCI] + ")</p>" +
	"<p>We are 95% confident that the interval (" + schoolInfo[lowerMeanCI] + ", " + schoolInfo[upperMeanCI] + 
        ") contains the mean School Performance Profile score for schools with mean income $" + formatIncome(schoolInfo[mean]) + 
        " and median income $" + formatIncome(schoolInfo[median]) + ".</p></div></div>";
   
	var predictedProb = "<div class=\"content-box\"><a id=\"prob-pass\" class=\"title\" href=\"\">Probability of Passing from Model</a>" +
	"<div class=\"content\" id=\"prob-pass-analysis\"><p>" + probPass + "%</p><p>" + predictedResult + "</p>" +
	"<p>The probability of earning a passing School Performance Profile score is obtained from the model</p>" +
        "<p>P(pass) = 13.01 - 0.25(mean) - 3.23(median) + 0.05(Mean)(median).</p></div></div>"; 	
   	
   	var schoolAnalysis = predictedScoreModel + predictInterval + confInterval + predictedProb;
   	
   	//display results in the analysis section
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
	
}

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
	
}

function writeContent(txt, id) {
	
	//write content to section specified by 'id' and display the section
	var contentSection = document.getElementById(id);
	contentSection.style.display = 'block';
   	contentSection.innerHTML = txt;
   	
   	//get all tags with class 'content' and hide them
	var array = [];
	arrayContent = document.getElementsByClassName("content");
	for (var i = 0; i < arrayContent.length; i++)
				{
				   var id = arrayContent[i].getAttribute("id");
				   var ana = document.getElementById(id);
    				ana.style.display = 'none';
				}
				
	//get all tags with class 'title' and change borderRadius and add event listeners
	var arrayTitle = [];
	arrayTitle = document.getElementsByClassName("title");
	for (var j = 0; j < arrayTitle.length; j++)
				{
					//change border radius of 'title' div to have 8px radius all around
					arrayTitle[j].style.borderRadius = '8px';
					
					//obtain id and add event listener
					var id = arrayTitle[j].getAttribute("id");
					var titleLink = document.getElementById(id);
    				titleLink.addEventListener("click",toggleContent,false);
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
	
}

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

function toggleContent(evt) {
	
	//blur the selection rectangle for IE
		if(navigator.appName == 'Microsoft Internet Explorer') this.blur();
		
	//prevent link from being followed
	evt.preventDefault();
	evt.stopPropagation();	
	
	//get id of current target and get the parent element, 
	var id = evt.currentTarget.getAttribute("id");	
	var el = document.getElementById(id);
	
	//check if div 'content' is displayed
	if(document.getElementById(id).nextSibling.style.display == 'block') {
		//change the border radius to 8px at top corners and 0px at bottom
		el.style.borderRadius = '8px';	
	
		//get class 'content' element that is the next sibling to target's parent node and set display to block
		var ana = document.getElementById(id).nextSibling;
		ana.style.display = 'none';
	}
	else {
		//change the border radius to 8px at top corners and 0px at bottom
		el.style.borderRadius = '8px 8px 0px 0px';	
	
		//get class 'content' element that is the next sibling to target's parent node and set display to block
		var ana = document.getElementById(id).nextSibling;
		ana.style.display = 'block';
	}
	
}

/**
	refreshApp() function resets the dashboard links to the original color/background settings
	and hides the information and prediction boxes and links
*/
function refreshApp(evt) {
	
	//format for mobile devices
	if(window.innerWidth < 450) {
		
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
	
	//hide school-info and prediction boxes
	var schoolInfoBox = document.getElementById("school-info").style.display = 'none';
	var analysisSect = document.getElementById("analysis-section").style.display = 'none';
	var descBox = document.getElementById("descriptive").style.display = 'none';
	var infoSect = document.getElementById("info-section").style.display = 'none';
	
}

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
	
}

/**
	resetLink() is called on mouseout to style the dashboard links visited since page refresh (browser refresh not refresh button)
	because the refresh button breaks the css stylesheet 'a' styling
*/
function resetLink(evt) {
	
	var id = evt.currentTarget.getAttribute("id");
	
		var link = document.getElementById(id);
		link.style.color = "rgb(0,60,119)";
		link.style.background = "rgba(0, 204, 255, .3)";

}

/**
	hoverLink() is called on mouseover to style the dashboard links visited since page refresh (browser refresh not refresh button)
	because the refresh button breaks the css stylesheet 'a:hover' styling
*/
function hoverLink(evt) {

	var id = evt.currentTarget.getAttribute("id");	
	
	var link = document.getElementById(id);
	link.style.color = "rgb(215,255,255)";
	link.style.background = "rgb(0,60,119)";

}