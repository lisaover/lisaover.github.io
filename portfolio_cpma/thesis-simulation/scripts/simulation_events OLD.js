// Declare global variables

//declare array to store score, school, district, mean, and median
var schoolInfo = [];
//declare array to store site divisions
var siteDivisions = [];
//stores previous school IDs to be used to turn the visited link color off for all links visited since last refresh
var prevId = [];
//stores current school ID to be used to turn the visited link color on
var currentId;
//stores id of currently displayed division (all mainNav buttons must have id pattern: [name of division here]_btn for the code to work)
var currentView;

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

//set school-stats instructions
var instructions = "<div id=\"instruct\" class=\"summary\"><h2 class=\"center\">Select a School to Model the <BR>School Performance Profile Score</h2></div>";

//set separator
var separator = "<p class=\"center\">&diams;&diams;&diams;&diams;&diams;</p>";

//set mean of mean and median incomes
var meanGrandMean = 74166.20;
var meanGrandMedian = 67819.00;
var medianGrandMean = 55844.40;
var medianGrandMedian = 51510.00;
var sdMeanIncome = 25669.27;
var sdMedianIncome = 18274.96;

//declare regression parameters
var interceptReg = 43.3384;
var meanSlopeReg = 0.9899;
var medianSlopeReg = 5.336;
var interactSlopeReg = (0 - 0.6271); //negative

//set scale factor to scale income
var scaleFactor = 10000; 
var scaleFormatted = "10,000";

//probability of passing from data
var numPass = 188;
var n=257;
var probPassData = Math.round((numPass/n)*100)/100;  

//declare logisitic parameters
var interceptLog = (0 - 7.36); //negative
var medianSlopeLog = (1.75); 

//mean, std dev, and median school performance profile
var meanSPP = 77.73;
var sdSPP = 13.66;
var medianSPP = 79.8;

//R-squared and RMSE from linear model
var rSquared = 0.5587;
var RMSE = 9.075;
//accuracy and misclassification rate of the logit model
var negLogLike = 61.9;
var logitAccuracy = 0.905;
var misclassRate = 0.1479;

//predicted variables
var predictedScore;
var probPass;
var lnOdds;
var predictedProbWord;
var actualProbWord;

var mobileDevice = false;
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
	mobileDevice = false; //NOT IN USE
}

/**
	init() function sets up the initial page by hiding the school-info and prediction boxes,
	creating listeners for the dashboard elements, and fixing IE link display issues
*/
function init() {
	
	//format for mobile devices NOT IN USE
	if(mobileDevice) {
		mobileSetup();
	}
	
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
				
	/**
	create event listeners for buttons in mainNav
	split the ids and store the first part in global array 'siteDivisions'
	*/
	
	//get all 'a' tags in 'ul' element 'buttons' and create event listeners to call toggleDiv
	var arrayBtns = [];
	var btns = document.getElementById("buttons"); 
	arrayBtns = btns.getElementsByTagName("li");  //get all 'li' tags within 'buttons'
	for (var i = 0; i < arrayBtns.length-1; i++) //iterate through array of 'li' tags except for the last one, which is handled separately
				{

				   var id = arrayBtns[i].firstChild.getAttribute("id"); //get id of 'a' tag that is child of 'li' tag
				   var btn = document.getElementById(id);
    				btn.addEventListener("click",toggleDiv,false);
    				
    				//store first part of id (all but '_btn' extension) in global array siteDivisions
    				var divTemp = id.split("_");
    				siteDivisions.push(divTemp[0]);
    				//push division counterparts with '_content' extension for all except first and last (abstract and refresh)
    				if(i > 0 && i < arrayBtns.length-1) { 
    					siteDivisions.push(divTemp[0] + "_content");
    				}
    				
					//add CSS style for main nav buttons to remain styled as hover when body id equals the related site division
					addBtnCSS(divTemp[0]);  				
    				
				}
				
			   //push 'dashboard' onto siteDivisions array
			   siteDivisions.push("dashboard");
	
	//add event listener to refresh button (the last button in the list)
	var id = arrayBtns[arrayBtns.length-1].firstChild.getAttribute("id");
	var ref = document.getElementById(id);
	ref.addEventListener("click",refreshApp,false);
	
	//create and write descriptive stats and model info
   	writeDescriptive();
   	writeModel();
   	
   	//write instructions for school-stats
	var schContent = document.getElementById("school-stats");
   	schContent.innerHTML = instructions;
   	
   	//set currentView to 'abstract'
   	currentView = "abstract";
   	
   	/**
	hide all components except the current view
	*/
	
	for(var s = 0; s < siteDivisions.length; s++) {
		if(siteDivisions[s] != currentView && siteDivisions[s] != currentView+"_content") {
			document.getElementById(siteDivisions[s]).style.display = 'none';
	   }
	}
	
	//hide all document divs with class 'content-box'   		
   	hideEl("content-box", "document");
	
	//hide all document divs with class 'summary' NOT IN USE
	//hideEl("summary", "document");
   	
   	//hide all math divs
   	hideEl("math", "document");
   	
   	/**
   	add event listeners to the following divs to toggle their visibility based on user action
   	*/
   	
   	//add event listeners to links of class 'content-link' to display 'content-box' when user selects link
	activateLinks("content-link");
	
	//add event listeners to links of class 'title-link' to display 'summary' when user selects link NOT IN USE
   //	activateLinks("title-link");
   	
   	//add event listeners to links of class 'math-link' to display mathematics when user selects 'Show the Math'
   	activateLinks("math-link");
	
	} //end init
	
/**
addBtnCSS() function receives an id for one of the main nav buttons - without the '_btn' extension - and creates CSS that will keep the button 
styled as if hovered over when the related div is visible

this CSS works when the body id equals the main nav button id with a '_bdy' extension so other JS changes body id when user clicks a button
*/
function addBtnCSS(id) {
		var sheet = document.createElement('style')
      sheet.innerHTML = "header a:hover, body#" + id + "_bdy #" + id + "_btn {color:#000033; background:#00ccff; box-shadow:3px 3px 5px rgba(215,255,255,0.5) inset;}";
      document.body.appendChild(sheet);
}
	
function mobileSetup() { //remove position-related attributes and float content div DOES NOT WORK
	
	var contentDivArry = document.getElementsByClassName("content-div");
	for(var i=0; i < contentDivArry.length; i++) {
		contentDivArry[i].style.position = "";
		contentDivArry[i].style.marginTop = "";
		contentDivArry[i].style.marginLeft = "";
		contentDivArry[i].style.float = "left";
		contentDivArry[i].style.width = "395px";
	}
		
} //end mobileSetup()

