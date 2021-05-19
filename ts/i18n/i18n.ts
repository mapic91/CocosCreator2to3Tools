/**
 * Note: The original script has been commented out, due to the large number of changes in the script, there may be missing in the conversion, you need to convert it manually
 */
import {Polyglot} from "./polyglot"
import {sys} from "cc"
import {data as en} from "./data/en"
import {data as zh} from "./data/zh"

let data = sys.language === 'zh' ? zh : en;
// let polyglot = null;
let polyglot = new Polyglot({phrases: data, allowMissing: true});


export class i18n {
    /**
     * This method allow you to switch language during runtime, language argument should be the same as your data file name
     * such as when language is 'zh', it will load your 'zh.js' data source.
     * @method init
     * @param language - the language specific data file name, such as 'zh' to load 'zh.js'
     */
    static init(language:string) {
        window.lang = language;
        data = language === 'zh' ? zh : en;
        polyglot.replace(data);
    };

    static t(key?:any, opt?:any) {
        return polyglot.t(key, opt);
    };
};
