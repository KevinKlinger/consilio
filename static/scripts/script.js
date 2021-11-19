var constFields;
var nameReplacements = new Map();

//Executed when page has finished loading
async function init() {
	await fetchAvailableFields().then( fields => {
		constFields = fields;
	});

	//logFields();
    setNameReplacements();

    generateInputFields();
	switchTab();
}

// Fetches all allowed parametes of the given Terraform provider
async function fetchAvailableFields() {
	const response = await fetch('http://localhost:33334/api?provider=libvirt')
	if (!response.ok) {
		const message = `An error has occured: ${response.status}`;
		throw new Error(message);
	}

	const fields = await response.json()
	.catch(function(err){
		console.error("Error decoding JSON:", err)
	});

	return fields;
}

//Prints all available fields and their subfields to browser console
function logFields() {
	console.log("Available Fields:");
	constFields.forEach(category => {
		console.log(" - " + category.Name);
		
		category.Fields.forEach( subField => {
			console.log("    - " + subField.Name);
		})
	});
}

//Create form input fields based on the recieved Json
function generateInputFields() {
    let i = 0; //keep track of number of Tabs
	constFields.forEach(category => {
        i++;

        //Create invisible Radio button
        let newTabHeadRadio = document.createElement('input');
        newTabHeadRadio.setAttribute("type", "radio");
        newTabHeadRadio.setAttribute("name", "tabControl");
        newTabHeadRadio.setAttribute("id", "tabController" + i);
        newTabHeadRadio.setAttribute("value", "tab" + i);
        newTabHeadRadio.setAttribute("onChange", "switchTab();");

        //Make first tab selected by default
        if (i ==  1) {
            newTabHeadRadio.setAttribute("checked", "checked");
        }

        //Create label element
        let newTabHeadLabel = document.createElement('label');
        newTabHeadLabel.setAttribute("for", newTabHeadRadio.id);
        newTabHeadLabel.innerHTML = category.Name.split("_")[1];

        //Create new tab content container
        let newTabContent = document.createElement('article');
        newTabContent.setAttribute("class", "tab");
        newTabContent.setAttribute("id", "tab" + i);
        newTabContent.innerHTML = category.Name;

        //Add Tab header items to <nav>
        document.querySelector('nav').appendChild(newTabHeadRadio);
        document.querySelector('nav').appendChild(newTabHeadLabel);

        //Add Tab header items to <form>
        document.querySelector('form').appendChild(newTabContent);
		
        //Iterate through subfields to generate input elements
		category.Fields.forEach( subField => {

            //generate inputs based on current field and recursively generate subsequent subFields
            generateInput(subField, category, document.getElementById("tab" + i));
		});
	});
}

function generateInput(currentField, category, parent) {
    //Create label element that also contains the input element
	let newFormElementLabel = document.createElement('label');
    newFormElementLabel.innerHTML = currentField.Name;

    //Create input element
    let newFormElementInput;

    let i = 0; //Counts the amount of fields with subfields for the purpose of assigning them IDs
    
    switch (currentField.Type) {
        case "String":
            newFormElementInput = document.createElement('input');
            newFormElementInput.setAttribute("type", "text");
            break;

        case "Int":
            newFormElementInput = document.createElement('input');
            newFormElementInput.setAttribute("type", "number");
            //newFormElementInput.setAttribute("pattern", "[0-9]"); //Make sure only numbers are allowed
            break;

        case "Bool":
            newFormElementInput = document.createElement('input');
            newFormElementInput.setAttribute("type", "checkbox");

            newFormElementLabel.setAttribute("class", "forCheckbox"); //Mark this label element to NOT use vertical flex alignment
            break;

        case "List":
            newFormElementInput = document.createElement('input');
            newFormElementInput.setAttribute("type", "button");
            newFormElementInput.setAttribute("value", "Add new " + currentField.Name + " Element");
            newFormElementInput.setAttribute("onClick", "duplicateSubfields('" + category.Name + "_" + currentField.Name + "_Subfield');");
            break;

        default:    //Fallback (wtf is "map" ???)
            newFormElementInput = document.createElement('input');
            newFormElementInput.setAttribute("type", "text");
            break;
    }

    //Make elements required if the JSON specifies it
    newFormElementInput.required = currentField.Required;

    //Add input element to label container
    newFormElementLabel.appendChild(newFormElementInput);

    //Check library for more human readable names + placeholder and icon
    if (nameReplacements.has(category.Name + "." + currentField.Name)) {
        let replacements = nameReplacements.get(category.Name + "." + currentField.Name);
        newFormElementLabel.innerHTML = replacements.name;
        newFormElementInput.setAttribute("placeholder", replacements.placeholder);
        newFormElementInput.setAttribute("class", replacements.icon);
    }

    //Add label element of currentField and all its children to parent
    parent.appendChild(newFormElementLabel);

    //Check if current field has deeper subfields
    if(!(currentField.Subfields == null)) {
        
        //Create container for all subfields
        let newSubfieldsContainer = document.createElement('section');
        newSubfieldsContainer.setAttribute("class", "subfieldsContainer");
        newSubfieldsContainer.setAttribute("id", category.Name + "_" + currentField.Name + "_Subfield");

        //Iterate through subfields and generate them recursively
        currentField.Subfields.forEach(listElement => {
            generateInput(listElement, category, newSubfieldsContainer);
        });

        //Add subfield container to document
        parent.appendChild(newSubfieldsContainer);
    }
}

