/***************************
/ React section
/ Creates objects for unit view
/ Called by XML section
****************************/

// Style the component div according to what kind of component it is.
const typeClassLookup = {
    'video': 'bg-primary',
    'html': 'bg-warning',
    'problem': 'bg-info',
    'discussion': 'bg-success',
    'other': 'bg-secondary'
};

// EdX components are shown as boxes in the subsection view
class Comp extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            comp_type: null,
            duration: 5
        };
    }

    render(){
        return (
            <div
                className={'rounded p-1 m-1 ' + typeClassLookup(this.state.comp_type)}
                style={'height: ' + this.state.duration * 10 + ';'}
                >
                Example Component
            </div>
        );
    }


}

// Verticals are shown as a column in the subsection view
class Vertical extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            title: 'Untitled page',
            total_duration: 0
        };
    }

    render(){
        return (
            <div className="col-sm-2 p-1 m-1 border border-secondary vertical rounded">
                <p className="font-weight-bold">{this.state.title}</p>
            </div>
        );
    }
}

// Button that loads the XML file
function LoadFileButton(props) {
    return <button onClick = {props.onClick}>Load from file</button>;
}

class SSView extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            title: 'Untitled subsection',
            total_duration: 0,
            xml: '<sequential/>'
        };
    }

    handleButtonClick(){

        const that = this;

        const isLoaded = new Promise(function(resolve, reject){
            return loadFromFile(resolve, reject);
        });

        isLoaded.then(function(loadedXML){
            console.log('Loading resolved');
            const newXML = parseAndProcess(loadedXML);
            // console.log('Altered XML:');
            // console.log(newXML);
            that.setState({
                xml: newXML
            });
            console.log('state:')
            console.log(this.state);
        });
    }

    renderLoadFileButton(){
        return <LoadFileButton onClick={() => this.handleButtonClick()} />
    }

    renderVerticals(){
        console.log('renderVerticals');
        const xparse = new DOMParser;
        const xdoc = xparse.parseFromString(this.state.xml, 'application/xml');
        const sequentials = xdoc.querySelectorAll('sequential');
        console.log('sequentials:');
        console.log(sequentials);
        const seq1 = sequentials[0];

        // For each vertical, create a column
        const verticals = Array.from(seq1.children).map( v => <Vertical/> );
        console.log('verticals:');
        console.log(verticals);
        return (
            <React.Fragment>
                {verticals}
            </React.Fragment>
        )
    }

    render(){
        return(
            <React.Fragment>
                {this.renderLoadFileButton()}
                {this.renderVerticals()}
            </React.Fragment>
        );
    }

}

ReactDOM.render(
    <SSView />,
    document.getElementById('subsection_view')
);



/***************************
/ XML handling section
/ Loads from example course
/ Calls React to render
****************************/

function loadFromFile(resolve, reject){
    console.log('loadFromFile');

    // Create XML parser and serializer
    const xparse = new DOMParser;
    const xser = new XMLSerializer();

    // Create or get an XML string
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log('XML obtained');
            // console.log(this.responseText);
            resolve(this.responseText);
        }
    };
    xmlhttp.open("GET", "test_course.xml", true);
    xmlhttp.send();

}

function parseAndProcess(xmlString){
    console.log('parseAndProcess');
    // console.log(xmlString);
    // Create XML parser and serializer
    const xparse = new DOMParser;
    const xser = new XMLSerializer();

    // Parse the XML and store the namespace
    let xdoc = xparse.parseFromString(xmlString, 'application/xml');
    let xns = xdoc.documentElement.namespaceURI;
    console.log('xdoc created');
    // console.log(xdoc);

    // Manipulate it
    let UPC = xdoc.querySelectorAll('vertical[display_name="Page 4"]');
    var bloit = document.createElementNS(xns, 'problem');
    bloit.setAttribute('display_name','Problem 5');
    var btext = document.createTextNode('');
    bloit.appendChild(btext);
    UPC[0].appendChild(bloit);

    // Serialize it. Gonna need a prettifier eventually.
    let finalString = xser.serializeToString(xdoc.documentElement);

    return finalString;

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

    // Pass all this to the rendering engine.
}
