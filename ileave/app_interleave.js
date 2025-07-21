
const storageKey = '_rc_interleave'; // Customize the key here
const blockMode="BLOCKMODE";
const leaveMode="LEAVEMODE";
const styleHilite= "background-color:#FFFF00;";
const styleNormal= "background-coolor:FFFFFF";
var currentID=0;
var maxID=5;
var strkGoal=5;
var strkMode=blockMode;
var lastFocusedItemID = null;


function attachFocusListeners() {
	for (let i = 1; i <= maxID; i++) {
		attachOneFocusListener(i);
	}
}

function attachOneFocusListener(i) {
	const inputName = objItm(i);
	const inputStrk = objStrk(i);
	const inputBpm = objBpm(i);

	inputName.addEventListener("focus", function () {
		lastFocusedItemID = i;
	});

	inputStrk.addEventListener("focus", function () {
		lastFocusedItemID = i;
	});

	inputBpm.addEventListener("focus", function () {
		lastFocusedItemID = i;
	});
}


function btnRandomize_click() {
	console.log("btnRandomize_click");
    list = [];
	for (i=1; i<=maxID; i++)
	{
		ord = Math.random();
		name = objItm(i).value; 
		if (name=="") {
			name=objItm(i).placeholder;
		}
		bpm = objBpm(i).value;
		strk = objStrk(i).value;
		strkH = objStrkH(i).value;
		list.push ([ord, name, bpm, strk, strkH]);
	}
	list.sort();
	for (i=1; i<=maxID; i++)
	{
		[ord,name,bpm, strk, strkH]=list.pop();
		objItm(i).value = name;
		objBpm(i).value = bpm;
		objStrk(i).value = strk;
		objStrkH(i).value = strkH;
		
	}
	setCurrent(1);
	attachFocusListeners();
}

function doAlphaSort() {
	console.log("doAlphaSort");
	list = [];
	for (i=1; i<=maxID; i++)
	{
		name = objItm(i).value; 
		if (name=="") {
			name=objItm(i).placeholder;
		}
		ord = name.toLowerCase();
		bpm = objBpm(i).value;
		strk = objStrk(i).value;
		strkH = objStrkH(i).value;
		list.push ([ord, name, bpm, strk, strkH]);
	}
	list.sort();
	for (i=1; i<=maxID; i++)
	{ 
		[ord, name,bpm, strk, strkH]=list.shift();
		objItm(i).value = name;
		objBpm(i).value = bpm;
		objStrk(i).value = strk;
		objStrkH(i).value = strkH;
	}
	setCurrent(1);
	attachFocusListeners();
}


function cbMode_change() {
	console.log("cbMode_change");
	obj = document.getElementById("cbMode");
	strkMode = obj.value;
	//console.log("strkMode", strkMode);
	btnReset_click();
}

function btnSkip_click() {
	console.log("btnskip.click ");
	setCurrent( (currentID % maxID) + 1 );
}

function btnFail_click() {
	console.log("btnFail.click ");
	doFail(currentID);
	if (strkMode==leaveMode) {
		btnSkip_click();
	}
}

