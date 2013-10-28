# FE-Builder-前端打包工具（Beta）


## Introduction

前端代码打包工具，适合于前端工作者及小中型开发团体快速构建和发布前端工程。

具体功能：

* 动态脚本 - `JavaScript` 代码合并、压缩：
  * `JavaScrirpt` 动态合并、压缩；
  * `CoffeeScript` 预编译，并可合并进`JavaScript`。
* 样式表 - `CSS` 代码合并、压缩：
  * 基于`LESS`构建的（一种`CSS`预处理语言，如果对他不熟悉，那么可以直接写`CSS`代码，只是文件扩展名不同罢了）；
  * `LESS` 预编译、动态合并、压缩；
  * `Image` 图片绝对路径转换；
  * 自动添加`CSS`兼容性代码
* 版本号系统 - 解决开发和线上版本问题：
  * 为`html`中的`script`和`link`所引入的`js`和`css`文件加上版本号；
  * 为`css`中的`image`加上版本号；
  * 支持版本号写入页面全局变量。
* 支持模拟`Ajax`和`Jsonp` - 让测试更简单：
  * 支持`Ajax`的`get`请求，并以`json`数据格式返回；
  * 支持`jsonp`请求，并以`json`数据格式返回；
  * 支持读取`*.json`文件数据;
  * 支持使用自定义的`JavaScript`来处理请求。
* 本地服务器 - 不懂后端也能建服务：
  * 可切换的服务器环境；
  * 动态增添项目，无需重启服务；
  * 避免本地开发的种种问题。
* 远程日志 - 在浏览器窗口中显示工具日志信息，用前端技术解决前端问题。
* 可视化UI - 直观、方便、容易操作。
* 兼容系统 - 现兼容MacOS及Window操作系统。


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
* 使用[Node-Css-Prefix](https://gitcafe.com/EdwonLim/Node-Css-Prefix)对Css进行浏览器兼容，如自动添加`-webkit-`、`-moz-`前缀等。
* 使用[ycssmin](https://github.com/yui/ycssmin)对CSS进行压缩。
* 界面基于[jQuery](http://jquery.com)，[BootStrap v3](http://v3.bootcss.com/)，[jQuery custom content scroller](http://manos.malihu.gr/jquery-custom-content-scroller/)构建的。

## Interface

#### 主界面
![主界面](http://edwonlim.gitcafe.com/pimg/feb/FEB.png)

#### 日志页面
![日志页面](http://edwonlim.gitcafe.com/pimg/feb//FEB_log.png)

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

Beta (0.2.0) 2013-10-23

更新内容：

1. 增加版本号系统。
2. 优化日志输出。
3. 修复已知Bug。

下载地址：

* Mac [FE-Builder-0.2.0-Mac.zip](http://pan.baidu.com/s/1JUha)
* Win [FE-Builder-0.2.0-Win.zip](http://pan.baidu.com/s/13QkuV)

Beta (0.1.1) 2013-10-22

更新内容：

1. 对css进行多浏览器兼容，例如自动添加`-webkit-`、`-moz-`前缀。
2. 日志输出优化。
3. 界面拖动问题修复。

下载地址：

* Mac [FE-Builder-0.1.1-Mac.zip](http://pan.baidu.com/s/1suLCO)
* Win [FE-Builder-0.1.1-Win.zip](http://pan.baidu.com/s/1JQAv)

Beta (0.1.0) 2013-10-14

下载地址：

* Mac [FE-Builder-0.1.0-Mac.zip](http://pan.baidu.com/s/1wxGlz)
* Win [FE-Builder-0.1.0-Win.zip](http://pan.baidu.com/s/1uvNaT)


## Todo List

* 界面优化
* ReadMe优化

