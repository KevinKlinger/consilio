function Quadrat() {
    var Eingabe  = document.getElementById('cpu');
    var Ergebnis = Eingabe.value * Eingabe.value;
    alert("Das Quadrat von " + Eingabe.value + " = " + Ergebnis);
    Eingabe.value = 0;
}

function addDisk() {

    let newDiskLabel = document.createElement('label');
    newDiskLabel.innerHTML = "Disk:\n";

    let newDiskMenu = document.createElement('input');

    document.getElementById('infobox').appendChild(newDiskLabel, newDiskMenu);

    console.log(newDiskLabel)
    console.log(newDiskMenu)
}