import {HtmlCompatActivity} from "./core/HtmlCompatActivity";

export class About extends HtmlCompatActivity {
    protected readonly title: string = "关于";

    protected onActivityCreate() { }

    public clearCache(): void {
        localStorage.removeItem("cache.table");
        localStorage.removeItem("cache.achievement");
        localStorage.removeItem("cache.exam");
    }
}