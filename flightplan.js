'use stirct';

var plan = require('flightplan');

plan.target('dev', {
  host: '52.35.84.251',
  username: 'ubuntu',
  privateKey: process.env.KG_SSH_KEY,
  agent: process.env.SSH_AUTH_SOCK
});

plan.local('deploy', function (local) {
  var target = plan.runtime.target;
  local.log('Building ' + target + ' .....');
  var filesToCopy = local.exec('git ls-files', {silent: true});
  local.transfer(filesToCopy, '~/kiddogardener/');
});

plan.remote('deploy', function(remote) {
	remote.log('Installing dependencies...');
	remote.exec('cd ~/kiddogardener/ && npm install', {pty: true});
  //remote.exec('cd ~/kiddogardener/ && npm run build', {pty: true});
  remote.exec('cd ~/kiddogardener/ && npm run dev-stop', {pty: true, failsafe: true});
	remote.exec('cd ~/kiddogardener/ && npm run dev-start', {pty: true});
});

plan.local('deploy', function (local) {
  local.log('Completed deploying Webapp to ' + plan.runtime.target);
});
