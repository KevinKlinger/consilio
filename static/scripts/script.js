var constFields;
var nameReplacements = new Map();

//Executed when page has finished loading
async function init() {

    //Add event listener for filepicker popup
    document.querySelector("#openFromUrl").addEventListener("click",async function(){
        await fetchAvailableFields().then( fields => {
            constFields = fields;
        });
        prepareForm();
    });

    //Add event listener for filepicker popup
    document.querySelector("#importFile").addEventListener("click",function(){
        document.querySelector("#popup").classList.add("active");
    });
     
    //Add event listener for popup close button
    document.querySelector("#popup #close-btn").addEventListener("click",function(){
        document.querySelector("#popup").classList.remove("active");
    });

    //Add event listener for file picker submit button
    document.querySelector("#open-btn").addEventListener("click",function(){
        var file_to_read = document.querySelector("#popup input[type=file]").files[0];
        var fileread = new FileReader();
        fileread.onload = function(e) {
            var content = e.target.result;
            constFields = JSON.parse(content); // parse json
            prepareForm();
        };
        fileread.readAsText(file_to_read);
    });
}

//After a JSON is opened by either method, this function will be called
async function prepareForm() {
    document.querySelector("#initialPrompt").remove();
    document.querySelector("#popup").classList.remove("active");

    document.querySelector("form").style.display= "flex";

    //logFields();
    setNameReplacements();  //Prepare library of custom names for fields
    
    generateInputFields();  //Generate the form based on the recieved JSON
    switchTab();            //Make the first tab visible

    document.querySelector('form').addEventListener('submit', handleSubmit); //enable pressing the submit button
}

// Fetches all allowed parameters of the given Terraform provider
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

	return fields.sort((a,b) => a.Name.localeCompare(b.Name));
}

//Debug function that prints all available fields and their subfields to browser console
function logFields() {
	console.log("Available Fields:");
	constFields.forEach(category => {
		console.log(" - " + category.Name);
		
		category.Fields.forEach( subField => {
			console.log("    - " + subField.Name);
		})
	});
}

//Create tabs and form input fields based on the recieved Json
function generateInputFields() {
    let i = 0; //keep count of the number of Tabs

    let form = document.querySelector('form');

    //iterate through all categorys and create a tab for each of them
	constFields.forEach(category => { 
        i++;

        //Create tab navigation
        //Create invisible Radio button
        let newTabHeadRadio = document.createElement('input');
        newTabHeadRadio.setAttribute("type", "radio");
        newTabHeadRadio.setAttribute("name", "tabControl");
        newTabHeadRadio.setAttribute("id", "tabController" + i);
        newTabHeadRadio.setAttribute("value", "tab" + i);
        newTabHeadRadio.setAttribute("onChange", "switchTab();");

        //Mark the first tab as selected by default
        if (i ==  1) {
            newTabHeadRadio.setAttribute("checked", "checked");
        }

        //Create clickable tab head
        let newTabHeadLabel = document.createElement('label');
        newTabHeadLabel.setAttribute("for", newTabHeadRadio.id);
        newTabHeadLabel.innerHTML = category.Name.split("_")[1];

        //Add Tab header items to <nav>
        document.querySelector('nav').appendChild(newTabHeadRadio);
        document.querySelector('nav').appendChild(newTabHeadLabel);

        //Create new tab content container
        let newTabContent = document.createElement('article');
        newTabContent.setAttribute("class", "tab");
        newTabContent.setAttribute("id", "tab" + i);
        newTabContent.innerHTML = category.Name;

        //Add Tab content items to <form>
        form.insertBefore(newTabContent, form.firstChild);
		
        //Iterate through fields to generate input elements
		category.Fields.forEach( currentField => {

            //generate inputs based on current field and recursively generate its child subFields
            generateInput(currentField, category.Name, document.getElementById("tab" + i));
		});
	});
}

