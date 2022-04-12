
const express = require('express')
var cors = require('cors')
const app = express()
const port = 3000;

const fs = require('fs')
const home = fs.readFileSync('home.html', 'utf8');
const testpage = fs.readFileSync('testpage.html', 'utf8');


app.use(cors())


//SETTINGS
var event_interval_seconds = 2;


app.get('/', (req, res) => {
  
  res.send(home);
})






var clients = [];


app.get('/test', (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  res.writeHead(200, headers);


  // const data = `data: ${JSON.stringify(get_data())}\n\n`;
  // res.write(data);

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    res: res,
    interval: (req.query.interval || event_interval_seconds) * 1000
  };

  if(req.query.jsonobj){
    //console.log(req.query.jsonobj);
    newClient.custom_dataobj = JSON.parse(req.query.jsonobj);
    console.log('custom message', newClient.custom_dataobj);
  }

  //start client
  startClient(newClient);

  req.on('close', () => {
    console.log(`${clientId} Connection closed`);
    clearInterval(newClient.timer);
    clients = clients.filter(client => client.id !== clientId);
  });
})


app.get('/testpage', (req, res) => {
  //res.send('hi');
  
  res.send(testpage);
});



function startClient(client){
  clients.push(client);
  var timer = setInterval(() => {
    const data = `data: ${JSON.stringify(get_data(client.custom_dataobj))}\n\n`;
    client.res.write(data);
    //console.log('sent on interval for',client.id,'of',clients.length,'clients');
  },client.interval);
  client.timer = timer;

  //send first event
  const data = `data: ${JSON.stringify(get_data(client.custom_dataobj))}\n\n`;
  client.res.write(data);
}






function get_data(custom_dataobj){
  var now = new Date().getTime();
  if(custom_dataobj){
    var testdata = custom_dataobj;
    testdata.now = now;
  }
  else{
    var testdata = {'testing':true,'testsse':'is great','msg':'It works!','now':now};
  }

  return testdata;
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
