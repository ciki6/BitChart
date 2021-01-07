/**
 * @author 陆晓夫
 * @description 组件基类
 * @version 1.0
 * @date 2020/1/3
 */
class ComponentBase {
    /**
     * @constructor 组件基类构造函数
     * @param id {string} 组件id
     * @param code {string} 组件编码
     * @param container {HTMLElement} 组件容器
     * @param workMode {number} 组件工作模式 0为测试 1为大屏 2为配置工具 3为控制中心
     * @param option {Object} 组件属性
     * @param useDefaultOpt {boolean} 是否启用默认值
     */
    constructor(id, code, container, workMode, option = {}, useDefaultOpt = true) {
        this.id = id;
        this.code = code;
        this.container = container;
        this.workMode = workMode;
        this.useDefaultOpt = useDefaultOpt;
        this.propertyDictionary = []
        this._initProperty();
        this._initEvents();
        this._setupDefaultValues();
        this._initConf(option)
    }

    _initConf(option) {
        this.property = $.extend(true, this.property, option.property);
        this.dataBind = $.extend(true, this.dataBind, option.compDataBind);
        this.animation = _.union(this.animation, option.compAnimation);
        this.script = _.union(this.script, option.compScript);
        this.interact = $.extend(true, this.interact, option.compInteract);
        this.staticData = $.extend(true, this.staticData, option.compData);
        this._foldPath = WisUtil.scriptPath(this.property.basic.className);
        this._initConfHandler();
    }

    _initConfHandler() {
        this._compScriptHandler()
    }

    /**
     * @description 组件所需常量初始化
     */
    _setupDefaultValues() {
        //组件文件夹路径
    }

    /**
     * @description 初始化组件属性列表和属性字典
     */
    _initProperty() {
        //组件基础属性
        let property = {
            basic: {
                code: this.code,
                displayName: '',
                type: '',
                className: '',
                frame: [0, 0, 1920, 1080],
                isVisible: true,
                translateZ: true,
                needSync: false,
                zIndex: 0,
                //组件字体比例
                fontScale: 1,
                //是否发送数据
                isSendData: false,
                //是否有动画
                isAnimate: false
            }
        };

        //组件基础属性字典
        let propertyDictionary = [{
            name: 'basic',
            displayName: '基础属性',
            children: [{
                name: 'code',
                displayName: '组件编码',
                description: '组件编码',
                type: OptionType.string,
                show: true,
                editable: false
            }, {
                name: 'displayName',
                displayName: '组件名称',
                description: '组件名称',
                type: OptionType.string,
                show: true,
                editable: true
            }, {
                name: 'type',
                displayName: '组件类型',
                description: '组件类型',
                type: OptionType.string,
                show: true,
                editable: false
            }, {
                name: 'className',
                displayName: '组件类名',
                description: '组件类名',
                type: OptionType.string,
                show: true,
                editable: false
            }, {
                name: 'frame',
                displayName: '组件大小',
                description: '组件位置以及大小',
                type: OptionType.doubleArray,
                placeholder: ['x', 'y', '宽', '高'],
                show: true,
                editable: true
            }, {
                name: 'isVisible',
                displayName: '是否可见',
                description: '组件是否可见',
                type: OptionType.boolean,
                show: true,
                editable: true
            }, {
                name: 'translateZ',
                displayName: '启用Z轴位移',
                description: '是否启用Z轴位移(启用分层渲染)',
                type: OptionType.boolean,
                show: true,
                editable: true
            }, {
                name: 'needSync',
                displayName: '是否同步',
                description: '跨屏组件是否启动事件同步',
                type: OptionType.boolean,
                show: true,
                editable: true
            }, {
                name: 'zIndex',
                displayName: '组件层级',
                description: '组件的所在画布的层级',
                type: OptionType.int,
                show: true,
                editable: true
            }, {
                name: 'isSendData',
                displayName: '是否发送数据',
                description: '组件在接收到数据后是否发送数据',
                type: OptionType.boolean,
                show: true,
                editable: true
            }, {
                name: 'isAnimate',
                displayName: '是否有动画',
                description: '当前组件是否绑定动画',
                type: OptionType.boolean,
                show: true,
                editable: true
            }],
            show: true,
            editable: true
        }]

        this._addProperty(property, propertyDictionary);
    }

