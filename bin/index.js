#! /usr/bin/env node
const { program } = require('commander')
const fs = require('fs')
const express = require('express')
const app = express()

const wjsonScripts = fs.readFileSync(process.argv[1].replace('index.js', '') + '\wjsonScripts.js', {encoding: 'utf8'})

program
    .command('run <file>')
    .description('Run JSON on Web')
    .action(run)

function run(fileName){
    if(fileName.substring(fileName.length - 6, fileName.length) != '.wjson'){
        console.error('File must be a wjson file')
        return
    }
    fs.readFile(fileName, 'utf8' , (err, data) => {
        if (err) {
          console.error(err)
          return
        }
        console.log('Parsing webJSON Server Data...')
        var port = 0
        var method = 'get'
        var name = 'WebJSON'
        JSON.parse(data).forEach(element => {
           if(element.type == 'server'){
               port = element.params.port
               method = element.params.method
               name = element.params.name ? element.params.name : 'WebJSON'
           }
        })

        if(!port){
            console.log('Error: You must specify port inside server Object to run a server')
        }else{
            if(method == 'get'){
                const pages = JSON.parse(data).filter(el => el.type == 'page')
                pages.forEach(item => {
                    app.get(item.route ? '/' + item.route : '/', (req, res) => {
                        let parsedData = parseJSON(req, item)
                        res.send(parsedData)
                    })
                })
            }else if(method == 'post'){
                app.post('/', (req, res) => {
                    res.send(getReturn)
                })
            }else if(method == 'put'){
                app.put('/', (req, res) => {
                    res.send(getReturn)
                })
            }
              
            app.listen(port, () => {
               console.log(`${name} is running on http://localhost:${port}`)
            }) 
        }       
    })
}

function parseJSON(req, data){
    var getReturn = `<style>p { font-size: 20px; font-family: helvetica; }</style>
    <script>${wjsonScripts}</script>`
                const corrected = JSON.stringify(data.child).replace(/&(\w+)\b/gi, (mathchedText,$1,offset,str) => {
                    return  req.query[$1]
                })
    data.title ? getReturn = getReturn + '<title>' + data.title + '</title>' : null            
                JSON.parse(corrected).forEach(element => {
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

program.parse()
