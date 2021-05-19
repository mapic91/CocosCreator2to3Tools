import { _decorator, Label } from 'cc';
import { i18n } from './i18n';
const { ccclass, property } = _decorator;

@ccclass('LabelLocalized')
export class LabelLocalized extends Label {
    @property
    public textKey = 'TEXT_KEY';
    @property
    get localizedString () {
        return i18n.t(this.textKey);
    }
    set localizedString (value: any) {
        this.textKey = value;
        // if (CC_EDITOR) {
        //     cc.warn('Please set label text key in Text Key property.');
        // }
    };

    onLoad () {
        if (this.localizedString) {
           this.string = this.localizedString;
        }
    };
}


/**
 * Note: The original script has been commented out, due to the large number of changes in the script, there may be missing in the conversion, you need to convert it manually
 */
// const i18n = require('i18n');
// cc.Class({
//     extends: cc.Label,
// 
//     properties: {
//         textKey: {
//             default: 'TEXT_KEY',
//             multiline: true,
//             tooltip: 'Enter i18n key here',
//             notify: function () {
//                 this.string = this.localizedString;
//             }
//         },
//         localizedString: {
//             override: true,
//             tooltip: 'Here shows the localized string of Text Key',
//             get: function () {
//                 return i18n.t(this.textKey);
//             },
//             set: function (value) {
//                 this.textKey = value;
//                 if (CC_EDITOR) {
//                     cc.warn('Please set label text key in Text Key property.');
//                 }
//             }
//         },
//     },
// 
//     onLoad () {
//         this._super();
//         if (this.localizedString) {
//             this.string = this.localizedString;
//         }
//     }
// });
