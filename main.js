console.log("server launching...")

const constant = require("./lib/constant")
const http = require("http")
const https = require("https")
const express = require("express")
const fs = require("fs")
const app = express()

var SSLOptions = {
    key: fs.readFileSync('./keys/server.key'),
    cert: fs.readFileSync('./keys/server.crt')
}

// 基础设置
// process.env.NODE_ENV === "production"    //此模式下会自动开启缓存功能
// app.enable("view cache");    //启用模板缓存
// app.set("view cache", true)  //启用模板缓存
app.disable("x-powered-by") //禁止发送服务器环境信息
app.set("port", 8888)

// 模板引擎两种使用方式
// 方式一
var handlebars = require("express-handlebars")
app.engine("handlebars", handlebars());
// 方式二
// var handlebars = require("express-handlebars").create({ defaultLayout: "main" })
// app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

// 静态文件
const publicPath = __dirname + "/public/"
app.use(express.static(publicPath))

const manifestPrefix0 = "itms-services://?action=download-manifest&url=https://"
const manifestPrefix1 = "192.168.9.126"
const manifestPrefix = manifestPrefix0 + manifestPrefix1 + ":" + (app.get("port") + 1) + "/"

app.get("/", (request, response) => {
    const appsPath = publicPath + "apps/"
    fs.readdir(appsPath, (err, fileList) => {
        var infoObj = {}
        infoObj.ca = "apps/ca.crt"
        infoObj.se = "apps/server.crt"
        infoObj.icon = "apps/image.57x57.png"
        infoObj.apps = []
        if (err) {
            console.log(err)
        } else {
            console.log(fileList)
            fileList.forEach(item => {
                var itemPath = appsPath + item
                if (fs.statSync(itemPath).isDirectory()) {
                    var about = "没有备注"
                    var aboutPath = itemPath + "/about.txt"
                    if (fs.existsSync(aboutPath)) {
                        about = fs.readFileSync(aboutPath)
                    }
                    infoObj.apps.push({
                        "name": item,
                        "about": about,
                        "link": manifestPrefix + "apps/" + item + "/manifest.plist"
                    })
                }
            });
        }
        response.render("home", { "info": infoObj })
    })
})

// 404处理放在所有路由之后
app.use((request, response) => {
    response.type("text/plain")
    response.status(404)
    response.send("404 - not found")
})

// 错误处理放在最后
app.use((error, request, response, next) => {
    console.error(error.stack)
    response.type("text/plain")
    response.status(500)
    response.send("500 - internal error")
})

// app.listen(app.get("port"), () => {
//     console.log("server listening on port : " + app.get("port"))
// })

var httpServer = http.createServer(app);
var httpsServer = https.createServer(SSLOptions, app);
httpServer.listen(app.get("port"), () => {
    console.log("http listening on port : " + app.get("port"))
});
httpsServer.listen(app.get("port") + 1, () => {
    console.log("https listening on port : " + app.get("port"))
})

