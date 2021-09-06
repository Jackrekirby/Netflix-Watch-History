class switchList {
    constructor(elementId, items) {
        this.element = document.getElementById(elementId);
        this.items = items;
        this.index = 0;
    }

    current() {
        return this.items[this.index];
    }

    set(state) {
        this.index = this.items.indexOf(state);
        this.element.innerHTML = state;
    }

    next() {
        this.index++;
        this.index %= this.items.length;
        let state = this.items[this.index];
        this.element.innerHTML = state;
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

class TvShow {
    constructor(name, date, index) {
        this.name = name;
        this.seasons = new Set();
        this.numSeasons = 0;
        this.numEpisodes = 0;
        this.startDate = '';
        this.lastWatched = date;
        this.lastIndex = index;
    }

    update(season, date, index) {
        this.seasons.add(season);
        this.numSeasons = this.seasons.size;
        this.numEpisodes++;
        this.startDate = date;
        this.startIndex = index;
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
        this.films = new Map();

        this.saveStates = {
            'last-watched': true, 'date-started': true,
            'seasons': true, 'episodes': true, 'stats': true,
        };

        this.showStates = {
            'Last Viewed': true, 'Date Started': true,
            '# Seasons': true, '# Episodes': true
        };

        this.since = 0;
        this.lastSeen = 0;
        this.numFilms = 0;
        this.numTvShows = 0;
        this.numSeasons = 0;
        this.numEpisodes = 0;
    }

    toggleSaveState(option) {
        let element = document.getElementById('save-' + option);
        if (this.saveStates[option]) {
            this.saveStates[option] = false;
            element.classList.add('off');
        } else {
            this.saveStates[option] = true;
            element.classList.remove('off');
        }
    }

    switchOption(option) {
        switch (option) {
            case 'view':
                this.views.next();
                break;
            case 'sort by':
                this.sorts.next();
                switch (this.sorts.current()) {
                    case '# Seasons':
                        this.sortDirection.set('▲');
                        break;
                    case '# Episodes':
                        this.sortDirection.set('▲');
                        break;
                    case 'A-Z':
                        this.sortDirection.set('▼');
                        break;
                    case 'Date Started':
                        this.sortDirection.set('▼');
                        break;
                    case 'Last Viewed':
                        this.sortDirection.set('▼');
                        break;
                }
                break;
            case 'sort direction':
                this.sortDirection.next();
                break;
        }
        this.render();
    }

    sortShowsBy(option, shows) {
        function sortAZ(a, b) {
            if (a.name.toLowerCase() < b.name.toLowerCase()) { return -1; }
            if (a.name.toLowerCase() > b.name.toLowerCase()) { return 1; }
            return 0;
        }

        function sortLastViewed(a, b) {
            if (a.lastIndex < b.lastIndex) { return -1; }
            if (a.lastIndex > b.lastIndex) { return 1; }
            return 0;
        }
        switch (option) {
            case '# Seasons':
                shows.sort(function (a, b) {
                    if (a.numSeasons < b.numSeasons) { return -1; }
                    if (a.numSeasons > b.numSeasons) { return 1; }
                    return 0; //sortLastViewed(a, b);;
                })
                break;
            case '# Episodes':
                shows.sort(function (a, b) {
                    return Math.sign(a.numEpisodes - b.numEpisodes);
                })
                break;
            case 'A-Z':
                shows.sort(function (a, b) {
                    sortAZ(a, b);
                })
                break;
            case 'Date Started':
                shows.sort(function (a, b) {
                    if (a.startIndex < b.startIndex) { return -1; }
                    if (a.startIndex > b.startIndex) { return 1; }
                    return 0;
                })
                break;
            case 'Last Viewed':
                shows.sort(function (a, b) {
                    sortLastViewed(a, b);
                })
                break;
        }
        return shows;
    }

    render() {
        let list = document.getElementById('shows-list');

        while (list.firstChild) {
            list.removeChild(list.lastChild);
        }


        let shows = Array.from(this.shows.values());
        this.sortShowsBy(this.sorts.current(), shows);

        if (this.sortDirection.current() == '▲') {
            shows = shows.reverse();
        }


        for (let show of shows) {
            let item = document.createElement('div');
            item.classList.add('item');
            let itemName = document.createElement('div');
            itemName.classList.add('name');

            itemName.innerHTML = show.name;
            itemName.addEventListener("click", () => { this.loadShow(show) });
            let itemValue = document.createElement('div');

            itemValue.classList.add('value');

            if (this.showStates[this.sorts.current()]) {
                switch (this.sorts.current()) {
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
            }


            item.appendChild(itemName);
            item.appendChild(itemValue);
            list.appendChild(item);
        }

        // render stats

        document.getElementById('stats-since').innerHTML = this.since;
        document.getElementById('stats-last-seen').innerHTML = this.lastSeen;
        document.getElementById('stats-films').innerHTML = this.numFilms;
        document.getElementById('stats-tv-shows').innerHTML = this.numTvShows;
        document.getElementById('stats-seasons').innerHTML = this.numSeasons;
        document.getElementById('stats-episodes').innerHTML = this.numEpisodes;
    }

    save() {
        function includeMark(state) {
            return state ? '' : '*';
        }

        let csv = ['Show',
            'Last Watched' + includeMark(this.saveStates['last-watched']),
            'Date Started' + includeMark(this.saveStates['date-started']), 'Start Index',
            '# Seasons' + includeMark(this.saveStates['seasons']),
            '# Episodes' + includeMark(this.saveStates['episodes'])
        ].join(',') + '\n';

        "Show, Last Watched, Date Started, Start Index, # Seasons, # Episodes \n";
        let shows = Array.from(this.shows.values());
        console.log(this);

        let showsSeasons = this.sortShowsBy('# Seasons', [...shows]);
        let showsEpisodes = this.sortShowsBy('# Episodes', [...shows]);
        let showsStarted = this.sortShowsBy('Date Started', [...shows]);

        let lastIndex = 0;
        for (let show of shows) {
            let lastWatched = this.saveStates['last-watched'] ? show.lastWatched : lastIndex;
            let dateStarted = this.saveStates['date-started'] ? show.startDate : '';
            let startIndex = showsStarted.indexOf(show);
            let numSeasons = this.saveStates['seasons'] ? show.numSeasons : showsSeasons.indexOf(show);
            let numEpisodes = this.saveStates['episodes'] ? show.numEpisodes : showsEpisodes.indexOf(show);

            csv += [show.name, lastWatched, dateStarted, startIndex, numSeasons, numEpisodes].join(', ') + '\n';
            lastIndex++;
        }

        if (this.saveStates['stats']) {
            csv += '\n' + [this.since, this.lastSeen, this.numFilms, this.numTvShows,
            this.numSeasons, this.numEpisodes];
        }

        let myFile = new File([csv], "NetflixWatchHistory.csv", { type: "text/plain;charset=utf-8" });
        let download = document.createElement('a');
        download.download = 'NetflixWatchHistory.csv';
        download.href = window.URL.createObjectURL(myFile);
        download.click();
    }

    loadShow(show) {
        document.getElementById('show-name').innerHTML = show.name;
        document.getElementById('show-date-started').innerHTML = show.startDate;
        document.getElementById('show-last-watched').innerHTML = show.lastWatched;
        document.getElementById('show-no-seasons').innerHTML = show.numSeasons;
        document.getElementById('show-no-episodes').innerHTML = show.numEpisodes;

        let showLowCase = show.name.toLowerCase();
        let q20 = showLowCase.replace(' ', '%20');
        let qplus = showLowCase.replace(' ', '+');

        document.getElementById('show-netflix-link').href =
            "https://www.netflix.com/search?q=" + q20;
        document.getElementById('show-google-link').href =
            "https://www.google.com/search?q=" + qplus + '+tv+series';
        document.getElementById('show-rotten-tomatoes-link').href =
            "https://www.rottentomatoes.com/search?search=" + q20;
        document.getElementById('show-imdb-link').href =
            "https://www.imdb.com/find?&q=" + qplus +
            "&s=tt&ttype=tv&ref_=fn_tv";

        //https://www.imdb.com/find?s=tt&q=sweet+tooth&s=tt&ttype=tv&exact=true&ref_=fn_tt_ex
        //https://www.imdb.com/find?q=sweet%20tooth&s=tt&ttype=tv&exact=true&ref_=fn_tt_ex

        pages.goto('show');
    }
}

function upload() {
    watchHistory = new WatchHistory();
    const reader = new FileReader()
    reader.onload = function (e) {
        function isSeason(titleParts) {
            let i = 0;
            for (let part of titleParts) {
                if (part.startsWith('Season') ||
                    part.startsWith('Vol.') ||
                    part.startsWith('Series') ||
                    part.startsWith('Limited Series') ||
                    part.startsWith('Part')) {
                    return i;
                }
                i++;
            }
            return -1;
        }

        let lines = this.result.split('\n');
        if (lines[0].startsWith('Title')) {
            let index = 0;
            for (let line of lines) {
                if (index == 0 || line == '') { index++; continue; }
                let lineParts = line.split(',');
                let title = lineParts.slice(0, lineParts.length - 1).join(',');
                let date = lineParts[lineParts.length - 1];
                // console.log(date);
                date = date.substring(1, date.length - 1);
                date = date.substring(0, 6) + date.substring(8, 10);
                // console.log(date);

                // date = date.split('/');
                // [date[0], date[1]] = [date[1], date[0]];
                // date = new Date(date.join('/'));

                let titleParts = title.split(': ');
                for (let i in titleParts) {
                    titleParts[i] = titleParts[i].replace('"', '');
                }

                let seasonIndex = isSeason(titleParts);
                if (seasonIndex >= 0) {
                    let showName = titleParts.slice(0, seasonIndex).join(': ');
                    let show = new TvShow(showName, date, index);
                    if (!watchHistory.shows.has(showName)) {
                        watchHistory.shows.set(showName, show);
                    }
                    watchHistory.shows.get(showName).update(titleParts[seasonIndex], date, index);
                    if (index == 1) {
                        watchHistory.lastSeen = date;
                    }
                    if (index == lines.length - 2) {
                        watchHistory.since = date;
                    }
                } else {
                    watchHistory.films.set(title.substring(1, title.length - 1), date);
                }

                index++;
            }

            let shows = Array.from(watchHistory.shows.values());
            for (show of shows) {
                watchHistory.numEpisodes += show.numEpisodes;
                watchHistory.numSeasons += show.numSeasons;
            }
            watchHistory.numTvShows = shows.length;
            watchHistory.numFilms = 0;
        } else if (lines[0].startsWith('Show')) {
            let lastIndex = 0;

            let [title, lastWatched, dateStarted, startIndex, numSeasons,
                numEpisodes] = lines[0].split(',');

            watchHistory.showStates = {
                'Last Viewed': !lastWatched.endsWith('*'),
                'Date Started': !dateStarted.endsWith('*'),
                '# Seasons': !numSeasons.endsWith('*'),
                '# Episodes': !numEpisodes.endsWith('*')
            };

            for (let line of lines) {
                if (lastIndex == 0) { lastIndex++; continue; }
                if (line == '') { break; }
                let [title, lastWatched, dateStarted, startIndex, numSeasons,
                    numEpisodes] = line.split(',');

                let show = new TvShow(title, lastWatched, lastIndex);
                show.numSeasons = parseInt(numSeasons);
                show.numEpisodes = parseInt(numEpisodes);
                show.startDate = dateStarted;
                show.startIndex = startIndex;
                show.lastIndex = lastIndex;

                watchHistory.shows.set(title, show);

                lastIndex++;
            }
            if (lines[lines.length - 1] != '') {
                [watchHistory.since, watchHistory.lastSeen, watchHistory.numFilms, watchHistory.numTvShows, watchHistory.numSeasons,
                watchHistory.numEpisodes] = lines[lines.length - 1].split(',');
            } else {
                document.getElementById('data-stats').classList.add('hidden');
            }
            document.getElementById('data-save').classList.add('hidden');

        } else {

        }

        console.log(watchHistory.films);
        watchHistory.render();
    };

    reader.readAsText(this.files[0]);
    this.value = null;
    pages.goto('data');
}

document.getElementById("file-upload").addEventListener('change', upload, false);
let pages = new Pages(['home', 'help', 'data', 'show', 'stats']);
let watchHistory = new WatchHistory();


