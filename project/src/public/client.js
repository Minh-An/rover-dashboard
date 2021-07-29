let store = {
    user: { name: "Student" },
    currentRoverData: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    fetchPhotos(store.currentRoverData.name, store.currentRoverData.max_date);
}

const render = async (root, state) => {
    root.innerHTML = App(state)
    document.getElementsByTagName('nav')[0].append(...renderButtons(state.rovers));
    addRoverListeners();
}

// add button listeners to the rovers 
const addRoverListeners = () => {
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function () {
            document.querySelector('.selected').classList.remove('selected');
            button.classList.add('selected');
            fetchManifest(button.innerText, store);
        });
    });
}

const renderPhotos = (photos) => {
    const htmlPhotos = photos.map((photo, idx) => {
        const htmlPhoto = document.createElement('img');
        htmlPhoto.src = photo.img_src;
        return htmlPhoto;
    });
    return htmlPhotos;
}

const renderStats = (rover) => {
    document.getElementById('stats').innerHTML = `
        <div><span class="key">Status: </span><span class="val">${rover.get('status')}</span></div>
        <div><span class="key">Launch Date: </span><span class="val">${new Date(rover.get('launch_date')).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}</span></div>
        <div><span class="key">Landing Date: </span><span class="val">${new Date(rover.get('landing_date')).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}</span></div>
        `;
}

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
}


// create content
const App = (state) => {
    let { rovers, apod } = state

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
            <footer>Rover Information Taken From <a href="https://www.nasa.gov">NASA</a></footer>`
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// ------------------------------------------------------  API CALLS

const fetchManifest= (name, store) => {
    fetch(`/rover/${name}`)
        .then(res => res.json())
        .then(rover => {       
            renderStats(Immutable.Map(rover));
            updateStore(store, {currentRoverData: rover});
        });
}

const fetchPhotos = (name, date, store) => {
    console.log(name);
    console.log(date);
    fetch(`/rover/${name}/${date}`)
        .then(res => res.json())
        .then(photos => {   
            document.getElementById('photos').append(...renderPhotos(photos));
        });
}