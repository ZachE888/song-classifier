import Classifier from '../src/lib/classifier';
import Spotify from '../src/lib/spotify'

const fs = require('fs');
const spotify = new Spotify();
const classifier = new Classifier();

const sleep = (delay) => new Promise( resolve => setTimeout(resolve(), delay) );

describe('song-classifier', function() {
    this.timeout(600000);

    before( done => {
        spotify.authorize('f7cbeaaf92314828ac13affb1ddcd928', 'c77be55828cc401e89645a659d8141ca').then( () => {
            console.log("Spotify API Token:", spotify.accessToken);
            done();
        }).catch( err => {
            done(err);
        });
    });

    // Do this in before() to initialize spotify instance for rest of tests.
    // it('authorize_spotify', (done) => {
    //     const spotify = new Spotify();
    //     spotify.authorize('f7cbeaaf92314828ac13affb1ddcd928', 'c77be55828cc401e89645a659d8141ca').then( () => {
    //         done();
    //     }).catch( err => {
    //         done(err);
    //     });
    // });
    
    it('get_top_100_spotify', done => {
        const genre = 'caribbean';
        spotify.getTop100AudioData(genre).then( data => {
            if (!fs.existsSync('./data/')){
                fs.mkdirSync('./data/');
            }
            fs.writeFileSync(`./data/${genre}.json`, JSON.stringify(data, null, 4));
            done();
        }).catch( err => {
            done(err);
        });
    });

    // Disabled optional test to collect a series of genres in one go
    // NOTE-> Long execution time. (30 second sleep() per genre)
    // NOTE-> DO NOT USE. Fails to retrieve half the data
    xit('get_top_100_spotify_batch', done => {
        const genres = ['country', 'edm_dance', 'hiphop', 'holidays', 'jazz', 'metal',
                        'pop', 'rnb', 'rock'];
        let promises = [];

        let delay = 1;
        genres.forEach( genre => {
            promises.push( sleep(delay * 1000).then( () => {
                return spotify.getTop100AudioData(genre).catch( err => {
                    console.error(`Error collecting ${genre}:`, err);
                    return {};
                });
            }) );
            delay += 30;
        });

        Promise.all(promises).then( results => {
            let i = 0;
            results.forEach( result => {
                if(Object.keys(result).length >= 0 && result.constructor === Object)
                    fs.writeFileSync(`./data/${genres[i]}.json`, JSON.stringify(result, null, 4));
                i++;
            });
            done()
        }).catch( err => {
            done(err);
        });
    });
});