function btnPass_click() {
	console.log("btnPass_click");
	v = doPass(currentID);
	// console.log("PASS ",currentID,strkMode,v);

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

function btnReset_click() {
	console.log("btnReset_click()");
	fillAll();
	setCurrent(1);
}

function fillAll() {
	// reset streaks
	for (i = 1; i <= maxID; i++) {
		objStrk(i).value = "";
		objStrkH(i).value = 0;
	}
}

function objItm(i) {
	s = ("00" + i).slice (-2);
	result= document.getElementsByName("txtItm"+s)[0];
	return result;
}

function objStrk(i) {
	s = ("00" + i).slice (-2);
	result= document.getElementsByName("txtStrk"+s)[0];
	return result;
}

function objBpm(i) {
	s = ("00" + i).slice (-2);
	result= document.getElementsByName("txtBpm"+s)[0];
	return result;
}

function objStrkH(i) {
	s = ("00" + i).slice (-2);
	result= document.getElementsByName("hidStrk"+s)[0];
	return result;
}

function strkDisplay(v) {
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

function setCurrent(i) {
	logClick();
	j = currentID;
	if (j>0) {
		objItm(j).style=styleNormal;
		objStrk(j).style=styleNormal;
		objBpm(j).style=styleNormal;
	}
	objItm(i).style=styleHilite;
	objStrk(i).style=styleHilite;
	objBpm(i).style=styleHilite;
	currentID = i;
}

function doFail(i) {
	logClick();
	s = ("00" + i).slice (-2);
	objStrk(i).value= "";
	objStrkH(i).value=0;
	return 0;
}

function doPass(i) {
	logClick();
	v = parseInt(objStrkH(i).value)+1;
	objStrk(i).value = strkDisplay(v);
	objStrkH(i).value = v;
	return v;
}


function addItem() {
	console.log("addItem");
	maxID += 1;
	const i = maxID;
	const s = ("00" + i).slice(-2);
	const tbody = document.querySelector("table tbody");

	// Create new row
	const row = document.createElement("tr");
	row.innerHTML = `
		<td><input name="txtItm${s}" placeholder="Practice Item ${i}" size="25" maxlength="40" type="text"></td>
		<td> <input name="txtBpm${s}" size="6" maxlength="6" value="" type="text">
		<td><input name="txtStrk${s}" size="6" maxlength="6" type="text" value="" readonly tabindex="-1"></td>
		<td style="display: none;"> <input name="hidStrk${s}" type="hidden" value=0> </td>
	`;

	// Append row first
	tbody.appendChild(row);
	attachOneFocusListener(i);
}


function deleteItem() {
	console.log("deleteItem");
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
	
	// Shift up all fields after the deleted one
	for (let j = i + 1; j <= maxID; j++) {
		const oldS = ("00" + j).slice(-2);
		const newS = ("00" + (j - 1)).slice(-2);

		const itm = document.getElementsByName("txtItm" + oldS)[0];
		const bpm = document.getElementsByName("txtBpm" + oldS)[0];
		const strk = document.getElementsByName("txtStrk" + oldS)[0];
		const hid = document.getElementsByName("hidStrk" + oldS)[0];

		itm.name = "txtItm" + newS;
		itm.placeholder = "Practice Item " + (j - 1);
		strk.name = "txtStrk" + newS;
		hid.name = "hidStrk" + newS;
		bpm.name = "txtBpm" + newS;
	}
	
	maxID--;
	attachFocusListeners();

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
			newField.focus();
		});
	} else {
		lastFocusedItemID = null;
	}
}




function saveStateToStorage() {
	alert("bye");
	const table = document.getElementById("dataTable");
	
	
	
	//console.log(table);
	
	//const tbody = document.querySelector("table tbody");
	//console.log(tbody);
	
	
	
	const data = {
		innerHtml: table.tBodies[0].innerHTML, 
		maxID: maxID,
		currentID: currentID,
		cbMode: document.getElementById("cbMode").value = strkMode
	};
	console.log("saveStateToStorage",storageKey, data);

    SafeStorage.setItem(storageKey, data);
    alert("State saved");
}

function xxxxloadStateFromStorage() {
    const data = SafeStorage.getItem(storageKey);
	console.log("loadStateFromStorage",storageKey, data);
    if (!data) return false;

	const table = document.getElementById("dataTable");
	table.tBodies[0].innerHTML = data.innerHtml;


	currentID=data.currentID;
    maxID=data.maxID;
	lastFocusedItemID = null;
	currentMode = data.cbMode;
	
	obj = document.getElementById("cbMode");
	obj.value = currentMode;
	
	attachFocusListeners();
	
	fillAll();
	setCurrent(1);

	console.log("State loaded", data);
	return true;
	/*
    // Restore content
    data.items.forEach((item, index) => {
        const i = index + 1;
        objItm(i).value = item.name;
        objStrkH(i).value = item.streak;
        objStrk(i).value = strkDisplay(item.streak);
    });

    // Restore mode
    document.getElementById("cbMode").value = strkMode;
    strkMode = data.mode;

    // Restore highlight
    if (data.currentID >= 1 && data.currentID <= maxID) {
        setCurrent(data.currentID);
    }

    console.log("State loaded", data);
	return true;
	*/
}

