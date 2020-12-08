// 创建初始变量
function Mine(tr,td,mineNum){
    this.tr = tr;        //行数
    this.td = td;        //列数
    this.mineNum = mineNum;  //雷数    
    this.squares = [];   //用来存储所有方块的信息
    this.tds = [];       //存储所有单元格的Dom信息
    this.allRight = false;        //右击标的小红旗是否全是雷，用来判断游戏是否成功

    this.parent = document.querySelector('.gameBox');
}

//随机生成雷的位置
Mine.prototype.randomNum = function(){
    // 统计全部格子数
    var square = new Array(this.tr * this.td);
    for(var i=0 ; i<square.length ; i++){
        //生成0-783
        square[i] = i;
    }
    // 打乱数字
    square.sort(function(){return 0.5 - Math.random();});
    //返回前打乱后的前几个数字（随机生成雷的位置）
    return square.slice(0,this.mineNum);
}

//更新雷周围的数字
Mine.prototype.updateNum = function(){
    // 扫描全局
    for(var i=0 ; i<this.tr ; i++){
        for(var j=0 ; j<this.td ; j++){
            // 不是雷直接过
            if(this.squares[i][j].type == 'number'){
                continue;
            }
            // 发现雷 寻找该格子周围的8个宫格，让他的数值 +1
            var num = this.getAround(this.squares[i][j]);
            // 让不是雷的盒子的数字 +1
             for(var k=0 ; k<num.length ; k++){
                 this.squares[num[k][0]][num[k][1]].value += 1;
             }
        }
    }     
}

//找某个格子周围的8个方格
Mine.prototype.getAround = function(square){
    var x = square.x;
    var y = square.y;
    var result = [];

    for(var i=x-1 ; i<=x+1 ; i++){
        for(var j=y-1 ; j<=y+1 ; j++){
            // 跳过不是数字的盒子
            if(i<0 || j<0 || i>this.td-1 || j>this.tr-1 || (i==x && j==y) || this.squares[j][i].type == 'mine'){
                continue;
            }
            // 返回 x：j ,y:i 的值
            result.push([j,i]);
        }
    }
    return result;
}

//创建表格
Mine.prototype.createDom = function(){
    var This = this;
    // 创建表格
    var table = document.createElement('table');

    for(var i=0 ; i<this.tr ; i++){          
        //dom创建行
        var domTr = document.createElement('tr');
        // 记录行
        this.tds[i] = [];
        
        for(var j=0 ; j<this.td ; j++){
            // dom创建列
            var domTd = document.createElement('td');
            // 记录列
            this.tds[i][j] = domTd;

            domTd.pos = [i, j]; 
            //把格子对应的行与列存到格子上,为了下面通过这个值数组里取到对应的数据
            //绑定鼠标点击事件
            domTd.onmousedown = function(event){
                This.play(event,this);
            }
            // if(this.squares[i][j].type == 'mine'){
            //     domTd.className = 'mine';
            // }
            // if(this.squares[i][j].type == 'number'){
            //     domTd.innerHTML = this.squares[i][j].value;
            // }

            domTr.appendChild(domTd);
        }
        table.appendChild(domTr);
    }
    // 清楚游戏盒子原有的元素 ，避免出现多个游戏盒子
    this.parent.innerHTML = '';
    this.parent.appendChild(table);

}
// 玩游戏的函数
Mine.prototype.play = function(ev,obj){
    var This = this;
    console.log(ev.which);
    // 判断单击事件，并且不是标了红旗的格子
    if(ev.which == 1 && (obj.className != 'flag')){
        // 记录点击的盒子
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        // 设置格子数字的样式
        var cla = ['zero','one','two','three','four','five','six','seven','eight']
        // 该格子是数字不是雷
        if(curSquare.type == 'number'){
            // 设置点击后的样式和值
            obj.className = cla[curSquare.value];
            obj.innerHTML = curSquare.value;
            // 数字0设置不显示数字
            if(curSquare.value == 0){
                obj.innerHTML = '';

                getAll(curSquare);
                // 扫描数值为0的格子周围的格子，将还是0的格子全部显示出来
                function getAll(square){
                    // 获取他周围的8个格子
                    var around = This.getAround(square);
                    for(var i=0 ; i<around.length ; i++){
                        var x = around[i][0];
                        var y = around[i][1];
                        // tds存储的值
                        This.tds[x][y].className = cla[This.squares[x][y].value];
                        // 如果格子的值还是0 ，执行回调函数
                        if(This.squares[x][y].value == 0){
                            // 避免死循环
                            if(!This.squares[x][y].check){
                                // 不会扫描重复的格子
                                This.squares[x][y].check= true; 
                                getAll(This.squares[x][y]);
                            }
                        }else{
                            // 不是0直接显示值
                            This.tds[x][y].innerHTML = This.squares[x][y].value;
                        } 
                    }
                }
                
            }
        }else{       //点击的是雷，游戏结束
            this.gameOver(obj);
        }
            
    }

    //点击的是右键   点击时小红旗，小红旗可以取消
    if(ev.which == 3){
        // 判定右击的盒子是否是还没点击显示的格子
        if(obj.className && (obj.className != 'flag')){
            return false;
        }
        // 显示小红旗，若已经是小红旗。直接取消
        obj.className = obj.className == 'flag' ? '' : 'flag'
        // 判定右击的是不是雷
        if(this.squares[obj.pos[0]][obj.pos[1]].type == 'mine'){
            this.allRight = true;
            // 真实剩余雷数 --
            this.surpulsMine--;
        }else{
            this.allRight = false;
            this.surpulsMine++;
        }
        // 右击雷数的增加或者减少
        if(obj.className == 'flag'){
            this.mineNumDom.innerHTML--;
        }else{
            this.mineNumDom.innerHTML++;
        }

        if (this.mineNumDom.innerHTML == 0){
            //剩余雷的数量为0,证明用户已经标完小红旗,判断游戏是否游戏成功
            // 游戏成功函数
            if (this.allRight && (this.surpulsMine == 0)) {
                // 进入游戏成功函数 扫描全局 点过的方格不能再点击了，没有点击的方格还可以点击
                for(var i=0 ; i<this.tr ; i++){
                    for(var j=0 ; j<this.td ; j++){
                        if(this.tds[i][j].className){       
                            this.tds[i][j].onmousedown = null;
                        }         
                    }
                }
                setTimeout(() => {
                    alert('恭喜你,游戏通过')
                }, 100);
            }else {
                this.gameOver();
            }

        }


    }
}

