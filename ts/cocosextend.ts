import { Mask, UIOpacity, log, Prefab } from "cc";
import { Widget } from "cc";
import { HorizontalTextAlignment } from "cc";
import { Tween } from "cc";
import { instantiate } from "cc";
import { ProgressBar } from "cc";
import { Material } from "cc";
import { Toggle } from "cc";
import { RichText } from "cc";
import { EditBox } from "cc";
import { Director,find, LabelOutline, resources, Button, SpriteFrame, Sprite, error, Node,Label,isValid, v2, v3, Vec3, Vec2, Color, Size, Rect, Component, UITransform, ScrollView } from "cc";
import { ResMapping } from "../common/resmapping";
import {enc, dec} from "../encryptjs/simpleencdec"
import { CompEvent } from "./compevent";
import { SceneManager } from "./scene/scenemgr";

/**
 * Note: The original script has been commented out, due to the large number of changes in the script, there may be missing in the conversion, you need to convert it manually
 */
let jsonCache:any = {}
let w :any= window
if (!w.fgResource) w.fgResource = {};
fgResource.fgGetJson = function (path?:any, cb?:any, noCahce:any = false) {
    if (!noCahce && jsonCache[path]) {
        cb(undefined, jsonCache[path])
        return
    }
    resources.load(path, function (err?:any, data?:any) {
        if (err) {
            cb(err)
        } else {
            if (data.json.high_tech_kkks399rkcmslck32i_private_enc) {
                let str = dec(data.json.enc, "jlsdxcmn324jal32")
                data.json = JSON.parse(str)
            }
            if (!noCahce) {
                jsonCache[path] = data
            }
            cb(undefined, data)
        }
    });
}

fgResource.fgClearJsonCache = function () {
    jsonCache = {}
}

function toHex(num?:any) {
    let hexString = num.toString(16);
    if (hexString.length % 2) {
        hexString = "0" + hexString;
    }
    return hexString;
}

function showChildrenGray(widget?:any, isGray?:any) {
    if (widget.children.length <= 0) return;
    for (let i = 0; i < widget.children.length; i++) {
        let child = widget.children[i];
        let _label = child.getComponent(Label);
        if (_label) {
            _label.showAsGray(isGray, ccc4(254, 254, 254, 255));
            let _outLine = child.getComponent(LabelOutline);
            if (_outLine) {
                _outLine.showAsGray(isGray);
            }
            continue;
        }
        let _button = child.getComponent(Button);
        if (_button) {
            _button.showAsGray(isGray);
            continue;
        }
        let _sprite = child.getComponent(Sprite);
        if (_sprite) {
            _sprite.showAsGray(isGray);
            continue;
        }
        if (child.children.length > 0) {
            showChildrenGray(child, isGray);
        }
    }
}

function getGraySpritePath(Button?:any) {
    let component = findBtnBgComponent(Button);

    if (!component || !component.spriteFrame) {//避免按钮误操作程序崩溃
        return false;
    }
    let name = component.spriteFrame.name
    let tmp = name.split("_");
    if (tmp.length != 3) {
        return false
    }
    if ((tmp[1] != "max" && tmp[1] != "big" && tmp[1] != "mid" && tmp[1] != "min" && tmp[1] != "small") || tmp[2] == "gray") {
        return false;
    }
    Button.originSpriteSize = tmp[1];
    Button.originSpriteColor = tmp[2];
    return "cdnRes/ui/common_btn/" + tmp[0] + "_" + tmp[1] + "_gray";
}

function findBtnBgComponent(Button?:any) {
    let component = Button.node.getComponent(Sprite);
    if (!component) {//spirte不绑定在button上
        for (let i = 0; i < Button.node.children.length; i++) {
            let child = Button.node.children[i];
            let tmpComp = child.getComponent(Sprite);
            if (tmpComp) {
                let name = tmpComp._spriteFrame.name;
                let tmp = name.split("_");
                if (tmp[0] == "btn" && tmp.length == 3) {//确定是btn_xx_xx样式
                    component = tmpComp;
                    break;
                }
            }
        }
    }
    return component;
}


w.isEmptyObject = (obj?:any) => {
    let name;
    for (name in obj) {
        return false;
    }
    return true;
}

// w.clone = (obj?:any) => {
//     return JSON.parse(JSON.stringify(obj))
// }
w.assert = function (v?:any, msg?:any) {
    if (!v) {
        error(msg);
    }
}

w.rawget = function (t?:any, k?:any) {
    return t[k]
}

w.rawset = function (t?:any, k?:any, v?:any) {
    t[k] = v
}

w.handler = function (target?:any, func?:any) {
    return function () {
        func.apply(target, arguments);
    }
}

w.oldRichToNew = function (text?:any) {
    let oldText = text;
    text = text.replace(/\n/g, "ddccaaee0923ll")
    let r = new RegExp("<prefix>(.+)</prefix>", "g")
    let m:any = r.exec(text)
    if (!m) {
        r = new RegExp("<root>(.+)</root>", "g")
        m = r.exec(text)
    }
    if (m) {
        r = new RegExp("(<text.*?/>)+?", "g");
        m = m[1].match(r)
        if (m) {
            let rs = ""
            for (let i in m) {
                let s = m[i];
                r = new RegExp("<text\\s*value='(.*?)'\\s*color='(\\d+)'\\s*/>", "g")
                let ms = r.exec(s);
                if (ms) {
                    let color = parseInt(ms[2]).toString(16);
                    rs += "<color=#" + color + ">" + ms[1] + "</color>";
                } else {
                    error("oldRichToNew匹配失败：" + s)
                }
            }
            rs = rs.replace(/ddccaaee0923ll/g, "\n");
            return rs;
        }
    }
    return oldText
}

w.clone = function (t?:any) {
    if (typeof (t) == "object") {
        let c:any
        if (Array.isArray(t)) {
            c = []
        } else {
            c = {}
        }
        for (let i in t) {
            c[i] = w.clone(t[i])
        }
        return c
    } else {
        return t
    }
}

if (!w.string) {
    w.string = {}
}

let err = error
w.error = function (str?:any) {
    if (w._kupao_err_msg == undefined) {
        w._kupao_err_msg = ""
    }
    w._kupao_err_msg += (str + "\n")
    err(str)
}

w.labelAtlas = function (str?:any, image?:any, callFunc:any = null) {
    let node = new Node
    node.addComponent(UITransform)
    let label = node.addComponent(Label)

    G_GlobalVar.resManager().loadRes(ResMapping.ResType.Font, "fonts/" + image, function (font?:any) {
        if (isValid(label)) {
            label.font = font;
            label.string = str;
            if (callFunc) {
                callFunc()
            }
        }

    })
    // resources.load("fonts/" + image?:any, Font?:any, (err?:any, font?:any) => {
    //     if (err) {
    //         error(err);
    //     } else {
    //         label.font = font
    //         if (callFunc) {
    //             callFunc()
    //         }
    //     }
    // });
    return node
}
w.string.gsub = function (txt?:any, pattern?:any, repl?:any) {
    if (typeof txt == 'string')
        return txt.replace(new RegExp(pattern, "g"), repl);
    return txt;
}
w.string.len = (str:string) => {
    return str.length
}
w.string.sub = (str:string, start?:any, end?:any) => {
    return str.substring(start, end)
}
w.string.find = (str:string, str2?:any) => {
    return str.indexOf(str2) != -1
}
w.string.split = (str:string, c?:any) => {
    return str.split(c)
}
w.string.utf8len = (str:string) => {
    return str.length
}
w.table = {
    nums(t?:any) {
        return t.length
    },
    insert(t?:any, v?:any, v2?:any) {
        if (v2) {
            t.splice(v - 1, 0, v2)
        } else {
            t.push(v)
        }

    },
    sort(t?:any, f?:any) {
        t.sort(f)
    },
    remove(t?:any, i?:any) {
        return t.splice(i, 1)
    },
    foreach(t?:any, func?:any) {
        for (let i in t) {
            func(i, t[i]);
        }
    }
}

