import * as ESPN from './app/sports/services/espn';

async function debug() {
    const id = '3945274'; // Luka
    const league = 'nba';
    
    console.log("Fetching logs for Luka...");
    const logs = await ESPN.getPlayerLogs(league, id);
    const lastGame = logs[0];
    
    if (lastGame) {
        console.log("Last Game Date:", lastGame.date);
        console.log("Labels:", lastGame.labels);
        console.log("Stats:", lastGame.stats);
    } else {
        console.log("No games found.");
    }
}

debug();
