# webJSON
**Build Modern Web Apps just with JSON and JS**

webJSON is a Node.js based framework to build modern dynamic and static web applications.

It's basically plain JSON with a special syntax which is parsed and converted to browser supported codes on runtime. Its simplicity and ease enables you to easily create and run a web application.

webJSON is based on NodeJS. You can create a server and run with only 5-6 lines of JSON. webJSON has its own CLI and file extension `wjson`. The power of webJSON can be realized better in dynamic app development.

## Installation
Make sure you have Node latest version installed. Install it using `npm` or `yarn`
```json
npm install webjson -g
yarn add webjson -g
```
## Creating a Server
Once you have installed the package, you can start coding. Create an `index.wjson` file or whatever you name it. Now put the following
```json
[
 {
   "type":"server",
   "params": {
      "port": 3000
   }
 }
]
```
This minimal amount of code is required to run a Server. Now navigate to the root folder and run
```
wjson run index.wjson //your file name
```
It should start a server in the specified port. By default, it will show `Cannot GET /`. You can give it a visit to be sure.

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
9. Image
10. Link
11. List

NOTE: Make sure you type them in lower case letters.

## Server
This is a required object.

Param | Required | Value Type | Description
------|----------|------------|-------------
`name` | No, But Recommended | `string` | This is your application name. This is important, if you enable and purge Tailwind.
`port` | Yes | `int` | The port of server where your application will be live

A complete example of server object can be:
```
 {
   "type":"server",
   "params": {
      "port":3000,
      "name": "My First WJSON app"
   }
 }
 ```
### Page
This is a configuration object for each page. page object acts as the building block of a web app. This is the base component for routing.

Param | Required | Value Type | Description
------|----------|------------|-------------
`method` | Yes | `string` (`get` or `post`) | Method of acceptable requests
`route` | Yes (if the page should not be the index file) | `string` | Route or Path of Page
`routeParam` | No | `string` | Determines the name with which you want to receive URL parameters of the specified route
`title` | No | `string` | Title of Page
`child` | Yes | `array` | Array of Child Component Objects, which will be shown in the page
`childPath` | No | `string` | Local relative path of the file from which you want to receive childs. If you want to get childs from different file, specify this. `child` value will be ignored if this is added



A complete example of page object can be:
```json
 {
   "type":"page",
   "method": "get",
   "title": "Home",
   "child": [
     {"type": "text", "value": "Home page"}
   ]
 },
 {
   "type":"page",
   "method": "get",
   "title": "About",
   "route": "about",
   "childPath": "about.wjson"
 }
 ````
### Scripts
You can load and add javascript code in JSON. As JSON supports only **string**, **number** and **boolean** value, It's difficult to write JS in JSON. So, the solution is to create a separate `.js` file and load it in your webJSON page. value must be a local file path. A simple example of script object can be:
```json
 {
   "type":"script",
   "value": "scripts.js",
 }
``` 
There is another object called `initScript` or Initial Script This runs as soon as the page is loaded.
```json
 {
   "type":"initScript",
   "value": "getPosts.js",
 }
``` 
### StyleSheet
Just like HTML stylesheet import, you can include CSS stylesheet in your page. The setup is similar to Scipts. A simple example of styleSheet object can be:
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
Take a look at the **Style Support list** for available style params.

### Block
This is equivalent to html `div` element. With this, You can do everything that you can do with div. This has a special element called `child`, Where you can append child components. Once again, it is an array of objects. Child components are parsed the same way parent components are parsed.

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
### Image
This is the HTML `img` element. More options and params for this will be added soon.

Notice, how you it accepts the image location in the `value` option. Height and Width style is not required. Only one special param available now is the `lazy` param. If it's true, the image will be lazily loaded.
```json
 {
   "type":"image",
   "value": "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?ixid=MnwxMjA3fDF8MHxlZGl0b3JpYWwtZmVlZHwxfHx8ZW58MHx8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=60",
   "params":{
     "style": {
       "height": 200,
       "width": 200
     },
     "lazy": true
   }
 }
``` 
### Link
`link` is equivalent to html `a` element. In this object, `value` is taken as the link text. To add the `href` link, you need to pass `link` element. Check the following example:
```json
 {
   "type":"link",
   "value": "Click Me!",
   "link": "https://github.com/MadCoderme/webJSON"
 }