w.tolua = {
    cast: function (node?:any, type?:any) {
        if (type == "Label") {
            return node.getComponent(Label)
        } else if (type == "ImageView") {
            return node.getComponent(Sprite)
        } else if (type == "Widget") {
            return node.node;
        } else if (type == "Button") {
            return node.getComponent(Button)
        } else if (type == "ScrollView") {
            return node.getComponent(ScrollView)
        } else {
            error("UNKNOw type in tolua!");
            return node;
        }
    }
}

w.toint = function (str?:any) {
    return parseInt(str)
}

w.cclog = function(msg?:any) {
    log(msg)
}

w.ccerror = function(msg?:any) {
    error(msg)
}

w.ccinstantiate = function(prefab: Prefab) {
    return instantiate(prefab)
}

w.ccfind = function(path:string, node?:any) {
    return find(path, node)
}

w.ccv2 = function(x?:any, y?:any) {
    return v2(x, y)
}

w.ccv3 = function(x?:any, y?:any,z?:any) {
    return v3(x, y, z)
}

w.ccrect = function(x?: number, y?: number, width?: number, height?: number) {
    return new Rect(x,y,width,height)
}

w.ccisValid = function(n:any, s?:any) {
    return isValid(n, s)
}

w.__Log = function () {
    console.log(sprintf.apply(null, Array.from(arguments)))
}

w.__LogError = function () {
    error(sprintf.apply(null, Array.from(arguments)))
}

w.__LogTag = function (tag?:any, msg?:any) {
    console.log("[" + tag + "]:" + msg);
}

w.assert = function (a?:any, msg?:any) {
    if (!a) {
        error(msg);
    }
}

w.tostring = function (o?:any) {
    return "" + o;
}

w.dump = function (t?:any) {
    console.log(t)
}

w.math = {
    floor: Math.floor,
    ceil: Math.ceil,
    atan: Math.atan,
    sqrt: Math.sqrt,
    max: Math.max,
    deg: function (radians?:any) {
        return radians * 180 / Math.PI;
    },
    pow: Math.pow,
}

w.tonumber = function (str?:any) {
    return parseFloat(str)
}

w.ccp = function (x?:any, y?:any) {
    if (typeof x == 'object') {
        return v2(x[0], x[1]);
    }
    return v2(x, y);
}
w.ccp3 = function(x?:any, y?:any, z?:any) {
    if (typeof x == 'object') {
        return v3(x[0], x[1], x[2] != undefined ? x[2] : 0);
    }
    return v3(x, y, z);
}
w.resetPosition = (object?:any, pos?:any) => {
    throw "cocosextend : cocos creator 3 不支持 resetPosition"
    // return cc.callFunc(function () {
    //     object.setPosition(pos);
    // }.bind(object))
}

w.resetOpacity = (object?:any, opacity?:any) => {
    throw "cocosextend : cocos creator 3 不支持 resetOpacity"
    // return cc.callFunc(function () {
    //     if (object.opacity) {
    //         object.opacity = opacity;
    //     } else {
    //         object.node.opacity = opacity;
    //     }
    // }.bind(object))
}
w.sequenceWithTwoActions = (act1?:any, act2?:any) => {
    throw "cocosextend : cocos creator 3 不支持 sequenceWithTwoActions"
    // return cc.sequence(act1, act2);
}
w.ccpAngle = function (a:Vec2, b:Vec2) {
    return Vec2.angle(a,b)
}
w.ccpSub = function (a?:any, b?:any) {
    return new Vec2(a.x - b.x, a.y - b.y);
}
w.ccpMult = function (a?:any, b?:any) {
    return new Vec2(a.x * b, a.y * b)
}
w.fileUtils = {
    sharedFileUtils() {
        return {
            getWritablePath() {
                return "stroage"
            }
        }
    }
}

w.ccpAdd = function (a?:any, b?:any) {
    return new Vec2(a.x + b.x, a.y + b.y);
}

w.ccc3 = function (r?:any, g?:any, b?:any) {
    return new Color(r, g, b);
}

w.ccc4 = function (r?:any, g?:any, b?:any, a?:any) {
    return new Color(r, g, b, a);
}

w.color = function (r?:any, g?:any, b?:any, a?:any) {
    return new Color(r, g, b, a);
}

w.CCSizeMake = function (w?:any, h?:any) {
    return new Size(w, h);
}

w.ccsize = CCSizeMake;

w.sizeMake = CCSizeMake

w.CCSize = function (w?:any, h?:any) {
    return new Size(w, h);
}

w.CCRectMake = function (x?:any, y?:any, w?:any, h?:any) {
    return new Rect(x, y, w, h);
}

w.ccsprite = function (path?:any) {
    return display.newSprite(path)
}

declare module "cc" {
    interface Component {
        getPosition(): Vec3;
        getLayoutParameter(): any;
        getChildByName(name?:any):any;
        setName (name?:any):void
        setVisible(isVisible?:any):void
        setZOrder(z?:any):void
        getPositionInCCPoint(): Vec3
        getSize(): Size
        runAction(action:any): void
    }

    interface Rect{
        containsPoint(p:any) : boolean
    }

    interface Node {
        _private_setUserObject_inner_save_abcd3435324kljadf: any;
        zIndex: number;
        color: Color;
        x: number;
        y: number;
        width: number;
        height: number;
        anchorX: number;
        anchorY: number;
        opacity: number;
        scaleN: number;
        scaleX: number;
        scaleY: number;
        setContentSize(size:Size):void
        getContentSize():Size
        getAnchorPoint(): Vec2
        getLayoutParameter(): any;
        setVisible (visible?:any): void
        isVisible () : boolean
        setName(name:string) :void
        getPositionInCCPoint(): Vec3
        showAsGray(isGray?:any): void
        _setScaleX(sx?:number): void
        _setScaleY(sx?:number): void
        _setOpacity(opacity?:any): void
        _getOpacity(): number
        _setColor(color?:any) :void
        setDisplayFrame(frame?:any) : void
        setDisplayFrameFromFile(texturePath?:any):void
        setOnLoad(callback?:any, target?:any):void
        setOnStart(callback?:any, target?:any): void
        setUpdate(callback?:any, target?:any, interval ?:any):void
        setOnDestroy(callback?:any, target?:any):void
        addNode(node?:any):void
        getLeftInParent(): number
        getRightInParent():number
        removeFromParentAndCleanup(isCleanup?:any):void
        requestDoLayout():void
        boundingBox(): Rect
        setPositionXY(x?:any, y?:any): void
        setZOrder (z?:any):void
        setSize(size?:any):void
        getSize(): Size;
        getWidth():number
        getHeight():number
        getLayoutParameter(): Widget
        setTouchEnabled(isEnable?:any):void
        loadTexture(path?:any, t?:any, callback?:any):void
        loadTextureNormal (path?:any, t?:any):void
        loadTextureDisabled (path?:any, t?:any):void
        removeAllNodes ():void
        removeAllChildrenWithCleanup(clean?:any):void
        retain():void
        release():void
        removeNode (node?:any):void
        hitTest(pt?:any):boolean
        convertToNodeSpaceAR(pt:Vec3): Vec3
        convertToNodeSpace(pt:Vec3): Vec3
        convertToWorldSpaceXY(x?:any, y?:any): Array<number>
        convertToNodeSpaceXY(x?:any, y?:any): Array<number>
        convertToWorldSpace(pt:Vec3): Vec3
        convertToWorldSpaceAR(nodePoint: Vec3, out?: Vec3): Vec3
        ignoreContentAdaptWithSize():void
        setUserObject(obj?:any): void
        getUserObject(): any
        setBackGroundImage(img?:any):void
        stopAllActions():void
        addChild2(node:Node, zIndex?:any, name?:string):void;
    }

