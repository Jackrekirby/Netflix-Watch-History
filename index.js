class switchList {
    constructor(elementId, items) {
        this.element = document.getElementById(elementId);
        this.items = items;
        this.index = 0;
    }

    current() {
        return this.items[this.index];
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
        console.log(pageId);
        this.hide(this.currentPageId, true);
        this.hide(pageId, false);
        this.currentPageId = pageId;
    }

    hide(pageId, state) {
        let element = document.getElementById(pageId);
        state ? element.classList.add('hidden') : element.classList.remove('hidden');
    }
}

class TvShow {
    constructor(name, date) {
        this.name = name;
        this.seasons = new Set();
        this.numSeasons = 0;
        this.numEpisodes = 0;
        this.startDate = 0;
        this.lastWatched = date;
    }

    update(season, date) {
        this.seasons.add(season);
        this.numSeasons = this.seasons.size;
        this.numEpisodes++;
        this.startDate = date;
    }
}

class WatchHistory {
    constructor() {
        console.log(document.body);
        this.views = new switchList('view-state', ['TV Shows', 'Films']);
        this.sorts = new switchList('sort-state', ['Last Viewed', 'Date Started',
                                    'A-Z', '# Seasons', '# Episodes']);
        this.sortDirection = new switchList('sort-direction-state', ['▼', '▲']);
        this.shows = new Map();
    }

    switchOption(option) {
        switch(option) {
            case 'view':
                this.views.next();
                break;
            case 'sort by':
                this.sorts.next();
                break;
            case 'sort direction':
                this.sortDirection.next();
                break;
        }
        this.render();
    }


    render() {
        let list = document.getElementById('shows-list');

        while (list.firstChild) {
            list.removeChild(list.lastChild);
        }


        let shows = Array.from(this.shows.values());
        switch(this.sorts.current()) {
            case '# Seasons':
                shows.sort(function( a, b ) {
                    return Math.sign ( a.numSeasons - b.numSeasons );
                })
                break;
            case '# Episodes':
                shows.sort(function( a, b ) {
                    return Math.sign ( a.numEpisodes - b.numEpisodes );
                })
                break;
            case 'A-Z':
                shows.sort(function( a, b ) {
                    if(a.name.toLowerCase() < b.name.toLowerCase()) { return -1; }
                    if(a.name.toLowerCase() > b.name.toLowerCase()) { return 1; }
                    return 0;
                })
                break;
            case 'Date Started':
                shows.sort(function( a, b ) {
                    if(a.startDate < b.startDate) { return -1; }
                    if(a.startDate > b.startDate) { return 1; }
                    return 0;
                })
                break;
        }

        if(this.sortDirection.current()== '▲') {
            shows = shows.reverse();
        }


        for(let show of shows) {
            let item = document.createElement('div');
            item.classList.add('item');
            let itemName = document.createElement('div');
            itemName.classList.add('name');
            itemName.innerHTML = show.name;
            let itemValue = document.createElement('div');
            itemName.classList.add('value');
            
            switch(this.sorts.current()) {
                case '# Seasons':
                    itemValue.innerHTML = show.numSeasons;
                    break;
                case '# Episodes':
                    itemValue.innerHTML = show.numEpisodes;
                    break;
                case 'Date Started':
                    itemValue.innerHTML = show.startDate;
                    break;
                case 'Last Viewed':
                    itemValue.innerHTML = show.lastWatched;
                    break;
            }
            
            item.appendChild(itemName);
            item.appendChild(itemValue);
            list.appendChild(item);
        }   
    }
}

function upload() {
    const reader = new FileReader()
    reader.onload = function(e) {
        function isSeason(titleParts) {
            let i = 0;
            for(let part of titleParts) {
                if(part.startsWith('Season') ||
                part.startsWith('Vol.') ||
                part.startsWith('Part')){
                    return i;
                }
                i++;
            }
            return -1;
        }
    
        console.log('reading');
        let lines = this.result.split('\n');
        for(let line of lines) {
            if(line == '' || line.startsWith('Title')) {continue;}
            let lineParts = line.split(',');
            let title = lineParts.slice(0, lineParts.length - 1).join(',');
            let date = lineParts[lineParts.length - 1];
            console.log(date);
            date = date.substring(1, date.length - 1);
            date = date.substring(0, 6) + date.substring(8, 10);
            console.log(date);
            
            // date = date.split('/');
            // [date[0], date[1]] = [date[1], date[0]];
            // date = new Date(date.join('/'));
            
            let titleParts = title.split(': ');
            for(let i in titleParts) {
                titleParts[i] = titleParts[i].replace('"', '');
            }
            
            let seasonIndex = isSeason(titleParts);
            if(seasonIndex >= 0) {
                let showName = titleParts.slice(0, seasonIndex).join(': ');
                let show = new TvShow(showName, date);
                if(!watchHistory.shows.has(showName)) {
                    watchHistory.shows.set(showName, show);
                }
                watchHistory.shows.get(showName).update(titleParts[seasonIndex], date);
            }   
        }
        watchHistory.render(); 
    };

    reader.readAsText(this.files[0]);
    this.value = null;
    pages.goto('data');
}

document.getElementById("file-upload").addEventListener('change', upload, false);
let pages = new Pages(['home', 'help', 'data']);
let watchHistory = new WatchHistory();;


