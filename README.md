# webJSON
**Build Modern Web Apps just with JSON**

webJSON is a Node.js based framework to build modern dynamic and static web applications.

It's basically plain JSON with a special syntax which is parsed and converted to browser supported codes on runtime. Its simplicity and ease enables you to easily create and run a web application.

webJSON is based on NodeJS. You can create a server and run with only 5-6 lines of JSON. webJSON has its own CLI and file extension wjson. The power of webJSON can be realized better in dynamic app development.

## Installation
Make sure you have Node latest version installed. Install it using npm or yarn
```
npm install webjson -g
yarn add webjson -g
```
## Creating a Server
Once you have installed the package, you can start coding. Create an index.wjson file or whatever you name it. Now put the following
```json
[
 {
   "type":"server",
   "params": {
      "port":3000
   }
 }
]
```
This minimal amount of code is required to run a Server. Now navigate to the root folder and run
```
wjson run index.wjson //your file name
```
It should start a server in the specified port. By default, it will accept get requests now. You can give it a visit to be sure.

## Supported Objects
As I am a student, I haven't been able to add enough support yet. I am actively developing and bringing more support for the basic things. Basic structure and code base is already built.

Every configuration or component is basically just a JSON object. The page is an array of all these objects. Each object must contain a type element which determines what it will do. Below are the currently supported Object types

1. Server
2. Page
3. Scripts
   - Script
   - initScript
4. StyleSheet   
5. Text
6. Block
7. TextInput
8. Button

NOTE: Make sure you type them in lower case letters.

### Server
This is a required object. Please note that, Only "get" method is supported now. name specifies the Name of your Application.

A complete example of `server` object can be:
```json
 {
   "type":"server",
   "name": "My First WJSON app", 
   "params": {
      "port":3000,
      "method": "get"
   }
 }
``` 
### Page
This is a configuration object for each page. `page` object acts
as the building block of a web app. This is the base component for routing.

1. `route` sets the route path of the page. In case of index page, you don't need to specify this.
2. `routeParam` determines by what name you want to receive the URL params.
3. `title` sets the page Title. 
4. `child` is an array of all objects that you want to display in that particular page. 
5. `childPath` if you want to load the childs from a different file, then put the file local path here. 
If you specify this, `child` value will be ignored.

A complete example of `page` object can be:
```json
 {
   "type":"page",
   "title": "Home",
   "child": [
     {"type": "text", "value": "Home page"}
   ]
 },
 {
   "type":"page",
   "title": "About",
   "route": "about",
   "childPath": "about.wjson"
 }

``` 
### Scripts
You can load and add javascript code in JSON. As JSON supports only **string**, **number** and **boolean** value, It's difficult to write JS in JSON. So, the solution is to create a separate .js file and load it in your webJSON page. `value` must be a local file path. 
A simple example of `script` object can be:
```json
 {
   "type":"script",
   "value": "scripts.js",
 }
``` 

There is another object called `initScript` or **Initial Script**
This runs as soon as the page is loaded.
```json
 {
   "type":"initScript",
   "value": "getPosts.js",
 }
``` 
### StyleSheet
Just like HTML stylesheet import, you can include `CSS` stylesheet in your `page`.
The setup is similar to Scipts.
A simple example of `styleSheet` object can be:
```json
 {
   "type":"styleSheet",
   "value": "styles.css",
 }
``` 

### Text
This is equivalent to html `p` element. A complete example of text object can be:
```json
 {
   "type":"text",
   "value": "Example Text",
   "params": {
      "id": "txt",
      "style": {
        "fontSize": 20
      }
   }
 }
``` 
Take a look at the Style Support list for available style params.

### Block
This is equivalent to html `div` element. With this, You can do everything that you can do with div. This has a special element called child, Where you can append child components. Once again, it is an array of objects. Child components are parsed the same way parent components are parsed.

A complete example of block object can be:
```json
 {
   "type": "block",
   "child": [{ "type": "text", "value": "child Text!"}],
   "params": {
      "id": "myBlock",
      "style": {
        "height": 100,
        "width": 100,
        "backgroundColor": "blue"
      }
   }
 }
``` 
### TextInput
This is equivalent to html `input` element with type text. More options and params for this will be added soon.
```json
 {
   "type":"textInput",
   "params": {
      "id": "name",
      "style": {
        "fontSize": 15
      },
      "placeHolder": "Write your Name..."
   }
 }
 ```

### Button
This is basically nothing but `button` element. More options and params for this will be added soon.
```json
 {
   "type":"button",
   "value": "Click Me!",
   "onClick": "alert('it is working...')
 }
``` 

### Supported Style Params
Take a look at the supported style params. More will be added soon. 
NOTE: You can use all the css params that has no conflict with the following style(no hyphens)

1. color
2. backgroundColor
3. height
4. width
5. margin
6. padding
7. fontSize
8. fontFamily
## Built-in Functions & Properties
webJSON provides some basic but important functions and properties.

### Receiving Inputs
Receiving server request information is too easy with webJSON. As only Get Requests are supported now, You can receive and work with query parameters of Get requests in the following way.
```
//Request: http://localhost:3000/?id=12345&name=David

//Receive "id" and "name" param:
 {
   "type":"text",
   "value": "Your Id is &id and Name is &name"
 }
```
Just put & before the name of the query param you want to work with. You can even use this functionality in JS scripts.
```javascript
function giveAlert(){
  if('&id' == "1234") {
    alert('Provided id: &id is valid')
  }
}
```

You can receive URL parameters of `get` request by putting `&&` before
the param name.
For example, if the url is: ``http://localhost:3000/post/123``, then you can receive `123` like below:
```json
 {
   "value": "url param id is &&id"
 }
```

Check Page object to understand how to configure URL params.

### Routing
Routing or Navigation is one of the most important part of every web application. 
webJSON makes it very easy to setup and perform routing. 

As mentioned earlier, every `page` object is indeed a Page. To navigate form one page to another, you can use the 
built in function of webJSON 
```json
{
  "type": "button",
  "value": "About",
  "onClick": "navigate('about')"
}
```
Basically, you need to pass the `route` name of the page, that you want
to navigate to. You can pass extra data for example URL Parameters and Query Parameters too.

## Conditional Rendering
Basic Conditional rendering has been made a lot easier in webJSON. You can pass a special condition element to every object except server. You need to follow a special syntax to write conditions. Each condition is an array of 3 elements.
```json
  "condition": ["&id", "==", "abcd"], 
```
Yes, you can use those special functionalities of receiving inputs too. Only strings and Integers are supported to be passed as 1st and 3rd element.

These conditional operators are supported right now:

1. "=="
2. "!="
3. ">"
4. "<"

You can compare these to conditional if statements but more easier to apply. If the condition is true, then the object will be rendered. Else it won't be rendered.
