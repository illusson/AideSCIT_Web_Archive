import {Map} from "./Map";
import {SharedPreferences} from "./SharedPreferences";

export abstract class HtmlCompatActivity {
    public abstract onCreate();

    public onFinish(){

    }

    static setVisibility(element: Element, visible: boolean){
        if (visible){
            if (element.hasAttribute("style")){
                element.removeAttribute("style");
            }
        } else {
            element.setAttribute("style", "display: none;");
        }
    }
}
