function init() {

    activeColor = 'rgb(0, 230, 138)';
    hoverColor = 'rgb(0, 230, 138)';
    deactiveColor = 'rgb(0, 153, 204)';
    
    activeColor = 'rgb(0, 191, 255)';
    hoverColor = 'rgb(0, 191, 255)';
    deactiveColor = 'rgb(0, 102, 153)';

    //define global record class with show, hide prototype methods
    Record = function(current, previous) {
        this.current = current;
        this.previous = previous;
        this.currContent = "c_" + current;
        this.prevContent = "c_" + previous;
    };
    Record.prototype.hidePrevious = function() {
        document.getElementById(this.prevContent).style.display = 'none';
    };
    Record.prototype.showContent = function() {
        document.getElementById(this.currContent).style.display = 'block';
    };
    Record.prototype.hideContent = function() {
        document.getElementById(this.currContent).style.display = 'none';
    };
    Record.prototype.activateLink = function() {
        var el = document.getElementById(this.current);
        el.style.color = activeColor;
        el.removeEventListener("mouseover", hoverLink, false);
        el.removeEventListener("mouseout", resetLink, false);
    };
    Record.prototype.resetLinks = function() {

        //reset all content links except current
        for (var i = 0; i < arrayNav1ID.length; i++) {
            var link = document.getElementById(arrayNav1ID[i]);
            if (arrayNav1ID[i] != this.current) {
                link.style.color = deactiveColor;
                link.addEventListener("mouseover", hoverLink, false);
                link.addEventListener("mouseout", resetLink, false);
            }
        }

    }; //end resetLinks

    //store nav IDs, add event listeners to links and hide content divs
    arrayNav1 = [];
    arrayNav1ID = [];

    nav1Div = document.getElementById("nav");

    arrayNav1 = nav1Div.getElementsByTagName("a");
    arrayNav2Div = new Array(arrayNav1.length);
    arrayNav2 = [];
    arrayNav2ID = [];
    onloadContent2 = new Array(arrayNav1.length);
    for (var i = 0; i < arrayNav1.length; i++) {
        //set array of nav 1 IDs
        arrayNav1ID[i] = arrayNav1[i].getAttribute("id");

        //get nav 1 elements by id, add event listeners, and hide them
        var el1 = document.getElementById(arrayNav1ID[i]);
        el1.addEventListener("click", displayContent1, false);
        el1.addEventListener("mouseover", hoverLink, false);
        el1.addEventListener("mouseout", resetLink, false);
        var rec1 = new Record(arrayNav1ID[i], '');
        rec1.hideContent();
    }
    //set onload ID for level 1
    onloadContent1 = arrayNav1ID[0];

    //**** USE corresponding elements of arrayNav1ID and onloadContent2 FOR DISPLAYING level 2 onload components

    //create global instance of Record 1 with id parameter for current var set to desired default content
    currentRecord1 = new Record(onloadContent1, '');
    //show content for onload currentRecord1
    currentRecord1.showContent();
    //activate tab that corresponds to current content1
    currentRecord1.activateLink();

} //end init

function displayContent1(evt) {

    //blur the selection rectangle for IE
    if (navigator.appName == 'Microsoft Internet Explorer') this.blur();

    //prevent link from being followed
    evt.preventDefault();

    //create a new record instance, store previous ID, get id of selected content element as current
    currentRecord1 = new Record(evt.currentTarget.getAttribute("id"), currentRecord1.current);

    //show current content and hide previous content
    currentRecord1.hidePrevious();
    currentRecord1.showContent();
    //activate corresponding link for current content and deactivate all other links
    currentRecord1.activateLink();
    currentRecord1.resetLinks();

}

function displayContent2(evt) {

    //blur the selection rectangle for IE
    if (navigator.appName == 'Microsoft Internet Explorer') this.blur();

    //prevent link from being followed
    evt.preventDefault();

    //create a new record instance, store previous ID, get id of selected content element as current
    currentRecord2 = new Record(evt.currentTarget.getAttribute("id"), currentRecord2.current);

    //show current content and hide previous content
    currentRecord2.hidePrevious();
    currentRecord2.showContent();
    //activate corresponding link for current content and deactivate all other links
    //currentRecord2.activateLink();
    //currentRecord2.resetLinks();

}

/**
resetLink is called on mouseout to style the dashboard links visited since page refresh (browser refresh not refresh button)
because the refresh button breaks the css stylesheet 'a' styling
*/
function resetLink(evt) {

    var link = document.getElementById(evt.currentTarget.getAttribute("id"));
    link.style.color = deactiveColor;

} //end resetLink

/**
hoverLink is called on mouseover to style the dashboard links visited since page refresh (browser refresh not refresh button)
because the refresh button breaks the css stylesheet 'a:hover' styling
*/
function hoverLink(evt) {

    var link = document.getElementById(evt.currentTarget.getAttribute("id"));
    link.style.color = hoverColor;

} //end hoverLink