    _initEvents() {
        //事件方法
        this.eventFunc = [{
            name: 'sendData',
            displayName: '发送数据',
            params: [{
                name: 'data',
                displayName: '数据',
            }],
        }];
        //可调用方法
        this.invokeFunc = [{
            name: 'setProperty',
            displayName: '配置属性',
            params: [{
                name: 'name',
                displayName: '属性名',
                type: 'option'
            }, {
                name: 'value',
                displayName: '属性值',
                type: 'optionType'
            }]
        }];
    }

    /**
     * @description 新增属性
     * @param property
     * @param propertyDictionary
     */
    _addProperty(property, propertyDictionary) {
        this.property = $.extend(true, this.property, property);
        this.propertyDictionary = this.propertyDictionary.concat(propertyDictionary);
    }

    /**
     * @description 通过属性名称获取属性字典的对象
     * @param propertyName 属性名称
     * @returns {JSON} 属性字典对象
     */
    _findPropertyDictionary(propertyName) {
        return WisCompUtil.findPropertyDictionary(propertyName, this.propertyDictionary)
    }

    /**
     * @description 设置属性
     * @param {{}} property 属性列表||属性名
     * @param {any} value 属性值
     */
    setProperty(property, value = null) {
        if (value !== null) {
            property = this._propertyNameToJson(property, value);
        }
        this.property = $.extend(true, this.property, property);

        this._draw()
    }

    /**
     * @description 将string类型的propertyName转化为object
     * @param propertyName {{}} 属性名称
     * @param value {any} 属性值
     * @returns {{}}
     */
    _propertyNameToJson(propertyName, value) {
        let propertyArr = propertyName.split('.');
        let propertyObj = {};
        let idx = propertyArr.length - 1;
        while (idx > -1) {
            let temp = {};
            if (idx === propertyArr.length - 1) {
                temp[propertyArr[idx]] = value
            } else {
                temp[propertyArr[idx]] = propertyObj;
            }
            propertyObj = temp;
            idx--;
        }
        return propertyObj
    }

    /**
     * @description 设置数据绑定
     * @param {string} key 数据绑定的key
     * @param {JSON} value 数据绑定key的内容
     */
    setDataBind(key, value) {
        this.dataBind[key] = value
    }

    /**
     * @description 设置组件动画
     */
    _compAnimationHandler() {

    }

    /**
     * @description 设置组件脚本
     */
    _compScriptHandler() {
        this.script.forEach(scriptObj => {
            console.log(`组件${this.id}绑定脚本${scriptObj.displayName}`);
            switch (scriptObj.trigger) {
                case 'click':
                    d3.select(this.container).on('click', function () {
                        eval(scriptObj.content)
                    })
                //todo 其他触发方式
            }
        })
    }

    /**
     * @description 设置组件交互
     */
    _compInteractHandler() {

    }

    /**
     * @description 设置组件静态数据
     */
    setStaticData() {

    }

    /**
     * @description 绘制容器样式
     */
    _draw() {
        let d3Container = d3.select(this.container);
        d3Container
            .style('display', this.property.basic.isVisible ? 'block' : 'none')
            .style('z-index', this.property.basic.zIndex);
        if (this.property.basic.translateZ) {
            d3Container
                .style('transform', 'translateZ(0)');
        }
    }

    /**
     * @description 清空组件内部的数据订阅ws以及数据同步ws
     */
    cleanup() {
        this.unsubscribeDataSource();
        if (this.webSocket) {
            this.webSocket.close();
            this.webSocket.heartBeatIntervaler && clearInterval(this.webSocket.heartBeatIntervaler);
            this.webSocket = null;
        }
    }

    /**
     * @description 当组件跨屏时创建组件的clipRect以及组件跨屏事件同步ws的初始化
     * @param clipRect
     */
    setClipRect(clipRect) {
        this.clipRect = clipRect;
        if (this.property.basic.needSync) {
            this._createClipRect();
            this._initEventSync();
        }
    }

    /**
     * @description 创建组件的clipRect的dom元素
     * @private
     */
    _createClipRect() {

    }

    /**
     * @description 初始化事件同步
     * @private
     */
    _initEventSync() {
        if (!this.webSocket) {
            this.webSocket = centralManager.eventSynchronization(this.property.basic.id, (data) => {
                this._eventSyncProcess(data);
            });
        }
    }