/**
	refreshApp() function resets the dashboard links to the original color/background settings
	and hides the information and prediction boxes and links
*/
function refreshApp(evt) {
	
	//format for mobile devices NOT IN USE
	if(mobileDevice) {
		
	}
	
	//blur the selection rectangle for IE
		if(navigator.appName == 'Microsoft Internet Explorer') this.blur();
		
	//prevent link from being followed
	evt.preventDefault();
	
	/**
		perform the following UNLESS currentView is 'abstract'
		close content boxes and math in current view (if school-stats refresh prevId and dashboard)
	*/
	if(currentView != 'abstract') {
	
	switch (currentView) {
		case "descriptive":
			var contentView = "descriptive_content"
			break;
		case "model-stats":
			var contentView = "model-stats_content"
			break;
		case "school-stats":
			var contentView = "school-stats_content";
			break;
	}
	
	//hide math in all content-boxes within division
   	hideEl("math", contentView);
	
	//select all content-box divs under the content division and hide the one that is displayed
	var contentEl = document.getElementById(contentView);
	var contentArray = [];
	contentArray = 	contentEl.getElementsByClassName("content-box");
	for (var j = 0; j < contentArray.length; j++)
				{
					//obtain id and check display state
					var boxId = contentArray[j].getAttribute("id");
					var boxContent = document.getElementById(boxId);
					if(boxId != contentView) {
    					if(boxContent.style.display == 'block') {
    						boxContent.style.display = 'none';
    						  //obtain id of 'a' tag reference by splitting content box id and obtain nodeValue of 'a' tag
								var boxAtagId = boxId.split("_");
								var boxAtag = document.getElementById(boxAtagId[0]);
								var aTxt = boxAtag.firstChild.nodeValue;
								var aTxtParts = aTxt.split("\t");
								//if id of current target is 'r-square' add '<sup>2</sup>' to the inner html
								if(boxAtagId[0] == "r-square") {
									boxAtag.innerHTML = aTxtParts[0] + "<sup>2</sup>";
								}
								else {
									boxAtag.innerHTML = aTxtParts[0];
							   }

    					}
    				}
				}	
	
	//if content view is school-stats, refresh dashboard and write instructions
	if(currentView == "school-stats") {
			//write instructions for school-stats
			var schContent = document.getElementById("school-stats");
   			schContent.innerHTML = instructions;		
	      //reset set all dashboard links
			for (var i = 0; i < prevId.length; i++)
				{
				   refreshLink(prevId[i])
				}	
			//reset prevId array
			prevId = []
	}
   	
   } //end if currentView is NOT 'abstract'
	
} //end refreshApp()

/**
	processAndDisplay() function is called on any click event from any dashboard item;
	it stops the browser from following the link; keeps track of schools visited, and calls 
	showDescriptive() and showSchool() functions
*/
function processAndDisplay(evt) {
	
	/**
		navigation - keep track of schools visited plus some other 'a' tag handling
	*/
		//blur the selection rectangle for IE
		if(navigator.appName == 'Microsoft Internet Explorer') this.blur();
	
		//prevent link from being followed
		evt.preventDefault();
		//evt.stopPropagation();
	
		//set currentID global variable
		currentId = evt.currentTarget.getAttribute("id");	
		 //alert(currentId);
	
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
		predictedProbWord = interpretProb(probPass);
		//convert actual score to pass or fail
		actualProbWord = interpretProb(schoolInfo[score2013]);
   		
   		//create and write school data/stats
   		showSchool();
   		
		//hide divs with class 'content-box'   		
   		hideEl("content-box", "document");
   		
   		//add event listeners to links of class 'content-link' to display 'content-box' when user selects link
		activateLinks("content-link");
		
		//hide divs with clas 'summary' NOT IN USE
		//hideEl("summary", "document");
		
		//add event listeners to links of class 'title-link to display 'summary' when user selects link NOT IN USE
		//activateLinks("title-link");
		
		//add event listeners to links of class 'math-link' to display mathematics when user selects 'Show the Math'
   		activateLinks("math-link");
   		
   		//hide math
   		hideEl("math", "document");
		
} //end processAndDisplay()

