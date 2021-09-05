class switchList {
    constructor(elementId, items) {
        this.element = document.getElementById(elementId);
        this.items = items;
        this.index = 0;
    }

    next() {
        this.index++;
        this.index %= this.items.length;
        let state = this.items[this.index];
        this.element.innerHTML = state;
        console.log(state);
    }
}

class Pages {
    constructor(pageIds) {
        this.pageIds = pageIds;
        this.currentPageId = pageIds[0];
    }

    goto(pageId) {
        this.hide(this.currentPageId, true);
        this.hide(pageId, false);
        this.currentPageId = pageId;
    }

    hide(pageId, state) {
        let element = document.getElementById(pageId);
        state ? element.classList.add('hidden') : element.classList.remove('hidden');
    }
}

class WatchHistory {

    constructor() {
        console.log(document.body);
        this.views = new switchList('view-state', ['TV Shows', 'Films']);
        this.sorts = new switchList('sort-state', ['A-Z', 'Date Started', 
                    'Date Finished', '# Seasons', '# Episodes']);
        this.sortDirection = new switchList('sort-direction-state', ['▲', '▼']);
    }
}

function upload() {
    console.log('Uploading');
    console.log(this.files);
    window.location.replace('shows.html');
}

let path = window.location.pathname;
path = path.substring(1, path.length - 5).split('/')[1];
console.log(path);
let watchHistory = undefined;
switch(path)  {
    case 'shows':
        console.log('Shows Page');
        watchHistory = new WatchHistory();
        break;
    default:
        console.log('Home Page');
        document.getElementById("file-upload").addEventListener('change', upload, false);
        break;
}  

console.log(watchHistory)

let pages = new Pages(['home', 'help', 'data']);