    interface RichText {
        clearRichElement():void
        appendContent(text?:any, color?:any):void
        setText(text?:any): void
        setFontName(fontResPath?:any): void
        setFontSize(size?:number):void
        reloadData():void
        adapterContent():void
        enableStroke(color?:Color): void
        disableStroke():void
        createStroke(color?:Color, width?:number):void
        setColor(color:Color):void
        setShowTextFromTop():void
        setTextAlignment(align?:any) :void
    }

    interface Label {
        getParent(): any
        clone():any
        setTextAreaSize(size?:any):void
        setFontName(fontResPath?:any):void
        getFontName():string
        getFontSize():number
        createStroke(color:Color, strokeSize:number):void
        enableStrokeEx(color:Color, strokeSize:number):void
        disableStroke():void
        setColor(color:Color):void
        getColor():Color
        setText(text?:any):void
        getStringLength():number
        setStringValue  (text?:any) :void
        setProperty (text?:any, path?:any, height?:any, fontSize?:any, starChar?:any):void
        getStringValue():string
        getContentSize():Size
        getPositionX(): number
        getPositionY(): number
        retain() :void
        release():void
        setPosition(p?:any):void
        stopAllActions():void
        setScale(_scale:Vec3):void
        runAction (act?:any):void
        addNode(node:any):void
        convertToWorldSpaceXY (x?:any, y?:any): Array<number>
        showAsGray(isGray?:any, _color ?:any):void
    }

    interface LabelOutline {
        _sourceLabelColor:any
        showAsGray(isGray?:any) : void
    }

    interface EditBox {
        getStringValue():string
        setText  (text?:any):void
        setMaxLength  (max?:any):void
        setFontColor (color:Color):void
        setReturnType (type?:any):void
        openKeyboard():void
        setPlaceHolder(str?:any):void
    }

    interface Toggle {
        setSelectedState (isCheck?:any):void
        setCheckDisabled (isDisable?:any):void
        getSelectedState():boolean
        setVisible (visible?:any): void
        isVisible():boolean
    }

    interface ProgressBar {
         _update: any
        setPercent (percent?:any):void
        loadModificationTexture  (path?:any, scale9Enable?:any, texType?:any): void
        setModificationVisible():void
        setModificationPercent():void
        blurModification():void
        runToPercent(percent?:any, duration?:any, callback?:any):void
    }

    interface Button {
         _private_attach_images:any
         _sprite:any
         enableAutoGrayEffect:any
         originSpriteColor:any
         originSpriteSize:any
        setTouchEnabled (isEnable?:any):void
        setEnabled (isEnable?:any):void
        showAsGray (isGray?:any) :void
        loadTextureNormal (p?:any, t?:any) : void
        loadTexturePressed(p?:any, t?:any):void
        loadTextureDisabled (p?:any, t?:any):void
        setPressedActionEnabled (isEnable?:any) :void
        addNode(node:any):void
        setSize(size?:any): void
        setScale(scale?:any):void
        getAnchorPoint(): Vec2
        setTitleText (text?:any):void
        getTitleText():string
        ignoreContentAdaptWithSize():void
        retain():void
        release():void
        setPosition(p:Vec3): void
        getLayoutParameter(): any
        getPositionX():number
        getPositionY():number
        getParent():any
        getName():string
        getContentSize(): Size
        setPositionX(v:number):void
        setPositionY(v:number):void
        stopAllActions():void
        removeAllNodes():void
        loadTexture (path?:any):void
    }

    interface Sprite {
        setVisible (isVisible?:any):void
        showAsGray  (isGray?:any):void
        removeAllNodes():void
        addNode(node:any):void
        loadTexture (p?:any, t?:any, callback?:any):void
        setScale(scale:Vec3):void
        setPosition (a:any,b:any,c:any):void
        getPositionY():number
        getPositionX():number
        setPositionX(v:number):void
        setPositionY(v:number):void
        setTouchEnabled (e?:any):void
        setSize  (size?:any):void
        getAnchorPoint():Vec2
        ignoreContentAdaptWithSize():void
        retain():void
        release():void
        getContentSize():Size
        setOpacity(op?:any):void
        stopAllActions():void
        runAction():void
        getName():string
        getParent():any
        textureFile():string
    }

    interface ScrollView {
        setScrollEnable (isEnable?:any):void
        getInnerContainerSize() : Size
        setInnerContainerSize(size?:any):void
        getSize():Size
        getInnerContainer():any
        jumpToBottom (duration?:any):void
        jumpToTop(duration?:any):void
        jumpToPercentHorizontal(percent?:any):void
        jumpToPercentVertical (percent?:any):void
        getContentSize():Size
        setSize (size?:any):void
        setPosition (p?:any): void
        removeAllChildren():void
        removeAllChildrenWithCleanup():void
        addChild(child:any):void
        isVisible():boolean
    }

    interface Director {
        sharedDirector(): SceneManager
    }

    interface Color {
        getR(): number
        getG(): number
        getB(): number
        getA(): number
    }
}

Object.defineProperty(Node.prototype, "zIndex", {
    get: function() {
        let t = this.getComponent(UITransform)
        return t ? t.priority : 0
        // return this.getSiblingIndex()
    }, 
    set: function(priority:number) {
        let t = this.getComponent(UITransform)
        if(!t) {
            t = this.addComponent(UITransform)
        }
        t.priority = priority
        // this.setSiblingIndex(priority)
    },
    enumerable: true,
    configurable: true,
})
Object.defineProperty(Node.prototype, "color", {
    get: function() {
        let s = this.getComponent(Sprite)
        if(s) {
            return s.color
        }
        let l = this.getComponent(Label)
        if(l) {
            return l.color
        }
        return ccc4(255,255,255, 255)
    },
    set: function(color: Color) {
        let s = this.getComponent(Sprite)
        if(s) {
            s.color = color
        }
        let l = this.getComponent(Label)
        if(l) {
            l.color = color
        }
    },
    enumerable: true,
    configurable: true,
})
Object.defineProperty(Node.prototype, "opacity", {
    get: function() {
        let uio = this.getComponent(UIOpacity)
        if(!uio) {
            return 255
        }
        return uio.opacity
    },
    set: function(v:number){
        let uio = this.getComponent(UIOpacity)
        if(!uio) {
            uio = this.addComponent(UIOpacity)
        }
        uio.opacity = v;
    },
    enumerable: true,
    configurable: true,
})
Object.defineProperty(Node.prototype, "x", {
    get: function(){
        return this.position.x
    }, 
    set: function(x:number) {
        this.position.x = x
    },
    enumerable: true,
    configurable: true,
})
Object.defineProperty(Node.prototype, "y", {
    get: function(){
        return this.position.y
    }, 
    set: function(y:number) {
        let p = this.position
        this.position = v3(p.x, y, p.z)
    },
    enumerable: true,
    configurable: true,
})
// Object.defineProperty(Node.prototype, "width", {
//     get: function(){
//         let t = this.getComponent(UITransform)!
//         return t.width
//     }, 
//     set: function(width:number) {
//         let t = this.getComponent(UITransform)!
//         t.width = width
//     },
//     enumerable: true,
//     configurable: true,
// })
// Object.defineProperty(Node.prototype, "height", {
//     get: function(){
//         let t = this.getComponent(UITransform)!
//         return t.height
//     }, 
//     set: function(height:number) {
//         let t = this.getComponent(UITransform)!
//         t.height = height
//     },
//     enumerable: true,
//     configurable: true,
// })
// Object.defineProperty(Node.prototype, "anchorX", {
//     get: function(){
//         let t = this.getComponent(UITransform)!
//         return t.anchorX
//     }, 
//     set: function(v:number) {
//         let t = this.getComponent(UITransform)!
//         t.anchorX = v
//     },
//     enumerable: true,
//     configurable: true,
// })
// Object.defineProperty(Node.prototype, "anchorY", {
//     get: function(){
//         let t = this.getComponent(UITransform)!
//         return t.anchorY
//     }, 
//     set: function(v:number) {
//         let t = this.getComponent(UITransform)!
//         t.anchorY = v
//     },
//     enumerable: true,
//     configurable: true,
// })
Object.defineProperty(Node.prototype, "scaleN", {
    get: function(){
        return this.scale.x
    }, 
    set: function(v:number) {
        this.scale = v3(v,v,1)
    },
    enumerable: true,
    configurable: true,
})
Object.defineProperty(Node.prototype, "scaleX", {
    get: function(){
        return this.scale.x
    }, 
    set: function(v:number) {
        this.scale = v3(v,this.scale.y,1)
    },
    enumerable: true,
    configurable: true,
})
Object.defineProperty(Node.prototype, "scaleY", {
    get: function(){
        return this.scale.x
    }, 
    set: function(v:number) {
        this.scale = v3(this.scale.x,v,1)
    },
    enumerable: true,
    configurable: true,
})


