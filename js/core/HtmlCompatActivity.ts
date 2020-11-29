import {Map} from "./Map";
import {SharedPreferences} from "./SharedPreferences";

export abstract class HtmlCompatActivity {
    protected readonly title: string = "";

    public onCreate(){
        this.setPageTitle();
        this.onViewSetup();
    }

    protected abstract onActivityCreate();

    public onFinish(){

    }

    static setVisibility(element: Element, visible: boolean){
        if (element != null){
            if (visible){
                if (element.hasAttribute("style")){
                    element.removeAttribute("style");
                }
            } else {
                element.setAttribute("style", "display: none;");
            }
        }
    }

    protected onViewSetup(){

    }

    protected setPageTitle(){
        document.getElementById("header-title").textContent = this.title;
    }
}
