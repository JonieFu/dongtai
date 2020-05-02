var http = require("http");
var fs = require("fs");
var url = require("url");
var port = process.argv[2];
if (!port) {
  console.log("请指定端口号好不啦？\nnode server.js 8888 这样不会吗？");
  process.exit(1);
}
var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true);
  var pathWithQuery = request.url;
  var queryString = "";
  if (pathWithQuery.indexOf("?") >= 0) {
    queryString = pathWithQuery.substring(pathWithQuery.indexOf("?"));
  }
  var path = parsedUrl.pathname;
  var query = parsedUrl.query;
  var method = request.method;
  /******** 从这里开始看，上面不要看 ************/
  console.log("请求过来啦！路径（带查询参数）为：" + pathWithQuery);
  if (path === "/sign_in" && method === "POST") {
    // 读取数据库数据
    const userString = fs.readFileSync("./db/user.json").toString();
    const userArray = JSON.parse(userString);
    const arr = [];
    request.on("data", (chunk) => {
      arr.push(chunk);
    });
    request.on("end", () => {
      const string = Buffer.concat(arr).toString();
      const obj = JSON.parse(string);
      const user = userArray.find((user) => {
        return user.name === obj.name && user.password === obj.password;
      });

      if (user === undefined) {
        response.statusCode = 400;
        response.setHeader("Content-Type", "text/json;charset=utf-8");
        console.log("41");
        response.write("请新用户注册！");
        response.end(`{"errorCode":4001}`);
      } else {
        console.log("登陆过");
        response.statusCode = 200;
        const random = Math.random();
        const session = JSON.parse(
          fs.readFileSync("./session.json").toString()
        );
        console.log(typeof session);
        session[random] = { user_id: user.id };
        console.log("48", session);
        fs.writeFileSync("./session.json", JSON.stringify(session));
        response.setHeader("Set-Cookie", `session_id = ${random};HttpOnly`);
        response.end();
      }
    });
  } else if (path === "/home.html") {
    let homeHTML = fs.readFileSync("./public/home.html").toString();
    console.log("我是home");
    const session = JSON.parse(fs.readFileSync("session.json").toString());
    const userString = fs.readFileSync("./db/user.json").toString();
    const userArray = JSON.parse(userString);

    const cookie = request.headers["cookie"];

    let sessionID;
    try {
      sessionID = cookie.split("=")[1];
    } catch (error) {}
    if (sessionID) {
      const ID = session[sessionID];
      console.log(typeof ID);

      const user = userArray.find(
        (user) => user.id.toString() === ID.user_id.toString()
      );
      console.log(user);
      homeHTML = homeHTML.replace("{{login}}", "您好！" + user.name);
      response.write(homeHTML);
    } else {
      homeHTML = homeHTML.replace("{{login}}", "未登录");
      response.write(homeHTML);
    }
    response.end();
  } else if (path === "/register" && method === "POST") {
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    // 读取数据库数据
    const userString = fs.readFileSync("./db/user.json").toString();
    const userArray = JSON.parse(userString);
    // 准备存数据 将上传的数据存到暂时存到数组
    let array = [];
    request.on("data", (chunk) => {
      array.push(chunk);
    });
    request.on("end", () => {
      const string = Buffer.concat(array).toString();
      const obj = JSON.parse(string);
      console.log(obj instanceof Array);
      console.log(typeof obj.password);
      console.log("38:", userArray);

      userArray.push({
        id: userArray.length ? userArray.length + 1 : 1,
        name: obj.name,
        password: obj.password,
      });
      const message = JSON.stringify(userArray);
      fs.writeFileSync("./db/user.json", message);
      response.end();
    });
  } else {
    // 默认主页;
    response.statusCode = 200;
    const filepath = path === "/" ? "/index.html" : path;
    const index = filepath.indexOf(".");
    const houzhui = filepath.substring(index);
    const hashMap = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "text/javascript",
    };
    response.setHeader(
      "Content-Type",
      `${hashMap[houzhui] || "text/html"};charset=utf-8`
    );
    let content;
    try {
      content = fs.readFileSync(`./public/${filepath}`);
    } catch {
      content = `文件不存在`;
      response.statusCode = 404;
    }

    response.write(content);
    response.end();
  }

  /******** 代码结束，下面不要看 ************/
});
server.listen(port);
console.log(
  "监听 " +
    port +
    " 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:" +
    port
);