``` 

### List

`List` is a useful and easy way to render a list of data with just one object. It can handle large amount of data with ease.
List provides two different ways to load and show data. 

1. **Load when page loads**
   - In this method, all the data will be loaded when the page is being loaded and rendered instantly after page is loaded. This method is useful
     if you a small amount of data or a directly an object without fetching from external API. But, if you have a large amount of data, this method will badly
     slow down your page. 
2. **Load after page is loaded**
   - This method is useful if you need to fetch data from API. This will keep performance and speed good and fetch data once page is loaded. You can add a `loader`
   to show until data is fetched.

Check the following example of the `first method`:

1. `data` can be either an **object** or an **API link**.
2. `value` says how each element will be rendered. Note, how `$` is used to declare the looping variable. You
   are receiving the `id` property from each object using this syntax. It must be used inside a string and automatically will be converted to actual property. 
```json
{
  "type":"list",
  "data": [{"id": 123}, {"id": 1234}, {"id": 12345}],
  "value": [{
        "type": "text",
        "value": "$id"
   }]
}
```

If you put an API link here, as the method works, page will keep loading until data is received. 
It’s not recommended anyway. Use the `second method` for those type of list:

1. `lazyLoad` says if the data should be fetched and rendered lazily. This is the configuration param to use `second method`
2. `loader` displays a `loading element` while the data is being fetched. This is recommended to add. `loader` is once again an array of `webJSON` component objects.
3. `id` is a required param. Without this, data won't be rendered
```json
{
  "type":"list",
  "data": "https://random-data-api.com/api/color/random_color?size=10",
  "value": [{
        "type": "block",
	"child": [],
        "params": {
	    "style": {
		"backgroundColor": "$hex_value",
		"height": 100,
		"width": 100
	    }
      	}
   }],
  "params": {
  	"id": "colorList",
	"lazyLoad": true
  }
}
```

If you run the above example with `lazyLoad` param `true`, the page will quickly load. Then, all the data will be fetched and rendered lazily. 
To add a loader, simply pass the `loader` param. Check the example below:

```json
{
  "type":"list",
  "data": "https://random-data-api.com/api/color/random_color?size=10",
  "value": [{
        "type": "text",
	"value": "$color_name",
        "params": {
	    "style": {
		"color": "$hex_value"
	    }
      	}
   }],
  "params": {
  	"id": "colorList",
	"lazyLoad": true,
	"loader": [{
	    "type": "text",
	    "value": "Loading..."
 	}]
  }
}
```
`loader` can be any element or multiple elements and will disappear once data is loaded.


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
9. position
10. top
11. bottom
12. left
13. right
14. border

If you add a Stylesheet or enable Tailwind, you need to replace style `array` with a `string`. For example,
```json
 "style": "myClass"
``` 
## Built-in Functions & API
webJSON provides some basic but important functions and API.

### Receiving Inputs
Receiving server request information is too easy with webJSON. You can receive and work with query parameters of `Get` requests in the following way.
```
//Request: http://localhost:3000/?id=12345&name=David

//Receive "id" and "name" param:
 {
   "type":"text",
   "value": "Your Id is &id and Name is &name"
 }
``` 
Just put `&` before the name of the query param you want to work with. You can even use this functionality in JS scripts.
```javascript
function giveAlert(){
  if('&id' == "1234") {
    alert('Provided id: &id is valid')
  }
}
```
This method will also work with `post` request body. Make sure the request body is in `json` format.

You can receive URL parameters of `get` request by putting && before the param name. For example, if the url is: http://localhost:3000/post/123, then you can receive 123 like below:
```json
 {
   "value": "url param id is &&id"
 }
``` 
Check Page object to understand how to configure URL params.

### Routing
Routing or Navigation is one of the most important part of every web application. webJSON makes it very easy to setup and perform routing.

As mentioned earlier, every page object is indeed a Page. To navigate form one page to another, you can use the built in function of webJSON
```json
{
  "type": "button",
  "value": "About",
  "onClick": "navigate('about')"
}
```
Basically, you need to pass the `route `name of the page, that you want to navigate to. You can pass extra data for example URL Parameters and Query Parameters too.

### Tailwind CSS
To make development easier and faster, webJSON comes with Tailwind CSS in the box. By default, it's not enabled. To enable and use Tailwind CSS classes, add `enableTailwind` param to page object.
```json
 {
   "type":"page",
   "method": "get",
   "title": "Home",
   "childPath": "home.wjson",
   "params": {
      "enableTailwind": true
   }
 }
``` 
You can now use all Tailwind classes. For example,
```json
 {
   "type":"text",
   "value": "Example Tailwind Text",
   "params": {
      "id": "txt",
      "style": "text-lg font-semibold"
   }
 }
``` 

***Optimizing Performance with Tailwind***

Minified Tailwind CSS is a huge 3000kb+ file which will dramatically increase your loading time and decrease your Lighthouse score. The solution is to prevent unused CSS codes from loading.

webJSON provides a simple solution to this problem. You can run the following command
```
wjson purgeTailwind index.wjson
```

This will analyze your wjson file and configure your project by creating a custom css file with the used classes only. You need to run this whenever you update your code. Or, you may run it only once before deploying app to production.

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

## Support and Contribution
I am actively developing this project. **If you like it, please help not with Donation, but with Contribution**

This project is not ready and perfect yet for big projects. Please help to grow this faster. If you make a big change, Open an issue first. If you make a small change, open a pull request.

Please let me know your suggestions about this project.

Thanks!