/**
	writeDescriptive() calculates and creates descriptive stats and creates descriptive content
*/
function writeDescriptive() {
   
	/**
   		create string components for descriptive and write to div
   	*/
	var descTitle = "<h3>School Performance Profile (SPP) and Income<BR>Descriptive Statistics for Allegheny County</h3>";   	
   	
	var sppTitle = "<p class=\"highlight2\">2012-2013 SPP Scores</p>";   	
   	var distSPPText =	"<p><a id=\"distribution\"  class=\"content-link\" href=\"\">Distribution of SPP Scores</a></p>";
   var centerSPPText = "<p><a id=\"center-spread\"  class=\"content-link\" href=\"\">Center and Spread of SPP Scores</a></p>";
   var probSPPText = "<p><a id=\"prob-pass\" class=\"content-link\" href=\"\">Probability of Passing from Data</a></p>";

	var sppTitle2 = "<p class=\"highlight2\">2013-2014 SPP Scores</p>";
	var distSPPText2 =	"<p><a id=\"distribution2\"  class=\"content-link\" href=\"\">Distribution of SPP Scores</a></p>";
   var centerSPPText2 = "<p><a id=\"center-spread2\"  class=\"content-link\" href=\"\">Center and Spread of SPP Scores</a></p>";
   var probSPPText2 = "<p><a id=\"prob-pass2\" class=\"content-link\" href=\"\">Probability of Passing from Data</a></p>";
    
	var meanTitle = "<p class=\"highlight2\">Mean Income</p>";
	var distMeanText =	"<p><a id=\"distribution-mean\"  class=\"content-link\" href=\"\">Distribution of Mean Incomes</a></p>";
   var centerMeanText = "<p><a id=\"center-spread-mean\"  class=\"content-link\" href=\"\">Center and Spread of Mean Incomes</a></p>";
   var boxSPPMeanText = "<p><a id=\"spp-by-mean\" class=\"content-link\" href=\"\">Box Plots of SPP Scores by Mean Incomes</a></p>";
    
	var medianTitle = "<p class=\"highlight2\">Median Income</p>";
	var distMedianText =	"<p><a id=\"distribution-median\"  class=\"content-link\" href=\"\">Distribution of Median Incomes</a></p>";
   var centerMedianText = "<p><a id=\"center-spread-median\"  class=\"content-link\" href=\"\">Center and Spread of Median Incomes</a></p>";
   var boxSPPMedianText = "<p><a id=\"spp-by-median\" class=\"content-link\" href=\"\">Box Plots of SPP Scores by Median Incomes</a></p>";
	
	var descStats = descTitle + "<div id=\"desc-main-summary\" class=\"summary\">" + separator + sppTitle + distSPPText + centerSPPText + probSPPText + meanTitle + distMeanText + centerMeanText + boxSPPMeanText + medianTitle + distMedianText + centerMedianText + boxSPPMedianText + "</div>";
	
	writeContent(descStats, "descriptive");
	
	/**
   		create string components for model-stats_content and write to div
   	*/
	var distributionSPP = "<div class=\"content-box\" id=\"distribution_content\"><h3 class=\"title\">Distribution of SPP Scores</h3>" + 
   "<div class=\"content\"><p>The histogram illustrates the distribution of 2012-2013 School Performance Profile Scores for schools in Allegheny County with <span class=\"color4\">mean " + meanSPP + 
   "</span> and <span class=\"color4\">standard deviation " + sdSPP + "</span>. The distribution is skewed left with the majority of scores above 70.</p>" + 
   "<p class=\"center\"><a href=\"images/2013ScoreDistribution.png\" onclick=\"window.open (this.href, 'child', 'height=504,width=596,top=100,left=100'); return false\"><img src=\"images/2013ScoreDistribution.png\" width=\"298\" height=\"252\"/></a><BR><BR>Click the image to display a larger version in a new window.</p></div></div>";   	
   	
	var centerSPPInfo = "<div class=\"content-box\" id=\"center-spread_content\"><h3 class=\"title\">Center and Spread of SPP Scores</h3>" + 
	"<div class=\"content\"><p>The mean School Performance Profile (SPP) score, <span class=\"color3\">" + meanSPP + "</span>, is a measure of central tendency, and thus, represents" + 
	" the entire distribution of SPP scores. </p>" + "<p>Another measure of central tendency typically used to represent a distribution of continuous data" + 
	" is the median. The median SPP score, <span class=\"color3\">" + medianSPP  + "</span>, is very close to the mean so either value could be used to represent the distribution.</p>" + 
	"<p>Because the mean takes every value into consideration, i.e., <span class=\"color4\">the mean SPP score is the sum of the 257 scores divided by 257</span>, we will consider the mean" +
        " as the best representative value for this distribution of SPP scores.</p><p>The standard deviation of this distribution of School Performance Profile (SPP) scores, <span class=\"color3\">" + sdSPP + "</span>, is a measure of spread and " + 
	" <span class=\"color4\">provides a measure of the average distance the SPP scores are from the mean</span>, <span class=\"color3\">" + meanSPP + "</span>. </p>" + "<p></p></div></div>";
        
   var probPassSPPInfo = "<div class=\"content-box\" id=\"prob-pass_content\"><h3 class=\"title\">Probability of Passing from Data</h3>" + 
   "<div class=\"content\"><p>The probability of earning a passing score calculated directly from the data is <span class=\"color3\">" +  probPassData + "</span>. The probability of passing" +
   " is the number of passing scores, <span class=\"color4\">" + numPass + "</span>, <span class=\"color4\">divided by</span> the total number of scores, <span class=\"color4\">" + n + "</span>. There is a <span class=\"color3\">" + probPassData*100 + 
   "%</span> chance any given school will earn a passing score.</p></div></div>";
   
   var distributionMeanIncome = "<div class=\"content-box\" id=\"distribution-mean_content\"><h3 class=\"title\">Distribution of Mean Incomes</h3>" + 
   "<div class=\"content\"><p>The histogram illustrates the distribution of scaled mean family incomes for schools in Allegheny County with <span class=\"color4\">mean " + Math.round(meanGrandMean)/scaleFactor + 
   "</span> and <span class=\"color4\">standard deviation " + Math.round(sdMeanIncome)/scaleFactor + "</span>, in ten thousands of dollars. The distribution is skewed right with the majority of scaled incomes below 8, i.e., below $80,000.</p>" + 
   "<p class=\"center\"><a href=\"images/scaledMeanDistribution.png\" onclick=\"window.open (this.href, 'child', 'height=507,width=598,top=100,left=100'); return false\"><img src=\"images/scaledMeanDistribution.png\" width=\"299\" height=\"253\"/></a><BR><BR>Click the image to display a larger version in a new window.</p></div></div>";   	
   	
	var centerMeanIncome = "<div class=\"content-box\" id=\"center-spread-mean_content\"><h3 class=\"title\">Center and Spread of Mean Incomes</h3>" + 
	"<div class=\"content\"><p>The overall mean of the scaled mean family incomes, <span class=\"color3\">" + Math.round(meanGrandMean)/scaleFactor + "</span> in ten thousands of dollars, is a measure of central tendency, and thus, represents" + 
	" the entire distribution of mean family incomes. </p>" + "<p>Another measure of central tendency typically used to represent a distribution of continuous data" + 
	" is the median. The median of the scaled mean family incomes, <span class=\"color3\">" + Math.round(meanGrandMedian)/scaleFactor  + "</span>, is fairly close to the overall mean.</p>" + 
	"<p>Because the mean takes every value into consideration, i.e., <span class=\"color4\">the overall mean family income is the sum of the 257 incomes divided by 257</span>, we will consider the overall mean" +
        " as the best representative value for this distribution of mean family incomes.</p><p>The standard deviation of this distribution, <span class=\"color3\">" + Math.round(sdMeanIncome)/scaleFactor + "</span>, is a measure of spread and " + 
	" <span class=\"color4\">provides a measure of the average distance the mean incomes are from the overall mean</span>, <span class=\"color3\">" + Math.round(meanGrandMean)/scaleFactor + "</span>. </p>" + "<p></p></div></div>";

	var boxSPPMeanIncome = "<div class=\"content-box\" id=\"spp-by-mean_content\"><h3 class=\"title\">Box Plots of SPP Scores by Mean Incomes</h3>" + 
   "<div class=\"content\"><p>The box plots illustrate the distribution of SPP scores by standardized mean family incomes for schools in Allegheny County. As mean family incomes increase from <span class=\"color3\">2</span> standard deviations below the overall mean family income of <span class=\"color4\">$" + 
   Math.round(meanGrandMean) + "</span> to <span class=\"color3\">3</span> standard deviations above the overall mean, the mean and median SPP scores also increase.</p>" + 
   "<p class=\"center\"><a href=\"images/2013SPPBoxPlotsByMean.png\" onclick=\"window.open (this.href, 'child', 'height=586,width=860,top=100,left=100'); return false\"><img src=\"images/2013SPPBoxPlotsByMean.png\" width=\"430\" height=\"293\"/></a><BR><BR>Click the image to display a larger version in a new window.</p></div></div>";   	
   	   	
   var distributionMedianIncome = "<div class=\"content-box\" id=\"distribution-median_content\"><h3 class=\"title\">Distribution of Median Incomes</h3>" + 
   "<div class=\"content\"><p>The histogram illustrates the distribution of scaled median family incomes for schools in Allegheny County with <span class=\"color4\">mean " + Math.round(medianGrandMean)/scaleFactor + 
   "</span> and <span class=\"color4\">standard deviation " + Math.round(sdMedianIncome)/scaleFactor + "</span>, in ten thousands of dollars. The distribution is skewed right with the majority of scaled incomes below 7, i.e., below $70,000.</p>" + 
   "<p class=\"center\"><a href=\"images/scaledMedianDistribution.png\" onclick=\"window.open (this.href, 'child', 'height=507,width=593,top=100,left=100'); return false\"><img src=\"images/scaledMedianDistribution.png\" width=\"297\" height=\"253\"/></a><BR><BR>Click the image to display a larger version in a new window.</p></div></div>";   	
   	
	var centerMedianIncome = "<div class=\"content-box\" id=\"center-spread-median_content\"><h3 class=\"title\">Center and Spread of Mean Incomes</h3>" + 
	"<div class=\"content\"><p>The overall mean of the scaled median family incomes, <span class=\"color3\">" + Math.round(medianGrandMean)/scaleFactor + "</span> in ten thousands of dollars, is a measure of central tendency, and thus, represents" + 
	" the entire distribution of median family incomes. </p>" + "<p>Another measure of central tendency typically used to represent a distribution of continuous data" + 
	" is the median. The median of the scaled median family incomes, <span class=\"color3\">" + Math.round(medianGrandMedian)/scaleFactor  + "</span>, is fairly close to the overall mean.</p>" + 
	"<p>Because the mean takes every value into consideration, i.e., <span class=\"color4\">the overall median family income is the sum of the 257 incomes divided by 257</span>, we will consider the overall mean" +
        " as the best representative value for this distribution of median family incomes.</p><p>The standard deviation of this distribution, <span class=\"color3\">" + Math.round(sdMedianIncome)/scaleFactor + "</span>, is a measure of spread and " + 
	" <span class=\"color4\">provides a measure of the average distance the median incomes are from the overall mean</span>, <span class=\"color3\">" + Math.round(medianGrandMean)/scaleFactor + "</span>. </p>" + "<p></p></div></div>";

	var boxSPPMedianIncome = "<div class=\"content-box\" id=\"spp-by-median_content\"><h3 class=\"title\">Box Plots of SPP Scores by Median Incomes</h3>" + 
   "<div class=\"content\"><p>The box plots illustrate the distribution of SPP scores by standardized median family incomes for schools in Allegheny County. As median family incomes increase from <span class=\"color3\">2</span> standard deviations below the overall mean family income of <span class=\"color4\">$" + 
   Math.round(meanGrandMean) + "</span> to <span class=\"color3\">3</span> standard deviations above the overall mean, the mean and median SPP scores also increase.</p>" + 
   "<p class=\"center\"><a href=\"images/2013SPPBoxPlotsByMedian.png\" onclick=\"window.open (this.href, 'child', 'height=595,width=859,top=100,left=100'); return false\"><img src=\"images/2013SPPBoxPlotsByMedian.png\" width=\"430\" height=\"298\"/></a><BR><BR>Click the image to display a larger version in a new window.</p></div></div>";   	
   	   	
   	
   	var descContent = distributionSPP + centerSPPInfo + probPassSPPInfo + distributionMeanIncome + centerMeanIncome + boxSPPMeanIncome + distributionMedianIncome + centerMedianIncome + boxSPPMedianIncome;

	writeContent(descContent, "descriptive_content");

} //end showDescriptive()

