var constFields;

//Executed when page has finished loading
async function init() {
  await fetchAvailableFields().then( fields => {
    constFields = fields;
  });
  logFields();
  //generateTabs();
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
  constFields.forEach(field => {
    console.log(" - " + field.Name);
    
    field.Fields.forEach( subField => {
      console.log("   - " + subField.Name);
    })
  });
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

//Add a new input field for a new Disk to the form
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
  constFields.forEach(field => {

    let tab = document.createElement('button')
    tab.innerHTML = field.Name
    tab.className = "tablinks"
    tab.id = field.Name

    tab.onclick = function () {
      openCity(event, field.Name)
    }

    document.getElementById('resources').appendChild(tab);


    
    field.Fields.forEach( subField => {
      let test = document.createElement('div')
      test.innerHTML = subField.Name
      test.className = "tabcontent"
      test.id = subField.Name

      document.getElementById('resources').appendChild(test);
    })
  });
}

function openCity(evt, resourceName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    
    document.getElementById(resourceName).style.display = "block";
    evt.currentTarget.className += " active";
}

*/

// function generateNetwork() {
  // let networkField = await getFieldsFor("libvirt_network")
  // networkField;
  // console.log(networkField)
// }

// function getFieldsFor(desiredElement) {
//   fetchAvailableFields().then( fields => {
//     fields.forEach(field => 
//       {
//         if (field.Name == desiredElement) {
//           console.log(field, "\n\n")
//           return field
//         }
//       }
//     );
//   });
// }