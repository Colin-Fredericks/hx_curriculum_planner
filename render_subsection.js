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

// Converts hh:mm:ss notation to a number of seconds.
// If it's passed a number, it just spits that back out as seconds.
function hmsToSec(hms){

    let hmsText = hms.toString();
    let hmsArray = hmsText.split(':');
    let time = 0;

    if(hmsArray.length == 3){
        time = 3600*parseInt(hmsArray[0]) + 60*parseInt(hmsArray[1]) + Number(hmsArray[2]);
    }else if(hmsArray.length == 2){
        time = 60*parseInt(hmsArray[0]) + Number(hmsArray[1]);
    }else if(hmsArray.length == 1){
        time = Number(hmsArray[0]);
    }

    return time;
}


// Converts a number of seconds to hh:mm:ss notation.
// Leading zeroes optional. Days not returned.
function secToHMS(time, useLeadingZeroes = true){
    let seconds = String(Math.floor(time          % 60));
    let minutes = String(Math.floor((time / 60)   % 60));
    let hours   = String(Math.floor((time / 3600) % 24));

    if(useLeadingZeroes){
        if(seconds.length == 1){ seconds = '0' + seconds; }
        if(minutes.length == 1){ minutes = '0' + minutes; }
        if(hours.length   == 1){ hours   = '0' + hours;   }
    }

    if(Number(hours) > 0){
        return hours + ':' + minutes + ':' + seconds;
    }else if(Number(minutes) > 0){
        return minutes + ':' + seconds;
    }else{
        return seconds;
    }
}


// Makes a random, probably unique ID for each XML tag.
function makeRandomID(){
    const textID = (Math.floor(Math.random() * 2**32).toString(16)) + (Math.floor(Math.random() * 2**32).toString(16));
    // Fill leading zeroes
    const finalID = Array(16 - textID.length).fill(0).toString().replace(',','') + textID;
    return finalID;
}


// Give every part of the XML an ID so we can find it.
function giveEverythingIDs(xmlString){
    console.log('Give everything IDs.')

    // Parse the XML and use jQuery to add an ID to every element.
    // Using data attributes instead of actual IDs just in case.
    let xdoc = $.parseXML(xmlString);
    $(xdoc).find('*').each(function(){
        $(this).attr('data-key',makeRandomID());
    });

    // Serialize it. Gonna need a prettifier eventually.
    const xser = new XMLSerializer();
    const finalString = xser.serializeToString(xdoc);

    return finalString;
}


// Button that loads the XML file
function LoadFileButton(props) {
    return <button onClick = {props.onClick}>Load from file</button>;
}

// Button that loads the XML file
function OutputXML(props) {
    return <button onClick = {props.onClick}>Output XML</button>;
}

// EdX components are shown as boxes in the subsection view
class Comp extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        console.log('rendering component');
        // console.log(this.props.thisComp);
        const duration = this.props.thisComp.attributes['data-time'].value;
        const compName = typeof this.props.thisComp.attributes.display_name === 'undefined'
            ? 'Unnamed ' + this.props.thisComp.tagName
            : this.props.thisComp.attributes.display_name.value

        return (
            <div
                className={'rounded p-1 m-1 ' + typeClassLookup[this.props.thisComp.tagName]}
                id={this.props.id}
                style={{height: hmsToSec(duration) / 5 + 'px'}}
                >
                <span
                    className={typeIconLookup[this.props.thisComp.tagName]}
                ></span>
                &nbsp; { compName }
            </div>
        );
    }


}


// Button to add new components
class CompAdder extends React.Component {
    constructor(props){
        super(props);
    };

    render(){
        return (
            <div
                id={this.props.id}
                style={{textAlign: 'center'}}
                >
                <button
                    onClick={this.props.onClick}
                    className='fa fa-plus'
                ></button>
            </div>
        );
    }
}


// Button to add new components
class VertAdder extends React.Component {
    constructor(props){
        super(props);
    };