function generateInput(currentField, path, parent) {
    //Create label element that also contains the input element
	let newFormElementLabel = document.createElement('label');
    newFormElementLabel.innerHTML = currentField.Name;

    //Create input element
    let newFormElementInput;

    let i = 0; //Keeps count of the amount of fields with subfields for the purpose of assigning them IDs
    
    switch (currentField.Type) {
        case "String":      //Create a standard text box
            newFormElementInput = document.createElement('input');
            newFormElementInput.setAttribute("type", "text");
            break;

        case "Int":         //Create a number selector
            newFormElementInput = document.createElement('input');
            newFormElementInput.setAttribute("type", "number");
            //newFormElementInput.setAttribute("pattern", "[0-9]"); //Make sure only numbers are allowed
            break;

        case "Bool":        //Create a checkbox
            newFormElementInput = document.createElement('input');
            newFormElementInput.setAttribute("type", "checkbox");

            newFormElementLabel.setAttribute("class", "forCheckbox"); //Mark this label element to NOT use vertical flex alignment
            break;

        case "List":        //List always has Subfields and requires a button to add additional subfields; Subfield generation happens later
            newFormElementLabel.dataset.subfieldSets = 1;

            newFormElementInput = document.createElement('input');
            newFormElementInput.setAttribute("type", "button");
            newFormElementInput.setAttribute("class", "icon iconPlus");
            newFormElementInput.setAttribute("value", "Add new " + currentField.Name + " Element");
            newFormElementInput.setAttribute("onClick", "duplicateSubfields('" + path + "_" + currentField.Name + "_Subfield', event);");
            break;

        default:    //Fallback (wtf is "map" ???)
            newFormElementInput = document.createElement('input');
            newFormElementInput.setAttribute("type", "text");
            break;
    }

    //add unique identifier to the input field
    newFormElementInput.setAttribute("name", path + "." + currentField.Name);

    //Mark elements as required if the JSON specifies it
    //newFormElementInput.required = currentField.Required;

    //Add input element to label container
    newFormElementLabel.appendChild(newFormElementInput);

    //Check library for more human readable names + placeholder and icon
    if (nameReplacements.has(path + "." + currentField.Name)) {
        let replacements = nameReplacements.get(path + "." + currentField.Name);
        newFormElementLabel.innerHTML = replacements.name;
        newFormElementInput.setAttribute("placeholder", replacements.placeholder);
        newFormElementInput.setAttribute("class", replacements.icon);
    }

    //Add label element of currentField and all its children to parent
    parent.appendChild(newFormElementLabel);

    //Check if the current field has deeper subfields
    if(!(currentField.Subfields == null)) {
        
        //Create container elements for all subfields
        let newSubfieldsContainer = document.createElement('section');
        newSubfieldsContainer.setAttribute("class", "subfieldsContainer");
        newSubfieldsContainer.setAttribute("id", path + "_" + currentField.Name + "_Subfield");

        //Recursively iterate through subfields and generate them
        currentField.Subfields.forEach(listElement => {
            generateInput(listElement, path + "." + currentField.Name, newSubfieldsContainer);
        });

        //Add subfield container to document
        parent.appendChild(newSubfieldsContainer);
    }
}

//Duplicate all Subfields of a List element
function duplicateSubfields(containerId, event) {

    let button = event.target;  //Determine the excact button that was pressed
    
    let label = button.parentNode;                        //find the parent label element counting the amount of subfields
    let i = parseInt(label.dataset.subfieldSets);     //read the current value
    label.dataset.subfieldSets = i + 1;              //update the counter

    //Find original subfields container and clone it
    subfieldContainer = document.getElementById(containerId).cloneNode(true);

    //Remove identifying ID
    subfieldContainer.removeAttribute("id");
    subfieldContainer.setAttribute("class", "subfieldsContainer clone");

    //Get a list of all input fields in this container
    let allInputs = subfieldContainer.getElementsByTagName("input")
    
    //Iterate through all inputs of this subfield
    for (inputElement of allInputs) {
        inputElement.name += i;     //give them a unique name
        inputElement.value = "";    //clean any existing input for the new copy
    }

    //Create a button that allows user to destroy this set of extra subfields
    let destroyButton = document.createElement("input");
    destroyButton.setAttribute("type", "button");
    destroyButton.setAttribute("class", "destroy");
    destroyButton.setAttribute("value", "Remove this Element");
    destroyButton.setAttribute("onclick", "destroySubfields(event)");

    //add the destroy button to the <section>
    subfieldContainer.appendChild(destroyButton);
    
    //Insert the cloned and modified <section> right behind the original
    document.getElementById(containerId).after(subfieldContainer);
}

//Removes a Subfield Section from a List
function destroySubfields(event) {
    let button = event.target;  //Determine the excact button that was pressed
    button.parentNode.remove(); //Destroy its parent element
}

//Switches the currently active tab of the form
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

//when user presses submit
function handleSubmit(event) {
    alert("test");

    event.preventDefault();

    const data = new FormData(event.target);

    const value = Object.fromEntries(data.entries());

    console.log({ value });
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