function duplicateSubfields(containerId) {
    //Find original subfields container and clone it
    subfieldContainer = document.getElementById(containerId).cloneNode(true);
    //Remove identifying ID
    subfieldContainer.removeAttribute("id");
    subfieldContainer.setAttribute("class", "subfieldsContainer clone");

    //Create a button that allows deleting the current set of extra subfields
    let destroyButton = document.createElement("input");
    destroyButton.setAttribute("type", "button");
    destroyButton.setAttribute("class", "destroy");
    destroyButton.setAttribute("value", "Remove this Element");
    destroyButton.setAttribute("onclick", "destroySubfields(event)");

    //add the destroy button to the <section>
    subfieldContainer.appendChild(destroyButton);
    
    //Insert the new clone after the original
    document.getElementById(containerId).after(subfieldContainer);
}

function destroySubfields(event) {
    let button = event.target;
    button.parentNode.remove();
}

//Switches the currently active tab
function switchTab() {

	//Read selected value from radio button
	var checkedTab = document.querySelector('input[name="tabControl"]:checked').value; 

	//fetch all available tabs
	var allTabs = document.getElementsByClassName('tab');

	//iterate through all available tabs
	for (let currentTab of allTabs) {
		//if current tab's name matches selected value, make it visible
		if(currentTab.id == checkedTab) {
			currentTab.style.display = "flex"; 
		} else {
			//if not, make it invisible
			currentTab.style.display = "none";
		}
	}
}

//Add a new input category for a new Disk to the form
function addDisk() {

	//create new Label element
	let newDiskLabel = document.createElement('label');
	newDiskLabel.innerHTML = "Disk:";

	//create new text input element
	let newDiskInput = document.createElement('input');
	newDiskInput.setAttribute("type", "text");
	newDiskInput.setAttribute("class", "icon iconHarddrive");

    //insert text input element into label element
	newDiskLabel.appendChild(newDiskInput);

	//insert label element after buttonAddDisk
	document.getElementById('buttonAddDisk').parentNode.insertBefore(newDiskLabel, document.getElementById('buttonAddDisk').nextSibling);

	console.log(newDiskLabel)
	console.log(newDiskInput)
}

/*
function generateTabs() {
	constFields.forEach(category => {

		let tab = document.createElement('button')
		tab.innerHTML = category.Name
		tab.className = "tablinks"
		tab.id = category.Name

		tab.onclick = function () {
			openCity(event, category.Name)
		}

		document.getElementById('resources').appendChild(tab);


		
		category.Fields.forEach( subField => {
			let test = document.createElement('div')
			test.innerHTML = subField.Name
			test.className = "tabcontent"
			test.id = subField.Name

			document.getElementById('resources').appendChild(test);
		})
	});
}

function generateNetwork() {
    let networkField = await getFieldsFor("libvirt_network")
    networkField;
    console.log(networkField)
}

function getFieldsFor(desiredElement) {
	 fetchAvailableFields().then( fields => {
		 fields.forEach(category => 
			 {
				 if (category.Name == desiredElement) {
					 console.log(category, "\n\n")
					 return category
				 }
			 }
		 );
	 });
}*/

//Pseudo Struct to allow us to hold three values for every key in a map
function fieldDescriptions(name, placeholder, icon) {
    this.name = name;
    this.placeholder = placeholder;
    this.icon = icon;
}

//Create each key-value pair for name replacements
function setNameReplacements() {
    nameReplacements.set("libvirt_domain.fw_cfg_name", new fieldDescriptions("config file CUSTOM NAME", "enter your forward configuration file", "icon iconFile"));
}