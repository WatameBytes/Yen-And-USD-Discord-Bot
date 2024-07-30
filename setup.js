const fs = require('fs');
const { exec } = require('child_process');

const envFile = '.env';

function createEnvFile() {
  const envContent = `DISCORD_TOKEN="PLACE_TOKEN_HERE"\nCLIENT_ID="CLIENT_ID"`;
  fs.writeFileSync(envFile, envContent);
  console.log('.env file created successfully. Please update your DISCORD_TOKEN and CLIENT_ID in the .env file.');
}

function runNpmInstall() {
  console.log('Running npm install...');
  exec('npm install', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`npm install completed:\n${stdout}`);
  });
}

function setup() {
  if (!fs.existsSync(envFile)) {
    console.log('No .env file found. Creating a new one...');
    createEnvFile();
  } else {
    console.log('Existing .env file found. Not making any changes.');
  }

  runNpmInstall();
}

setup();
