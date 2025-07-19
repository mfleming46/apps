
const blockMode="BLOCKMODE";
const leaveMode="LEAVEMODE";
const styleHilite= "background-color:#FFFF00;";
const styleNormal= "background-coolor:FFFFFF";
var currentID=0;
var maxID=5;
var strkGoal=5;
var strkMode=blockMode;
var lastFocusedItemID = null;


function initForm() {
	console.clear();
	fillAll();
	setCurrent(1);

	// Attach focus listeners to both columns
	for (let i = 1; i <= maxID; i++) {
		const inputName = objItm(i);
		const inputStrk = objStrk(i);

		inputName.addEventListener("focus", function () {
			lastFocusedItemID = i;
		});

		inputStrk.addEventListener("focus", function () {
			lastFocusedItemID = i;
		});
	}
}



function btnRandomize_click()
{
    list = [];
	for (i=1; i<=maxID; i++)
	{
		ord = Math.random();
		name = objItm(i).value; 
		if (name=="") {
			name=objItm(i).placeholder;
		}
		strkH = objStrkH(i).value;
		list.push ([ord, name, strkH]);
	}
	list.sort();
	for (i=1; i<=maxID; i++)
	{
		[ord,name,strkH]=list.pop();
		v=parseInt(strkH);
		console.log(ord,name,v);
		objItm(i).value = name;
		objStrkH(i).value = v;
		objStrk(i).value = strkDisplay(v);
	}
	setCurrent(1)
}

function cbMode_change() {
	obj = document.getElementsByName("cbMode")[0];
	strkMode = obj.value;
	btnReset_click();
}

function btnSkip_click()
{
	setCurrent( (currentID % maxID) + 1 );
}

function btnFail_click()
{
	console.log("FAIL ",currentID);
	doFail(currentID);
	if (strkMode==leaveMode) {
		btnSkip_click();
	}
}

function btnPass_click()
{
	v = doPass(currentID);
	console.log("PASS ",currentID,strkMode,v);

	switch (strkMode) {
		case blockMode:
			if (v>=strkGoal) {
				btnSkip_click();
			}
			break;
		case leaveMode:
			btnSkip_click();
			break;
	}
}

function btnReset_click()
{
	console.log("btnReset_click()");
	fillAll();
	setCurrent(1);
}

function fillAll()
{
	for (i = 1; i <= maxID; i++) {
		objStrk(i).value = "";
		objStrkH(i).value = 0;
	}
}

function objItm(i)
{
	s = ("00" + i).slice (-2);
	result= document.getElementsByName("txtItm"+s)[0];
	return result;
}

function objStrk(i)
{
	s = ("00" + i).slice (-2);
	result= document.getElementsByName("txtStrk"+s)[0];
	return result;
}

function objStrkH(i)
{
	s = ("00" + i).slice (-2);
	result= document.getElementsByName("hidStrk"+s)[0];
	return result;
}

function strkDisplay(v)
{
	switch (v) {
		case 0: newVal="";
			break;
		case 1: newVal="1";
			break;
		case 2: newVal="12";
			break;
		case 3: newVal="123";
			break;
		case 4: newVal="1234";
			break;
		case 5: newVal="12345";
			break;
		default: newVal = "12345+";
	}
	return newVal;
}

function setCurrent(i)
{
logClick()
	j = currentID
	if (j>0) {
		objItm(j).style=styleNormal;
		objStrk(j).style=styleNormal;
	}
	objItm(i).style=styleHilite;
	objStrk(i).style=styleHilite;
	currentID = i;
	console.log("currentID=",currentID);
}

function doFail(i)
{
logClick()
	s = ("00" + i).slice (-2);
	objStrk(i).value= "";
	objStrkH(i).value=0;
	return 0;
}
function doPass(i)
{
logClick()
	v = parseInt(objStrkH(i).value)+1;
	objStrk(i).value = strkDisplay(v);
	objStrkH(i).value = v;
	return v;
}


function addItem() {
	maxID += 1;
	const i = maxID;
	const s = ("00" + i).slice(-2);
	const tbody = document.querySelector("table tbody");

	// Create new row
	const row = document.createElement("tr");
	row.innerHTML = `
		<td><input name="txtItm${s}" placeholder="Practice Item ${i}" size="25" maxlength="40" type="text"></td>
		<td><input name="txtStrk${s}" size="6" maxlength="6" type="text" readonly tabindex="-1"></td>
	`;

	// Append row first
	tbody.appendChild(row);

	// Add focus listener to the name input
	const inputName = row.querySelector(`input[name="txtItm${s}"]`);
	if (inputName) {
		inputName.addEventListener("focus", function () {
			lastFocusedItemID = i;
		});
	}

	// Add focus listener to the streak input
	const inputStrk = row.querySelector(`input[name="txtStrk${s}"]`);
	if (inputStrk) {
		inputStrk.addEventListener("focus", function () {
			lastFocusedItemID = i;
		});
	}

	// Hidden field for streak value
	const hidden = document.createElement("input");
	hidden.type = "hidden";
	hidden.name = "hidStrk" + s;
	document.forms["frmLeave"].appendChild(hidden);

	// Initialize values
	objStrk(i).value = "";
	objStrkH(i).value = 0;
}


