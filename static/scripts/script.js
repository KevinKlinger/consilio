var constFields;
var nameReplacements = new Map();

/** Executed automatically after page load */
async function init() {

    await fetchAvailableFields().then( fields => {
        constFields = fields;
    });
    
    setNameReplacements();  //Prepare library of custom names for fields
    
    generateTabs();         //Generate the form based on the recieved JSON
    switchTab();            //Make the first tab visible

    //document.querySelector('form').addEventListener('submit', handleSubmit); //enable pressing the submit button

    document.querySelector('#fileToImport').addEventListener('change', importFromFile); //enable pressing the import file button
    document.querySelector('#btn_saveFile').addEventListener('click', saveToFile); //enable pressing the save to file button
    document.querySelector('#btn_submit').addEventListener('click', sendToServer); //enable pressing the send to server button
}

/**  Fetches all allowed parameters of the given Terraform provider 
 * @return {Object} Hierarchic list of all available parameters as specified by the provider
*/
async function fetchAvailableFields() {
	const response = await fetch('http://localhost:33334/api?provider=libvirt')
	if (!response.ok) {
		const message = `An error has occured: ${response.status}`;
		throw new Error(message);
	}

	const fields = await response.json()
	.catch(function(err){
		console.error("Error decoding JSON:", err);
	});

	return fields.sort((a,b) => a.Name.localeCompare(b.Name));
}

/** Create tabs and form input fields based on the recieved Json */
function generateTabs() {
    let i = 0; //keep count of the number of Tabs for the purpose of assigning them IDs

    let form = document.querySelector('form');

    //iterate through all categorys and create a tab for each of them
	constFields.forEach(category => { 
        i++;

        //Create tab navigation
        //Create invisible Radio button
        let newTabHeadRadio = document.createElement('input');
        newTabHeadRadio.type = "radio";
        newTabHeadRadio.name = "tabControl";
        newTabHeadRadio.id = "tabController" + i;
        newTabHeadRadio.value = "tab" + i;
        newTabHeadRadio.setAttribute("onChange", "switchTab();");

        //Mark the first tab as selected by default
        if (i ==  1) {
            newTabHeadRadio.setAttribute("checked", "checked");
        }

        //Create clickable tab head
        let newTabHeadLabel = document.createElement('label');
        newTabHeadLabel.setAttribute("for", newTabHeadRadio.id);
        newTabHeadLabel.innerHTML = category.Name.replace("libvirt_", ""); //Trim out the "livbirt_" from the name for user readability

        //Add Tab header items to <nav>
        document.querySelector('nav').appendChild(newTabHeadRadio);
        document.querySelector('nav').appendChild(newTabHeadLabel);

        //Create new tab content container
        let newTabContent = document.createElement('article');
        newTabContent.setAttribute("class", "tab");
        newTabContent.id = "tab" + i;

        //Add Tab content item to <form>
        form.insertBefore(newTabContent, form.firstChild);
		
        //Iterate through fields to generate input elements
        generateInputs(category.Fields.sort((a,b) => a.Name.localeCompare(b.Name)), category.Name, document.getElementById("tab" + i));
	});
}

/** Generate HTML form inputs based on current field and recursively generate its child subFields
 * @param {Object} currentField Object describing the properties of the input field to be generated
 * @param {String} path A String describing the path to this field
 * @param {HTMLElement} parent Container for this input to be generated inside of 
 */ 
