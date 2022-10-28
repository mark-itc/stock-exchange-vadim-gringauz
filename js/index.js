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
    const marquee = new Marquee(marqueeProperies);
    marquee.load(); 
    const form = new SearchForm(document.getElementById('form'));
    const results = new SearchResult(document.getElementById('search-results'));

    /* 'searchedTerm' WAS ADDED FOR SearchResult.highLight METHOD 
     *  I THOUGHT IT'S BETTER THAN MAKE SearchResult GET IT FROM 
     *  FORM'S inputbox.value                                     */ 
    form.onSearch((companies, searchedTerm) => {
        results.renderResults(companies, searchedTerm)
    });
    
    /* EXTRA FEATURE - JUST FOR MY OWN PRACTICE */
    const darkmode = new Darkmode(document.getElementById('nav'));
}