Component.prototype.getPosition = function () {
    return this.node.getPosition();
}

Component.prototype.getLayoutParameter = function () {
    return this.node.getLayoutParameter();
}

Component.prototype.getChildByName = function (name?:any) {
    return this.node.getChildByName(name);
}

Component.prototype.setName = function (name?:any) {
    return this.node.name = name;
}

Component.prototype.setVisible = function (isVisible?:any) {
    this.node.active = isVisible;
}

Component.prototype.setZOrder = function (z?:any) {
    this.node.zIndex = z
}

Component.prototype.getPositionInCCPoint = function () {
    return this.node.getPosition();
}

Component.prototype.getSize = function () {
    return this.node.getSize()
}

Component.prototype.runAction = function (action?:any) {
    throw "cocosextend : cocos creator 3 不支持 runAction"
}

Rect.prototype.containsPoint = function (pt?:any) {
    return this.contains(pt);
}

Node.prototype.setVisible = function (visible?:any) {
    this.active = !!visible;
}

Node.prototype.isVisible = function () {
    return this.active;
}

Node.prototype.setName = function (name?:any) {
    this.name = name;
}

Node.prototype.getSize = function() {
    let t = this.getComponent(UITransform)!
    return t.contentSize
}

Node.prototype.getPositionInCCPoint = function () {
    return this.getPosition();
}
Node.prototype.showAsGray = function (isGray?:any) {

    let _label = this.getComponent(Label);
    if (_label) {
        _label.showAsGray(isGray, ccc4(254, 254, 254, 255));
    }
    let _button = this.getComponent(Button);
    if (_button) {
        _button.showAsGray(isGray);
    } else {
        let _sprite = this.getComponent(Sprite);
        if (_sprite) {
            _sprite.showAsGray(isGray);
        }
    }
    if (this.children.length > 0) {
        showChildrenGray(this, isGray);
    }
}
// Node.prototype.getColor = function() {
//     return this.color;
// }
// Node.prototype.setRotation = function (rotation?:any) {
//     this.angle = rotation;
// }

Node.prototype._setScaleX = function (sx?:any) {
    this.setScale(sx, this.scale.y)
}

Node.prototype._setScaleY = function (sy?:any) {
    this.setScale(this.scale.x, sy)
}

Node.prototype._setOpacity = function (opacity?:any) {
    let uio = this.getComponent(UIOpacity)
    if(!uio) {
        uio = this.addComponent(UIOpacity)
    }
    uio.opacity = opacity;
}

Node.prototype._getOpacity = function () {
    let uio = this.getComponent(UIOpacity)
    if(!uio) {
        return 255
    }
    return uio.opacity
}

Node.prototype._setColor = function (color:Color) {
    this.color = color
}

Node.prototype.setDisplayFrame = function (frame?:any) {
    let s = this.getComponent(Sprite)
    if(s) {
        s.spriteFrame = frame;
    }
}

Node.prototype.setDisplayFrameFromFile = function (texturePath?:any) {
    let sprite = this.getComponent(Sprite);
    let self = this
    G_GlobalVar.resManager().loadRes(ResMapping.ResType.SpriteFrame, texturePath, (texture?:any, err?:any) => {
        if (!isValid(self)) {
            return
        }
        //resources.load(texturePath?:any, SpriteFrame?:any, (err?:any, texture?:any) => {
        if (err) {
            error(err);
        } else {
            if(sprite) {
                sprite.spriteFrame = texture;//new SpriteFrame(texture);
            }
        }
    });
}

Node.prototype.setOnLoad = function (callback?:any, target?:any) {
    let ce = this.getComponent(CompEvent);
    if (ce === null) {
        ce = this.addComponent(CompEvent);
    }
    ce.setOnLoadCallback(callback, target);
}

Node.prototype.setOnStart = function (callback?:any, target?:any) {
    let ce = this.getComponent(CompEvent);
    if (ce === null) {
        ce = this.addComponent(CompEvent);
    }
    ce.setStartCallback(callback, target);
}

Node.prototype.setUpdate = function (callback?:any, target?:any, interval :any = 0) {
    let ce = this.getComponent(CompEvent);
    if (ce === null) {
        ce = this.addComponent(CompEvent);
    }
    ce.setUpdateCallback(callback, target, interval);
}

Node.prototype.setOnDestroy = function (callback?:any, target?:any) {
    let ce = this.getComponent(CompEvent);
    if (ce === null) {
        ce = this.addComponent(CompEvent);
    }
    ce.setOnDestroyCallback(callback, target);
}

Node.prototype.addNode = function (node?:any) {
    Node.prototype.addChild.apply(this, node);
}

Node.prototype.getLeftInParent = function () {
    return this.x - this.anchorX * this.width;
}

Node.prototype.getRightInParent = function () {
    return this.getLeftInParent() + this.width;
}

Node.prototype.removeFromParentAndCleanup = function (isCleanup?:any) {
    this.removeFromParent(/*isCleanup*/)
}

Node.prototype.requestDoLayout = function () { }

Node.prototype.boundingBox = function () {
    let t = this.getComponent(UITransform)!
    return t.getBoundingBox()
}

Node.prototype.setPositionXY = function (x?:any, y?:any) {
    this.setPosition(x, y)
}

Node.prototype.setZOrder = function (z?:any) {
    this.zIndex = z
}

Node.prototype.setSize = function (size?:any) {
    this.width = size.width;
    this.height = size.height;
}

Node.prototype.getSize = function () {
    let t = this.getComponent(UITransform)!
    return t.contentSize
}

Node.prototype.getWidth = function () {
    let t = this.getComponent(UITransform)!
    return t.width
}

Node.prototype.getHeight = function () {
    let t = this.getComponent(UITransform)!
    return t.height
}

Node.prototype.setContentSize = function(size:Size) {
    let t = this.getComponent(UITransform)!
    t.contentSize = size
}

Node.prototype.getContentSize = function() {
    let t = this.getComponent(UITransform)!
    return t.contentSize
}

Node.prototype.getAnchorPoint = function() {
    let t = this.getComponent(UITransform)!
    return t.anchorPoint
}

Node.prototype.getLayoutParameter = function () {
    return this.getComponent(Widget)!;
}

Node.prototype.setTouchEnabled = function (isEnable?:any) {
    // let bi = this.getComponent(BlockInputEvents);
    // if (bi) {
    //     if (!isEnable) {
    //         bi.enabled = false;
    //     }
    // } else {
    //     if (isEnable) {
    //         bi = this.addComponent(BlockInputEvents);
    //     }
    // }
    if (isEnable) {
        this.resumeSystemEvents(true);
    } else {
        this.pauseSystemEvents(true);
    }
}