/**
	writeModel() collects the general model stats and creates model content boxes.
*/
	function writeModel() {
   	
   	/**
   		create string components for model-stats and write to div
   	*/
   	var infoModel = 
   	"<p class=\"highlight2\">Linear Regression</p>" + 
   	"<p><a id=\"linear-regression\" class=\"content-link\" href=\"\">About Linear Regression</p></a>" +
   	"<p><a id=\"linearity\"  class=\"content-link\" href=\"\">Linear Pattern </a>" + "</p>" +
   	"<p><a id=\"r-square\"  class=\"content-link\" href=\"\">Variance Explained with R<sup>2</sup></a></p>" +
   	"<p class=\"highlight2\">Logistic Regression</p>" + 
   	"<p><a id=\"log-regression\" class=\"content-link\" href=\"\">About Logistic Regression</a></p>" +
   	"<p><a id=\"gstat\"  class=\"content-link\" href=\"\">Drop in Deviance</a></p>" +
   	"<p><a id=\"accuracy\"  class=\"content-link\" href=\"\">Model Accuracy</a></p>" +
   	"<p><a id=\"misclass-rate\"  class=\"content-link\" href=\"\">Model Misclassification Rate</a></p>";
   	
   	//var modelTitle = "<h3><a id=\"model-main\" class=\"title-link\" href=\"\">Two Ways to Model <BR>School Performance Profile Scores</a></h3>";
	var modelTitle = "<h3>Two Ways to Model <BR>School Performance Profile Scores</h3>";
	
	var modelStats = modelTitle + "<div id=\"model-main-summary\" class=\"summary\">" + infoModel + "</div>";
	
	writeContent(modelStats, "model-stats");
	
	/**
   		create string components for model-stats_content and write to div
   	*/
	var linearRegression = "<div class=\"content-box\" id=\"linear-regression_content\"><h3 class=\"title\">About Linear Regression</h3>" + 
	"<div class=\"content\"><p>Linear regression involves finding a linear relationship between a dependent variable (<span class=\"color4\">the outcome</span>) that we want to explain" + 
	" or understand and one or more independent variables.</p>" + 
	"<p> The linear relationship in this model is between School Performance Profile score (<span class=\"color4\">the outcome" + 
	" we want to explain</span>) and a function of three independent variables&mdash;mean income, median income, and the product of the mean and median incomes.<sup>*</sup></p>" + 
	"<p><sup>*</sup> Income values are estimated family incomes by zip code from the Census Bureau and estimated further to" + 
   " account for multiple zip codes being represented in one school.</p>" + 
	"<a id=\"linear-math-link\" class=\"math-link\" href=\"\"><p class=\"center\">Show the Math</p></a><div id=\"linear-math\" class=\"math\"><p>Modeled School Performance Profile score = </p>" + 
	"<p class=\"center\">" + interceptReg + " + " + meanSlopeReg + "(<span class=\"color1\">mean</span>) + " + medianSlopeReg + "(<span class=\"color2\">median</span>) + " + 
	"<BR>(" + interactSlopeReg + ")(<span class=\"color1\">mean</span> - " + meanGrandMean/scaleFactor + ")(<span class=\"color2\">median</span> - " + medianGrandMean/scaleFactor + ")<sup>**</sup></p>" +
	"<p>The following numbers are fixed values in the equation; only the mean and median incomes change among schools.</p>" + 
	"<ul><li>" + interceptReg + " is the intercept</li><li>" + meanSlopeReg + " is the slope for mean income</li><li>" + medianSlopeReg + " is the slope for mean income</li><li>" + interactSlopeReg + 
	" is the slope for the interaction of mean and median</li><li>" + meanGrandMean/scaleFactor + " is the average mean income scaled by a factor of " + scaleFactor + "</li><li>" + medianGrandMean/scaleFactor + 
	" is the average median income scaled by a factor of " + scaleFactor + "</li></ul>" +
   "<p><sup>**</sup> Mean and median income are also scaled by a factor of 10,000 when plugged into the equation.</p></div></div></div>";
   
   var linearPattern = "<div class=\"content-box\" id=\"linearity_content\"><h3 class=\"title\">Linear Pattern</h3>" + 
   "<div class=\"content\"><p>The plot of actual School Performance Profile (SPP) scores against the predicted SPP scores shows a fairly strong positive linear relationship between the actual and predicted scores. </p>" + 
   "<p class=\"center\"><a href=\"images/2013ActualByPredicted.png\" onclick=\"window.open (this.href, 'child', 'height=479,width=697,top=100,left=100'); return false\"><img src=\"images/2013ActualByPredicted.png\" width=\"348\" height=\"240\"/></a><BR><BR>Click the image to display a larger version in a new window.</p></div></div>";
	
	var rSquaredModel = "<div class=\"content-box\" id=\"r-square_content\"><h3 class=\"title\">Variance Explained with R<sup>2</sup></h3>" + 
   "<div class=\"content\"><p>Model R<sup>2</sup>: <span class=\"color3\">" + rSquared + "</span> </p>" + 
   "<p>The School Performance Profile score is different for different schools, i.e., it <span class=\"color4\">varies</span> among schools." +
   	" The R<sup>2</sup> value is a measure of how much of this <span class=\"color4\">variability</span> in scores is explained by the model.</p>" +
   	"<p class=\"color5\">The R<sup>2</sup> in this model, <span class=\"color3\">" + rSquared  + "</span>, means that average family incomes in Allegheny County explain approximately <span class=\"color3\">" + Math.round(rSquared*100)  + 
   	 "%</span> of the <span class=\"color4\">variability</span> in School Performance Profile scores.</p></div></div>";
   
   var logisticRegression = "<div class=\"content-box\" id=\"log-regression_content\"><h3 class=\"title\">About Logistic Regression</h3>" + 
	"<div class=\"content\"><p>Logistic regression involves finding a linear relationship between a transformed dependent variable (<span class=\"color4\">the outcome</span>) that we want to explain" + 
	" or understand better and one or more independent variables. The transformation involves logarithms and odds ratios, and the outcome is a binary variable, i.e., there are only two possible outcomes." +
	"<p>Because the School Performance Profile (SPP) score is an academic score on a 100-point scale, it" + 
	" makes sense to categorize scores as passing or failing.</p><p>Therefore, the two outcomes in this model are 1) passing scores, those equal to or greater than 70, and" + 
	" 2) failing scores, those less than 70.</p><p>One important result of logistic regression is that the <span class=\"color3\">probability that a school will earn a passing score</span> can be calculated from the model.</p>" + 
	"<a id=\"log-math-link\" class=\"math-link\" href=\"\"><p class=\"center\">Show the Math</p></a><div id=\"log-math\" class=\"math\">" +
	"<p><span class=\"color4\">LN(ODDS)</span><sup>*</sup>  = </p><p class=\"center\">" + interceptLog + " + (" + medianSlopeLog + ")(<span class=\"color1\">median</span>)<sup>**</sup></p>" + 
	"<p>The probability of earning a passing score can be calculated from the <span class=\"color4\">LN(ODDS)</span>.</p> " + 
	"<p class=\"center\"><span class=\"color3\">P(score is passing)</span> = 1/[1 + e<sup>-(<span class=\"color4\">LN(ODDS)</span>)</sup>]</p><p>This modeled probability will be different for different combinations of mean and median incomes.</p>" + 
	"<p><sup>*</sup> Odds of earning a passing score</p><p><sup>**</sup> Median income is scaled by a factor of 10,000.</p>" + 
	"</div></div></div>";
	
	var gStat = "<div class=\"content-box\" id=\"gstat_content\"><h3 class=\"title\">Drop in Deviance</h3>" + 
   "<div class=\"content\"><p>Drop in Deviance: <span class=\"color3\">" + negLogLike + "</span> </p>" + 
   "<p>The drop in deviance is a measure of how effective the logistic model is in explaining the dependent variable." + 
   " A large drop in deviance is evidence that the model is effective. The drop in deviance in this model, <span class=\"color3\">" + 
   negLogLike + "</span>, with three independent variables, is large. </p><p><span class=\"color5\">Therefore, for a school in Allegheny County," + 
   " the success of earning a passing SPP score depends on the average family income of the communities serviced by the school.</p></div></div>";
   
	var accuracy = "<div class=\"content-box\" id=\"accuracy_content\"><h3 class=\"title\">Model Accuracy</h3>" + 
   "<div class=\"content\"><p>Model Accuracy: <span class=\"color3\">" + logitAccuracy + "</span> </p>" + 
   "<p>We can predict with <span class=\"color3\">" + Math.round(logitAccuracy*100)  + "%</span> accuracy whether a school will earn a passing " + 
   " School Performance Profile score.</p></div></div>";
   
   var misclassification = "<div class=\"content-box\" id=\"misclass-rate_content\"><h3 class=\"title\">Model Misclassification Rate</h3>" + 
   "<div class=\"content\"><p>Model Misclassifcaition Rate: <span class=\"color3\">" + misclassRate + "</span> </p>" + 
   "<p>The model misclassifies a school <span class=\"color3\">" + Math.round(misclassRate*100)  + "%</span> of the time. Misclassification means that the model will incorrectly classify a " +
   				"school that earned a passing School Performance Profile score as failing or a school that earned a failing score as passing.</p></div></div>";
   	
   	var modContent = linearRegression + rSquaredModel + linearPattern + logisticRegression + gStat + accuracy + misclassification;
   	
	writeContent(modContent, "model-stats_content");
   	
} //end showModel
	
