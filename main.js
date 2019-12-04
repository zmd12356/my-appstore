console.log('server launching...')

const constant = require('./lib/constant')
const express = require('express')
const fs = require('fs')
const app = express()

// 基础设置
// process.env.NODE_ENV === "production"    //此模式下会自动开启缓存功能
// app.enable('view cache');    //启用模板缓存
// app.set('view cache', true)  //启用模板缓存
app.disable('x-powered-by') //禁止发送服务器环境信息
app.set('port', 8888)

// 模板引擎两种使用方式
// 方式一
var handlebars = require('express-handlebars')
app.engine('handlebars', handlebars());
// 方式二
// var handlebars = require('express-handlebars').create({ defaultLayout: 'main' })
// app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// 静态文件
app.use(express.static(__dirname + '/public'))

app.get('/', (request, response) => {
    var appsDirPath = './apps'
    fs.readdir(appsDirPath, (err, fileList) => {
        if (err) {
            console.log(err)
        } else {
            console.log(fileList)
        }
        response.render('home')
    })
})

// 404处理放在所有路由之后
app.use((request, response) => {
    response.type('text/plain')
    response.status(404)
    response.send('404 - not found')
})

// 错误处理放在最后
app.use((error, request, response, next) => {
    console.error(error.stack)
    response.type('text/plain')
    response.status(500)
    response.send('500 - internal error')
})

app.listen(app.get('port'), () => {
    console.log('server listening on port : ' + app.get('port'))
})