function XdeleteItem() {
	const i = lastFocusedItemID;

	if (!i || i < 1 || i > maxID) {
		alert("Place your cursor inside the item you want to delete.");
		return;
	}

	if (maxID <= 1) {
		alert("At least one item must remain.");
		return;
	}

	const s = ("00" + i).slice(-2);
	const tbody = document.querySelector("table tbody");
	const rows = tbody.querySelectorAll("tr");

	const rowIndex = i - 1;
	if (rows[rowIndex]) {
		tbody.removeChild(rows[rowIndex]);
	}

	const hidden = document.getElementsByName("hidStrk" + s)[0];
	if (hidden) hidden.remove();

	// Shift fields up for all rows after the one being deleted
	for (let j = i + 1; j <= maxID; j++) {
		const oldS = ("00" + j).slice(-2);
		const newS = ("00" + (j - 1)).slice(-2);

		const itm = document.getElementsByName("txtItm" + oldS)[0];
		const strk = document.getElementsByName("txtStrk" + oldS)[0];
		const hid = document.getElementsByName("hidStrk" + oldS)[0];

		if (itm) {
			itm.name = "txtItm" + newS;
			itm.placeholder = "Practice Item " + (j - 1);
			itm.addEventListener("focus", function () {
				lastFocusedItemID = j - 1;
			});
	 }

		if (strk) strk.name = "txtStrk" + newS;
		if (hid) hid.name = "hidStrk" + newS;
	}

	maxID--;
	
	if (currentID === i) {
		setCurrent(1);  // Deleted the highlighted row — move highlight to top
	} else if (currentID > i) {
		currentID--;    // Deleted a row before the highlight — shift it down
	}

	const index = items.indexOf(lastFocused);
	items.splice(index, 1);
	lastFocused = items[index] ?? items[items.length - 1] ?? null;
}


function deleteItem() {
	const i = lastFocusedItemID;

	if (!i || i < 1 || i > maxID) {
		alert("Place your cursor inside the item you want to delete.");
		return;
	}

	if (maxID <= 1) {
		alert("At least one item must remain.");
		return;
	}

	const s = ("00" + i).slice(-2);
	const tbody = document.querySelector("table tbody");
	const rows = tbody.querySelectorAll("tr");

	const rowIndex = i - 1;
	if (rows[rowIndex]) {
		tbody.removeChild(rows[rowIndex]);
	}

	// Remove corresponding hidden input
	const hidden = document.getElementsByName("hidStrk" + s)[0];
	if (hidden) hidden.remove();

	// Shift up all fields after the deleted one
	for (let j = i + 1; j <= maxID; j++) {
		const oldS = ("00" + j).slice(-2);
		const newS = ("00" + (j - 1)).slice(-2);

		const itm = document.getElementsByName("txtItm" + oldS)[0];
		const strk = document.getElementsByName("txtStrk" + oldS)[0];
		const hid = document.getElementsByName("hidStrk" + oldS)[0];

		if (itm) {
			itm.name = "txtItm" + newS;
			itm.placeholder = "Practice Item " + (j - 1);
			itm.addEventListener("focus", function () {
				lastFocusedItemID = j - 1;
			});
	 }

		if (strk) {
			strk.name = "txtStrk" + newS;
			strk.addEventListener("focus", function () {
				lastFocusedItemID = j - 1;
			});
	 }

		if (hid) {
			hid.name = "hidStrk" + newS;
		}
	}

	maxID--;

	// Update current highlight
	if (currentID === i) {
		setCurrent(1);  // Deleted the highlighted row — move highlight to top
	} else if (currentID > i) {
		currentID--;    // Deleted a row before the highlight — shift it down
	}

	// Set new focus ID safely
	if (maxID >= 1) {
		const newFocusID = Math.min(i, maxID);
		lastFocusedItemID = newFocusID;

		queueMicrotask(() => {
			const newField = objItm(newFocusID);
			newField?.focus();
		});
	} else {
		lastFocusedItemID = null;
	}
}




function saveStateToStorage() {
    const data = {
        items: [],
        mode: strkMode,
        currentID: currentID,
        maxID: maxID
    };

    for (let i = 1; i <= maxID; i++) {
        data.items.push({
            name: objItm(i).value,
            streak: parseInt(objStrkH(i).value)
        });
    }

    SafeStorage.setItem("interleave_state", data);
    console.log("State saved", data);
}

function loadStateFromStorage() {
    const data = SafeStorage.getItem("interleave_state");
    if (!data) return false;

    // Restore number of rows
    while (maxID < data.maxID) {
        addItem();
    }
    while (maxID > data.maxID) {
        deleteItem();
    }

    // Restore content
    data.items.forEach((item, index) => {
        const i = index + 1;
        objItm(i).value = item.name;
        objStrkH(i).value = item.streak;
        objStrk(i).value = strkDisplay(item.streak);
    });

    // Restore mode
    strkMode = data.mode;
    document.getElementsByName("cbMode")[0].value = strkMode;

    // Restore highlight
    if (data.currentID >= 1 && data.currentID <= maxID) {
        setCurrent(data.currentID);
    }

    console.log("State loaded", data);
	return true
}



function logClick() {
  fetch('/apps/log.php?page=interleave', { method: 'GET' })
}


window.onload = function () {
  loadStateFromStorage();
  drawTable();
  highlightRow(stashCurrentRow);
};

window.onbeforeunload = saveStateToStorage;