/**
	showSchool() calculates school-specific stats and school content boxes
*/
	function showSchool() {
   	
   	/**
   		format mean and median and write school information
   	*/
   	var formattedMean = formatIncome(schoolInfo[mean]);
   	var formattedMedian = formatIncome(schoolInfo[median]);
   	
   	/**
   		create string components for school-stats and write to div
   	*/
   	var infoSchool = 
   	"<p><span class=\"highlight2\">District: </span>" + schoolInfo[district] + "</p>" +
   	"<p><span class=\"highlight2\">Annual Income: Mean</span> <span class=\"color1\">$" + formattedMean + "</span>" + 
   			" <span class=\"highlight2\">Median:</span> <span class=\"color2\">$" + formattedMedian + "</p>" + "</span>" + 
   	"<p><span class=\"highlight2\">Actual Score 2012-2013: </span>" + schoolInfo[score2013] + " (" + actualProbWord + ")</p>" +
   	separator + "<p class=\"highlight2\">Linear Regression</p>" + 
   	"<p><a id=\"predict-score\"  class=\"content-link\" href=\"\">Score from Model</a></p>" +
   	"<!-- <p><a id=\"conf-95\"  class=\"content-link\" href=\"\">95% Confidence Interval</a></p>-->" +
   	"<p><a id=\"predict-95\"  class=\"content-link\" href=\"\">95% Prediction Interval</a></p>" +
   	"<p class=\"highlight2\">Logistic Regression</p>" + 
   	 "<!-- <p><a id=\"predict-odds\" class=\"content-link\" href=\"\">LN(Odds) from Model</a></p> -->" +
   	"<p><a id=\"predict-prob\" class=\"content-link\" href=\"\">Probability of Passing from Model</a></p>";
   	
   //	var infoTitle = "<h3><a id=\"school-main\" class=\"title-link\" href=\"\">Income and School Performance <BR>Profile Score for</a><BR><BR><span class=\"highlight2\">" + schoolInfo[school] + "</span></h3>";
	var infoTitle = "<h3>Income and School Performance <BR>Profile Score for<BR><BR><span class=\"highlight2\">" + schoolInfo[school] + "</span></h3>";	
	
	var schoolStats = infoTitle + "<div id=\"school-main-summary\" class=\"summary\">" + infoSchool + "</div>";
	
	writeContent(schoolStats, "school-stats");
	
	/**
   		create string components for school-stats_content and write to div
   	*/
	var predictedScoreModel = "<div class=\"content-box\" id=\"predict-score_content\"><h3 class=\"title\">School Score from Model</h3>" + 
	"<div class=\"content\"><p>Model Score: <span class=\"color3\">" + predictedScore + "</span></p>" +
	"<p>The predicted score for a school with mean income, <span class=\"color1\">$" + formatIncome(schoolInfo[mean]) + 
	"</span>, and median income, <span class=\"color2\">$" + formatIncome(schoolInfo[median]) + "</span>, is <span class=\"color3\">" + predictedScore + "</span>.</p>" +
	"<a id=\"score-math-link\" class=\"math-link\" href=\"\"><p class=\"center\">Show the Math</p></a><div id=\"score-math\" class=\"math\">" +   
   "<p>For this school, the score <span class=\"color3\">" + predictedScore  + "</span> = </p>" + 
   "<p class=\"center\">" + interceptReg + " + " + meanSlopeReg + "(<span class=\"color1\">" +  schoolInfo[mean]/scaleFactor + "</span>) + " + medianSlopeReg + "(<span class=\"color2\">" +  
     schoolInfo[median]/scaleFactor + ")</span> + <BR>(" + interactSlopeReg + ")(<span class=\"color1\">" + schoolInfo[mean]/scaleFactor + "</span> - " + meanGrandMean/scaleFactor + ")(<span class=\"color2\">" +  
     schoolInfo[median]/scaleFactor + "</span>  - " + medianGrandMean/scaleFactor + ")</p></div></div></div>";
        
   var prediction95 = "<div class=\"content-box\" id=\"predict-95_content\"><h3 class=\"title\">95% Prediction Interval</h3>" + 
   "<div class=\"content\"><p>95% Prediction Interval: (<span class=\"color3\">" + schoolInfo[lowerIndivCI] + "</span>, <span class=\"color3\">" + schoolInfo[upperIndivCI] + "</span>)</p>" + 
   "<p>We can predict with 95% certainty that the interval (<span class=\"color3\">" + schoolInfo[lowerIndivCI] + "</span>, <span class=\"color3\">" + schoolInfo[upperIndivCI] + 
   "</span>) will contain the <span class=\"color4\">true</span> School Performance Profile score for a school with mean income <span class=\"color1\">$" + formatIncome(schoolInfo[mean]) + 
        "</span> and median income <span class=\"color2\">$" + formatIncome(schoolInfo[median]) + "</span>.</p></div></div>";
   
   var confidence95 = "<div class=\"content-box\" id=\"conf-95_content\"><h3 class=\"title\">95% Confidence Interval</h3>" +
	"<div class=\"content\"><p>95% Confidence Interval: (<span class=\"color3\">" + schoolInfo[lowerMeanCI] + "</span>, <span class=\"color3\">" + schoolInfo[upperMeanCI] + "</span>)</p>" +
	"<p>We are 95% confident that the interval (<span class=\"color3\">" + schoolInfo[lowerMeanCI] + "</span>, <span class=\"color3\">" + schoolInfo[upperMeanCI] + "</span>)" + 
	" contains the <span class=\"color4\">mean</span> School Performance Profile score for schools with mean income <span class=\"color1\">$" + formatIncome(schoolInfo[mean]) + 
        "</span> and median income <span class=\"color2\">$" + formatIncome(schoolInfo[median]) + "</span>.</p></div></div>";
        
  var predictedProbModel = "<div class=\"content-box\" id=\"predict-prob_content\"><h3 class=\"title\">Probability of Passing from Model</h3>" +
	"<div class=\"content\"><p>Modeled Probability of Passing: <span class=\"color3\">" + probPass/100 + "</span> (<span class=\"color3\">" + predictedProbWord + "</span>)</p>" +
	"<p>There is a <span class=\"color3\">" + probPass + "%</span> chance that a school with median income, <span class=\"color2\">$" + formatIncome(schoolInfo[median]) + "</span>, will earn a passing SPP score.</p>" +
	"<a id=\"prob-math-link\" class=\"math-link\" href=\"\"><p class=\"center\">Show the Math</p></a><div id=\"prob-math\" class=\"math\">" +
	"<p>For this school, <span class=\"color4\">LN(Odds)</span> = <span class=\"color4\">" + lnOdds + "</span> = </p>" + 
	"<p class=\"center\">" + interceptLog + " + (" + medianSlopeLog + ")(<span class=\"color2\">" +  
	  schoolInfo[median]/10000 + "</span>)<sup>*</sup></p>" +
	"<p><span class=\"color3\">P(pass)</span> = <span class=\"color3\">" + probPass/100 + "</span> = </p><p class=\"center\">1/[1 + e<sup>-(<span class=\"color4\">" + 
	lnOdds + "</span>)</sup>]</p><p><sup>*</sup> Median income is scaled by a factor of 10,000.</p></div></div></div>";    
   
	var predictedOddsModel = "<div class=\"content-box\" id=\"predict-odds_content\"><h3 class=\"title\">LN(Odds) from Model</h3>" +
	"<div class=\"content\"><p>LN(Odds of Passing): <span class=\"color3\">" + lnOdds + "</span></p>" +
	"<p>For this school, LN(Odds) is <span class=\"color3\">" + lnOdds + "</span> = </p><p class=\"center\">1/[1 + e<sup>-(<span class=\"color3\">" + 
	lnOdds + ")</span>)</sup>]</p></div></div>"; 	
   	
   	var schContent = predictedScoreModel + prediction95 + confidence95 + predictedProbModel;
   	
	writeContent(schContent, "school-stats_content");
   	
} //end showSchool

