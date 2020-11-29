import {HtmlCompatActivity} from "./core/HtmlCompatActivity";

export class About extends HtmlCompatActivity {
    public onCreate() {

    }

    public clearCache(): void {
        localStorage.removeItem("cache.table");
        localStorage.removeItem("cache.achievement");
        localStorage.removeItem("cache.exam");
    }
}