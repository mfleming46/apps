
const blockMode="BLOCKMODE";
const leaveMode="LEAVEMODE";
const styleHilite= "background-color:#FFFF00;";
const styleNormal= "background-coolor:FFFFFF";
var currentID=0;
var maxID=5;
var strkGoal=5;
var strkMode=blockMode;

function initForm()
{
	console.clear()	;
	fillAll();
	setCurrent(1);
}

function btnRandomize_click()
{
    list = [];
	for (i=1; i<=5; i++)
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
	for (i=1; i<=5; i++)
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

    // Hidden field for streak value
    const hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = "hidStrk" + s;

    document.forms["frmLeave"].appendChild(hidden);
    tbody.appendChild(row);

    // Optional: auto-focus new item
    //objItm(i).focus();
}

function deleteItem() {
    if (maxID <= 1) {
        alert("At least one item must remain.");
        return;
    }

    const i = maxID;
    const s = ("00" + i).slice(-2);

    // Remove input row
    const tbody = document.querySelector("table tbody");
    tbody.removeChild(tbody.lastElementChild);

    // Remove hidden input
    const hidden = document.getElementsByName("hidStrk" + s)[0];
    if (hidden) hidden.remove();

    maxID -= 1;

    // Update currentID if necessary
    if (currentID > maxID) {
        setCurrent(maxID);
    }
}


    function logClick() {
      fetch('/apps/log.php?page=interleave', { method: 'GET' })
    }

