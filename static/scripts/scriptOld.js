var constFields;

async function init() {
  await fetchAvailableFields().then( fields => {
    constFields = fields;
  });
  generateTabs();
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

  return fields
}

function addDisk() {

    let newDiskLabel = document.createElement('label');
    newDiskLabel.innerHTML = "Disk:";

    let newDiskMenu = document.createElement('input');
    newDiskMenu.setAttribute("type", "text");

    document.getElementById('infobox').appendChild(newDiskLabel);
    document.getElementById('infobox').appendChild(newDiskMenu);

    console.log(newDiskLabel)
    console.log(newDiskMenu)
}

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