//游戏失败函数
Mine.prototype.gameOver = function(clickTd){
    //1.显示所有的雷
    //2.取消所有格子的点击事件
    //3.给点中的雷标上红
    for(var i=0 ; i<this.tr ; i++){
        for(var j=0 ; j<this.td ; j++){
            if(this.squares[i][j].type == 'mine'){
                this.tds[i][j].className = 'mine';
            }

            this.tds[i][j].onmousedown = null;
        }
    }
    // 让点到的盒子标红，示意是这个雷爆炸了
    if(clickTd){
        clickTd.style.backgroundColor = 'red';
    }

    setTimeout(() => {
        alert('游戏失败');
    }, 100);
}

// 初始化函数
Mine.prototype.init = function(){
    // 生成随机雷的位置
    var ran = this.randomNum();
    var n = 0;
    for(var i=0 ; i<this.tr ; i++){          //行
        this.squares[i] = [];
        for(var j=0 ; j<this.td ; j++){       //列
            // 没有雷的下标返回 -1，则其下标为数字
            if(ran.indexOf(n++) == -1){
                this.squares[i][j] = {type:'number',x:j,y:i,value:0}
            }else{
                this.squares[i][j] = {type:'mine',x:j,y:i}  
            } 
        }
        
    }
    // 阻止游戏内的右击触发事件 (右击为标注雷)
    this.parent.oncontextmenu = function(){
        return false;
    }
    // 更新格子周围的数字
    this.updateNum();
    // 生成表格（游戏盒子）
    this.createDom();
    // 获取剩余雷数
    this.mineNumDom = document.querySelector('.minNum');
    this.mineNumDom.innerHTML = this.mineNum;
    this.surpulsMine = this.mineNum;   //真实剩余的雷数(一开始剩余雷数为全部)
}

var mine = null;
var btn = document.getElementsByTagName('button');
var arr = [[9,9,10],[16,16,40],[28,28,99]];

for(let i=0 ; i<btn.length-1 ; i++){
    btn[i].onclick = function(){

        mine = new Mine(...arr[i]);
        mine.init();
    }
}
btn[0].onclick();           //初始化初级

btn[3].onclick = function(){
    mine.init();
}

