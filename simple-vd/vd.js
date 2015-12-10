// 最终实现官网最简示例
// React.createElement('ul', { className: 'my-list' }, child);
// ReactDOM.render(root, document.getElementById('example'));

// 内置的元素类,包含 类，属性，子元素 ReactElement.js
function ReactElement(type,key,props){
  this.type = type;
  this.key = key;
  this.props = props;
}

// 判断元素类型 instantiateReactComponent.js 58行
function instantiateReactComponent(node){	
	console.log(node,(typeof node));
	if(typeof node === 'string' || typeof node === 'number'){ // 文本节点
		return new ReactDOMTextComponent(node);
	}else if(typeof node ==='object'){ // 元素节点
		return new ReactDOMComponent(node);
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
    this._rootNodeId = null;
}

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

	// 用户调用渲染的方法
	render:function(element,container){		
		var instance = instantiateReactComponent(element);
		var elementString = instance.mountComponent(this.realRootId++);
		container.innerHTML = elementString;
	}
};