Node.prototype.loadTexture = function (path?:any,t?:any, callback?:any) {
    let sp = this.getComponent(Sprite)!;
    sp.loadTexture(path,t, callback);
}

Node.prototype.loadTextureNormal = function (path?:any, t?:any) {
    let bt = this.getComponent(Button)!;
    bt.loadTextureNormal(path, t);
}

Node.prototype.loadTextureDisabled = function (path?:any, t?:any) {
    let bt = this.getComponent(Button)!;
    bt.loadTextureDisabled(path, t);
}

Node.prototype.removeAllNodes = function () {
    this.removeAllChildren();
}

Node.prototype.removeAllChildrenWithCleanup = function (clean?:any) {
    this.removeAllChildren(/*clean*/);
}

Node.prototype.retain = function () {
    // if (this._private_frame_fg_reatin_counter == undefined) {
    //     this._private_frame_fg_reatin_counter = 0;
    // }
    // this._private_frame_fg_reatin_counter++;
}
Node.prototype.release = function () {
    // this._private_frame_fg_reatin_counter--;
    // if (this._private_frame_fg_reatin_counter == 0 && this.parent == null) {
    //     this.destroy();
    // }
}

Node.prototype.removeNode = function (node?:any) {
    for (let i = 0; i < this.children.length; i++) {
        if (this.children[i] == node) {
            node.parent = null;
            return;
        }
    }
}

Node.prototype.convertToNodeSpaceAR = function(pt:Vec3) {
    let t = this.getComponent(UITransform)!
    return t.convertToNodeSpaceAR(pt)
}

Node.prototype.convertToNodeSpace = function(pt:Vec3) {
    let nsp = this.convertToNodeSpaceAR(pt);
    nsp.x -= this.width * this.scale.x * this.anchorX
    nsp.y -= this.height * this.scale.y * this.anchorY
    return nsp
}

Node.prototype.hitTest = function (pt:Vec3) {
    let nsp = this.convertToNodeSpace(pt);
    let bb = CCRectMake(-this.width * this.anchorX, -this.height * this.anchorY, this.width, this.height);
    if (nsp.x >= bb.x && nsp.x <= bb.x + bb.width && nsp.y >= bb.y && nsp.y <= bb.y + bb.height) {
        return true;
    }
    return false;
}
Node.prototype.convertToWorldSpace = function(pt:Vec3) {
    let t = this.getComponent(UITransform)!
    return t.convertToWorldSpaceAR(pt)
}
Node.prototype.convertToWorldSpaceAR = function(nodePoint: Vec3, out?: Vec3) {
    let t = this.getComponent(UITransform)!
    return t.convertToWorldSpaceAR(nodePoint, out)
}
Node.prototype.convertToWorldSpaceXY = function (x?:any, y?:any) {
    let pos = this.convertToWorldSpace(v3(x, y));
    return [pos.x, pos.y];
}

Node.prototype.convertToNodeSpaceXY = function (x?:any, y?:any) {
    let pos = this.convertToNodeSpace(v3(x, y));
    return [pos.x, pos.y];
}

Node.prototype.ignoreContentAdaptWithSize = function () { }

Node.prototype.setUserObject = function (obj?:any) {
    this._private_setUserObject_inner_save_abcd3435324kljadf = obj;
}

Node.prototype.getUserObject = function () {
    return this._private_setUserObject_inner_save_abcd3435324kljadf
}

Node.prototype.setBackGroundImage = function (img?:any) {
    let bg = this.getChildByName("_panel_bg_")
    if (bg) {
        let s = bg.getComponent(Sprite)
        if(s){
            s.loadTexture(img)
        }
    }
}

Node.prototype.stopAllActions = function(){
    Tween.stopAllByTarget(this)
}

Node.prototype.addChild2 = function(node:Node, zIndex?:any, name?:string) {
    this.addChild(node)
    if(zIndex) {
        node.zIndex = zIndex
    }
    if(name) {
        node.name = name
    }
}

// Node.prototype.isRunning = function() {
//     return this.active;
// }

Component.prototype.setVisible = function (isVisible?:any) {
    this.node.setVisible(isVisible);
}

RichText.prototype.clearRichElement = function () {
    this.string = "";
}

RichText.prototype.appendContent = function (text:any, color:Color) {
    this.string = this.string +
        "<color=#" +
        toHex(color.r) +
        toHex(color.g) +
        toHex(color.b) +
        ">" + text + "</color>";
}

RichText.prototype.setText = function (text?:any) {
    this.string = "";
    this.appendContent(text, this.node.color);
}

RichText.prototype.setFontName = function (fontResPath?:any) {
    let self = this;
    G_GlobalVar.resManager().loadRes(ResMapping.ResType.Font, fontResPath, (font?:any, err?:any) => {
        if (!isValid(self)) {
            return
        }
        //resources.load(fontResPath?:any, TTFFont?:any, (err?:any, font?:any) => {
        if (err) {
            error(err);
        }
        self.font = font;
    })
}

RichText.prototype.setFontSize = function (size?:any) {
    this.fontSize = size;
}

RichText.prototype.reloadData = function () { }

RichText.prototype.adapterContent = function () { }

RichText.prototype.enableStroke = function (color?:Color) {
    this.createStroke(color, 1);
}

RichText.prototype.disableStroke = function () {
    let outline = this.node.getComponent(LabelOutline);
    if (outline) {
        outline.enabled = false;
    }
}

RichText.prototype.createStroke = function (color:Color, width:number) {
    let outline = this.node.getComponent(LabelOutline);
    if (!outline) {
        outline = this.node.addComponent(LabelOutline)
    } else {
        outline.enabled = true;
    }
    outline.color = color;
    outline.width = width;
}

RichText.prototype.setColor = function (color:Color) {
    this.node.color = color;
}

RichText.prototype.setShowTextFromTop = function () { }

RichText.prototype.setTextAlignment = function (align?:any) {
    let at
    if (align == kCCTextAlignmentLeft) {
        at = HorizontalTextAlignment.LEFT
    } else if (align == kCCTextAlignmentCenter) {
        at = HorizontalTextAlignment.CENTER
    } else {
        at = HorizontalTextAlignment.RIGHT
    }
    this.horizontalAlign = at;
}

Label.prototype.getParent = function () {
    return this.node.parent;
}

Label.prototype.clone = function () {
    return instantiate(this.node);
}

Label.prototype.setTextAreaSize = function (size:any) {
    this.node.setContentSize(size)
}

Label.prototype.setFontName = function (fontResPath?:any) {
    let self = this;
    G_GlobalVar.resManager().loadRes(ResMapping.ResType.Font, fontResPath, (font?:any, err?:any) => {
        if (!isValid(self)) {
            return
        }
        //resources.load(fontResPath?:any, TTFFont?:any, (err?:any, font?:any) => {
        if (err) {
            error(err);
        }
        self.font = font;
    })
}

Label.prototype.getFontName = function () {
    return "fonts/ZiTi"
}

Label.prototype.getFontSize = function () {
    return this.fontSize;
}

Label.prototype.createStroke = function (color:Color, strokeSize:number) {
    let outline = this.node.getComponent(LabelOutline);
    if (!outline) {
        outline = this.node.addComponent(LabelOutline)
    } else {
        outline.enabled = true;
    }
    outline.color = color;
    outline.width = strokeSize;
}

Label.prototype.enableStrokeEx = function (color:Color, strokeSize:number) {
    this.createStroke(color, strokeSize);
}

Label.prototype.disableStroke = function () {
    let outline = this.node.getComponent(LabelOutline);
    if (outline) {
        outline.enabled = false;
    }
}