    /**
     * @description 组件通过ws广播信息
     * @param message {string} 需要广播的信息
     */
    _sendMessageByWS(message) {
        let centralManager = window.centralManager;
        let webSocket = this.webSocket;

        centralManager.sendMessage(webSocket, message);
    }

    /**
     * @description 事件同步执行方法
     * @param data
     * @private
     */
    _eventSyncProcess(data) { }

    /**
     * @description 订阅数据源
     * @param processFunction {callback} 订阅数据源后的回调
     */
    subscribeDataSource(processFunction) {
        //如果dataBind为空则不订阅数据
        if (this.dataBind === {} || window.sceneHasEnterAnimation) return;
        window.wiscomWebSocket.subscribeData(this.id, this.code, (data) => {
            console.info("subscribeDataSource", "data received");
            //首次订阅返回OK表示订阅成功，否则在7s后会重新订阅
            if (data.body === 'OK') {
                this.isSubscribeData = true;
                return;
            }
            if (this.property.basic.isSendData) {
                this.postData(JSON.parse(data.body), 'sendData')
            }
            if (processFunction) {
                processFunction(data);
            }
            if (this.workMode === 3) {
                this.unsubscribeDataSource();
                this.unsubscribeDataByClient();
            }
        });
        setTimeout(() => {
            if (!this.isSubscribeData) {
                this.subscribeDataSource(processFunction)
            }
        }, 7000)
    }

    /**
     * @description 组件反订阅数据源
     */
    unsubscribeDataSource() {
        window.wiscomWebSocket && window.wiscomWebSocket.unsubscribeData(this.id, this.code);
    }

    /**
     * @description 通过客户端反订阅数据源
     */
    unsubscribeDataByClient() {
        window.wiscomWebSocket && window.wiscomWebSocket.unsubscribeDataByClient(this.id, this.code);
    }

    postData(data, eventName) {
        let eventActions = this._getActionByEventName(eventName);
        if (eventActions) {
            let actions = this._processActions(eventActions, data);
            let message = { "targetId": this.id, "actions": actions };
            window.WisActionLoader.sendActionMessage(message);
        } else {
            console.warn("postData", "can not find handler for " + eventName);
        }
    }

    _processActions(actions, data) {
        let oldActions = WisUtil.deepCopy(actions);
        oldActions.forEach(function (action) {
            let oldParam = action.compParams;
            action.compParams = [];
            oldParam.forEach(function (param) {
                let evalString = param;
                evalString = evalString.replace(/@data/g, "\"+data");
                evalString = evalString.replace(/@/g, "+\"");
                evalString = "\"" + evalString + "\"";
                let result = eval(evalString);
                action.compParams.push(result);
            });
        });
        let result = [];
        oldActions.forEach(action => {
            for (let i = 0; i < action.compList.length; i++) {
                result.push({
                    performerId: action.compList[i].compCode,
                    param: action.compParams,
                    functionName: action.eventName
                })
            }
        })
        return result;
    }

    _getActionByEventName(eventName) {
        let custom = this.interact.custom;
        if (custom.hasOwnProperty(eventName)) {
            let actions = [];
            for (let i = 0; i < custom[eventName].length; i++) {
                actions = [...actions, ...custom[eventName][i].actions]
            }
            return actions;
        }
        return null
    }
}

/**
 * @class SVGComponentBase
 * @extends ComponentBase
 * @description svg组件基类
 */
class SVGComponentBase extends ComponentBase {
    /**
     * @constructor SVG组件基类构造函数
     * @param id {string} 组件id
     * @param code {string} 组件编码
     * @param container {HTMLElement} 组件容器
     * @param workMode {number} 组件工作模式 0为测试 1为大屏 2为配置工具 3为控制中心
     * @param option {JSON} 组件属性
     * @param useDefaultOpt {boolean} 是否启用默认属性
     */
    constructor(id, code, container, workMode, option, useDefaultOpt) {
        super(id, code, container, workMode, option, useDefaultOpt);
    }

    /**
     * @description 组件所需常量初始化
     */
    _setupDefaultValues() {
        super._setupDefaultValues();
    }