/**
	predictScore() function predicts the school performance score for the currently selected school
	using the estimated parameters from the linear model
*/
function predictScore() {
	
	//blur the selection rectangle for IE
		if(navigator.appName == 'Microsoft Internet Explorer') this.blur();
	
	//scale the mean and median income
	var scaledMean = schoolInfo[mean]/scaleFactor;
	var scaledMedian = schoolInfo[median]/scaleFactor;
	var scaledMeanGrand = meanGrandMean/scaleFactor;
	var scaledMedianGrand = medianGrandMean/scaleFactor;
	
	//calculate predicted score
	predictedScore = interceptReg + meanSlopeReg*scaledMean + medianSlopeReg*scaledMedian - interactSlopeReg*(scaledMean-scaledMeanGrand)*(scaledMedian-scaledMedianGrand);
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
	var e = 2.7183;
	
	//scale the mean and median income
	var scaledMean = schoolInfo[mean]/scaleFactor;
	var scaledMedian = schoolInfo[median]/scaleFactor;
	
	//calculate log odds (odds of failing to odds of passing)
	lnOdds = interceptLog + medianSlopeLog*scaledMedian;
   lnOdds = Math.round(lnOdds*1000)/1000;
	
	//calculate probability of passing using model
	var probPass = Math.pow(Math.E, lnOdds)/(1 + Math.pow(Math.E, lnOdds));
	probPass = Math.round(probPass*100); 

	return probPass;
	
} //end predictProbPass