Label.prototype.setColor = function (color:Color) {
    this.node.color = color;
}

Label.prototype.getColor = function () {
    return this.node.color;
}

Label.prototype.setText = function (text?:any) {
    if (text == null) {
        text = "";
    }
    this.string = text;
}

Label.prototype.getStringLength = function () {
    return this.string.length;
}

Label.prototype.setStringValue = function (text?:any) {
    this.string = text;
}

Label.prototype.setProperty = function (text?:any, path?:any, height?:any, fontSize?:any, starChar?:any) {
    let self =this
    let _path = path.split('.');
    G_GlobalVar.resManager().loadRes(ResMapping.ResType.Font, _path[0], function (ft?:any, err?:any) {
        if (!isValid(self.node)) {
            return
        }
        // resources.load(_path[0], LabelAtlas, function (err?:any, ft?:any) {
            self.font = ft;
            self.fontSize = fontSize;
            self.lineHeight = height;
            if (text)
                self.string = text;
    }.bind(this))
}
Label.prototype.getStringValue = function () {
    return this.string;
}

Label.prototype.getContentSize = function () {
    return this.node.getContentSize();
}

Label.prototype.getParent = function () {
    return this.node.getParent();
}

Label.prototype.getPositionX = function () {
    return this.node.x;
}

Label.prototype.getPositionY = function () {
    return this.node.y;
}

Label.prototype.retain = function () {
    this.node.retain();
}

Label.prototype.release = function () {
    this.node.release();
}

Label.prototype.setPosition = function (p?:any) {
    this.node.setPosition(p)
}

Label.prototype.stopAllActions = function () {
    Tween.stopAllByTarget(this.node)
}

Label.prototype.setScale = function (_scale:Vec3) {
    this.node.setScale(_scale)
}

Label.prototype.runAction = function (act?:any) {
    throw "cocosextend : cocos creator 3 不支持 runAction"
}

Label.prototype.addNode = function (node:any) {
    Node.prototype.addChild.apply(this.node, node);
}

Label.prototype.convertToWorldSpaceXY = function (x?:any, y?:any) {
    let pos = this.node.convertToWorldSpace(v3(x, y));
    return [pos.x, pos.y];
}

EditBox.prototype.getStringValue = function () {
    return this.string;
}

EditBox.prototype.setText = function (text?:any) {
    this.string = text;
}

EditBox.prototype.setMaxLength = function (max?:any) {
    this.maxLength = max;
}

EditBox.prototype.setFontColor = function (color:Color) {
    if(this.textLabel){
        this.textLabel.color = color;
    }
    if(this.placeholderLabel){
        this.placeholderLabel.color = color
    }
}

EditBox.prototype.setReturnType = function (type?:any) {
    this.returnType = type;
}

EditBox.prototype.openKeyboard = function () { }

EditBox.prototype.setPlaceHolder = function (str?:any) {
    this.placeholder = str
}

Toggle.prototype.setSelectedState = function (isCheck?:any) {
    this.isChecked = isCheck;
}

Toggle.prototype.setCheckDisabled = function (isDisable?:any) {
    this.interactable = !isDisable;
}
Toggle.prototype.getSelectedState = function () {
    return this.isChecked;
}
Toggle.prototype.setVisible = function (visible?:any) {
    this.node.setVisible(visible)
}
Toggle.prototype.isVisible = function () {
    return this.node.active;
}

ProgressBar.prototype.setPercent = function (percent?:any) {
    if (percent == 0) this.progress = 0;
    else this.progress = percent / 100;
    let bar = this.node.getChildByName("bar");
    let s:any
    if(bar) {
        s = bar.getComponent(Sprite)
    }
    if (!bar || s.type !== Sprite.Type.FILLED) return;
    let mask = bar.getChildByName("mask");
    if (!mask) return;
    let m = mask.getComponent(Mask)
    if(m){
        m.destroy()
    }
    if (this.progress < 0.15) {
        mask.active = false;
        return;
    }
    mask.active = true;
    let spriteLight = mask.getChildByName("Sprite_light");
    if (!spriteLight) return;
    let _prog = this.progress;
    if (this.progress > 1) _prog = 1;
    let bs = bar.getComponent(Sprite)!
    if (bs.fillType === Sprite.FillType.HORIZONTAL) {
        spriteLight.x = bar.width * _prog;
    } else if (bs.fillType === Sprite.FillType.VERTICAL) {
        spriteLight.y = bar.height * _prog;
    }
}

ProgressBar.prototype.loadModificationTexture = function (path?:any, scale9Enable?:any, texType?:any) {
    let self = this;
    if (texType == UI_TEX_TYPE_LOCAL) {
        G_GlobalVar.resManager().loadRes(ResMapping.ResType.SpriteFrame, path, (texture?:any, err?:any) => {
            if (!isValid(self.node)) {
                return
            }
            //resources.load(path?:any, SpriteFrame?:any, (err?:any, texture?:any) => {
            if (err) {
                error(err);
            } else {
                if(self.barSprite){
                    self.barSprite.spriteFrame = texture;//new SpriteFrame(texture);
                }
                
            }
        });
    } else {
        if(self.barSprite) {
            self.barSprite.spriteFrame = display.newSpriteFrame(path);
        }
    }
}

ProgressBar.prototype.setModificationVisible = function () { }
ProgressBar.prototype.setModificationPercent = function () { }
ProgressBar.prototype.blurModification = function () { }
ProgressBar.prototype.runToPercent = function (percent?:any, duration :any = 1, callback :any = () => { }) {
    if (this._update) {
        this.unschedule(this._update);
        this._update = null;
    }
    let _duration = 0;
    let _durTime = 1 / 60;
    let curPercent = this.progress;
    let _durPercent = (percent / 100 - curPercent) / duration / 60;
    percent /= 100;
    if (percent > 1) {
        percent -= 1;
    }
    let self = this;
    this._update = function (_float?:any) {
        _duration += _durTime;
        if (_duration > duration) {
            self.setPercent(percent * 100);
            self.unschedule(this._update);
            this._update = null;
            if (callback) callback();
            return;
        }
        if (self.progress > 1) {
            self.setPercent((self.progress - 1) * 100);
        }
        self.setPercent((self.progress + _durPercent) * 100);
    }

    this.schedule(this._update, _durTime);

}

Button.prototype.setTouchEnabled = function (isEnable?:any) {
    this.setEnabled(isEnable);
    if (this._private_attach_images) {
        for (let i = 0; i < this._private_attach_images.length; i++) {
            this._private_attach_images[i].showAsGray(!isEnable)
        }
    }
}

Button.prototype.setEnabled = function (isEnable?:any) {
    this.interactable = isEnable;
}

Button.prototype.showAsGray = function (isGray?:any) {
    if (!this._sprite) {
        let t:any = this
        t["_applyTarget"].call(this);
    }
    if (isGray) {
        this.interactable = false;
        let path = getGraySpritePath(this);
        let component = findBtnBgComponent(this);
        if(component) {
            component.grayscale = true
        }
        if (path && component) {
            component.loadTexture(path)
        }
    } else {
        this.interactable = true;
        let component = findBtnBgComponent(this);
        if(component) {
            component.grayscale = false
        }
        if (this.originSpriteColor && component) {
            let path = "cdnRes/ui/common_btn/" + "btn_" + this.originSpriteSize + "_" + this.originSpriteColor;
            component.loadTexture(path);
        }
    }
    let _labelShowAsGray = function (widget?:any, target?:any) {
        if (widget.children.length <= 0) return;
        for (let i = 0; i < widget.children.length; i++) {
            let child = widget.children[i];
            if (child.children.length > 0) {
                showChildrenGray(child, isGray);
            }
            let _label = child.getComponent(Label);
            if (_label) {
                _label.showAsGray(isGray, ccc4(254, 254, 254, 255));
            }
            if (!target || child._id !== target._id) {
                let _sprite = child.getComponent(Sprite);
                if (_sprite) {
                    _sprite.showAsGray(isGray);
                }
            }
        }
    }
    _labelShowAsGray(this.node, this.target);
}

