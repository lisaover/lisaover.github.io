// DropDownMenu.js

function addEventHandlers() {

  // Add listeners to show/hide drop-down menu associated
  // with first menu bar item
  var menuBar1 = window.document.getElementById("MenuBar1");
  menuBar1.addEventListener("mouseover", showDropDown, false);
  menuBar1.addEventListener("mouseout", hideDropDown, false);

  // Add first drop-down div as a property of the first menu bar object
  // so that this div can be accessed conveniently in event listeners
  menuBar1.dropDown = window.document.getElementById("DropDown1");

  // Change style of drop-down menu items when entered/exited
  var dropDown1_1 = window.document.getElementById("DropDown1_1");
  dropDown1_1.addEventListener("mouseover", highlight, false);
  dropDown1_1.addEventListener("mouseout", lowlight, false);
  var dropDown1_2 = window.document.getElementById("DropDown1_2");
  dropDown1_2.addEventListener("mouseover", highlight, false);
  dropDown1_2.addEventListener("mouseout", lowlight, false);
  var dropDown1_3 = window.document.getElementById("DropDown1_3");
  dropDown1_3.addEventListener("mouseover", highlight, false);
  dropDown1_3.addEventListener("mouseout", lowlight, false);

  // Repeat for second menu
  var menuBar2 = window.document.getElementById("MenuBar2");
  menuBar2.addEventListener("mouseover", showDropDown, false);
  menuBar2.addEventListener("mouseout", hideDropDown, false);
  menuBar2.dropDown = window.document.getElementById("DropDown2");
  var dropDown2_1 = window.document.getElementById("DropDown2_1");
  dropDown2_1.addEventListener("mouseover", highlight, false);
  dropDown2_1.addEventListener("mouseout", lowlight, false);
  var dropDown2_2 = window.document.getElementById("DropDown2_2");
  dropDown2_2.addEventListener("mouseover", highlight, false);
  dropDown2_2.addEventListener("mouseout", lowlight, false);

  return;
}

// mouseover listener for a drop-down menu item
function highlight(event) {

  // If this menu item is not already highlighted, make it so
  if (event.currentTarget.style.backgroundColor != "silver") {
    event.currentTarget.style.backgroundColor = "silver";
  }

  // Drop-down is already showing, so no need for ancestor
  // menu bar item to see this event
  event.stopPropagation();
  return;
}

// mouseout listener for a drop-down menu item
function lowlight(event) {

  // If this menu item is not an ancestor of the node to which
  // the mouse is moving, then unhighlight this item
  if (!ancestorOf(event.currentTarget, event.relatedTarget)) {
    event.currentTarget.style.backgroundColor = "gray";
  }
  return;
}

// mouseover listener for a menu bar item
function showDropDown(event) {

  // If mouse is over a menu bar item, then display 
  // the drop-down menu associated with this menu bar item
  if (event.target == event.currentTarget) {
    var dropDown = event.currentTarget.dropDown;
    //    dropDown.removeAttribute("hidden");
    dropDown.style.display = "block";
  }
  return;
}

// mouseout listener for a menu bar item
function hideDropDown(event) {

  // If this menu bar item is not an ancestor of the node to which
  // the mouse is moving, hide the drop-down menu associated with
  // this menu bar item
  if (!ancestorOf(event.currentTarget, event.relatedTarget)) {
    var dropDown = event.currentTarget.dropDown;
    //    dropDown.setAttribute("hidden", "hidden");
    dropDown.style.display = "none";
  }
  return;
}

// Is ancestorElt an ancestor of descendElt?
// This treats a node as an ancestor of itself.
function ancestorOf(ancestorElt, descendElt) {
  var found;

  // Base cases: descendElt is null or same as ancestorElt
  if (!descendElt) {
    found = false;
  } else if (descendElt == ancestorElt) {
    found = true;

  // Recursive case: check descendElt's parent
  } else {
    found = ancestorOf(ancestorElt, descendElt.parentNode);
  }
  return found;
}
