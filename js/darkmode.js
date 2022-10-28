/* *********************************************
*         JS Project #2 - Stock Exchange       * 
*                  darkmode.js:                *
*      EXTRA - Darkmode functionality          *
* **********************************************/

export class Darkmode {
    constructor(container) {
        this.container = container;
        this.isDarkmode = localStorage.getItem('isDarkmode') === 'true';
        this.init();
    }
    init() {
        this.renderButton();

        if (this.isDarkmode) {
            this.toggle();
            localStorage.setItem('isDarkmode', true);
            this.isDarkmode = true;
        }

        document.getElementById('toggle-darkmode').addEventListener('click', (event) => {
            this.toggle();
            this.isDarkmode = !this.isDarkmode;
            localStorage.setItem('isDarkmode', this.isDarkmode);
        });
    }

    toggle() {
        document.querySelector('body').classList.toggle('darkmode');
        document.querySelector('nav').classList.toggle('bg-danger');
        document.querySelector('nav').classList.toggle('bg-primary');
    }

    renderButton() {
        const toggleButon = document.createElement('button');
        toggleButon.id = "toggle-darkmode";
        toggleButon.type = "button";
        toggleButon.className = "btn btn-dark darkmode-btn";
        toggleButon.innerHTML = "Dark-mode";
        this.container.appendChild(toggleButon);
    }
} 
