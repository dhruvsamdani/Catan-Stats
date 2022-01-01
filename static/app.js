
// Getting items from html

const numberButtons = document.getElementsByClassName('button');
const counterButton = document.getElementById('counter');
const statsButton = document.getElementById('stats');
const buttonTab = document.querySelector('.tab-content');
const chart = document.getElementById('chart');
const numberRoles = document.getElementById('rolls');
const lastRoled = document.getElementById('last-clicked');
const newGame = document.getElementById('new-game-button');
const reset = document.getElementById('reset-button');
const popUpContainer = document.getElementById('popup-container');
const overlay = document.getElementById('overlay');
const winner = document.getElementById('winner-select');
const url = 'URL.com/catan'
// Retrieving data from local storage

let counter = sessionStorage.getItem("data") == null ? new Array(11).fill(0) : JSON.parse(sessionStorage.getItem("data"));
let roles = sessionStorage.getItem("roles") == null ? 0 : parseInt(sessionStorage.getItem("roles"));
let stack = sessionStorage.getItem("stack") == null ? [] : JSON.parse(sessionStorage.getItem("stack"));

// Setting up page

chart.style.display = 'none'
newGame.style.display = 'none'
reset.style.display = 'none'
numberRoles.innerText = 'Number of Roles: ' + roles; 
lastRoled.innerText = 'Last Roled: ' + (stack[stack.length - 1] + 2); 

// Setting up chart info

const data = {
    labels: [2,3,4,5,6,7,8,9,10,11,12],
    datasets: [{
        label: 'Dice roles',
        barThickness: 9, 
        barPercentage: 1.0,
        backgroundColor: '#4b87ff',
        borderColor: '#4b87ff',
        data: counter 
    }]
};

const options = {
    responive: true,
    plugins: {
        legend: {
            labels: {
                font: {
                    family: 'Lato',
                    weight: '300',
                }
            }
        }
    },
    layout: {
        padding: 20
    },
    scales: {
        y: {
           grid: {
               color: '#c0cfed10',
               display: true,
               drawBorder: false
           },
           ticks: {
               beginAtZero: true,
               callback: (value) => {
                    if (value % 1 ==0){
                        return value;
                    }
               },
               color: 'white'
           }    
        },
        x: {
           grid: {
               display: false,
               drawBorder: false
           },
           ticks: {
               color: 'white'
           }   
        }
    }
};

const myChart = new Chart(chart , {
    type: 'bar',
    label: 'Dice Roll',
    data,
    options: options 
});

// Creating event listener for buttons

Array.from(numberButtons).forEach(element => {
    element.addEventListener('click', appendToCounter)
});

// Launching start page from storage

if (sessionStorage.getItem("buttonPage") == "opened"){
    changePage('button-page');
} else {
    changePage('stats-page');
}

// Function to append to counter array 

function appendToCounter(event) {
    let value = event.target.value;
    counter[value-2] += 1
    stack.push(value-2);
    roles += 1;
    storeData("data", JSON.stringify(counter));
    storeData("roles", roles);
    storeData("stack", JSON.stringify(stack));
    numberRoles.innerText = 'Number of Roles: ' + roles; 
    lastRoled.innerText = 'Last Roled: ' + value; 

}

// Function to change page

function changePage(page) {
    if (page == 'button-page') {
        changeButtonColor(counterButton,statsButton);
        chart.style.display='none';
        newGame.style.display = 'none';
        reset.style.display = 'none';
        buttonTab.style.display = 'flex';
        storeData("buttonPage", "opened")
    }
    if (page == 'stats-page') {
        changeButtonColor(statsButton,counterButton);
        buttonTab.style.display='none';
        chart.style.display = 'flex';
        newGame.style.display = 'flex';
        reset.style.display = 'flex';
        updateData(counter);
        storeData("buttonPage", "closed")
    }
}

// Function for tab button

function changeButtonColor(primaryButton, secondaryButton){
    primaryButton.style.borderBottom = '3px solid #4b87ff';
    primaryButton.style.color = '#4b87ff';
    primaryButton.style.background='rgba(256,256,256,0.2)'
    secondaryButton.style.color = 'white';
    secondaryButton.style.background='none'
    secondaryButton.style.borderBottom = 'none';
}

// Function to update chart

function updateData(data){
    myChart.data.datasets.pop();
    myChart.data.datasets.push({
        label: 'Dice Roles',
        backgroundColor: '#4b87ff',
        barThickness: 'flex', 
        borderWidth: 1,
        borderColor: '#4379e6',
        categoryPercentage: 1,
        barPercentage: 1.0,
        data: data,
    });
    myChart.update();
}

// Function to store data on website 

function storeData(value, item){
    sessionStorage.setItem(value, item);
}

// Function to send to data to REST API for storage on
// Postgresql database

function postData(link, winnerOfGame, player_count){


    let dataToSend = {
        "roles" : counter,
        "winner" : winnerOfGame,
        'player_count': player_count
    }

    fetch(
        link,
        {
            headers : {'Content-type': 'application/json'},
            body : JSON.stringify(dataToSend),
            method: 'POST'
        }

    );
}

// Function to restart game

function restartGame(){
    popUpContainer.classList.add('winner-popup-active');
    overlay.classList.add('overlayActive')
    
}

// Function that clears game data

function forceReset(){
    sessionStorage.removeItem("data");
    sessionStorage.removeItem("roles");
    sessionStorage.removeItem("stack");
    roles = 0;
    numberRoles.innerText = 'Number of Roles: ' + roles; 
    lastRoled.innerText = 'Last Roled: None'; 
    counter.fill(0);
    updateData(null);

}

// UI function

function exitOverlay(){
    popUpContainer.classList.remove('winner-popup-active');
    overlay.classList.remove('overlayActive')
}

// Function that undos the last move

function undo(){
    if (roles > 0){
        counter[stack.pop()] -= 1;
        roles -= 1;
        numberRoles.innerText = 'Number of Roles: ' + roles; 
        if (stack.length != 0){
            lastRoled.innerText = 'Last Roled: ' + (stack[stack.length - 1] + 2); 
        } else {
            lastRoled.innerText = 'Last Roled: None';  
        }
        storeData("stack", JSON.stringify(stack));
        storeData("data", JSON.stringify(counter));
        storeData("roles", roles);
    }

}

// Function that sends the data and restarts the game

function updatePlayerCount(event){
    let winnerOfGame = winner.value;
    let player_count = event.value;

    postData(url, winnerOfGame, player_count);
    sessionStorage.removeItem("data");
    sessionStorage.removeItem("roles");
    roles = 0;
    numberRoles.innerText = 'Number of Roles: ' + roles; 
    counter.fill(0);
    updateData(null);

}



    