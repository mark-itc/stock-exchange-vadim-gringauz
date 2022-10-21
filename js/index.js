/* *********************************************
*         JS Project #2 - Stock Exchange       * 
*                  index.js:                   *
*          index.html onLoad script            *
* **********************************************/
import { Marquee } from "./marquee.js";
import { SearchResult } from "./searchResult.js";
import { SearchForm } from "./searchForm.js";
import { Darkmode } from "./darkmode.js";

window.onload = async() => { 
    const marqueeProperies = {
        container: document.getElementById('marquee'),
        containerA: document.getElementById('marquee-container-a'),
        containerB: document.getElementById('marquee-container-b'),
        limit: 100
    }
    let marquee = new Marquee(marqueeProperies);
    marquee.load(); 

    const results = new SearchResult(document.getElementById('search-results'));
    const form = new SearchForm(document.getElementById('form'));

    // 'searchedTerm' IS NEEDED FOR results.highLight METHOD
    form.onSearch((companies, searchedTerm) => {
        results.renderResults(companies, searchedTerm)
    });
    
    const darkmode = new Darkmode(document.getElementById('nav'));
}