# FE-Builder-前端打包工具（Beta）


## Introduction

前端代码打包工具，支持JavaScript，CoffeeScript，CSS， LESS代码的预编译、打包合并、压缩等，支持实时动态打包，支持Json数据模拟。

## Features

* 基于[Node-Webkit](https://raw.github.com/rogerwang/node-webkit)编写的可视化前端打包工具，基于nodejs和前端技术。
* 支持JavaScript和[CoffeeScript](http://jashkenas.github.io/coffee-script/)的动态混合打包，及合并压缩。
* 支持[LESS](http://lesscss.net)预编译，支持动态打包合并，支持代码压缩。
* 支持测试数据模拟，支持Json数据返回，支持请求动态处理，支持Ajax和Jsonp。

## Components

* 基于[NodeJS](http://nodejs.org)搭建服务器，快速搭建本地服务环境。
* 基于[Sokcet.io](http://socket.io)的远程日志输出。
* 使用[Node-Webkit-Packager](https://gitcafe.com/EdwonLim/Node-Webkit-Packager)打包。
* 使用[UglifyJS](https://github.com/mishoo/UglifyJS)对JavaScript代码进行格式化和压缩。
* 使用[CoffeeScript](http://jashkenas.github.io/coffee-script/)编译器进行Coffee预编译。
* 使用[Node-Less](https://gitcafe.com/EdwonLim/node-less)进行LESS预编译。
* 使用[ycssmin](https://github.com/yui/ycssmin)对CSS进行压缩。
* 界面基于[jQuery](http://jquery.com)，[BootStrap v3](http://v3.bootcss.com/)，[jQuery custom content scroller](http://manos.malihu.gr/jquery-custom-content-scroller/)构建的。

## Interface

#### 主界面
![主界面](http://febuilder.sinaapp.com/FEB.png)

## Agreed Directory

约定的目录结构如下：

```
project
|-- conf
  |-- js
  `-- css 
|-- data
|-- production
`-- src
  |-- js
  |-- less
```

* `src`为源码目录，`js`子目录下为`JavaScript`或`CoffeeScript`源码，`less`子目录下为`less`源码。
* `conf`为配置目录，`js`子目录下为`JavaScript`文件打包配置，`css`子目录下为`css`文件打包配置。
* `production`为产品目录，为打包后的项目代码。
* `data`为模拟数据目录。

## Quick Start

* 按照约定目录，建立项目，启动服务后，项目的访问路径为`http://127.0.0.1:端口号(默认8080)/项目名/`。
* `JavaScript`引入方式是`$Import('path/to/file.js')`，如果是`CoffeeScript`，那么拓展名为`.coffee`，相对路径的`root`为`src/js/`。(`.js`可以省略)
* `Less`使用标准的引入方式，`@import "path/to/file"`，相对路径的`root`为`src/less/`。
* 在`DEV`开发环境下，访问项目路径下的`js`和`css`目录中的文件，会根据`conf`配置返回内容，其他文件会直接返回`src`下的相应文件。
  * 例如访问`http://127.0.0.1:8080/example/js/index.js`，那么会根据`conf/js/index.js`返回相应内容，如果是`index.min.js`，那么会压缩后返回。
* 在`PD`生产环境下，访问项目路径下的`js`和`css`目录中的文件，会直接返回`production`中的相应文件。
* 如果访问项目路径下的`path/to/name.json`或`path/to/name.jsonp`，（先仅支持get请求）
  * 如果存在`data`目录下的`path/to/name.json`文件，则直接返回其中的`json`数据。
  * 如果存在`data`目录下的`path/to/name.js`文件，则会执行此`js`中的方法，返回方法`return`的`object`数据。
 
Example1：
 
```
// args为请求的参数对象，a、b为请求时所带的参数
function exec(args) {
    var a = parseInt(args.a) || 0,
        b = parseInt(args.b) || 0;

    return {
        rs : a + b
    };
}
```
Example2:

```
//同一个项目会有一个global对象可以操作，可以存取一些数据，模拟相关的逻辑
function exec(args) {
    global.value = args.value;
    return {
        result : true
    };
}
/*----------------------------------*/
function exec(args) {
    return {
        value : global.value || ''
    };
}
```

本项目`example`目录下为示例项目。

## Download

Beta (0.1.0)

* Mac [FE-Builder-0.1.0-Mac.zip](http://pan.baidu.com/s/1wxGlz)
* Win [FE-Builder-0.1.0-Win.zip](http://pan.baidu.com/s/1uvNaT)


## TODO Listti

* 优化界面。
* 优化日志输出。
* 优化远程日志面板。
* 模拟数据支持post请求。