    render(){
        return (
            <div
                className='ol-sm-2 p-1 m-1 border border-secondary vertical rounded'
                id={this.props.id}
                style={{textAlign: 'center'}}
                >
                <button
                    onClick={this.props.onClick}
                    className='fa fa-plus'
                ></button>
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

    // Return the edX components for this vertical
    renderComps(){
        console.log('renderComps');

        const xparse = new DOMParser;
        const xdoc = xparse.parseFromString(this.props.thisVert.outerHTML, 'application/xml');
        const vertical = xdoc.querySelectorAll('vertical');
        // console.log('This vertical:');
        // console.log(vertical);
        const vert1 = vertical[0];

        // For each edX component, create a div
        const comps = Array.from(vert1.children).map(function(c, index){
            const keyid = $(c).data('key');
            return <Comp key={keyid} id={keyid} thisComp={c} />
        });
        // console.log('components:');
        // console.log(comps);
        const adderID = makeRandomID();
        const compAdder = this.props.compAdder;
        return (
            <React.Fragment>
                {comps}
                <CompAdder
                    key={adderID}
                    id={adderID}
                    onClick={compAdder}
                />
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

// The view of the whole subsection
class SSView extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            title: 'Untitled subsection',
            total_duration: -1,
            sequence_id: -1,
            xml: '<sequential/>'
        };
    }

    makeTag(tagType='html', name='Unnamed Component', duration='5:00', xns='', datakey=makeRandomID()){
        // Handle durations in pure seconds.
        if(duration.search(':') == -1 ){ duration = secToHMS(duration) }

        let newTag = document.createElementNS(xns, tagType);
        newTag.setAttribute('display_name',name);
        newTag.setAttribute('data-time',duration);
        newTag.setAttribute('data-key',datakey);
        let btext = document.createTextNode('');
        newTag.appendChild(btext);
        return newTag;
    }

    getCurrentSequence(){
        const xparse = new DOMParser;
        const xdoc = xparse.parseFromString(this.state.xml, 'application/xml');
        const sequentials = xdoc.querySelectorAll('sequential');
        const seq1 = sequentials[0];
        const key = seq1.getAttribute('data-key');
        if(key){ return key; } else { return 'nokeyfound'; }
    }

    handleOutputButton(){
        // For right now, just dump the current XML to the console.
        // Uses vkBeautify: http://www.eslinstructor.net/vkbeautify/
        const prettyXML = vkbeautify.xml(this.state.xml);
        console.log(prettyXML);
    }

    handleLoadButton(){

        const that = this;
        console.log('that');
        console.log(that);

        const isLoaded = new Promise(function(resolve, reject){
            return loadFromFile(resolve, reject);
        });

        // Right now we're still loading the whole course XML.
        // Later we'll do that elsewhere and just get one subsection here.
        isLoaded.then(function(loadedXML){
            console.log('Loading resolved');
            const newXML = parseAndProcess(loadedXML);
            that.setState({ xml: newXML });
            that.setState({ sequence_id: that.getCurrentSequence() })
            console.log('state:')
            console.log(that.state);
        });
    }

    addCompTo(e, that, tagType='html'){
        const currentXML = that.state.xml;

        // Get vertical from click event
        const parentVertical = e.target.parentNode.parentNode.id;

        // Parse the current XML
        const xparse = new DOMParser;
        let xdoc = xparse.parseFromString(currentXML, 'application/xml');
        let xns = xdoc.documentElement.namespaceURI;

        // Add the component with minimal info
        let UPC = xdoc.querySelectorAll('vertical[data-key="' + parentVertical + '"]');
        let newComp = that.makeTag(tagType,'Unnamed HTML','5:00', xns);
        UPC[0].appendChild(newComp);

        // Serialize it.
        const xser = new XMLSerializer();
        const finalString = xser.serializeToString(xdoc);

        // Update the state
        that.setState({
            xml: finalString
        });

        console.log('Component added to vertical ' + parentVertical);
    }

    addVerticalTo(e, that){

        const currentXML = that.state.xml;

        // Get vertical from click event
        const parentSequential = e.target.parentNode.parentNode.id;

        // Parse the current XML
        const xparse = new DOMParser;
        let xdoc = xparse.parseFromString(currentXML, 'application/xml');
        let xns = xdoc.documentElement.namespaceURI;

        // Add the component with minimal info
        let UPC = xdoc.querySelectorAll('sequential[data-key="' + parentSequential + '"]');
        console.log(UPC);
        let newComp = that.makeTag('vertical','Unnamed Unit','0', xns);
        UPC[0].appendChild(newComp);

        // Serialize it.
        const xser = new XMLSerializer();
        const finalString = xser.serializeToString(xdoc);

        // Update the state
        that.setState({
            xml: finalString
        });

        console.log('Vertical added to sequence ' + parentSequential);
    }

    renderLoadFileButton(){
        return <LoadFileButton onClick={() => this.handleLoadButton()} />
    }

    renderOutputXMLButton(){
        return <OutputXML onClick={() => this.handleOutputButton()} />
    }

    renderVerticals(){
        console.log('renderVerticals');

        const xparse = new DOMParser;
        const xdoc = xparse.parseFromString(this.state.xml, 'application/xml');
        const sequentials = xdoc.querySelectorAll('sequential');
        // console.log('sequentials:');
        // console.log(sequentials);
        const seq1 = sequentials[0];
        const ACT = this.addCompTo;
        const that = this;

        // For each vertical, create a column
        const verticals = Array.from(seq1.children).map(function(v, index){
            const keyid = $(v).data('key');
            return (
                <Vertical
                    key={keyid}
                    id={keyid}
                    thisVert={v}
                    compAdder={(e) => ACT(e, that, 'html')}
                />
            )
        });
        // console.log('verticals:');
        // console.log(verticals);
        const adderID = makeRandomID();
        return (
            <React.Fragment>
                {verticals}
                <VertAdder
                    key={adderID}
                    id={adderID}
                    onClick={(e) => this.addVerticalTo(e, that)}
                />
            </React.Fragment>
        )
    }

    render(){
        return(
            <div className='container'>
                <div className='controls row'>
                    {this.renderLoadFileButton()}
                    {this.renderOutputXMLButton()}
                </div>
                <div
                    className='sequential row'
                    id={this.state.sequence_id}
                    data-key={this.state.sequence_id}
                    >
                        {this.renderVerticals()}
                </div>
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

    // Give everything IDs.
    let stringWithIDs = giveEverythingIDs(xmlString)

    // Parse the XML and store the namespace
    let xdoc = xparse.parseFromString(stringWithIDs, 'application/xml');
    console.log('xdoc created');

    // Serialize it. Gonna need a prettifier eventually.
    let finalString = xser.serializeToString(xdoc.documentElement);

    return finalString;

}
