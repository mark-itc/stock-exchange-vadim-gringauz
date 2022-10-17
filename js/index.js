/* *********************************************
*         JS Project #2 - Stock Exchange       * 
*                  index.js:                   *
*          index.html onLoad script            *
* **********************************************/
import {Marquee} from "./marquee.js";
import {SearchResult} from "./searchResult.js";
import {SearchForm} from "./searchForm.js";


let form = {};
let results = {};


window.onload = async() => { 
    const marqueeProperies = {
        container: document.getElementById('marquee'),
        containerA: document.getElementById('marquee-container-a'),
        containerB: document.getElementById('marquee-container-b'),
        limit: 100
    }
    
    let marquee = new Marquee(marqueeProperies);
    marquee.load();
    window.addEventListener('resize', (event) => {
        marquee = new Marquee(marqueeProperies);
        marquee.load();
    });
    
    results = new SearchResult(document.getElementById('search-results'));
    form = new SearchForm(document.getElementById('form'));
}