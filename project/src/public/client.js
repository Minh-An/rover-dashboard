const store = Immutable.Map({
    user: { name: "Student" },
    currentRoverData: "",
    rovers: ['Curiosity', 'Opportunity', 'Spirit']
});

// ------------------------------------------------------  COMPONENTS

// add our markup to the page
const root = document.getElementById('root');

const updateStore = (store, rover) => {
    store = store.set('currentRoverData', Immutable.fromJS(rover));
    // whenever store has new rover, update photos
    fetchPhotos(store.get('currentRoverData').get('name'), store.get('currentRoverData').get('max_date'));
};

// HIGHER ORDER FUNCTION 1
// render HTML elements (rendered from an array) onto a parent HTML element
const renderElement = (element, renderFunc, arr) => {
    element.innerHTML = '';
    element.append(...renderFunc(arr));
};

const render = async (root, state) => {
    root.innerHTML = App();
    renderElement(document.getElementsByTagName('nav')[0], renderButtons, state.get('rovers'));
    addRoverListeners((button) => {
        document.querySelector('.selected').classList.remove('selected');
        button.classList.add('selected');
        fetchManifest(button.innerText, store);
    });
};

// add button listeners to the rovers 
// HIGHER ORDER FUNCTION 2
const addRoverListeners = (clickEventHandler) => {
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function () {
            clickEventHandler(button);
        });
    });
};

const renderPhotos = (photos) => {
    const photoGroups = photos.map((photo, idx) => {
        const photoGroup = document.createElement('div');
        photoGroup.classList.add('photo-group')
        const htmlPhoto = document.createElement('img');
        htmlPhoto.src = photo.img_src;
        photoGroup.appendChild(htmlPhoto);
        const photoDate = document.createElement('p');
        const date = new Date(photo.earth_date);
        photoDate.innerText = `Date Taken: ${date.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}`
        photoGroup.appendChild(photoDate);
        return photoGroup;
    });
    return photoGroups;
};

const renderStats = (rover) => {
    document.getElementById('stats').innerHTML = `
        <div><span class="key">Status: </span><span class="val">${rover.get('status')}</span></div>
        <div><span class="key">Launch Date: </span><span class="val">${new Date(rover.get('launch_date')).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}</span></div>
        <div><span class="key">Landing Date: </span><span class="val">${new Date(rover.get('landing_date')).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}</span></div>
        `;
};

const renderButtons = (buttonNames) => {
    buttons = buttonNames.map((name, idx) => {
        const button = document.createElement('button');
        if (idx === 2) {
            button.classList.add('selected');
            fetchManifest(name, store);
        }
        button.innerText = name;
        return button;
    });
    return buttons;
};

// create content
const App = () => {
    return `<header>
                <h1>Mars Rover Dashboard</h1>
                <p>Click on a Mars Rover name to view its information and photos.</p>
            </header>
            <nav>
            </nav>
            <div id="stats">
            </div>
            <div id="photos">
            </div>
            <footer>Rover Information Taken From <a href="https://www.nasa.gov">NASA</a></footer>`;
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store);
});

// ------------------------------------------------------  API CALLS

const fetchManifest= (name, store) => {
    fetch(`/rover/${name}`)
        .then(res => res.json())
        .then(rover => {       
            renderStats(Immutable.Map(rover));
            updateStore(store, rover);
        });
};

const fetchPhotos = (name, date) => {
    fetch(`/rover/${name}/${date}`)
        .then(res => res.json())
        .then(photos => {
            renderElement(document.getElementById('photos'), renderPhotos, photos);
        });
}