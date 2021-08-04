# webJSON
**Build Modern Web Apps just with JSON**

webJSON is a Node.js based framework to build modern dynamic and static web applications.

It's basically plain JSON with a special syntax which is parsed and converted to browser supported codes on runtime. Its simplicity and ease enables you to easily create and run a web application.

webJSON is based on NodeJS. You can create a server and run with only 5-6 lines of JSON. webJSON has its own CLI and file extension wjson. The power of webJSON can be realized better in dynamic app development.

## Installation
Make sure you have Node latest version installed. Install it using npm or yarn
```
npm install wjson -g
yarn add wjson -g
```
## Creating a Server
Once you have installed the package, you can start coding. Create an index.wjson file or whatever you name it. Now put the following
```
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

``wjson run index.wjson //your file name``
It should start a server in the specified port. By default, it will accept get requests now. You can give it a visit to be sure.
