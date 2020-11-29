export abstract class HtmlCompatActivity {
    protected loadState: boolean = false;
    protected readonly title: string = "";

    public onCreate(){
        this.setPageTitle();
        this.onViewSetup();
        this.onActivityCreate();
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

    protected setOnLoadState(state: boolean){
        if (this.loadState != state){
            HtmlCompatActivity.setVisibility(document.getElementById(
                "index-progress"
            ), state);
        }
        this.loadState = state;
    }
}
