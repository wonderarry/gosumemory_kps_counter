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


let tempState;
let key1state;
let key2state;



let animation = {
    kps_storage: new CountUp('currentkps', 0, 0, 0, 0.25, { decimalPlaces: 0, useEasing: true, useGrouping: false, separator: " ", decimal: "." }),
    //presses_storage: new CountUp('totalpresses', 0, 0, 0, 0.25, { decimalPlaces: 0, useEasing: true, useGrouping: false, separator: " ", decimal: "." }),
    bpm_storage: new CountUp('currentbpm', 0, 0, 0, 0.2, { decimalPlaces: 0, useEasing: true, useGrouping: false, separator: " ", decimal: "." }),
}



let tapsQueue = [];

let kps = 0;
let changeStorage;
let prevTime = window.performance.now();
let avgtime;
let firstframescounter = 0;
let testframecount = 500;
let kps_bpm_refresh_cap = 1;
let kps_bpm_refresh_counter = 0;

socket.onmessage = event => {
    let data = JSON.parse(event.data);
    if (firstframescounter < testframecount){
        firstframescounter += 1; 
        if (firstframescounter == testframecount){
            avgtime = Math.floor((window.performance.now() - prevTime) / testframecount) + 0.25;
            queueMaxSize = Math.floor(1000 / avgtime);
            tapsQueue.length = queueMaxSize;
            tapsQueue.fill(0);
            //presses_storage.innerText = 0;
        }
        else{
            kps_storage.innerText = "Setting up...";
            //presses_storage.innerText = "Please wait...";
            bpm_storage.innerText = "Please wait...";
        }
    }
    else{
        let data = JSON.parse(event.data);
        if (tempState !== data.menu.state){
            tempState = data.menu.state;

            if (tempState == 2){
                tapsdiv.style.opacity = 1;
            }
            else{
                tapsdiv.style.opacity = 0;
                key1state = 0;
                key2state = 0;
            }
        }
        changeStorage = 0;
        if (data.menu.state == 2){
            if (data.gameplay.keyOverlay.k1.isPressed && key1state == 0){
                key1state = 1;
                changeStorage += 1;
            }
            else if (!(data.gameplay.keyOverlay.k1.isPressed) && key1state == 1){
                key1state = 0;
            }

            if (data.gameplay.keyOverlay.k2.isPressed && key2state == 0){
                key2state = 1;
                changeStorage += 1;
            }
            else if (!(data.gameplay.keyOverlay.k2.isPressed) && key2state == 1){
                key2state = 0;
            }
        }
        tapsQueue.push(changeStorage);
        kps += changeStorage;
        kps -= tapsQueue.shift();

        /*
        if (data.menu.state == 2){
            animation.presses_storage.update(parseInt(presses_storage.innerText) + changeStorage);
        }
        */

        kps_bpm_refresh_counter += 1;
        if (kps_bpm_refresh_counter == kps_bpm_refresh_cap){
            animation.kps_storage.update(kps);
            animation.bpm_storage.update(Math.floor(kps * 60 / 4));
            kps_bpm_refresh_counter = 0;
        }
    }
}


