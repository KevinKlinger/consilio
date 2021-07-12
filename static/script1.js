var constFields;
var once = true;

async function init() {
  await fetchAvailableFields().then( fields => {
    constFields = fields;
  });
  generateTabs();
}

function generateNetwork() {
  
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
    newDiskLabel.innerHTML = "Disk:\n";

    let newDiskMenu = document.createElement('input');
    newDiskMenu.setAttribute("type", "text");

    document.getElementById('infobox').appendChild(newDiskLabel);
    document.getElementById('infobox').appendChild(newDiskMenu);

    console.log(newDiskLabel)
    console.log(newDiskMenu)
}