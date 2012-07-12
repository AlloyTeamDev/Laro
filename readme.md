#Laro#
A Game Engine base on Html5 :)

By [Tencent AlloyTeam](http://www.AlloyTeam.com/)

## Examples ##
查看以下demo最好使用chrome  : )

http://hongru.github.com/proj/laro/examples/emberwind/

http://hongru.github.com/proj/laro/examples/typeshot/index.html

http://hongru.github.com/proj/laro/examples/jxhome/

http://heroes.github.com/world-of-heroes/development/

## Test cases ##
* [Canvas Transform](http://hongru.github.com/proj/laro/test/canvas.transform.html)
* [Chaikin Curve](http://hongru.github.com/proj/laro/test/laro.chaikin_curve.html)
* [Laro Animation](http://hongru.github.com/proj/laro/test/laro.animation.html)
* [Laro Background](http://hongru.github.com/proj/laro/test/laro.background.html)
* [Laro Animation 2](http://hongru.github.com/proj/laro/test/laro.fighter2.html)
* [Laro Resource Loader](http://hongru.github.com/proj/laro/test/laro.resource.html)
* [Laro input.animation](http://hongru.github.com/proj/laro/test/laro.input.animation.html)
* [Collision - LineSegment](http://hongru.github.com/proj/laro/test/lineSegment.test.html)
* [Collision - Simple Test](http://hongru.github.com/proj/laro/test/laro.collision.test2.html)
* [Collision - Collision With Param](http://hongru.github.com/proj/laro/test/laro.collision.test3.html)
* [A* demo](http://hongru.github.com/proj/laro/test/laro.astar.html)

## Introduction ##
随着html5 相关技术的兴起，因其跨平台的特性，和标准的日益完善。html5相关技术越来越多的被应用到前沿app的开发中，尤其是html5 小游戏的开发。

Laro 是一个基于html5 canvas的用于平面2d或者2.5d游戏制作的轻量级游戏引擎。

因为当前canvas作为画布形态的dom元素，并提供了大量关于矢量图以及texture绘制的api，但是由于其本身提供的api太过于底层，在类似游戏这一类交互性，逻辑性较为复杂的app时。需要开发者编写大量底层的api来实现本身的业务逻辑。

Laro出现的目的是为了简化使用canvas制作游戏时的api调用。同时提供了一套“有限状态机”的开发模式，这种模式在对于游戏这一类的典型的“事件驱动”的模型的开发上。能够很好的做到模块间的低耦合，利于开发者梳理整个开发逻辑。

Laro 游戏引擎目前已经完成了游戏开发中所需要的模块和api的封装，并有一些实际的Demo和TestCase供使用者参考。而且随后会结合这个引擎整理出一套用于html5 小游戏开发的可视化编辑工具。 旨在帮助开发者更快更容易的搭建一款小游戏为目的。

目前已经开源到github （https://github.com/AlloyTeam/Laro）

我们团队希望通过Laro的不断完善，能够帮助更多的html5 小游戏开发者以更快的速度，更优的质量完成 html5小游戏 产业化的开发。

#### Version Log ####
- 0.1 - 基础模块搭建
- 0.2 - 融入jcanvas，配合鼠标事件处理
- 0.3 - 加强状态机模块
 