    /**
     * @description 初始化组件属性列表和属性字典
     */
    _initProperty() {
        super._initProperty();
        let property = {
            basic: {
                type: 'SVGComponent'
            },
            svgBasic: {
                isViewBox: true,
                lockViewBox: false,
                viewBox: [0, 0, 1920, 1080]
            }
        }

        let propertyDictionary = [{
            name: 'svgBasic',
            displayName: 'SVG组件基础属性',
            children: [{
                name: 'isViewBox',
                displayName: '启用ViewBox',
                description: '组件是否启用ViewBox',
                type: OptionType.boolean,
                show: true,
                editable: true
            }, {
                name: 'lockViewBox',
                displayName: '锁定ViewBox',
                description: '组件ViewBox是否与宽高绑定',
                type: OptionType.boolean,
                show: true,
                editable: true
            }, {
                name: 'viewBox',
                displayName: '可视区域',
                description: '可视区域大小',
                placeholder: ['x', 'y', '宽', '高'],
                type: OptionType.doubleArray,
                show: true,
                editable: true
            }],
            show: true,
            editable: true
        }];

        this._addProperty(property, propertyDictionary)
    }

    /**
     * @description 绘制容器样式
     */
    _draw() {
        super._draw();
        if (this.property.svgBasic.lockViewBox) {
            this.property.svgBasic.viewBox.editable = false;
            this.property.svgBasic.viewBox = [0, 0, this.property.basic.frame[2], this.property.basic.frame[3]]
        }
        let d3Container = d3.select(this.container);
        d3Container.select('svg').remove();
        this.mainSVG = d3Container.append('svg')
            .attr('class', 'mainSVG')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.property.basic.frame[2])
            .attr('height', this.property.basic.frame[3])
            .attr('viewBox', this.property.svgBasic.isViewBox ? this.property.svgBasic.viewBox.join(' ') : '');
    }

    /**
     * @description 创建组件的clipRect的dom元素
     * @private
     */
    _createClipRect() {
        let clipID = this.property.basic.id + "_clip";
        this.mainSVG.append("defs")
            .append("svg:clipPath")
            .attr("id", clipID)
            .append("svg:rect")
            .attr("id", "clip-rect")
            .attr("x", this.clipRect[0])
            .attr("y", this.clipRect[1])
            .attr("width", this.clipRect[2])
            .attr("height", this.clipRect[3]);

        this.mainSVG.attr("clip-path", "url(#" + clipID + ")");
    }
}

/**
 * @class DIVComponentBase
 * @extends ComponentBase
 * @description div组件基类
 */
class DIVComponentBase extends ComponentBase {
    /**
     * @constructor SVG组件基类构造函数
     * @param id {string} 组件id
     * @param code {string} 组件编码
     * @param container {HTMLElement} 组件容器
     * @param workMode {number} 组件工作模式 0为测试 1为大屏 2为配置工具 3为控制中心
     * @param option {JSON} 组件属性
     * @param useDefaultOpt {boolean} 是否启用默认属性
     */
    constructor(id, code, container, workMode, option, useDefaultOpt) {
        super(id, code, container, workMode, option, useDefaultOpt);
    }

    /**
     * @description 组件所需常量初始化
     */
    _setupDefaultValues() {
        super._setupDefaultValues();
    }


    /**
     * @description 初始化组件属性列表和属性字典
     */
    _initProperty() {
        super._initProperty();
        let property = {
            basic: {
                type: 'DIVComponent'
            }
        }

        let propertyDictionary = [];

        this._addProperty(property, propertyDictionary)
    }

    /**
     * @description 绘制容器样式
     */
    _draw() {
        super._draw();
        let d3Container = d3.select(this.container);
        d3Container.select('.mainDIV').remove();
        this.mainDIV = d3Container.append('div')
            .attr('class', 'mainDIV')
            .style('position', 'absolute')
            .style('left', '0')
            .style('top', '0')
            .style('width', `${this.property.basic.frame[2]}px`)
            .style('height', `${this.property.basic.frame[3]}px`)
            .style('overflow', 'hidden');
    }
}

/**
 * @class DIVContainerBase
 * @extends DIVComponentBase
 * @description 容器组件基类
 */
class DIVContainerBase extends DIVComponentBase {
    /**
     * @constructor SVG组件基类构造函数
     * @param id {string} 组件id
     * @param code {string} 组件code
     * @param container {HTMLElement} 组件容器
     * @param workMode {number} 组件工作模式 0为测试 1为大屏 2为配置工具 3为控制中心
     * @param option {JSON} 组件属性
     * @param useDefaultOpt {boolean} 是否启用默认属性
     */
    constructor(id, code, container, workMode, option, useDefaultOpt) {
        super(id, code, container, workMode, option, useDefaultOpt);
    }

