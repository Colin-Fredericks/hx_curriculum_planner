ReactDOM.render(
    <h1>Course Title</h1>,
    document.getElementById('root')
);


// Create XML parser and serializer
let xparse = new DOMParser;
let xser = new XMLSerializer();

// Create or get an XML string
// let xmlString = '<Pages><Page Name="test"><controls><test>this is a test.</test></controls></Page><Page Name = "User"><controls><name>Sunil</name></controls></Page></Pages>';
// console.log(xmlString);
let xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        parseAndProcess(this.responseText);
    }
};
xmlhttp.open("GET", "test_course.xml", true);
xmlhttp.send();

function parseAndProcess(xmlString){

    // Parse it and store the namespace
    let xdoc = xparse.parseFromString(xmlString, 'application/xml');
    let xns = xdoc.documentElement.namespaceURI;
    console.log(xdoc);

    // Manipulate it
    let UPC = xdoc.querySelectorAll('vertical[display_name="Page 4"]');
    var bloit = document.createElementNS(xns, 'problem');
    bloit.setAttribute('display_name','Problem 5');
    var btext = document.createTextNode('');
    bloit.appendChild(btext);
    UPC[0].appendChild(bloit);

    // Serialize it. Gonna need a prettifier eventually.
    let finalString = xser.serializeToString(xdoc.documentElement);
    console.log(finalString);
    
    // Ok, now for actual code
    XMLToReact(xdoc, xns);

}

// Takes an XML document and namespace.
// Constructs the on-page structure via React.
function XMLToReact(xdoc, xns){
    // Get the first sequential tag
    let sequentials = xdoc.querySelectorAll('sequential');
    let seq1 = sequentials[0];
    console.log(seq1);
    
    // For each vertical, create a column
    let verticals = seq1.children;
    Array.from(verticals).forEach( v => console.log(v) );
    
    // For each component in that vertical, create a div.
    // Style the div according to what kind of component it is.
}
