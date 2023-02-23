const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  console.log("---------- HEADERS -------");
  let path = req.headers["x-original-uri"];
  let path_without_param = path.split('?')[0];
  console.log(path_without_param);
  allowed_paths = ["/api/v0/cat", "/api/v0/add", "/api/v0/pubsub/sub", "/api/v0/pubsub/pub"];
  if (allowed_paths.includes(path_without_param)) {
     res.send();
  } else {
     res.sendStatus(403);
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
