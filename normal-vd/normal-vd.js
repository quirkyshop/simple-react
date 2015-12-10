// 最终实现官网最简示例
// React.createElement('ul', { className: 'my-list' }, child);
// ReactDOM.render(root, document.getElementById('example'));

// 内置的元素类,包含 类，属性，子元素 ReactElement.js
function ReactElement(type,key,props){
  this.type = type;
  this.key = key;
  this.props = props;
}


function ReactClass(spec){

}
ReactClass.prototype.render = function(){};




// 判断元素类型 instantiateReactComponent.js 58行
function instantiateReactComponent(node){	
	if(typeof node === 'string' || typeof node === 'number'){ // 文本节点
		return new ReactDOMTextComponent(node);
	}else if(typeof node ==='object'){ // 元素节点
		var element = node;
		if(typeof element.type === 'string'){
			return new ReactDOMComponent(element);
		}else if(typeof element.type === 'function'){
			return new ReactCompositeComponent(element);
		}	
	}
}

// 纯文本元素 ReactDOMTextComponent.js 40 这里省略了_stringText和_mountIndex
function ReactDOMTextComponent(txt){
	this._currentElement = '' + txt;
	this._rootNodeId = null;
	this._mountId = null;
}

// 对象元素 ReactDOMComponent.js 382  这里省略很多，少了对标签的判断,样式，事件的处理
function ReactDOMComponent(element){
    //存下当前的element对象引用
    this._currentElement = element;
    this._mountId = null;
    this._rootNodeID = null;
}

// 自定义元素 
function ReactCompositeComponent(element){
	this._currentElement = element;
	this._rootNodeId = null;
	this._mountId = null;
}

// ReactCompositeComponent.js 124 省略了对类型的判断，属性的过滤等等好多东西，简单实现
ReactCompositeComponent.prototype.mountComponent = function(rootId){	
	this._rootNodeId = rootId;
	var props = this._currentElement.props;
	var Component = this._currentElement.type;

	// 这里内部保存变量
	var inst;
	var renderedElement;
	inst = new Component(props);
	inst.props = props;

	// 相互保存引用关系
	this._instance = inst;
	inst._renderedElement = this;

	// 触发挂载前方法
	if(inst.componentWillMount){
		inst.componentWillMount();
	}

	// 递归到最后。render实际上返回到就是 原生支持的DOM集合，下面的做法就和ReactDOMComponent的做法完全一致
    renderedElement = inst.render();


    // 最终解析成所有浏览器支持的DOM，并输出DOM的字符串
    var renderedComponentInstance = instantiateReactComponent(renderedElement);
    this._renderedComponent = renderedComponentInstance; 
    var elementString = renderedComponentInstance.mountComponent(rootId);

	// 触发挂载完成方法
	if(inst.componentDidMount){
		inst.componentDidMount();
	}

	return elementString;
};

// Text只输出自身的字符串
ReactDOMTextComponent.prototype.mountComponent = function(rootId){
	this._rootNodeId = rootId;	

	// 这里简单输出span作为字符串的tag包裹
	var content = '<span data-react-id="' + rootId + '">'  + this._currentElement + "</span>";
	return content;

};

// ReactDOMComponent.js:416,TEXT 一样，选一个作参考即可,省略了owner,context的处理
ReactDOMComponent.prototype.mountComponent = function(rootId){
	this._rootNodeId = rootId;
	var tagOpen = "<" + this._currentElement.type + " ";
	var tagClose = "</" + this._currentElement.type + ">";

	// 模拟0.0.2.1那种根据层级生成的唯一id
	var elementString = tagOpen + 'data-react-id="' + this._rootNodeId + '"';

	var props = this._currentElement.props;
	for(var p in props){		

		if(p==='children'){
			continue;
		}

		elementString += ' ' + (p === 'className' ? 'class' : p )  + '="' +props[p]+ '" ';
	}
	elementString += '>';

	// 还需要往下遍历自身的子节点，获取全部的字符串
	// 遍历还要纪录一下子节点，方便之后渲染对比
	var childString = "";
	var tmpChildren = [];
	var childInstance;
	for(var i = 0,ln = props.children.length;i<ln;i++){
		childInstance = instantiateReactComponent(props.children[i]);
		childInstance._mountId = rootId; // 纪录父节点
		childInstance._rootNodeId = rootId + '.' + i; // 根据层级给点唯一id
		tmpChildren.push(childInstance);
		childString += ' ' + childInstance.mountComponent(childInstance._rootNodeId);
	}

	elementString += childString + tagClose;

	this._renderedChildren = tmpChildren;
	return elementString;
};

var Util = {
	isArray:function(arr){
		return Object.prototype.toString.call(arr) === '[object Array]';
	}
};

var React = {
	realRootId:0,

	// 创建 virtual DOM 元素
	createElement:function(type,props,children){

		// 这里的key用来生成DOM的id 如0.0.2.1,表示层级
		var key = props.key || null;

		if(children){ //如果传入了子元素们
			props.children = Util.isArray(children) ? children : [children];
		}
		return new ReactElement(type,key,props);
	},

    // ReactClass.js 684 这里弱化了构造器的概念，简单实现
	createClass:function(spec){
		var Constructor = function(props,updater){
			this.props = props;
			this.state = this.getInitialState ? this.getInitialState : null;
		};

	    Constructor.prototype = new ReactClass();
    	Constructor.prototype.constructor = Constructor;	

    	// 这里将spec的属性赋值给构造函数
    	for(var attr in spec){
			Constructor.prototype[attr] = spec[attr];			
		}				
		return Constructor;
	},

	// 用户调用渲染的方法
	render:function(element,container){		
		var instance = instantiateReactComponent(element);
		var elementString = instance.mountComponent(this.realRootId++);
		console.log("输出的结构:",elementString);
		container.innerHTML = elementString;
	}
};