function generateInputs(currentSet, path, parent) {
    currentSet.forEach(currentField => {
        //Create label element that will contain the input element
        let newFormElementLabel = document.createElement('label');
        newFormElementLabel.innerHTML = currentField.Name.replaceAll("_", " ");

        //Create input element
        let newFormElementInput = document.createElement("input");
        
        switch (currentField.Type) {
            case "String":      //Create a standard text box
                newFormElementInput.type = "text";
                break;

            case "Int":         //Create a number selector
                newFormElementInput.type = "number";
                //TODO: newFormElementInput.setAttribute("pattern", "[0-9]"); //Make sure only numbers are allowed
                break;

            case "Bool":        //Create a checkbox
                newFormElementInput.type = "checkbox";

                newFormElementLabel.setAttribute("class", "forCheckbox"); //Mark the containing label element to NOT use vertical flex alignment
                break;

            case "List":        //List always has Subfields and requires a button to add additional subfields; Subfield generation happens later
                newFormElementLabel.dataset.subfieldSets = 1;

                newFormElementInput.type = "button";
                newFormElementInput.value = "Add new " + currentField.Name + " Element";
                newFormElementInput.setAttribute("class", "icon iconPlus");
                newFormElementInput.setAttribute("onClick", "duplicateSubfields('" + path + "." + currentField.Name + ".subfields', event);");
                break;

            default:    //Fallback
                newFormElementInput.type = "text";
                break;
        }

        //add unique identifier to the input field
        newFormElementInput.name = path + "." + currentField.Name;

        //Mark elements as required if the JSON specifies it
        //TODO: newFormElementInput.required = currentField.Required; //Disabled for easier Debugging

        //Check library for more human readable names + placeholder and icon
        if (nameReplacements.has(path + "." + currentField.Name)) {
            let replacements = nameReplacements.get(path + "." + currentField.Name);
            newFormElementLabel.title = currentField.Name;  //retain original name of current field as pop-up shown on hover
            newFormElementLabel.innerHTML = replacements.name;
            newFormElementInput.setAttribute("placeholder", replacements.placeholder);
            newFormElementInput.setAttribute("class", replacements.icon);
        }

        //Add input element to label container
        newFormElementLabel.appendChild(newFormElementInput);

        //Save a referene to the input HTML element in the Object structure so that we can read its value later when User submits the form
        //currentField.inputPointer = newFormElementInput;

        //Add label element of currentField and all its children to parent
        parent.appendChild(newFormElementLabel);

        //Check if the current field has deeper subfields
        if(!(currentField.Subfields == null)) {
            
            //Create container element for all subfields
            let newSubfieldsContainer = document.createElement('section');
            newSubfieldsContainer.setAttribute("class", "subfieldsContainer");
            newSubfieldsContainer.id = path + "." + currentField.Name + ".subfields";

            //Iterate through subfields and generate them recursively
            generateInputs(currentField.Subfields.sort((a,b) => a.Name.localeCompare(b.Name)), path + "." + currentField.Name, newSubfieldsContainer);

            //Add subfield container to document
            parent.appendChild(newSubfieldsContainer);
        }
    });
}

/** Creates a clone of the specified subfield container
 * @param {String} containerId Unique name to identify the container of all subfields to duplicate
 * @param {Object} event Event object automatically generated by the triggering Event
 */
function duplicateSubfields(containerId, event) {

    let button = event.target;  //Determine the excact button that was pressed
    
    let label = button.parentNode;                      //find the parent label element counting the amount of subfields
    let i = parseInt(label.dataset.subfieldSets);       //read the current value
    label.dataset.subfieldSets = i + 1;                 //update the counter

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
        if(inputElement.type != "button") {
            inputElement.value = "";    //clean any existing value for the new copy, except for buttons
        }
    }

    //Create a button that allows user to destroy this set of extra subfields
    let destroyButton = document.createElement("input");
    destroyButton.type = "button";
    destroyButton.value = "Remove this Element";
    destroyButton.setAttribute("class", "destroy");
    destroyButton.setAttribute("onclick", "destroySubfields(event)");

    //add the destroy button to the <section>
    subfieldContainer.appendChild(destroyButton);
    
    //Insert the cloned and modified <section> right behind the original
    document.getElementById(containerId).after(subfieldContainer);
}

/** Removes a Subfield Section from a List
 * @param {Object} event Event object automatically generated by the triggering Event
 */
function destroySubfields(event) {
    let button = event.target;  //Determine the excact button that was pressed
    button.parentNode.remove(); //Destroy its parent element
}

