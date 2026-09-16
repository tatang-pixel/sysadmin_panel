let coins = 0.000000;
let isMining = false;

document.getElementById('start-btn').addEventListener('click', startMining);

function startMining() {
    if(isMining) return;
    isMining = true;
    
    let log = document.getElementById('logs');
    log.innerHTML += "[MINING] Connecting to Cloud Server...<br>";
    
    // Counter visual koin goib
    setInterval(() => {
        coins += 0.001420;
        document.getElementById('coin-counter').innerText = coins.toFixed(6);
        
        // Ping ke server backend biar ke-log di TUI Python lu
        fetch('/')
            .catch(err => console.log('Ping sent'));
            
    }, 800);

    setInterval(() => {
        let hashes = (Math.random() * 500 + 100).toFixed(2);
        log.innerHTML = `[MINING] Hashrate: ${hashes} MH/s<br>[BLOCK] Found new block! +0.001420 FKN<br>` + log.innerHTML;
    }, 1500);
}