    /**
     * @description 组件所需常量初始化
     */
    _setupDefaultValues() {
        super._setupDefaultValues();
        //容器内组件列表
        this.childrenComponents = [];
    }


    /**
     * @description 初始化组件属性列表和属性字典
     */
    _initProperty() {
        super._initProperty();
        let property = {
            basic: {
                type: 'container'
            },
            panel: {},
            containerJson: []
        }

        let propertyDictionary = [{
            name: 'panel',
            displayName: '面板组',
            action: [{
                text: '新增',
                style: 'success',
                action: 'addPanel',
                param: []
            }],
            children: [],
            show: true,
            editable: true
        }];

        this.panelProperty = {
            panelName: '',
            panelFrame: [0, 0, 100, 100],
            panelBgImage: '',
        };

        this.panelPropertyDictionary = [{
            name: 'panelName',
            displayName: '面板名称',
            description: '面板名称',
            type: OptionType.string,
            show: true,
            editable: true
        }, {
            name: 'panelFrame',
            displayName: '面板大小',
            description: '面板位置以及大小',
            type: OptionType.doubleArray,
            placeholder: ['x', 'y', '宽', '高'],
            show: true,
            editable: false
        }, {
            name: 'panelBgImage',
            displayName: '面板背景',
            description: '面板背景图',
            type: OptionType.string,
            show: true,
            editable: true
        }]

        this._addProperty(property, propertyDictionary)
    }

    /**
     * @description 绘制容器样式
     */
    _draw() {
        super._draw();
        this._initPanelPropertyDictionary();
    }

    /**
     * @description 获取容器内所有子组件
     * @returns {null}
     */
    getAllChildren() {
        return this.childrenComponents
    }

    /**
     * @description 清空组件信息 清空容器内所有组件的组件信息
     */
    cleanup() {
        super.cleanup();
        let children = this.getAllChildren();
        if (children && children.length > 0) {
            children.forEach(function (component) {
                component.cleanup();
            });
            children = null;
        }
    }

    /**
     * @description 每次绘制面板时初始化面板属性字典
     * @private
     */
    _initPanelPropertyDictionary() {
        let panelProperty = this.property.panel;
        let panelPropertyDictionary = this._findPropertyDictionary('panel');
        for (const panelId in panelProperty) {
            //判断面板属性字典中是否含有该面板id的字典，若没有则新增
            if (panelProperty.hasOwnProperty(panelId) && this._findPropertyDictionary(`panel.${panelId}`) === undefined) {
                panelPropertyDictionary.children.push({
                    name: panelId,
                    displayName: panelId,
                    action: [{
                        text: '删除组',
                        style: 'warning',
                        action: 'deletePanel',
                        param: ['parentIndex']
                    }],
                    children: WisUtil.deepCopy(this.panelPropertyDictionary),
                    show: true,
                    editable: true
                })
            }
        }
    }

    /**
     * @description 新增面板
     */
    addPanel() {
        let panelPropertyDictionary = this._findPropertyDictionary('panel');
        let lastIndex = 0;
        if (panelPropertyDictionary.children.length > 0) {
            lastIndex = parseInt(d3.max(panelPropertyDictionary.children.map(d => d.name.split('_')[1]))) + 1;
        }
        let panelName = `panel_${lastIndex}`;
        this.property.panel[panelName] = WisUtil.deepCopy(this.panelProperty);
        panelPropertyDictionary.children.push({
            name: panelName,
            displayName: panelName,
            action: [{
                text: '删除组',
                style: 'warning',
                action: 'deletePanel',
                param: ['parentIndex']
            }],
            children: WisUtil.deepCopy(this.panelPropertyDictionary),
            show: true,
            editable: true
        })
    }

    /**
     * @description 删除面板
     * @param index {number} 面板序号
     */
    deletePanel(index) {
        let panelPropertyDictionary = this._findPropertyDictionary('panel');
        let panelName = panelPropertyDictionary.children[index].name;
        //删除optionDic中panel的对应项
        panelPropertyDictionary.children.splice(index, 1);
        //删除opts中的panel的项
        delete this.property.panel[panelName];
        //删除ContainerJson中的对应项
        for (let i = 0; i < this.property.containerJson.length; i++) {
            if (this.property.containerJson[i].paneId === panelName) {
                this.property.containerJson.splice(i, 1);
                break;
            }
        }
    }

