import {SharedPreferences} from "./core/SharedPreferences";
import {TableCallback, TableHelper} from "./helper/TableHelper";
import {CurlToolException} from "./core/CurlUnit";
import {TableData} from "./data/TableData";
import {HtmlCompatActivity} from "./core/HtmlCompatActivity";

export class Home extends HtmlCompatActivity implements TableCallback {
    private week: number;

    protected onActivityCreate() {
        const sp = SharedPreferences.getInterface("user");
        this.week = sp.getNumber("week", 0)

        const table = localStorage.getItem("cache.table");
        if (table != null){
            TableHelper.parse(table, this.week, this);
        } else {
            this.getTable();
        }
    }

    protected onViewSetup() {
        document.getElementById("home-welcome").textContent = Home.getHeaderInfo();
        document.getElementById("home-soup-content").textContent = Home.getSentenceString();
        document.getElementById("home-soup-author").textContent = Home.getSentenceFrom();
    }

    private getTable(){
        const sp = SharedPreferences.getInterface("user");
        const school_year: string = sp.getString("school_year", "");
        const semester: number = sp.getNumber("semester", 0);
        const helper = new TableHelper(this.week)
        helper.getTable(school_year, semester, this);
    }

    private static getHeaderInfo(): string {
        const week = SharedPreferences.getInterface("user").getNumber("week", 0);
        let time: string;
        const hours = new Date().getHours();
        if (hours < 8){
            time = "早上";
        } else if (hours < 11){
            time = "上午";
        } else if (hours < 13){
            time = "中午";
        } else if (hours < 18){
            time = "下午";
        } else {
            time = "晚上";
        }
        if (week == 0){
            return time + "好，祝你假期快乐~"
        } else {
            const day = ["日", "一", "二", "三", "四", "五", "六"][new Date().getDay()];
            return time + "好，今天是第" + week.toString() + "周星期" + day;
        }
    }

    public static getSentenceString(){
        return SharedPreferences.getInterface("user")
            .getString("sentence", "");
    }

    public static getSentenceFrom(){
        return SharedPreferences.getInterface("user")
            .getString("from", "");
    }

    onFailure(code: number, message: string, e?: CurlToolException) {
        // @ts-ignore
        mdui.snackbar({
            message: '课表获取失败，' + message + '(' + code.toString() + ')'
        })
    }

    onRead(dayIndex: number, classIndex: number, data?: TableData) {
        if (data != null){
            /*
                <div class="schedule-item-base" style="grid-column: 1; grid-row: 1;">
                    <div class="schedule-item mdui-card mdui-ripple">
                        <div class="mdui-cars-content table-item-title">工程力学Ⅱ</div>
                        <div class="mdui-cars-content table-item-content">钟灵楼(6号楼)209</div>
                        <div class="mdui-cars-content table-item-content">何运琪</div>
                    </div>
                </div>
             */
            const table: Element = document.getElementById("schedule-content");

            const schedule_item_base = document.createElement('div');
            schedule_item_base.classList.add('schedule-item-base');
            schedule_item_base.setAttribute(
                "style",
                "grid-column: " + dayIndex + "; grid-row: " + classIndex + ";"
            )

            const schedule_item: Element = document.createElement('div');
            schedule_item.classList.add('schedule-item', 'mdui-card', 'mdui-ripple');

            let table_item: Element = document.createElement('div');
            table_item.classList.add('mdui-cars-content', 'table-item-title');
            table_item.textContent = data.name;
            schedule_item.appendChild(table_item);

            table_item = document.createElement('div');
            table_item.classList.add('mdui-cars-content', 'table-item-content');
            table_item.textContent = data.room;
            schedule_item.appendChild(table_item);

            table_item = document.createElement('div');
            table_item.classList.add('mdui-cars-content', 'table-item-content');
            table_item.textContent = data.teacher;
            schedule_item.appendChild(table_item);

            schedule_item_base.appendChild(schedule_item);
            table.appendChild(schedule_item_base);
        }
    }

    onReadFinish(isEmpty: boolean) {
        Home.setVisibility(document.getElementById("schedule-item-base"), !isEmpty);
        Home.setVisibility(document.getElementById("schedule-empty"), isEmpty);
    }

    onReadStart() {
        const table_base = document.getElementById("schedule-content");
        table_base.innerHTML = "<p class=\"table-divider\" id=\"table-divider-noon\">中午</p>\n" +
            "<p class=\"table-divider\" id=\"table-divider-evening\">晚上</p>\n" +
            "<img src='img/placeholder.png' id=\"table-divider-placeholder\" alt=''>";
    }
}