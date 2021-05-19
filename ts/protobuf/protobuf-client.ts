/**
 * Note: The original script has been commented out, due to the large number of changes in the script, there may be missing in the conversion, you need to convert it manually
 */
/* ProtocolBuffer client 0.1.0*/

/**
 * websocket-protobuf
 * @author <yegang>
 */
import {warn, error, resources} from 'cc'
import {ByteBuffer} from "./bytebuffer-lib"
import {ProtoBuf} from "./protobuf-lib"
import {EventEmitter} from "./EventEmitter"
declare function require(name:string):any;

if (typeof (console.warn) === "undefined") {
    console.warn = warn;
}
if (typeof (console.error) === "undefined") {
    console.error = error;
}

// let EventEmitter = require("events");
if (typeof Object.create !== 'function') {
    Object.create = function (o?:any) {
        class F extends o {
            
        }
        return new F;
    };
}



let protonet:any

let socket : any = null;
let protobuf : any= null;



let userid : any = 0;
let sessionid  : any= 0;
let PHDR_LEN  : any= 16;

let reconnect  : any= false;
let reconncetTimer  : any= null;
let reconnectUrl : any = null;
let reconnectAttempts : any = 0;
let reconnectionDelay : any = 5000;
let DEFAULT_MAX_RECONNECT_ATTEMPTS : any = 10;

let initCallback : any = null;


let reset = function () {
    reconnect = false;
    reconnectionDelay = 1000 * 5;
    reconnectAttempts = 0;
    clearTimeout(reconncetTimer);
};


let sendMessage = function (msgid?:any, data?:any) {

    let packet = encode(msgid, data);
    send(packet);
};

let send = function (packet?:any) {
    if (socket)
        socket.send(packet.buffer);
};

let copyArray = function (dest?:any, doffset?:any, src?:any, soffset?:any, length?:any) {
    if ('function' === typeof src.copy) {
        // Buffer
        src.copy(dest, doffset, soffset, soffset + length);
    } else {
        // Uint8Array
        for (let index = 0; index < length; index++) {
            dest[doffset++] = src[soffset++];
        }
    }
};

//Big Endian
let encodeUint32 = function (n?:any, phdr?:any, offset?:any) {
    phdr[offset + 3] = n & 0xFF;
    phdr[offset + 2] = (n >> 8) & 0xFF;
    phdr[offset + 1] = (n >> 16) & 0xFF;
    phdr[offset] = (n >> 24) & 0xFF;
};

let decodeUint32 = function (data?:any) {
    return (data[0] << 24) | (data[1] << 16) | (data[2] << 8) | data[3];
};

let encode = function (msgid?:any, body?:any) {
    let header = new ArrayBuffer(PHDR_LEN);
    let phdr = new Uint8Array(header);
    encodeUint32(body.byteLength + PHDR_LEN, phdr, 0);   //len
    encodeUint32(msgid, phdr, 4);                        //cmd
    encodeUint32(userid, phdr, 8);                       //uid
    encodeUint32(sessionid, phdr, 12);                   //sid

    let buffer = new Uint8Array(body.byteLength + PHDR_LEN);
    //copyArray(buffer, 0, header, 0, PHDR_LEN);
    //copyArray(buffer, PHDR_LEN, body, 0, body.byteLength);
    buffer.set(new Uint8Array(header));
    buffer.set(new Uint8Array(body), PHDR_LEN);

    return buffer;
};

let decode = function (data?:any) {
    let res:any = {};

    let header = data.slice(0, PHDR_LEN);
    let phdr = new Uint8Array(header);
    res.msgid = decodeUint32([phdr[4], phdr[5], phdr[6], phdr[7]]);
    let length = decodeUint32([phdr[0], phdr[1], phdr[2], phdr[3]]);

    //let buffer = new ArrayBuffer(length - PHDR_LEN);
    //copyArray(buffer, 0, data, PHDR_LEN, length - PHDR_LEN);
    res.body = data.slice(PHDR_LEN, length);

    return res;
};

let processMessage = function (data?:any, cb?:any) {
    let msg = decode(data);

    let res:any = {};
    res.id = msg.msgid;
    res.body = msg.body;

    protonet.emit("onMessage", res);
};

let connect = function (params?:any, url?:any, cb?:any) {
    console.log('connect to ' + url);

    params = params || {};
    let maxReconnectAttempts = params.maxReconnectAttempts || DEFAULT_MAX_RECONNECT_ATTEMPTS;
    reconnectUrl = url;

    let onopen = function (event?:any) {
        if (!!reconnect) {
            protonet.emit('reconnect');
        }
        reset();
        protonet.emit('connect', event);

        if (initCallback) {
            initCallback(socket);
        }
    };
    let onmessage = function (event?:any) {
        processMessage(event.data, cb);
    };
    let onerror = function (event?:any) {
        protonet.emit('io-error', event);
        console.error('socket error: ', event);
    };
    let onclose = function (event?:any) {
        protonet.emit('close', event);
        protonet.emit('disconnect', event);
        console.error('socket close: ', event);
        if (!!params.reconnect && reconnectAttempts < maxReconnectAttempts) {
            reconnect = true;
            reconnectAttempts++;
            reconncetTimer = setTimeout(function () {
                connect(params, reconnectUrl, cb);
            }, reconnectionDelay);
            reconnectionDelay *= 2;
        }
    };
    socket = new WebSocket(url);
    socket.binaryType = 'arraybuffer';
    socket.onopen = onopen;
    socket.onmessage = onmessage;
    socket.onerror = onerror;
    socket.onclose = onclose;
};

class ProtoBufClient extends EventEmitter {
    loadProto = function (cb?:any) {
        (function () {
            //load cs.proto
            resources.load("cs", function (err?:any, data?:any) {
                protobuf = ProtoBuf.protoFromString(data);
                if (!!cb) cb();
            });
        })();
    }
    
    getProto = function (key?:any) {
        return protobuf.build(key);
    };

    init = function (params?:any, cb?:any) {
        initCallback = cb;
        let host = params.host;
        let port = params.port;
    
        let url = 'ws://' + host;
        if (port) {
            url += ':' + port;
        }
    
        connect(params, url, cb);
    };
    
    setUserId = function (_userid?:any) {
        userid = _userid;
    };
    
    setSessionId = function (_sessionid?:any) {
        sessionid = _sessionid;
    };
    
    getUserId = function () {
        return userid;
    };
    
    getSessionId = function () {
        return sessionid;
    };
    
    disconnect = function () {
        if (socket) {
            if (socket.disconnect) socket.disconnect();
            if (socket.close) socket.close();
            console.log('disconnect');
            socket = null;
        }
    };

    
    request = function (route?:any, msgid?:any, data?:any, cb?:any) {
        sendMessage(msgid, data);
    };
}

protonet = new ProtoBufClient

export default protonet
