#! /usr/bin/env node
const { program } = require('commander')
const fs = require('fs')
const express = require('express')
const app = express()

program
    .command('run <file>')
    .description('Run JSON on Web')
    .action(run)

function run(fileName){
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
                app.get('/', (req, res) => {
                    let parsedData = parseJSON(req, data)
                    res.send(parsedData)
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
    var getReturn = `<style>p { font-size: 20px; font-family: helvetica; }</style><script></script>`
                const corrected = data.replace(/&(\w+)\b/gi, (mathchedText,$1,offset,str) => {
                    return  req.query[$1]
                })
                JSON.parse(corrected).forEach(element => {
                    if(element.type == 'server'){
                        port = element.params.port
                        method = element.params.method
                    }else if(element.type == 'page'){
                        element.title ? getReturn = getReturn + '<title>' + element.title + '</title>' : null
                    }else if(element.type == 'script'){
                        var scripts = fs.readFileSync(element.value, {encoding: 'utf8'})
                        const correctedScripts = scripts.replace(/&(\w+)\b/gi, (mathchedText,$1,offset,str) => {
                            return  req.query[$1]
                        })
                        var pos = getReturn.indexOf('<script>')
                        getReturn = getReturn.substring(0, pos + 8) + correctedScripts + getReturn.substring(pos + 8, getReturn.length) 
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
                        if(shouldRender) getReturn = getReturn + '<p id="'+ id+'" style="' + parseStyle(style) + '">' + element.value + '</p>'
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
                        if(shouldRender) getReturn = getReturn + '<div id="'+id+'" style="' + parseStyle(style) + '">' + parseChild(element.child) + '</div>'
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
                    }
                 })
    return getReturn             
}

function parseChild( data){
    var getReturn = ``
                data.forEach(element => {
                    if(element.type == 'server'){
                        port = element.params.port
                        method = element.params.method
                    }else if(element.type == 'page'){
                        element.title ? getReturn = getReturn + '<title>' + element.title + '</title>' : null
                    }else if(element.type == 'script'){
                        var scripts = fs.readFileSync(element.value, {encoding: 'utf8'})
                        const correctedScripts = scripts.replace(/&(\w+)\b/gi, (mathchedText,$1,offset,str) => {
                            return  req.query[$1]
                        })
                        var pos = getReturn.indexOf('<script>')
                        getReturn = getReturn.substring(0, pos + 8) + correctedScripts + getReturn.substring(pos + 8, getReturn.length) 
                    }
                    else if(element.type == 'text'){
                        var shouldRender = true
                        if(element.condition){
                            let result = judgeCondition(element)
                            shouldRender = result
                        }
                        if(element.params){
                            var id = element.params.id
                            var style = element.params.style
                        }
                        if(shouldRender) getReturn = getReturn + '<p id="'+ id+'" style="' + parseStyle(style) + '">' + element.value + '</p>'
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
                        if(shouldRender) getReturn = getReturn + '<div id="'+id+'" style="' + parseStyle(style) + '">' + parseChild(element.child) + '</div>'
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
                    }
                 })
    return getReturn             
}

function judgeCondition(element){
    let shoudlReturn = true
    element.condition.replace(/(.+) (==|!=) (('|")([\w ]*)('|")|([0-9]*))/g, (mathchedText, $1, $2, $3, $4, $5) => {
        if($2 == '=='){
            if($1.charAt(0) == "'" || $1.charAt($1.length - 1) == "'"){
                $1 = $1.replace(/'/g, '')
            }else if($1.charAt(0) == '"' || $1.charAt($1.length - 1) == '"'){
                $1 = $1.replace(/"/g, '')
            }
            if(/^\d+$/.test($3)){
                if($1 != $3) shoudlReturn = false 
            }else{  
               if($1 != $5) shoudlReturn = false 
            }
        } else if($2 == '!='){
            if($1.charAt(0) == "'" || $1.charAt($1.length - 1) == "'"){
                $1 = $1.replace(/'/g, '')
            }else if($1.charAt(0) == '"' || $1.charAt($1.length - 1) == '"'){
                $1 = $1.replace(/"/g, '')
            }
            if(/^\d+$/.test($3)){
                if($1 == $3) rshoudlReturn = false  
            }else{  
               if($1 == $5) shoudlReturn = false 
            }
        }
    })
    return shoudlReturn
}

function parseStyle(styleData){
    var converted = ``
    for (var key in styleData){
        converted = converted + formatStyleKey(key) + ':' + formatStyleVal(styleData[key]) + ';'
    } 
    return converted
}

function formatStyleKey(key){
    if(key == 'fontSize') return 'font-size'
      else if(key == 'fontFamily') return 'font-family'
      else if(key == 'height') return  'height'
      else if(key == 'width') return  'width'
      else if(key == 'backgroundColor') return  'background-color'
      else if(key == 'color') return  'color'
}

function formatStyleVal(val){
    if(typeof val == 'number') return val + 'px'  
      else if(typeof val == 'string') return val
}

program.parse()
