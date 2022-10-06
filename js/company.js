// import Chart from 'chart.js/auto';

const urlParams = new URLSearchParams(window.location.search)
console.log(window.location.search);

class Company {
    constructor(symbol) {
        this.symbol = symbol;

        this.#init();
    }

    async #init() {
        try {
            this.turnOnLoading();
            const profileEndpoint = `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/company/profile/${this.symbol}`;
            const profile = await this.getProfile(profileEndpoint);
            console.log('profile', profile);
            const stockHistoryEndpoint = 
                `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/historical-price-full/${this.symbol}?serietype=line`;
            const stockHistory = await this.getStockHistory(stockHistoryEndpoint);
            console.log('stockHistory', stockHistory);

            this.presenProfile(profile);

            this.presentHistoryChart(stockHistory);
        } catch(error) {
            console.log('error:', error);
            return;
        } finally {
            this.turnOffLoading();
        }

    }

    async getProfile(url) {
        try {
            const response = await fetch(url);
            const companyProfileData = await response.json();
            // console.log('companyProfileData: ', companyProfileData);
            return companyProfileData;
        } catch(error) {
            console.log('error:', error);
            return;
        } 
    }

    presenProfile(profile) {
        document.getElementById('name').innerHTML = profile.profile.companyName;
        document.getElementById('symbol').innerHTML = profile.symbol;
        document.getElementById('description').innerHTML = profile.profile.description;
        document.getElementById('image').src = profile.profile.image;
        document.getElementById('image').alt = profile.profile.companyName + " logo";
        document.getElementById('price').innerHTML = profile.profile.price;
        let changePercentage  = profile.profile.changes * 10000;
        changePercentage  = Math.round(changePercentage);
        changePercentage /= 100;
        document.getElementById('change').innerHTML = changePercentage + "%";
        if (changePercentage < 0) {
            document.getElementById('change').classList.add('text-danger');
        } else if (changePercentage > 0) {
            document.getElementById('change').classList.add('text-success');
        }
        

    }
    
    async getStockHistory(url) {
        try {
            // console.log('url:', url);
            const response = await fetch(url);
            const stockHistoryData = await response.json();
            // console.log('stockHistoryData: ', stockHistoryData);
            return stockHistoryData;
        } catch(error) {
            console.log('error:', error);
            return;
        } 
    }

    turnOnLoading() {
        document.getElementById('company-container').classList.add('d-none');
        document.getElementById('preloader').classList.remove('d-none');
    }
    turnOffLoading() {
        document.getElementById('company-container').classList.remove('d-none');
        document.getElementById('preloader').classList.add('d-none');
    }

    presentHistoryChart(history) {        
        // let dates = [];
        // let prices = [];
        // history.forEach((item) => {
        //     const {date} = item;
        //     dates.push(date);
        //     const {close} = item;
        //     prices.push(close);
        // });
        // console.log('dates', dates);
        // console.log('prices', prices);
        
        const chartContext = document.getElementById('myChart').getContext('2d');
        const chartConfig = {
            type: 'line',
            data: {
                datasets: [{
                    label: 'closing price',
                    data: history.historical,
                    fill: true,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    pointRadius: 0
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: `${history.symbol} Stock-price History`
                    }
                },
                parsing: {
                    xAxisKey: 'date',
                    yAxisKey: 'close'
                },
                scales: {
                    y: {
                        beginAtZero: true
                    },
                    x: {
                        reverse: true
                    }
                }
            }
        }

        const myChart = new Chart(chartContext, chartConfig);
    }
}




window.onload = () => {
    const company = new Company("AAON");
}