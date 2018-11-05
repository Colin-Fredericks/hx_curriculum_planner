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

// Prepping for using my own colors at some point.
// const typeClassLookup = {
//     'video': 'video-component',
//     'html': 'html-component',
//     'problem': 'problem-component',
//     'discussion': 'discussion-component',
//     'other': 'other-component'
// };

const typeIconLookup = {
    'video': 'fa fa-video',
    'html': 'fa fa-file-alt',
    'problem': 'fa fa-question-circle',
    'discussion': 'fa fa-comments',
    'other': 'fa fa-file'
}

const skip_tags = [ 'wiki' ];

const leaf_tags = [
    'annotatable', // This is the older, deprecated annotation component.
    'discussion',
    'done',
    'drag-and-drop-v2',
    'html',
    'imageannotation',
    'library_content',
    'lti',  // This is the older, deprecated LTI component.
    'lti_consumer',
    'openassessment',
    'oppia',
    'poll',
    'poll_question', // This is the older, deprecated poll component.
    'problem',
    'problem-builder',
    'recommender',
    'step-builder',
    'survey',
    'textannotation',
    'ubcpi',
    'video',
    'videoannotation',
    'word_cloud'
];

const branch_tags = [
    'course',
    'chapter',
    'sequential',
    'vertical',
    'split_test',
    'conditional'
];


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
            sequence_id: 'deadbeef',
            xml: '<sequential data-key="deadbeef" />'
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
        const filename = 'test_course.xml';
        // console.log('that');
        // console.log(that);

        const isLoaded = new Promise(function(resolve, reject){
            // return loadFromFile(filename, resolve, reject);
            return loadEntireCourse('hx_boilerplate_course');
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


function loadEntireCourse(folder){
    let OuterXML = '';

    // Open the course XML file
    const isLoaded = new Promise(function(resolve, reject){
        return loadFromFile(folder + '/course.xml', resolve, reject);
    });

    isLoaded.then(function(loadedXML){
        console.log('Loading resolved');
        OuterXML = drillDown(loadedXML, folder);
        console.log('Course XML:')
        console.log(OuterXML);
    });

}

// Recursion function for repacking course XML
// (still working on this section, pseudocode is wrong.)

function drillDown(innerXML, folder){

    console.log('drillDown');
    console.log(innerXML);

    // Parse the XML with jQuery
    let xdoc = $.parseXML(innerXML);
    // console.log(xdoc);
    let tag = xdoc.documentElement.tagName;
    console.log('tag: ' + tag);
    let url_name = ''
    try{
        url_name = xdoc.documentElement.attributes['url_name'].value;
        // console.log('url_name: ' + url_name);
    }
    catch(err){
        console.log('No URL name, probably.');
        // console.log(err);
    }


    // If this is a branch tag, drill down to the contents, whether file or inline XML.
    if(branch_tags.indexOf(tag) > -1){
        console.log(tag + ' is a branch tag.');
        // console.log('child nodes: ');
        // console.log(xdoc.childNodes);
        // console.log('url_name: ' + url_name);
        // If it's an empty tag with a URL name, try to open the file.
        if( (xdoc.childNodes.length === 1) && url_name ){
            const filename = folder + '/' + tag + '/' + url_name + '.xml'
            console.log('opening file ' + filename);
            const isLoaded = new Promise(function(resolve, reject){
                // Open the course XML file
                const isLoaded = new Promise(function(resolve, reject){
                    return loadFromFile(filename, resolve, reject);
                });
                // But, y'know, wait for it.
                isLoaded.then(function(newXML){
                    console.log('Loading ' + filename + ' resolved');
                    console.log('new XML:');
                    console.log(newXML);
                    if(newXML){
                        innerXML += drillDown(newXML, folder);
                    }else{
                        // File missing or other issue.
                        console.log('Blank XML, returning.')
                        innerXML += '';
                    }
                });

            });
        }
        // If not, more structure is probably declared inline here.
        // Drill down on direct children.
        else{
            console.log('structure declared inline');
            console.log($(innerXML)[0]);
            Array.from($(innerXML)[0].children).forEach(function(child){
                console.log(child);
                innerXML += drillDown(child.outerHTML, folder);
            });
        }

    }
    // If this is a leaf tag, get the XML and add it to the larger file.
    else if(leaf_tags.indexOf(tag) > -1){
        console.log(tag + ' is a leaf tag.');
        console.log('Leaf XML:');
        console.log(innerXML);
        return innerXML;
    }else{
        console.log('What the hell tag is ' + tag + '?');
        // Unknown or unwanted tag. Skip it.
        return '';
    }

    return innerXML;

}


// Gets the XML from a particular file as a string.
function loadFromFile(filename, resolve, reject){
    console.log('loadFromFile');

    // Create XML parser and serializer
    const xparse = new DOMParser;
    const xser = new XMLSerializer();

    // Create or get an XML string
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        // console.log(this.readyState);
        // console.log(this.status);
        if (this.readyState == 4 && this.status == 200) {
            console.log('XML obtained');
            // console.log(this.responseText);
            resolve(this.responseText);
        }else if (this.readyState == 4 && this.status != 200){
            console.log('HTTP request failed with status ' + this.status);
            resolve(false);
        }
    };
    xmlhttp.open("GET", filename, true);
    xmlhttp.send();

}

function parseAndProcess(xmlString){
    console.log('parseAndProcess');
    console.log(xmlString);
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