/** Switches the currently active tab of the form based on the current selected radio button in <nav> */
function switchTab() {

	//Read value of selected radio button
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

/** when user presses submit
 * @param {Object} event Event object automatically generated by the triggering Event
 *
function handleSubmit(event) {
    event.preventDefault();

    const data = new FormData(event.target);

    const value = Object.fromEntries(data.entries());

    console.log({ value });

    sendToServer({ value });
} */

/** Called when user selects an existing config file to import its values to the form */
function importFromFile(event) {
    var fileToImportInput = event.target;
    var file_to_read = fileToImportInput.files[0];  //copy reference to selected file
    var fileread = new FileReader();                //create file reader helper Object

    function importFields(currentSet, path) {
        currentSet.forEach(currentField => {
            let targetInputElement = document.getElementsByName(path + "." + currentField.Name)[0];
            if(targetInputElement != null) {
                
                switch(currentField.Type) {
                    case "String":
                    case "Int":
                    case "Map":
                        targetInputElement.value = currentField.value;
                        break;
        
                    case "Bool":
                        targetInputElement.checked = currentField.value;
                        break;
        
                    default:
                        break;
                }
        
                if(!(currentField.Subfields == null)) {
                    //Iterate through subfields and generate them recursively
                    importFields(currentField.Subfields, path + "." + currentField.Name);
                }
            }
        });
    }

    fileread.onload = function(e) {                 //Event triggered when file is finished loading
        var content = e.target.result;
        FieldsToImport = JSON.parse(content);       // parse json

        FieldsToImport.forEach(category => {
            importFields(category.Fields, category.Name);
        });
    };
    fileread.readAsText(file_to_read);              //Load file
}

/** Function that reads all user input from the form, adds the values to the persistent object structure, then returns a JSON string representing the object structure
 * 
 * @returns {String} A JSON string representing the object structure with user input values
 */
function serializeFormData() {
    //Create deep clone of list of all fields to edit
    let constFieldsClone = JSON.parse(JSON.stringify(constFields));

    //Recursively called function that finds corresponding HTML input field and reads its value
    function ReadFields(currentSet, path) {
        currentSet.forEach(currentField => {
            let targetInputElement = document.getElementsByName(path + "." + currentField.Name)[0];       //find the HTML element
            if(targetInputElement != null) {                                    //Make sure we actually found one

                if(!(currentField.Subfields == null)) {                         //Check if this field has deeper subfields
                    ReadFields(currentField.Subfields, path + "." + currentField.Name);  //Recursive function call for subfields
                    currentField.Subfields = currentField.Subfields.filter((item) => item.value !== undefined); //filter out all subfields that have no value
                    if(currentField.Subfields.length > 0) {                     //if at least one subfield has value, mark the current field to also have a value so it doesn't get filtered
                        currentField.value = "";
                    } else {
                        delete currentField.Subfields;                          //Delete Subfields property if it is empty. TODO this doesn't seem to work though...
                    }
                }
    
                switch(currentField.Type) {                                     //Check type of field
                    case "String":
                    case "Int":
                    case "Map": 
                        if(targetInputElement.value != "") {                    //These types correspond to an <input type="text">
                            currentField.value = targetInputElement.value;
                        }
                        break;
    
                    case "Bool":                                                //This corresponds to an <input type="checkbox">
                        if(targetInputElement.checked) {
                            currentField.value = true;
                        }
                        break;
    
                    default:                                                    //Type List doesn't have a corresponding input, value depends entirely on its subfields
                        break;
                }
            }
        });
    }

    constFieldsClone.forEach(category => {
        ReadFields(category.Fields, category.Name);
        category.Fields = category.Fields.filter((item) => item.value !== undefined);
    });

    constFieldsClone = constFieldsClone.filter((item) => item.Fields.length > 0);

    let JSONString = JSON.stringify(constFieldsClone);
    return JSONString;
}

/** Prompts user to download current form inputs as a JSON file */
function saveToFile(event) {
    //Retrieve content from the form
    let content = serializeFormData();

    //Create a text document in memory and prompt user to "download" it
    var a = document.createElement("a");
    a.href = window.URL.createObjectURL(new Blob([content], {type: "text/plain"}));
    a.download = "libvirtConfig.json";
    a.click(); 
}

/** Sends current form inputs to server as a JSON string */
function sendToServer(event) {
    //Retrieve content from the form
    let content = serializeFormData();

    // Creating a XHR object
    let xhr = new XMLHttpRequest();
    let url = "/projects/1";
    
    // open a connection
    xhr.open("GET", url, true);
  
    // Set the request header i.e. which type of content you are sending
    xhr.setRequestHeader("Content-Type", "application/json");

    // Create a state change callback
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            alert("Success!");
            // Print received data from server
        } else {
            alert("Not Success! ReadyState: " + xhr.readyState + " status code: " + xhr.status);
        }
    };
    
    // Converting JSON data to string
    var data = JSON.stringify({content});

    // Sending data with the request
    xhr.send(data);
}

//Pseudo Struct to allow us to hold three values for every key in a map
class fieldDescriptions {
    constructor(name, placeholder, icon) {
        this.name = name;
        this.placeholder = placeholder;
        this.icon = icon;
    }
}

/** Create each key-value pair for name replacements */
function setNameReplacements() {
    nameReplacements.set("libvirt_cloudinit_disk.meta_data", new fieldDescriptions("Meta Information", "Set basic meta data", "icon iconHashTag"));
    nameReplacements.set("libvirt_cloudinit_disk.name", new fieldDescriptions("Cloud disk name", "Give your cloud disk a unique name", "icon iconNameTag"));
    nameReplacements.set("libvirt_cloudinit_disk.network_config", new fieldDescriptions("Network Configuration", "Set configuration for networking", "icon iconNetwork"));
    nameReplacements.set("libvirt_cloudinit_disk.pool", new fieldDescriptions("Pool", "Set the pool where this resource will be created", "icon iconHarddrive"));
    nameReplacements.set("libvirt_cloudinit_disk.user_data", new fieldDescriptions("User Data", "Attach additional meta data", "icon iconCog"));
}