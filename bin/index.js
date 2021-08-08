#! /usr/bin/env node
const { program } = require('commander')
const fs = require('fs')
const express = require('express')
const app = express()
const http = require('http')
const path = require('path')
const uncss = require('uncss')

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest

app.use(express.json())
const server = http.createServer(app)

const wjsonScripts = fs.readFileSync(path.resolve(__dirname, 'wjson.js'), {encoding: 'utf8'})
var cssLib = ''

program
    .command('run <file>')
    .description('Run JSON on Web')
    .action(run)

program
    .command('purgeTailwind <file>')
    .description('Remove unused Tailwind CSS from your page')
    .action(purge)    

function purge(fileName){
    console.log('Analyzing your Files...')

    var wjson = fs.readFileSync(fileName, {encoding: 'utf8'})
    var nameServer = JSON.parse(wjson).find(el => el.type == 'server')
    var name = nameServer.params.name
    const pages = JSON.parse(wjson).filter(el => el.type == 'page')
    var parsedData = ``
    pages.forEach(item => {
        let returned = parseJSON([], item, 'get', true)
        parsedData = parsedData+ returned
    })
    var options = {
        userAgent    : 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X)',
        stylesheets  : [path.resolve(__dirname, 'tailwind/style.css')]
    }
    uncss(parsedData, options, function (error, output) {
        if(error){
            console.log('Purge error', error)
        }else{
          console.log('Done Analyzing. Generating New File')
          fs.writeFile(path.resolve(__dirname, name + '-tailwind.css'), output, (err) => {
            if (err)
              console.log(err)
            else {
              console.log("File Generated Successfully\n")
            }
          })
        }
    })
}


function run(fileName){
    if(fileName.substring(fileName.length - 6, fileName.length) != '.wjson'){
        console.error('File must be a wjson file')
        return
    }

    fs.watchFile(fileName, (ev, data) => {
        fs.readFile(fileName, 'utf8' , (err, data) => {
                server.close()
                //processWebJSONFile(err, data)
         })
    })

    fs.readFile(fileName, 'utf8' , (err, data) => {
       processWebJSONFile(err, data)
    })
}
function processWebJSONFile(err, data){
    if (err) {
        console.error(err)
        return
      }
      console.log('Parsing webJSON Server Data...')
      var port = 0
      var name = 'WebJSON'
      JSON.parse(data).forEach(element => {
         if(element.type == 'server'){
             port = element.params.port
             name = element.params.name ? element.params.name : 'WebJSON'
         }
      })

      fs.readFile(path.resolve(__dirname, name + '-tailwind.css'), {encoding: 'utf8'}, (err, data) => {
          if(data){
              cssLib = data
          }else{
              cssLib = fs.readFileSync(path.resolve(__dirname, 'tailwind/style.css'), {encoding: 'utf8'})
          }
      })

      if(!port){
          console.log('Error: You must specify port inside server Object to run a server')
      }else{
          const pages = JSON.parse(data).filter(el => el.type == 'page')
          pages.forEach(item => {
              if(item.method == 'get'){
                  app.get(item.route ? item.routeParam ? '/' + item.route + '/:' + item.routeParam : '/' + item.route : '/', async(req, res) => {
                      let parsedData = await parseJSON(req, item, 'get')
                      res.send(parsedData)
                  })
              }else if(item.method == 'post'){
                  app.post(item.route ? '/' + item.route : '/', async(req, res) => {
                      let parsedData = await parseJSON(req, item, 'post')
                      res.send(parsedData)
                  })
              }
          })
          server.listen(port, () => {
             console.log(`${name} is running on http://localhost:${port}`)
          }) 
      }  
}

