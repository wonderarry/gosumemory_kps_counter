let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");
let tapsdiv = document.getElementById("taps")
//let updateRate = 10;
let kps_storage = document.getElementById("currentkps");
//let presses_storage = document.getElementById("totalpresses");
let bpm_storage = document.getElementById("currentbpm");

socket.onopen = () => {
    console.log("Successfully Connected");
};

socket.onclose = event => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!")
};

socket.onerror = error => {
    console.log("Socket Error: ", error);
};


let tempState = -2;
let key1state = 0;
let key2state = 0;



let animation = {
    kps_storage: new CountUp('currentkps', 0, 0, 0, 0.3, { decimalPlaces: 0, useEasing: true, useGrouping: false, separator: " ", decimal: "." }),
    bpm_storage: new CountUp('currentbpm', 0, 0, 0, 0.3, { decimalPlaces: 0, useEasing: true, useGrouping: false, separator: " ", decimal: "." }),
}


let tapsQueue = [];
let actualFrametimeMilliseconds = 15.25; //experimental measurement, may vary based on system
tapsQueue.length = Math.floor(1000 / actualFrametimeMilliseconds);
tapsQueue.fill(0);

let kps = 0;
let tapsCounter = 0;

let itercount = 0;
let maxiter = 5;

socket.onmessage = event => {
    let data = JSON.parse(event.data);
    if (tempState !== data.menu.state){ // switched to a new state
        tempState = data.menu.state;
        
        if (tempState == 2){ // playing
            tapsdiv.style.opacity = 1;
        }
        else{
            tapsdiv.style.opacity = 0;
            key1state = 0;
            key2state = 1;
            tapsQueue.fill(0);
        }
    }
    tapsCounter = 0;
    if (tempState == 2){
        if (key1state == 0 && data.gameplay.keyOverlay.k1.isPressed){ //a new tap that was unaccounted for
            key1state = 1;
            tapsCounter += 1;
        }
        else if (key1state == 1 && !(data.gameplay.keyOverlay.k1.isPressed)){ // key was released this frame
            key1state = 0;
        }

        if (key2state == 0 && data.gameplay.keyOverlay.k2.isPressed){ //a new tap that was unaccounted for
            key2state = 1;
            tapsCounter += 1;
        }
        else if (key2state == 1 && !(data.gameplay.keyOverlay.k2.isPressed)){ // key was released this frame
            key2state = 0;
        } 
    }

    tapsQueue.push(tapsCounter);
    kps += tapsCounter;
    kps -= tapsQueue.shift();

    itercount += 1;
    if (itercount == maxiter){
        itercount = 0;
        animation.kps_storage.update(kps);
        animation.bpm_storage.update(Math.floor(kps * 60 / 4));       
    }



}

