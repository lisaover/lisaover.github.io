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

var scaleFactor = 10000; //scale income by 10,000

//stores previous school IDs to be used to turn the visited link color off for all links visited since last refresh
var prevId = [];
//stores current school ID to be used to turn the visited link color on
var currentId;

/**
	init() function sets up the initial page by hiding the school-info and prediction boxes,
	creating listeners for the dashboard elements, and fixing IE link display issues
*/
function init() {

   //hide school info, selection, and prediction boxes until user selects a school
	var schoolInfoBox = document.getElementById("school-info").style.display = 'none';
	var predictionBox = document.getElementById("prediction").style.display = 'none';
	
	//get all 'a' tags in dashboard and create event listeners to call showSchool()
	var arrayDash = [];
	var dash = document.getElementById("dashboard");
	arrayDash = dash.getElementsByTagName("a");
	for (var i = 0; i < arrayDash.length; i++)
				{
				   var Id = arrayDash[i].getAttribute("id");
				   var sch = document.getElementById(Id);
    				sch.addEventListener("click",showSchool,false);
				}
				
	//add event listener to refresh button
	var ref = document.getElementById("refresh");
	ref.addEventListener("click",refreshApp,false);
				
	//create event listeners for model selection options
	var linearOption = document.getElementById("linear");
   var logisticOption = document.getElementById("logistic");	
   linearOption.addEventListener("click",predictScore,false);
   logisticOption.addEventListener("click",predictPass,false);
	   
	} //end init
	