function parseJSON(req, data, method, isPurgeMode){
    var tailwindCSS = isPurgeMode ? '' : data.params ? data.params.enableTailwind ?'' : '' : ''
    var getReturn = `<style>${tailwindCSS}</style>
    <script>${wjsonScripts}</script>`
    if(data.childPath){
        var toRead = fs.readFileSync(data.childPath, {encoding: 'utf8'})
    }else{
        var toRead = JSON.stringify(data.child)
    }
    if(req.length > 0){
        if(method == 'get'){
            if(req.params){
                var corrected = toRead.replace(/&&(\w+)\b/gi, (mathchedText,$1,offset,str) => {
                   return  req.params[$1]
                  })
            }else{
                var corrected = toRead
            }
            corrected = corrected.replace(/&(\w+)\b/gi, (mathchedText,$1,offset,str) => {
                return  req.query[$1]
            })
        }else if(method == 'post'){
            corrected = toRead.replace(/&(\w+)\b/gi, (mathchedText,$1,offset,str) => {
                return  req.body[$1]
            })
        }
    }else{
        var corrected = toRead
    }

    data.title ? getReturn = getReturn + '<title>' + data.title + '</title>' : null            
                JSON.parse(corrected).forEach(async(element) => {
                   if(element.type == 'script'){
                        var scripts = fs.readFileSync(element.value, {encoding: 'utf8'})
                        const correctedScripts = scripts.replace(/&(\w+)\b/gi, (mathchedText,$1,offset,str) => {
                            return  req.query[$1]
                        })
                        var pos = getReturn.indexOf('<script>')
                        getReturn = getReturn.substring(0, pos + 8) + correctedScripts + getReturn.substring(pos + 8, getReturn.length) 
                    }else if(element.type == 'initScript'){
                        var scripts = fs.readFileSync(element.value, {encoding: 'utf8'})
                        const correctedScripts = scripts.replace(/&(\w+)\b/gi, (mathchedText,$1,offset,str) => {
                            return  req.query[$1]
                        })
                        var pos = getReturn.indexOf('<script>')
                        getReturn = getReturn.substring(0, pos + 8) + 'window.onload = () => {' + correctedScripts + '}' + getReturn.substring(pos + 8, getReturn.length) 
                    }else if(element.type == 'styleSheet'){
                        var scripts = fs.readFileSync(element.value, {encoding: 'utf8'})
                        const correctedStyles = scripts.replace(/&(\w+)\b/gi, (mathchedText,$1,offset,str) => {
                            return  req.query[$1]
                        })
                        var pos = getReturn.indexOf('<style>')
                        getReturn = getReturn.substring(0, pos + 7) + correctedStyles + getReturn.substring(pos + 7, getReturn.length) 
                    }else if(element.type == 'text'){
                        var shouldRender = true
                        if(element.condition){
                            let result = judgeCondition(element)
                            shouldRender = result
                        }
                        if(element.params){
                            var id = element.params.id
                            var style = element.params.style
                        }
                        if(shouldRender) getReturn = getReturn + '<p id="'+ id+'" onclick="'+element.onClick+'" class="'+parseStyle(style)+'" style="' + parseStyle(style) + '">' + element.value + '</p>'
                    }else if(element.type == 'block'){
                        var shouldRender = true
                        if(element.condition){
                            let result = judgeCondition(element)
                            shouldRender = result
                        }
                        if(element.params){
                            var id = element.params.id
                            var style = element.params.style
                        }
                        if(shouldRender) getReturn = getReturn + '<div id="'+id+'" onclick="'+element.onClick+'" style="' + parseStyle(style) + '">' + parseChild(element.child) + '</div>'
                    }else if(element.type == 'textInput'){
                        var shouldRender = true
                        if(element.condition){
                            let result = judgeCondition(element)
                            shouldRender = result
                        }
                        if(element.params){
                            var id = element.params.id
                            var style = element.params.style
                            var placeholder = element.params.placeHolder
                        }
                        if(shouldRender) getReturn = getReturn + '<input type="text" id="'+id+'" style="' + parseStyle(style) + '" placeholder="'+placeholder+'" />'
                    }else if(element.type == 'button'){
                        var shouldRender = true
                        if(element.condition){
                            let result = judgeCondition(element)
                            shouldRender = result
                        }
                        if(element.params){
                            var id = element.params.id
                            var style = element.params.style
                        }
                        if(shouldRender) getReturn = getReturn + '<button id="'+id+'" onclick="'+element.onClick+'" style="' + parseStyle(style) + '">'+element.value+'</button>'
                    }else if(element.type == 'image'){
                        var shouldRender = true
                        if(element.condition){
                            let result = judgeCondition(element)
                            shouldRender = result
                        }
                        if(element.params){
                            var id = element.params.id
                            var style = element.params.style
                            var loadingLazy = element.params.lazy
                        }
                        if(shouldRender) getReturn = getReturn + '<img src="'+element.value+'"  id="'+id+'" loading="'+parseLoadingattr(loadingLazy)+'" onclick="'+element.onClick+'" style="' + parseStyle(style) + '" />'
                    }else if(element.type == 'link'){
                        var shouldRender = true
                        if(element.condition){
                            let result = judgeCondition(element)
                            shouldRender = result
                        }
                        if(element.params){
                            var id = element.params.id
                            var style = element.params.style
                        }
                        if(shouldRender) getReturn = getReturn + '<a href="'+element.link+'"  id="'+id+'" style="' + parseStyle(style) + '">'+element.value+'</a>'
                    }else if(element.type == 'list'){
                        var shouldRender = true
                        if(element.condition){
                            let result = judgeCondition(element)
                            shouldRender = result
                        }
                        if(element.params){
                            var id = element.params.id
                            var lazy = element.params.lazyLoad
                            var loader = element.params.loader ? parseChild(element.params.loader) : ''
                        }
                        if(lazy){
                            var convertedCode = parseChild(element.value)
                            if(typeof element.data == 'string' && /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(element.data)){
                                var scripts = `
                                fetch('${element.data}').then(response => response.json()).then(responseJson => {
                                    responseJson.forEach(i => {
                                        let corCode = '${convertedCode}'.replace(/[$]+([a-z A-Z0-9_@./#&+-]{1,})/gi, (mathchedText,$1,offset,str) => {
                                            return  i[$1]
                                        })
                                        if(responseJson.indexOf(i) == 0){
                                            document.getElementById('${id}').innerHTML = corCode
                                        }else{
                                            document.getElementById('${id}').innerHTML += corCode
                                        }
                                    })
                                })`
                            }else if(Array.isArray(element.data)){
                                let stringData = JSON.stringify(element.data)
                                var scripts = `
                                    let data = ${stringData}
                                    data.forEach(i => {
                                        let corCode = '${convertedCode}'.replace(/[$]+([a-z A-Z0-9_@./#&+-]{1,})/gi, (mathchedText,$1,offset,str) => {
                                            return  i[$1]
                                        })
                                        if(data.indexOf(i) == 0){
                                            document.getElementById('${id}').innerHTML = corCode
                                        }else{
                                            document.getElementById('${id}').innerHTML += corCode
                                        }
                                    })`
                            }    
                            getReturn = getReturn + '<script>window.onload = () => {' + scripts + '}' + '</script>'
                            if(shouldRender) getReturn = getReturn + '<div id="' +id+ '">'+loader+'</div>'
                        }else{
                            var returnedList = ''
                            if(typeof element.data == 'string' && /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(element.data)){
                                var xhttp = new XMLHttpRequest();
                                xhttp.open("GET", element.data, false)
                                xhttp.send()
                                if(xhttp.status == 200){
                                    provData = JSON.parse(xhttp.responseText)
                                }
                            }else if(Array.isArray(element.data)){
                                var provData = element.data
                            }
                            provData.map((item, idx) => {
                                let eachItem = parseChild(element.value).replace(/[$]+([a-z A-Z0-9_@./#&+-]{1,})/gi, (mathchedText,$1,offset,str) => {
                                    return  item[$1]
                                })
                                returnedList = returnedList + eachItem
                            }) 

                            if(shouldRender) getReturn = '<div id="' +id+ '">' + getReturn + returnedList + '</div>'
                        }
                    }
                 })      
    return getReturn                       
}

function parseChild( data){
    var getReturn = ``
                data.forEach(element => {
                   if(element.type == 'text'){
                        var shouldRender = true
                        if(element.condition){
                            let result = judgeCondition(element)
                            shouldRender = result
                        }
                        if(element.params){
                            var id = element.params.id
                            var style = element.params.style
                        }
                        if(shouldRender) getReturn = getReturn + '<p id="'+ id+'" onclick="'+element.onClick+'" style="' + parseStyle(style) + '">' + element.value + '</p>'
                    }else if(element.type == 'block'){
                        var shouldRender = true
                        if(element.condition){
                            let result = judgeCondition(element)
                            shouldRender = result
                        }
                        if(element.params){
                            var id = element.params.id
                            var style = element.params.style
                        }
                        if(shouldRender) getReturn = getReturn + '<div id="'+id+'" onclick="'+element.onClick+'" style="' + parseStyle(style) + '">' + parseChild(element.child) + '</div>'
                    }else if(element.type == 'textInput'){
                        var shouldRender = true
                        if(element.condition){
                            let result = judgeCondition(element)
                            shouldRender = result
                        }
                        if(element.params){
                            var id = element.params.id
                            var style = element.params.style
                            var placeholder = element.params.placeHolder
                        }
                        if(shouldRender) getReturn = getReturn + '<input type="text" id="'+id+'" style="' + parseStyle(style) + '" placeholder="'+placeholder+'" />'
                    }else if(element.type == 'button'){
                        var shouldRender = true
                        if(element.condition){
                            let result = judgeCondition(element)
                            shouldRender = result
                        }
                        if(element.params){
                            var id = element.params.id
                            var style = element.params.style
                        }
                        if(shouldRender) getReturn = getReturn + '<button id="'+id+'" onclick="'+element.onClick+'" style="' + parseStyle(style) + '">'+element.value+'</button>'
                    }else if(element.type == 'image'){
                        var shouldRender = true
                        if(element.condition){
                            let result = judgeCondition(element)
                            shouldRender = result
                        }
                        if(element.params){
                            var id = element.params.id
                            var style = element.params.style
                            var loadingLazy = element.params.lazy
                        }
                        if(shouldRender) getReturn = getReturn + '<img src="'+element.value+'"  id="'+id+'" loading="'+parseLoadingattr(loadingLazy)+'" onclick="'+element.onClick+'" style="' + parseStyle(style) + '" />'
                    }else if(element.type == 'link'){
                        var shouldRender = true
                        if(element.condition){
                            let result = judgeCondition(element)
                            shouldRender = result
                        }
                        if(element.params){
                            var id = element.params.id
                            var style = element.params.style
                        }
                        if(shouldRender) getReturn = getReturn + '<a href="'+element.link+'"  id="'+id+'" style="' + parseStyle(style) + '">'+element.value+'</a>'
                    }
                 })
    return getReturn             
}

function judgeCondition(element){
    let shoudlReturn = true
    if(element.condition[1] == '=='){
        if(element.condition[0] != element.condition[2]) return false
    } else if(element.condition[1] == '!='){
        if(element.condition[0] == element.condition[2]) return false
    } else if(element.condition[1] == '>'){
        if(element.condition[0] < element.condition[2] || element.condition[0] == element.condition[2]) return false
    }else if(element.condition[1] == '<'){
        if(element.condition[0] > element.condition[2] || element.condition[0] == element.condition[2]) return false
    }
    return shoudlReturn
}

function parseStyle(styleData){
    if(typeof styleData == 'string'){
        return styleData
    }
    var converted = ``
    for (var key in styleData){
        converted = converted + formatStyleKey(key) + ':' + formatStyleVal(styleData[key], key) + ';'
    } 
    return converted
}

function formatStyleKey(key){
    if(key == 'fontSize') return 'font-size'
      else if(key == 'fontFamily') return 'font-family'
      else if(key == 'height') return  'height'
      else if(key == 'width') return  'width'
      else if(key == 'backgroundColor') return  'background-color'
      else if(key == 'fontWeight') return  'font-weight'
      else return key


}

function formatStyleVal(val, prop){
    if(typeof val == 'number') {
        if(prop == 'fontWeight') return val 
        else return val + 'px'  
    }
      else if(typeof val == 'string') return val
}

function parseLoadingattr(isLazy){
    return isLazy ?  'lazy' : 'eager'
}

program.parse()