Label.prototype.showAsGray = function (isGray?:any, _color :any = ccc4(98, 98, 98, 255)) {
    isGray = isGray ? 1 : 0;
    //判定当前是否置灰
    // let _material = this.getMaterial(0); //this.getMaterial(0);
    // if (!_material || !_material.name) {
    //     return;
    // }
    // if (isGray > 0 && _material.name.indexOf("2d-gray-sprite") >= 0) {
    //     return;
    // }
    // if (isGray <= 0 && _material.name.indexOf("2d-sprite") >= 0) {
    //     return;
    // }
    
    // if (isGray > 0) {
    //     this.setMaterial(0, MaterialVariant.createWithBuiltin('2d-gray-sprite', this))
    // } else {
    //     this.setMaterial(0, MaterialVariant.createWithBuiltin('2d-sprite', this))
    // }
    // this._forceUpdateRenderData();
    //this._activateMaterial();
    let _outLine = this.node.getComponent(LabelOutline);
    if (_outLine) {
        _outLine.showAsGray(isGray);
    }
    if (isGray) {
        //已经是灰色再置灰就会有问题
        if (this.color.a == 255 && this.color.b == 98 && this.color.g == 98 && this.color.r == 98) {
            return;
        }
        this.node._sourceLabelColor_lsdj32 = this.color.clone();
        this.color = color(98, 98, 98, 255);
    } else {
        if (this.node._sourceLabelColor_lsdj32) {
            this.color = this.node._sourceLabelColor_lsdj32.clone();
        }
    }
    showChildrenGray(this.node, isGray);
}
LabelOutline.prototype.showAsGray = function (isGray?:any) {
    // if (isGray) {
    //     //已经是灰色再置灰就会有问题
    //     if (this.color.a == 255 && this.color.b == 98 && this.color.g == 98 && this.color.r == 98) {
    //         return;
    //     }
    //     this._sourceLabelColor = this.color;
    //     this.color = color(98, 98, 98, 255);
    // } else {
    //     if (this._sourceLabelColor) {
    //         this.color = this._sourceLabelColor;
    //     }
    // }
    this.enabled = !isGray
}

Button.prototype.loadTextureNormal = function (p?:any, t?:any) {
    let path = p;
    let type = UI_TEX_TYPE_LOCAL;
    if (t != undefined) {
        type = t;
    }
    if (typeof (p) == "object") {
        path = p[0];
        type = p[1];
    }

    let self = this.node;
    let target = this.target;
    let bt = this;
    if (!target) target = bt.node;
    let sp = target.getComponent(Sprite)
    if (type == UI_TEX_TYPE_LOCAL) {
        G_GlobalVar.resManager().loadRes(ResMapping.ResType.SpriteFrame, path, (texture?:any, err?:any) => {
            //resources.load(path?:any, SpriteFrame?:any, (err?:any, texture?:any) => {
            if (!isValid(target)) {
                return
            }
            if (err) {
                error(err);
            } else {
                bt.normalSprite = texture;//new SpriteFrame(texture);
                if (sp) {
                    sp.spriteFrame = bt.normalSprite;
                }
                // self.width = texture.width;
                // self.height = texture.height;
            }
        });
    } else {
        bt.normalSprite = display.newSpriteFrame(path);
        if (bt.normalSprite) {
            self.width = bt.normalSprite.rect.width;
            self.height = bt.normalSprite.rect.height;
        }
    }
}

Button.prototype.loadTexturePressed = function (p?:any, t?:any) {
    let path = p;
    let type = UI_TEX_TYPE_LOCAL;
    if (t != undefined) {
        type = t;
    }
    if (typeof (p) == "object") {
        path = p[0];
        type = p[1];
    }

    let self = this.node;
    let bt = this;
    if (type == UI_TEX_TYPE_LOCAL) {
        G_GlobalVar.resManager().loadRes(ResMapping.ResType.SpriteFrame, path, (texture?:any, err?:any) => {
            if (!isValid(self)) {
                return
            }
            //resources.load(path?:any, SpriteFrame?:any, (err?:any, texture?:any) => {
            if (err) {
                error(err);
            } else {
                bt.pressedSprite = texture;//new SpriteFrame(texture);
                bt.transition = Button.Transition.SPRITE;
            }
        });
    } else {
        bt.pressedSprite = display.newSpriteFrame(path);
        bt.transition = Button.Transition.SPRITE;
    }
}

Button.prototype.loadTextureDisabled = function (p?:any, t?:any) {
    let path = p;
    let type = UI_TEX_TYPE_LOCAL;
    if (t != undefined) {
        type = t;
    }
    if (typeof (p) == "object") {
        path = p[0];
        type = p[1];
    }

    let self = this.node;
    let bt = this;
    if (type == UI_TEX_TYPE_LOCAL) {
        G_GlobalVar.resManager().loadRes(ResMapping.ResType.SpriteFrame, path, (texture?:any, err?:any) => {
            if (!isValid(self)) {
                return
            }
            //resources.load(path?:any, SpriteFrame?:any, (err?:any, texture?:any) => {
            if (err) {
                error(err);
            } else {
                bt.disabledSprite = texture;//new SpriteFrame(texture);
                bt.transition = Button.Transition.SPRITE;
            }
        });
    } else {
        bt.disabledSprite = display.newSpriteFrame(path);
        bt.transition = Button.Transition.SPRITE;
    }
}

Button.prototype.setPressedActionEnabled = function (isEnable?:any) {
    this.zoomScale = isEnable ? 1.1 : 1;
}

Button.prototype.addNode = function (node:any) {
    Node.prototype.addChild.apply(this.node, node);
}

Button.prototype.setSize = function (size?:any) {
    this.node.setSize(size)
}

Button.prototype.setScale = function (scale?:any) {
    this.node.scaleN =(scale)
}

Button.prototype.getAnchorPoint = function () {
    return this.node.getAnchorPoint();
}

Button.prototype.setTitleText = function (text?:any) {
    let title = this.node.getChildByName("Label");
    if(title) {
        let l = title.getComponent(Label)!
        l.setText(text);
    }
}

Button.prototype.getTitleText = function () {
    let title = this.node.getChildByName("Label");
    if(title) {
        let l =  title.getComponent(Label)!
        return l.string
    }
    return ""
}

Button.prototype.ignoreContentAdaptWithSize = function () { }

Button.prototype.retain = function () {
    this.node.retain();
}

Button.prototype.release = function () {
    this.node.release();
}

Button.prototype.setPosition = function (p:Vec3) {
    this.node.setPosition(p)
}

Button.prototype.getLayoutParameter = function () {
    return this.node.getLayoutParameter()
}

Button.prototype.getPositionX = function () {
    return this.node.x;
}

Button.prototype.getPositionY = function () {
    return this.node.y;
}

Button.prototype.getParent = function () {
    return this.node.parent;
}

Button.prototype.getName = function () {
    return this.node.name
}

Button.prototype.getContentSize = function () {
    return this.node.getContentSize();
}

Button.prototype.setPositionX = function (y?:any) {
    this.node.x = y;
}

Button.prototype.setPositionY = function (y?:any) {
    this.node.y = y;
}

Button.prototype.stopAllActions = function () {
    this.node.stopAllActions();
}

Button.prototype.removeAllNodes = function () {
    this.node.removeAllNodes();
}

Button.prototype.loadTexture = function (path?:any) {
    let sp = this.node.getComponent(Sprite);
    if (sp) sp.loadTexture(path);
}