    /**
     * @description 注入容器的子组件
     * @param containerJson {array} 容器的containerJson对象
     * @param index {number|null} 更新的序号
     */
    setChildrenComponents(containerJson, index = null) {
        this.containerJson = containerJson;
        this._loadComponentsFromJson(index);
    }

    /**
     * @description 从组建的containerJson中加载容器内组建
     * @param {number|null} index
     */
    _loadComponentsFromJson(index = null) {
        if (typeof index !== 'number') {
            index = parseInt(index)
        }
        let childrenComponents = [];
        for (let i = 0; i < this.containerJson.length; i++) {
            let info = this.containerJson[i];
            let container = this.mainDIV.select(`.panel_${i}`);
            if (info.paneId === `panel_${i}`) {
                $(container.node()).empty();
                if (info.children.length > 0) {
                    let compList = new ComponentsFactory(info.children, container, this.workMode);
                    if (this.workMode === 1) {
                        // window.screenOverload.screenManager._bindEvents(info.children);
                    }
                    compList.components.forEach(comp => {
                        // if (this.clipRect) {
                        // let comClipRect = window.screenOverload.screenManager._getClipFrame([comp.property.basic.frame[0] + this.property.basic.frame[0], comp.property.basic.frame[1] + this.property.basic.frame[1], comp.property.basic.frame[2], comp.property.basic.frame[3]], window.screenOverload.dimension);
                        // comp.setClipRect(comClipRect);
                        // }
                        childrenComponents.push(comp)
                    })
                    this.childrenComponents = childrenComponents;
                }
            }
        }
    }
}

class MapWidget extends DIVComponentBase {
    constructor(id, code, container, workMode, option, useDefaultOpt) {
        super(id, code, container, workMode, option, useDefaultOpt);


        window.initAPIPromise.then(() => {
            this._initEventSync();
        })
    };

    /**
     * @description 初始化组件属性列表和属性字典
     */
    _initProperty() {
        super._initProperty();
        let property = {
            basic: {
                type: 'map'
            }
        }
        this._addProperty(property, [])
    }

    _draw() {
        super._draw();
        this._generateBasicDIV();
    }

    _generateBasicDIV() { }

}

/**
 * @description 自定义组件基类
 */
class CustomComponent {
    /**
     * @description 自定义组件基类构造函数
     * @param id {string} 组件id
     * @param code {string} 组件编码
     * @param container {HTMLElement} 组件容器
     * @param workMode {number} 组件工作模式
     * @param option {Object} 组件属性
     * @param useDefaultOpt {boolean} 是否启用默认值
     */
    constructor(id, code, container, workMode, option, useDefaultOpt) {
        this.id = id;
        this.code = code;
        this.container = container;
        this.workMode = workMode;
        this.useDefaultOpt = useDefaultOpt;
        this.propertyDictionary = []
        this._initProperty();
        this.property = $.extend(true, this.property, option.property);
        this._draw()
    }

    _initProperty() {
        let property = {
            basic: {
                code: this.code,
                displayName: '',
                type: 'custom',
                className: '',
                frame: [0, 0, 1920, 1080],
                isVisible: true,
                translateZ: true,
                needSync: false,
                zIndex: 0,
                //组件字体比例
                fontScale: 1,
            },
            childComp: []
        };

        //组件基础属性字典
        let propertyDictionary = [{
            name: 'basic',
            displayName: '基础属性',
            children: [{
                name: 'code',
                displayName: '组件编码',
                description: '组件编码',
                type: OptionType.string,
                show: true,
                editable: false
            }, {
                name: 'displayName',
                displayName: '组件名称',
                description: '组件名称',
                type: OptionType.string,
                show: true,
                editable: true
            }, {
                name: 'type',
                displayName: '组件类型',
                description: '组件类型',
                type: OptionType.string,
                show: true,
                editable: false
            }, {
                name: 'className',
                displayName: '组件类名',
                description: '组件类名',
                type: OptionType.string,
                show: true,
                editable: false
            }, {
                name: 'frame',
                displayName: '组件大小',
                description: '组件位置以及大小',
                type: OptionType.doubleArray,
                placeholder: ['x', 'y', '宽', '高'],
                show: true,
                editable: true
            }, {
                name: 'isVisible',
                displayName: '是否可见',
                description: '组件是否可见',
                type: OptionType.boolean,
                show: true,
                editable: true
            }, {
                name: 'translateZ',
                displayName: '启用Z轴位移',
                description: '是否启用Z轴位移(启用分层渲染)',
                type: OptionType.boolean,
                show: true,
                editable: true
            }, {
                name: 'needSync',
                displayName: '是否同步',
                description: '跨屏组件是否启动事件同步',
                type: OptionType.boolean,
                show: true,
                editable: true
            }, {
                name: 'zIndex',
                displayName: '组件层级',
                description: '组件的所在画布的层级',
                type: OptionType.int,
                show: true,
                editable: true
            }],
            show: true,
            editable: true
        }]

        this._addProperty(property, propertyDictionary);
    }

