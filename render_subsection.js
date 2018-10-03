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

const typeIconLookup = {
    'video': 'fa fa-video',
    'html': 'fa fa-file-alt',
    'problem': 'fa fa-question-circle',
    'discussion': 'fa fa-comments',
    'other': 'fa fa-file'
}

// Makes a probably unique ID for each XML tag.
function makeRandomID(){
    const textID = (Math.floor(Math.random() * 2**32).toString(16)) + (Math.floor(Math.random() * 2**32).toString(16));
    // Fill leading zeroes
    const finalID = Array(16 - textID.length).fill(0).toString().replace(',','') + textID;
    return finalID;
}

// EdX components are shown as boxes in the subsection view
class Comp extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            duration: 5
        };
    }

    render(){
        console.log('rendering component');
        return (
            <div
                className={'rounded p-1 m-1 ' + typeClassLookup[this.props.thisComp.tagName]}
                id={this.props.id}
                style={{height: this.state.duration * 10 + 'px'}}
                >
                <span
                    className={typeIconLookup[this.props.thisComp.tagName]}
                ></span>
                &nbsp; {
                    typeof this.props.thisComp.attributes.display_name === 'undefined'
                    ? 'Unnamed ' + this.props.thisComp.tagName
                    : this.props.thisComp.attributes.display_name.value
                }
            </div>
        );
    }


}

// Verticals are shown as a column in the subsection view
class Vertical extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            total_duration: 0
        };
    }

    // Render the edX components for this vertical
    renderComps(){
        console.log('renderComps');

        const xparse = new DOMParser;
        const xdoc = xparse.parseFromString(this.props.thisVert.outerHTML, 'application/xml');
        const vertical = xdoc.querySelectorAll('vertical');
        console.log('This vertical:');
        console.log(vertical);
        const vert1 = vertical[0];

        // For each edX component, create a div
        const comps = Array.from(vert1.children).map(function(c, index){
            return <Comp key={makeRandomID()} id={makeRandomID()} thisComp={c} />
        });
        console.log('components:');
        console.log(comps);
        return (
            <React.Fragment>
                {comps}
            </React.Fragment>
        )
    }

    render(){
        return (
            <div
                id={this.props.id}
                className='ol-sm-2 p-1 m-1 border border-secondary vertical rounded'
                >
                <p className="font-weight-bold">
                &nbsp; {
                    typeof this.props.thisVert.attributes.display_name === 'undefined'
                    ? 'Unnamed Unit'
                    : this.props.thisVert.attributes.display_name.value
                }
                </p>
                {this.renderComps()}
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
            console.log(that.state);
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
        const verticals = Array.from(seq1.children).map(function(v, index){
            return <Vertical key={makeRandomID()} id={makeRandomID()} thisVert={v} />
        });
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
            <div className='container'>
                <div className='controls row'>{this.renderLoadFileButton()}</div>
                <div className='allverticals row'>{this.renderVerticals()}</div>
            </div>
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