Sprite.prototype.setVisible = function (isVisible?:any) {
    this.node.setVisible(isVisible);
}

Sprite.prototype.showAsGray = function (isGray?:any) {
    isGray = isGray ? 1 : 0;
    //this.setState(isGray);
    //判定当前是否置灰
    // let _material = this.getMaterial(0);
    // if (!_material || !_material.name) {
    //     return;
    // }
    // if (isGray > 0 && _material.name.indexOf("2d-gray-sprite") >= 0) {
    //     return;
    // }
    // if (isGray <= 0 && _material.name.indexOf("2d-sprite") >= 0) {
    //     return;
    // }
    // if (isGray > 0) {
    //     this.setMaterial(0, MaterialVariant.createWithBuiltin('2d-gray-sprite', this))
    // } else {
    //     this.setMaterial(0, MaterialVariant.createWithBuiltin('2d-sprite', this))
    // }
    //this.markForUpdateRenderData(true);
    this.grayscale = isGray
    showChildrenGray(this.node, isGray);
}

Sprite.prototype.removeAllNodes = function () {
    this.node.removeAllNodes();
}

Sprite.prototype.addNode = function (node:any) {
    Node.prototype.addChild.apply(this.node, node);
}

Sprite.prototype.loadTexture = function (p?:any, t?:any, callback?:any) {
    let path = p;
    let type = UI_TEX_TYPE_LOCAL;
    if (t != undefined) {
        type = t;
    }
    if (typeof (p) == "object") {
        path = p[0];
        type = p[1];
    }

    let self = this.node;
    let sp = this;
    let top:any, bottom:any, left:any, right:any, width:any, height:any
    if (sp.type == Sprite.Type.SLICED && sp.spriteFrame) {
        top = sp.spriteFrame.insetTop
        bottom = sp.spriteFrame.insetBottom
        left = sp.spriteFrame.insetLeft
        right = sp.spriteFrame.insetRight
        width = sp.node.width
        height = sp.node.height
    }
    if (type == UI_TEX_TYPE_LOCAL) {
        G_GlobalVar.resManager().loadRes(ResMapping.ResType.SpriteFrame, path, (texture?:any, err?:any) => {
            //resources.load(path?:any, SpriteFrame?:any, (err?:any, texture?:any) => {
            if (err) {
                error(err);
            } else {
                if (!isValid(sp.node)) {
                    return;
                }
                sp.spriteFrame = texture;//new SpriteFrame(texture);
                if (sp.type == Sprite.Type.SLICED && sp.spriteFrame) {
                    sp.spriteFrame.insetTop = top
                    sp.spriteFrame.insetBottom = bottom
                    sp.spriteFrame.insetLeft = left
                    sp.spriteFrame.insetRight = right
                    sp.node.width = width
                    sp.node.height = height
                }
            }
            if (callback) {
                callback()
            }
        });
    } else {
        sp.spriteFrame = display.newSpriteFrame(path);
        // if(sp.spriteFrame?:any) {
        //     self.width = sp.spriteFrame.getRect().width;
        //     self.height = sp.spriteFrame.getRect().height;
        // }
        if (sp.type == Sprite.Type.SLICED) {
            sp.node.width = width
            sp.node.height = height
        }
        if (callback) {
            callback()
        }
    }
}

Sprite.prototype.setScale = function (scale:Vec3) {
    this.node.setScale(scale);
}

Sprite.prototype.setPosition = function (a:any,b:any,c:any) {
    Node.prototype.setPosition.apply(this.node, [a,b,c])
}

Sprite.prototype.getPositionY = function () {
    return this.node.y;
}

Sprite.prototype.getPositionX = function () {
    return this.node.x;
}

Sprite.prototype.setPositionX = function (y?:any) {
    this.node.x = y;
}

Sprite.prototype.setPositionY = function (y?:any) {
    this.node.y = y;
}


Sprite.prototype.getPositionY = function () {
    return this.node.y;
}

Sprite.prototype.getPositionX = function () {
    return this.node.x;
}

Sprite.prototype.setTouchEnabled = function (e?:any) {
    this.node.setTouchEnabled(e);
}

Sprite.prototype.setSize = function (size?:any) {
    this.node.setSize(size)
}

Sprite.prototype.getAnchorPoint = function () {
    return this.node.getAnchorPoint();
}

Sprite.prototype.ignoreContentAdaptWithSize = function () { }

Sprite.prototype.retain = function () {
    this.node.retain();
}

Sprite.prototype.release = function () {
    this.node.release();
}

Sprite.prototype.getContentSize = function () {
    return this.node.getContentSize();
}

Sprite.prototype.setOpacity = function (op?:any) {
    this.node.opacity = op;
}

Sprite.prototype.stopAllActions = function () {
    this.node.stopAllActions();
}

Sprite.prototype.runAction = function (act?:any) {
    throw "cocosextend : cocos creator 3 不支持 runAction" 
}

Sprite.prototype.getName = function () {
    return this.node.name;
}

Sprite.prototype.getParent = function () {
    return this.node.parent;
}

Sprite.prototype.textureFile = function () {
    throw "cocosextend : cocos creator 3 不支持 textureFile"
    // if(this.spriteFrame){
    //     return this.spriteFrame.texture.url
    // }
    // return ""
}

ScrollView.prototype.setScrollEnable = function (isEnable?:any) {
    this.enabled = isEnable;
}

ScrollView.prototype.getInnerContainerSize = function () {
    if(this.content) {
        return this.content.getContentSize()
    }
    return CCSizeMake(0,0);
}

ScrollView.prototype.setInnerContainerSize = function (size?:any) {
    if(this.content){
        this.content.width = size.width;
        this.content.height = size.height;
    }
}

ScrollView.prototype.getSize = function () {
    return this.node.getContentSize();
}

ScrollView.prototype.getInnerContainer = function () {
    return this.content;
}

ScrollView.prototype.jumpToBottom = function (duration?:any) {
    this.scrollToBottom(duration);
}

ScrollView.prototype.jumpToTop = function (duration?:any) {
    this.scrollToTop(duration);
}

ScrollView.prototype.jumpToPercentHorizontal = function (percent?:any) {
    this.scrollToPercentHorizontal(percent / 100, 0, false);
}

ScrollView.prototype.jumpToPercentVertical = function (percent?:any) {
    this.scrollToPercentVertical(percent / 100);
}

ScrollView.prototype.getContentSize = function () {
    return this.node.getContentSize();
}

ScrollView.prototype.setSize = function (size?:any) {
    this.node.width = size.width;
    this.node.height = size.height;
    let view = this.node.getChildByName("view");
    if (view) {
        view.setContentSize(this.node.getContentSize());
        view.x = (view.anchorX - this.node.anchorX) * this.node.width;
        view.y = (view.anchorY - this.node.anchorY) * this.node.height;
    }
}

ScrollView.prototype.setPosition = function (p?:any) {
    this.node.x = p.x;
    this.node.y = p.y;
}

ScrollView.prototype.removeAllChildren = function () {
    let c = find("view/content", this.node)
    if(c) {
        c.removeAllChildren();
    }
}

ScrollView.prototype.removeAllChildrenWithCleanup = function (isCleanup?:any) {
    let c = find("view/content", this.node)
    if(c) {
        c.removeAllChildren();
    }
}

ScrollView.prototype.addChild = function (child?:any) {
    if (!(child instanceof Node)) {
        child = child.node;
    }
    child.parent = find("view/content", this.node)
}

ScrollView.prototype.isVisible = function () {
    return this.node.active;
}

Director.prototype.sharedDirector = function () {
    return uf_sceneManager
}

Color.prototype.getR = function() {
    return this.r
}
Color.prototype.getG = function() {
    return this.g
}
Color.prototype.getB = function() {
    return this.b
}
Color.prototype.getA = function() {
    return this.a
}