/**

*/
function toggleMath(evt) {
	
	//blur the selection rectangle for IE
		if(navigator.appName == 'Microsoft Internet Explorer') this.blur();
		
	//prevent link from being followed
	evt.preventDefault();
	
	//get the ide of the target element
	var title = evt.currentTarget;
	
	//get the id of the target element and get the related math element
	var id = evt.currentTarget.nextSibling.getAttribute("id");
	var mathEl = document.getElementById(id);
	if(mathEl.style.display == 'none') {
		mathEl.style.display = 'block';
		title.innerHTML = "<p class=\"center\">Hide the Math</p>";
	}	
	else {
			mathEl.style.display = 'none';
			title.innerHTML = "<p class=\"center\">Show the Math</p>";
			}
	
	}

/**

*/
function toggleSummary(evt) {
	
	//blur the selection rectangle for IE
		if(navigator.appName == 'Microsoft Internet Explorer') this.blur();
		
	//prevent link from being followed
	evt.preventDefault();
	
	//get the id of the target element, create the summary id, and get the related summary element
	var id = evt.currentTarget.getAttribute("id");
	var summaryId = id + "-summary";
	var summaryEl = document.getElementById(summaryId);
	
	//get id of parent node h3 and then id of that parent div and then id of next sibling (text node) and then id of the next sibling which holds content boxes
	//need o select div to then select and hide all content boxes only in that div
	var divId = document.getElementById(id).parentNode.parentNode.nextSibling.nextSibling.getAttribute("id");;
	var div = document.getElementById(divId);
	var divContent = [];
	divContent = div.getElementsByClassName("content-box");
	//hide each content box within div
	for(var i = 0; i < divContent.length; i++) {
		divContent[i].style.display = 'none';	
	}
	
	//if element is hidden, display it; if element is displayed, hide it
	if(summaryEl.style.display == 'none') {
		summaryEl.style.display = 'block';
	} 
	else summaryEl.style.display = 'none';
	
} //end toggleSummary()

/**
	toggleContent() function closes currently open content box and opens
	the one related to the target
*/
function toggleContent(evt) {
	
	//blur the selection rectangle for IE
		if(navigator.appName == 'Microsoft Internet Explorer') this.blur();
		
	//prevent link from being followed
	evt.preventDefault();
	
	//get id of current target and create related '_content' id
	var id = evt.currentTarget.getAttribute("id");	
	var contentId = id + "_content";
	
	//get the related '_content' and display it
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
						//if content display is 'block', set display to 'none' and change inner html to omit the angle quote - split on tab
    					if(boxContent.style.display == 'block') {
    						boxContent.style.display = 'none';
    						   //obtain id of 'a' tag reference by splitting content box id and obtain nodeValue of 'a' tag
								var boxAtagId = boxId.split("_");
								var boxAtag = document.getElementById(boxAtagId[0]);
								var aTxt = boxAtag.firstChild.nodeValue;
								var aTxtParts = aTxt.split("\t");
								//if id of current target is 'r-square' add '<sup>2</sup>' to the inner html
								if(boxAtagId[0] == "r-square") {
									boxAtag.innerHTML = aTxtParts[0] + "<sup>2</sup>";
								}
								else {
									boxAtag.innerHTML = aTxtParts[0];
							   }
    					}
    				}
				}
	
	//hide math in all content-boxes within division NOT IN USE
   	//hideEl("math", parentId);
	
} //end toggleContent()