/**
	showSchool() function is called on any click event from any dashboard item
	It stops the browser from following the link and instead displays the selected school 
	information in the school-info box. To do this, it collects the textContent of each 'span' tag 
	child of the triggering dashboard 'a' tag, dislays the school information using innerHTML, and 
	displays the school-info box. It also uses the previous school ID to reset the dashboard link to
	inactive and sets the dashboard link for the current ID to active to orient the user.
*/
	function showSchool(evt) {
		
		//blur the selection rectangle for IE
		if(navigator.appName == 'Microsoft Internet Explorer') this.blur();
	
	//hide prediction box until user selects prediction for newly selected school
	var predictionBox = document.getElementById("prediction").style.display = 'none';
	
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
	
	var schoolInfoBox = document.getElementById("school-info").style.display = 'block';
	//var selectionBox = document.getElementById("model-select").style.display = 'block';
   							 
   	//set css properties for selected school to display as visited link in 'dashboard'
   	setVisited(currentId);
   	
   	//add currentId to prevId array 
   	prevId.push(currentId);
   	
   	var formattedMean = formatIncome(schoolInfo[mean]);
   	var formattedMedian = formatIncome(schoolInfo[median]);
   	
   	//display schoolInfo in 'school-info' box
   	document.getElementById("school-info").innerHTML = 
   	"<p><span class=\"highlight\">School: </span>" + schoolInfo[school] + "</p>" +
   	"<p><span class=\"highlight\">District: </span>" + schoolInfo[district] + "</p>" +
   	"<p><span class=\"highlight\">Mean Annual Income: </span> $" + formattedMean + "</p>" +
   	"<p><span class=\"highlight\">Median Annual Income: </span> $" + formattedMedian + "</p>";   
   	
   	//calculate the predicted score and predicted probability of passing
   	var predictedScore = predictScore();
   	var probPass = predictProbPass();
   	
   	//actual probability of passing from data
   	var actualProbPass = Math.round(188/257);
   	
   	//convert the actual score to pass or fail
	var actualResult = interpretValue(schoolInfo[score2013]);	
	//convert model probability to pass or fail
	var predictedResult = interpretValue(probPass);
   
   //create string components for output
	var predictedScoreModel = "<a id=\"linear-predict-link\" href=\"\"><p><span class=\"highlight\">Predicted Score from Model: </span>" + predictedScore + 
	"<div id=\"linear-predict\"><h3>Predicted Score from Model</h3>" + 
    	  "<p>Predicted School Performance Profile score = 19.55 + 1.57(" + schoolInfo[mean]/scaleFactor + ") + 11.43(" + 
    	  schoolInfo[median]/scaleFactor + ") - 0.17(" + schoolInfo[mean]/scaleFactor + ")(" + schoolInfo[median]/scaleFactor + ")*.</p>" +
    	  "<p>*Mean and median income are scaled by a factor of 10,000.</p></div></p></a>";
    	  
   var predictInterval = "<a id=\"linear-PI-link\" href=\"\"><p><span class=\"highlight\">95% Prediction Interval: </span> (" + schoolInfo[lowerIndivCI] + ", " + schoolInfo[upperIndivCI] + ")</p></a>";
	
	var confInterval = "<a id=\"linear-CI-link\" href=\"\"><p><span class=\"highlight\">95% Confidence Interval: </span> (" + schoolInfo[lowerMeanCI] + ", " + schoolInfo[upperMeanCI] + ")</p></a>";
	
   //var actualScore = 	"<p><span class=\"highlight\">Actual Score 2012-2013: </span>" + schoolInfo[score2013] + "</p>";
   
	var predictedProb = "<a id=\"prob-predict-link\" href=\"\"><p><span class=\"highlight\">Probability of Passing from Model: </span>" + probPass + "%</p></a>";
	
	var predictedPass = "<a id=\"logistic-predict-link\" href=\"\"><p><span class=\"highlight\">Prediction from Model: </span>" + predictedResult + "</p></a>";
	
	var actualProb = "<a id=\"prob-actual-link\" href=\"\"><p><span class=\"highlight\">Probability of Passing from Data: </span>" + actualProbPass*100 + "%</p></a>";
   
   var actualScore =	"<p><span class=\"highlight\">Actual Score 2012-2013: </span>" + schoolInfo[score2013] + " (" + actualResult + ")</p>";
   	
   	var schoolAnalysis = predictedScoreModel + predictInterval + confInterval + predictedProb + predictedPass + actualProb + actualScore;
   	
   	//display results in the prediction box
	writeAnalysis(schoolAnalysis);
   	
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

function writeAnalysis(schoolAnalysis) {
	
	//display area where analysis will appear
	var predictionBox = document.getElementById("prediction");
	predictionBox.style.display = 'block';
   	predictionBox.innerHTML = schoolAnalysis;
   	
   	//add event listener for the links in analysis boxes, which will display an explanation on click
   	var logisticPredict = document.getElementById("logistic-predict-link");
	logisticPredict.addEventListener("mouseover",showExplanation,false);
	logisticPredict.addEventListener("click",showExplanation,false);
	logisticPredict.addEventListener("mouseout",hideExplanation,false);
	
	var logisticProb = document.getElementById("prob-predict-link");
	logisticProb.addEventListener("mouseover",showExplanation,false);
	logisticProb.addEventListener("click",showExplanation,false);
	logisticProb.addEventListener("mouseout",hideExplanation,false);
	
	var actualProb = document.getElementById("prob-actual-link");
	actualProb.addEventListener("mouseover",showExplanation,false);
	actualProb.addEventListener("click",showExplanation,false);
	actualProb.addEventListener("mouseout",hideExplanation,false);
	
	var linearPredict = document.getElementById("linear-predict-link");
	linearPredict.addEventListener("mouseover",showExplanation,false);
	linearPredict.addEventListener("click",showExplanation,false);
	linearPredict.addEventListener("mouseout",hideExplanation,false);
	
	var linearPI = document.getElementById("linear-PI-link");
	linearPI.addEventListener("mouseover",showExplanation,false);
	linearPI.addEventListener("click",showExplanation,false);
	linearPI.addEventListener("mouseout",hideExplanation,false);
	
	var linearCI = document.getElementById("linear-CI-link");
	linearCI.addEventListener("mouseover",showExplanation,false);
	linearCI.addEventListener("click",showExplanation,false);
	linearCI.addEventListener("mouseout",hideExplanation,false);
	
	//hide explanations of results
	var linPredictDiv = document.getElementById("linear-predict").style.display = 'none';
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

 /**
	showExplanation() function dislays an explanation of target items in a popup window
*/
function showExplanation(evt) {
	
	//blur the selection rectangle for IE
	if(navigator.appName == 'Microsoft Internet Explorer') this.blur();
		
	//prevent link from being followed
	evt.preventDefault();
	evt.stopPropagation();
	
	//determine the id of the target
	var id = evt.currentTarget.getAttribute("id");
	
	//display the appropriate explanation based on the id
	switch(id) {
    case "linear-predict-link":
    	  var content = 
    	  "<h3>Predicted Score from Model</h3>" + 
    	  "<p>Predicted School Performance Profile score = 19.55 + 1.57(" + schoolInfo[mean]/scaleFactor + ") + 11.43(" + 
    	  schoolInfo[median]/scaleFactor + ") - 0.17(" + schoolInfo[mean]/scaleFactor + ")(" + schoolInfo[median]/scaleFactor + ")*.</p>" +
    	  "<p>*Mean and median income are scaled by a factor of 10,000.</p>"
        break;
    case "linear-PI-link":
        var content = 
        "<h3>95% Prediction Interval</h3>" + 
        "<p>We can predict with 95% certainty that the interval (" + schoolInfo[lowerIndivCI] + ", " + schoolInfo[upperIndivCI] + 
        ") will contain the true School Performance Profile score for a school with mean income $" + formatIncome(schoolInfo[mean]) + 
        " and median income $" + formatIncome(schoolInfo[median]) + ".</p>"
        break;
    case "linear-CI-link":
        var content = 
        "<h3>95% Confidence Interval</h3>" + 
        "<p>We are 95% confident that the interval (" + schoolInfo[lowerMeanCI] + ", " + schoolInfo[upperMeanCI] + 
        ") contains the mean School Performance Profile score for schools with mean income $" + formatIncome(schoolInfo[mean]) + 
        " and median income $" + formatIncome(schoolInfo[median]) + ".</p>"
        break;
    case "logistic-predict-link":
        var content = 
        "<h3>Prediction from Model</h3>" + 
        "<p>P(passing score) = 13.01 - 0.25(" + schoolInfo[mean]/scaleFactor + ") - 3.23(" + 
    	  schoolInfo[median]/scaleFactor + ") + 0.05(" + schoolInfo[mean]/scaleFactor + ")(" + schoolInfo[median]/scaleFactor + ")*.</p>" +
    	  "<p>*Mean and median income are scaled by a factor of 10,000.</p>"
        break;
    case "prob-predict-link":
        var content = 
        "<h3>Probability of Passing from Model</h3>" + 
        "<p>The probability of earning a passing School Performance Profile score is obtained from the model</p>" +
        "<p>P(pass) = 13.01 - 0.25(mean) - 3.23(median) + 0.05(Mean)(median).</p>"
        break;
    case "prob-actual-link":
        var content = 
        "<h3>Probability of Passing from Data</h3>" + 
        "<p>Without the model, the probability of earning a passing score is 73%. </p>" +
        "<p>This is calculated from the data. Out of 257 scores, 188 were 70 or greater, i.e., passing.</p><p> 188/257 = 0.73</p>"
        break;
    default:
        var content = "<p>There was an error. Please refresh the browser and try again.</p>";
     }
     
     var infoBox = document.getElementById("info-box");
     infoBox.innerHTML = content;
     infoBox.style.visibility = "visible";
 
}

/**
	hideExplanation() function hides the popup window displayed for target items in the prediction box
*/
function hideExplanation(evt) {
	
	//hide the explanation
	var infoBox = document.getElementById("info-box");
     infoBox.style.visibility = "hidden";
	}

/**
	refreshApp() function resets the dashboard links to the original color/background settings
	and hides the information and prediction boxes and links
*/
function refreshApp(evt) {
	
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
	var predictionBox = document.getElementById("prediction").style.display = 'none';
	
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