function doFactoryReset() {
	console.log("doFactoryReset");
	const table = document.getElementById("dataTable");
	table.tBodies[0].innerHTML = `
<tr >
	<td> <input name="txtItm01" placeholder="Practice Item 1" size="25" maxlength="40" type="text"> </td>
	<td> <input name="txtBpm01" size="6" maxlength="6" value="" type="text" ></td>
	<td> <input name="txtStrk01" size="6" maxlength="6" value="" type="text" readonly tabindex=-1>	</td>
	<td style="display: none;"> <input name="hidStrk01" type="hidden" > </td>
</tr>
<tr>
	<td> <input name="txtItm02" placeholder="Practice Item 2" size="25" maxlength="40"	type="text"> </td>
	<td> <input name="txtBpm02" size="6" maxlength="6" value="" type="text"></td>
	<td> <input name="txtStrk02" size="6" maxlength="6" type="text" readonly tabindex=-1> </td>
	<td style="display: none;"> <input name="hidStrk02" type="hidden" > </td>
</tr>
<tr>
	<td> <input name="txtItm03" placeholder="Practice Item 3" size="25" maxlength="40"	type="text"> </td>
	<td> <input name="txtBpm03" size="6" maxlength="6" value="" type="text"></td>
	<td> <input name="txtStrk03" size="6" maxlength="6" type="text" readonly tabindex=-1> </td>
	<td style="display: none;"> <input name="hidStrk03" type="hidden" > </td>
</tr>
<tr>
	<td> <input name="txtItm04" placeholder="Practice Item 4" size="25" maxlength="40"	type="text"> </td>
	<td> <input name="txtBpm04" size="6" maxlength="6" value="" type="text"></td>
	<td> <input name="txtStrk04" size="6" maxlength="6" type="text" readonly tabindex=-1> </td>
	<td style="display: none;"> <input name="hidStrk04" type="hidden" > </td>
</tr>
<tr>
	<td> <input name="txtItm05" placeholder="Practice Item 5" size="25" maxlength="40" type="text"> </td>
	<td> <input name="txtBpm05" size="6" maxlength="6" value="" type="text"></td>
	<td> <input name="txtStrk05" size="6" maxlength="6" type="text" readonly tabindex=-1> </td>
	<td style="display: none;"> <input name="hidStrk05" type="hidden" > </td>
</tr>`;

	currentID=0;
    maxID=5;
	strkMode=blockMode;
	lastFocusedItemID = null;
	
	obj = document.getElementById("cbMode");
	obj.value = blockMode;
	
	attachFocusListeners();
	
	fillAll();
	setCurrent(1);
}

// ------------------------------------------------------


function dataDump() {
	console.log("dataDump");
	list = [];
	for (i=1; i<=maxID; i++)
	{
		name = objItm(i).value; 
		if (name=="") {
			name=objItm(i).placeholder;
		}
		bpm = objBpm(i).value;
		strkH = objStrkH(i).value;
		list.push ([i, name, bpm, strkH]);
	}
	
	const state = {
		tableItems: list,
		maxID: maxID,
		strkMode: strkMode,
		currentID: currentID
	}
	SafeStorage.setItem("storageKey", state);
	console.log(state);
	
	return list;
}

function loadStateFromStorage() {
	console.log("loadStateFromStorage");
	const state = SafeStorage.getItem("storageKey");
	console.log(state);
	if (!state) {
		return false;
	}

	// construct the table
	const table = document.getElementById("dataTable");
	const tbody = table.tBodies[0];
	tbody.innerHTML = ""
	
	maxID = 0;
	while ( maxID < state.maxID  ) {	
		maxID += 1;
		const i = maxID;
		const s = ("00" + i).slice(-2);

		// Create new row
		const row = document.createElement("tr");
		row.innerHTML = `
			<td><input name="txtItm${s}" placeholder="Practice Item ${i}" size="25" maxlength="40" type="text"></td>
			<td> <input name="txtBpm${s}" size="6" maxlength="6" value="" type="text" >
			<td><input name="txtStrk${s}" size="6" maxlength="6" type="text" value="" readonly tabindex="-1"></td>
			<td style="display: none;"> <input name="hidStrk${s}" type="hidden" value=0> </td>
		`;
		// Append row first
		tbody.appendChild(row);
		
		name = state.tableItems[i-1][1];
		bpm = state.tableItems[i-1][2];
		strkH = state.tableItems[i-1][3];
		objItm(i).value = name;
		objBpm(i).value = bpm;
		objStrkH(i).value = strkH;
		objStrk(i).value = strkDisplay(strkH);
		attachOneFocusListener(i);
	}
	lastFocusedItemID=null;
	setCurrent(state.currentID)
	strkMode= state.strkMode,
	obj = document.getElementById("cbMode");
	obj.value = strkMode
	return true;
}

// ------------------------------------------------------


function logClick() {
  fetch('/apps/log.php?page=interleave', { method: 'GET' });
}


// Bind buttons
document.getElementById('btnFReset').addEventListener('click', doFactoryReset);
document.getElementById('btnAlphaSort').addEventListener('click', doAlphaSort);
document.getElementById('btnReset').addEventListener('click', btnReset_click);
document.getElementById('btnRandomize').addEventListener('click', btnRandomize_click);
document.getElementById('btnAddItem').addEventListener('click', addItem);
document.getElementById('btnDeleteItem').addEventListener('click', deleteItem);
document.getElementById('cbMode').addEventListener('change', cbMode_change);
document.getElementById('btnPass').addEventListener('click', btnPass_click);
document.getElementById('btnFail').addEventListener('click', btnFail_click);
document.getElementById('btnSkip').addEventListener('click', btnSkip_click);

document.getElementById('btnDebug').addEventListener('click', saveStateToStorage);
document.getElementById('btnDebug2').addEventListener('click', dataDump);
document.getElementById('btnDebug3').addEventListener('click', loadStateFromStorage);


window.onload = function () {
	if (!loadStateFromStorage() ) {
		doFactoryReset();
	}
}

window.onbeforeunload = function() {
  alert("onbeforeunload");
}