/**
	toggleMain toggles the visibility of the main divisions: descriptive-wrapper, model-wrapper, dashboard and school-wrapper, and abstract-wrapper
	content divs and math divs are not closed so user can move back and forth between divisions without losing his or her place
*/
function toggleDiv(evt) {
	
	//blur the selection rectangle for IE
		if(navigator.appName == 'Microsoft Internet Explorer') this.blur();
		
	//prevent link from being followed
	evt.preventDefault();
	
	//get id of current target
	var id = evt.currentTarget.getAttribute("id");
	//get id of division by splitting currentTarget (button) id and accessing the first part
	var temp = id.split("_");
	//set currentView equal to newly selected division
	currentView = temp[0];
	var contentView = currentView + "_content";
	var bodyId = currentView + "_bdy";
	
	//change body tag to be currentView + '_bdy' for CSS styling - related button in main nav stays as if hovered
	var tagArray = document.getElementsByTagName("body");
	var bodyTag = tagArray[0];
	bodyTag.setAttribute("id", bodyId);
	
	/**
	hide all divisions except the current view; handle school-stats, school-stats_content, and dashboard separately
	*/
	if(currentView != "school-stats") { //if current view is NOT school-stats
		//change margin-left of div with id 'section' 
	       document.getElementById("section").style.marginLeft = '15px';
	   //iterate siteDivisions and hide if element is not current view or its content
		for(var s = 0; s < siteDivisions.length; s++) {
				if(siteDivisions[s] != currentView && siteDivisions[s] != contentView) { 
					document.getElementById(siteDivisions[s]).style.display = 'none';
				}
	   			else { //display current view and its content
	   				document.getElementById(siteDivisions[s]).style.display = 'block';
	   			}
	    }
	  }
	   //if current view is school-stats and no schools have been selected (determine by checking length of prevId)
	  else if(currentView == "school-stats") { 
	       //change margin-left of div with id 'section' 
	       document.getElementById("section").style.marginLeft = '235px';
	  		//iterate siteDivisions and hide if element is not dashboard, school-stats, or school-stats_content
			for(var s = 0; s < siteDivisions.length; s++) {
				if(siteDivisions[s] != "dashboard" && siteDivisions[s] != "school-stats" && siteDivisions[s] != "school-stats_content") { 
					document.getElementById(siteDivisions[s]).style.display = 'none';
				}
	   			else { //display current view and its content
	   				document.getElementById(siteDivisions[s]).style.display = 'block';
	   			}
	      }
	   }
	   
} //end toggleContent

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
	hideEl() function receives a class and div id and hides divs of class className within the div with divId
*/
function hideEl(className, divId) {

   	//get all tags with class className and hide them
	var array = [];
	//if divId is 'document' get all tags, otherwise get just the tags in the div with id divId
	if(divId == "document") {
		arrayHide = document.getElementsByClassName(className);
	}
	else {
		var divEl = document.getElementById(divId);
		arrayHide = divEl.getElementsByClassName(className);
	}
	
	//hide elements retrieved above; if className is 'math' also get previousSibling and change innerHTML to say 'Show the Math'
	for (var i = 0; i < arrayHide.length; i++)
				{
				   var id = arrayHide[i].getAttribute("id");
				   	var el = document.getElementById(id);
				   	el.style.display = 'none';
				   	if(className == "math") {
				   		document.getElementById(id).previousSibling.innerHTML = "<p class=\"center\">Show the Math</p>";
				   	}
				}

} //end hideEl()

/**
	activateLinks() function receives a class name and function to call,
	gets all 'a' tags with className and adds event listeners to call functionCall
*/
function activateLinks(className) {
	
	var activate = [];
	activate = document.getElementsByClassName(className);
	for (var j = 0; j < activate.length; j++)
				{
					//obtain id and add event listener
					var id = activate[j].getAttribute("id");
					var linkId = document.getElementById(id);
    				switch(className) {
						case "content-link":
						linkId.addEventListener("click",toggleContent,false)
						linkId.addEventListener("mouseover",addAngleQuo,false)
						linkId.addEventListener("mouseout",removeAngleQuo,false)
						break;
					case "title-link": //NOT IN USE
						linkId.addEventListener("click",toggleSummary,false)
						break;
					case "math-link":
						linkId.addEventListener("click",toggleMath,false)
						break;
					}
				}
} //end activateLinks()

/**
	addAngleQuo() function adds the angle quotes to content links
	It handles R square element differently because of the <sup> tag
*/
function addAngleQuo(evt) {
	//get id of current target
	var id = evt.currentTarget.getAttribute("id");	
	
	//get current target element by id, get text within the element
	var el = document.getElementById(id);
	var elTxt = el.firstChild.nodeValue;
	var txtArray = elTxt.split("\t");
	
	//if id of current target is 'r-square' add '<sup>2</sup>' to the inner html
	if(id == "r-square") {
		el.innerHTML = txtArray[0] + "<sup>2</sup>" + "\t&raquo;";
	}
	else {
		el.innerHTML = txtArray[0] + "\t&raquo;";
	}
	
} //end addAngleQuo

/**
	removeAngleQuo() function removes the angle quotes from content links on mouseout 
	only if the target was not clicked - detected by checking if related '_content' box is displayed
	It handles R square element differently because of the <sup> tag
*/
function removeAngleQuo(evt) {
	//get id of current target
	var id = evt.currentTarget.getAttribute("id");	
	var contentId = id + "_content";
	var contentBox = document.getElementById(contentId);
	
	//get current target element by id, get text withint the element, and split the text by tab
	var el = document.getElementById(id);
	var elTxt = el.firstChild.nodeValue;
	var txtArray = elTxt.split("\t");

	if(contentBox.style.display == 'none') {
		//if id of current target is 'r-square' add '<sup>2</sup>' to the inner html
		if(id == "r-square") {
			el.innerHTML = txtArray[0] + "<sup>2</sup>";
		}
		else {
			el.innerHTML = txtArray[0];
		}
    }
	
} //end addAngleQuo

/**
	interpretProb() function converts probability to pass or fail (if parameter is less than 1)
	or score to pass or fail (if parameter is greater than 1)
*/
function interpretProb(prob) {
	//convert probability to pass or fail
	if(prob < 1) {
		if(prob < 0.5) {
		var result = "Fail";	
		}
		else result = "Pass";
		}
	else {
		if(prob < 70) {
		var result = "Fail";	
		}
		else result = "Pass";
		}

	return result;
	
} //end interpretProb()

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