    /**
     * @description 新增属性
     * @param property
     * @param propertyDictionary
     */
    _addProperty(property, propertyDictionary) {
        this.property = $.extend(true, this.property, property);
        this.propertyDictionary = this.propertyDictionary.concat(propertyDictionary);
    }

    _draw() {
        let d3Container = d3.select(this.container);
        if (!d3Container.select(`#comp${this.id}`).empty()) {
            d3Container.select(`#comp${this.id}`).remove()
        }
        d3Container.append('div')
            .attr('id', `comp${this.id}`)
            .style('width', this.property.basic.frame[2])
            .style('height', this.property.basic.frame[4])
            .style('display', this.property.basic.isVisible ? 'block' : 'none')
            .style('z-index', this.property.basic.zIndex);
        if (this.property.basic.translateZ) {
            d3Container.style('transform', 'translateZ(0)');
        }
        this._generateChildrenComp()
    }

    _generateChildrenComp() {
        this.childrenComponents = [];
        this.property.childComp.forEach(compOpt => {
            let className = compOpt.property.basic.className;
            let code = compOpt.property.basic.code;
            let container = d3.select(this.container)
                .select('div')
                .append('div')
                .attr('id', `comp_${this.id}_${code}`)
                .style('position', 'absolute')
                .style('left', `${compOpt.property.basic.frame[0]}px`)
                .style('top', `${compOpt.property.basic.frame[1]}px`)
                .style('width', `${compOpt.property.basic.frame[2]}px`)
                .style('height', `${compOpt.property.basic.frame[3]}px`)
                .node()
            let comp = eval(`new ${className}(this.id,code,container, this.workMode, compOpt, false)`)
            this.childrenComponents.push(comp)
        })
    }

    setProperty(property) {
        // let scale = d3.min([property.basic.frame[2] / this.property.basic.frame[2], property.basic.frame[3] / this.property.basic.frame[3]])
        // scale = Math.round(scale * 100) / 100;
        let widthScale = property.basic.frame[2] / this.property.basic.frame[2];
        let heightScale = property.basic.frame[3] / this.property.basic.frame[3];
        widthScale = Math.round(widthScale * 100) / 100;
        heightScale = Math.round(heightScale * 100) / 100;
        //依次获取childComp下所有子组件的frame中的每个值并乘scale
        for (let i = 0; i < this.property.childComp.length; i++) {
            this.property.childComp[i].property.basic.frame[2] *= widthScale;
            this.property.childComp[i].property.basic.frame[3] *= heightScale;
            // for (let j = 0; j < this.property.childComp[i].property.basic.frame.length; j++) {
            //     this.property.childComp[i].property.basic.frame[j] *= scale
            //     this.property.childComp[i].property.basic.frame[j] = Math.round(this.property.childComp[i].property.basic.frame[j] * 100) / 100;
            // }
        }
        this.property = $.extend(true, this.property, property);
        this._draw()
    }

    cleanup() {
        this.childrenComponents.forEach(comp => comp.cleanup())
    }
}

/**
 * @description echarts组件基类
 */
class EchartsComponent {
    constructor(id, code, container, workMode, option) {
        this.id = id;
        this.code = code;
        this.container = container;
        this.workMode = workMode;
        this.propertyDictionary = [];
        this._initProperty();
        this.property = $.extend(true, this.property, option.property);
        this._draw()
    }

    _initProperty() {
        let property = {
            basic: {
                code: this.code,
                displayName: '',
                type: 'echarts',
                className: '',
                frame: [0, 0, 1920, 1080],
                isVisible: true,
                translateZ: true,
                needSync: false,
                zIndex: 0,
                //组件字体比例
                fontScale: 1,
            },
            echartsOption: {}
        };
    }
}
