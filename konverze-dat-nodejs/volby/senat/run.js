const { execSync } = require('child_process');

// setTimeout(() => execSync('node volby/senat/1-csu.js',{stdio: 'inherit'}), 50);
// setTimeout(() => execSync('node volby/senat/3-vysledky.js',{stdio: 'inherit'}), 4000);
// setTimeout(() => execSync('node volby/senat/4-souhrn.js',{stdio: 'inherit'}), 4500);
setTimeout(() => execSync('node volby/senat/5-obce.js',{stdio: 'inherit'}), 5000);
// setTimeout(() => execSync('git commit -a -m "Výsledky"',{stdio: 'inherit'}), 5500);
// setTimeout(() => execSync('git ftp push',{stdio: 'inherit'}), 6000);
